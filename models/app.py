import base64
from flask_cors import CORS

import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn.functional as F
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from torchvision.utils import save_image
from flask import Flask, request, jsonify, send_file
import io
from torchvision.utils import save_image
from torchvision import transforms


app = Flask(__name__)
CORS(app)

device = 'cuda' if torch.cuda.is_available() else 'cpu'
resnet = models.resnet50(pretrained=True).eval().to(device)

with open("models/imagenet_classes.txt") as f:
    idx_to_class = [line.strip() for line in f.readlines()]

preprocess_224 = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

to_tensor = transforms.ToTensor()

def fgsm_highres_cloak(orig_img, target_class, intensity):
    orig_w, orig_h = orig_img.size

    x_small = preprocess_224(orig_img).unsqueeze(0).to(device)
    x_small.requires_grad = True

    output = resnet(x_small)
    loss = output[0, target_class]

    loss.backward()

    epsilon = intensity
    grad_sign = x_small.grad.data.sign()

    pert_small = torch.clamp(x_small - epsilon * grad_sign, 0, 1).detach()

    delta_small = pert_small - x_small

    delta_big = torch.nn.functional.interpolate(
        delta_small,
        size=(orig_h, orig_w),
        mode='bilinear',
        align_corners=False
    )

    orig_tensor = to_tensor(orig_img).unsqueeze(0).to(device)

    perturbed_highres = torch.clamp(orig_tensor + delta_big, 0, 1)

    return perturbed_highres
# required imports

# ImageNet normalization (update if your preprocess_224 uses different values)
IMAGENET_MEAN = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1).to(device)
IMAGENET_STD  = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1).to(device)

def fgsm_highres_cloak(pil_img, target_idx, epsilon=0.01, targeted=False):
    """
    - pil_img: PIL RGB image (original full resolution)
    - target_idx: integer class index
    - epsilon: float (applied in normalized input-space then converted to pixel-space)
    - targeted: bool (if True, push *towards* target; else push *away*)
    Returns:
    - perturbed_orig_px: tensor [1,3,H,W] with pixel values in [0,1] at original resolution
    """
    model = resnet
    model.eval()

    # 1) Prepare model input (resized+normalized) for gradient computation
    x = preprocess_224(pil_img).unsqueeze(0).to(device)   # this is normalized input
    x.requires_grad = True

    # 2) Forward + loss
    out = model(x)
    loss = F.cross_entropy(out, torch.tensor([target_idx], device=device))
    model.zero_grad()
    loss.backward()

    # 3) gradient sign in normalized space
    grad_sign = x.grad.data.sign()  # shape [1,3,224,224] (or whatever preprocess_224 produces)

    # 4) make delta in normalized space (flip sign for targeted)
    if targeted:
        delta_norm = -epsilon * grad_sign
    else:
        delta_norm = epsilon * grad_sign

    # 5) convert delta from normalized-space -> pixel-space
    #    delta_px_small = delta_norm * std (because x_norm = (x_px - mean)/std -> delta_px = delta_norm * std)
    delta_px_small = delta_norm * IMAGENET_STD  # still small spatial size (e.g. 224x224)

    # 6) upsample delta to original image size
    orig_w, orig_h = pil_img.size  # PIL: (width, height)
    delta_px_upsampled = F.interpolate(delta_px_small, size=(orig_h, orig_w), mode="bilinear", align_corners=False)

    # 7) get original image as pixel tensor
    to_tensor = transforms.ToTensor()
    orig_px = to_tensor(pil_img).unsqueeze(0).to(device)  # [1,3,H,W], values in [0,1]

    # 8) apply perturbation and clamp
    perturbed_orig_px = orig_px + delta_px_upsampled
    perturbed_orig_px = torch.clamp(perturbed_orig_px, 0.0, 1.0).detach()

    return perturbed_orig_px  # [1,3,H,W] in original resolution, ready to save


@app.route("/art-cloak", methods=["POST"])
def cloak_image():
    image_file = request.files.get("image")
    target_class_name = request.form.get("target_class", None)
    intensity = float(request.form.get("intensity", 0.01))
    mode = request.form.get("mode", "untargeted")

    if image_file is None:
        return jsonify({"error": "No image file provided"}), 400

    # Load original image at full resolution
    orig_img = Image.open(image_file).convert("RGB")

    # --- BEFORE PREDICTIONS (model input space only) ---
    with torch.no_grad():
        x_before = preprocess_224(orig_img).unsqueeze(0).to(device)
        probs_before = F.softmax(resnet(x_before), dim=1)[0]

    targeted = (mode == "targeted")

    # Resolve target class
    if target_class_name is None:
        target_idx = torch.argmax(probs_before).item()
        target_class_name = idx_to_class[target_idx]
    else:
        try:
            target_idx = idx_to_class.index(target_class_name)
        except ValueError:
            return jsonify({"error": "Invalid class name"}), 400

    # --- HIGH-RES CLOAKING (NO RESIZE OF OUTPUT IMAGE) ---
    perturbed_tensor = fgsm_highres_cloak(
        pil_img=orig_img,
        target_idx=target_idx,
        epsilon=intensity,
        targeted=targeted
    )
    # perturbed_tensor shape: [1, 3, H, W]  (original H,W)

    # --- AFTER PREDICTIONS (resize only for model, NOT output) ---
    with torch.no_grad():
        pert_img_pil = transforms.ToPILImage()(
            perturbed_tensor.squeeze(0).cpu()
        )
        x_after = preprocess_224(pert_img_pil).unsqueeze(0).to(device)
        probs_after = F.softmax(resnet(x_after), dim=1)[0]

    top_before = torch.topk(probs_before, 3)
    top_after = torch.topk(probs_after, 3)

    response = {
        "mode": mode,
        "target_class": target_class_name,
        "original_top_predictions": [
            {
                "class": idx_to_class[top_before.indices[i]],
                "prob": float(top_before.values[i])
            }
            for i in range(3)
        ],
        "cloaked_top_predictions": [
            {
                "class": idx_to_class[top_after.indices[i]],
                "prob": float(top_after.values[i])
            }
            for i in range(3)
        ],
    }

    # --- RETURN FULL-RES IMAGE ---
    buffer = io.BytesIO()
    save_image(perturbed_tensor, buffer, format="PNG")  # preserves original size
    buffer.seek(0)
    encoded_string = base64.b64encode(buffer.read()).decode("utf-8")

    return jsonify({
        "cloaked_image": encoded_string,
        "response": response
    }), 200


@app.route("/")
def home():
    return "Mirage-AI FGSM High-Res Cloak API is running!"

mtcnn = MTCNN(keep_all=False, device=device)

facenet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

face_preprocess = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor()
])

to_tensor = transforms.ToTensor()

def cloak_face_facenet(
    orig_img,
    intensity=0.01,
    method="fgsm",
    targeted=False,
    target_identity_img=None
):
    orig_w, orig_h = orig_img.size

    boxes, probs = mtcnn.detect(orig_img)
    if boxes is None:
        return None, {"error": "No face detected"}

    x1, y1, x2, y2 = map(int, boxes[0])
    face_crop = orig_img.crop((x1, y1, x2, y2))

    face_small = face_preprocess(face_crop).unsqueeze(0).to(device)
    face_small.requires_grad = True

    orig_emb = facenet(face_small).detach()

    if targeted:
        target_face = face_preprocess(target_identity_img).unsqueeze(0).to(device)
        target_emb = facenet(target_face).detach()
    else:
        target_emb = None

    def untargeted_loss(adv_emb):
        return -F.cosine_similarity(adv_emb, orig_emb).mean()

    def targeted_loss(adv_emb):
        return F.cosine_similarity(adv_emb, target_emb).mean()

    if method == "fgsm":
        emb = facenet(face_small)
        loss = targeted_loss(emb) if targeted else untargeted_loss(emb)
        loss.backward()

        epsilon = intensity
        adv_small = torch.clamp(face_small + epsilon * face_small.grad.sign(), 0, 1).detach()

    elif method == "pgd":
        adv_small = face_small.clone()
        epsilon = intensity
        alpha = epsilon / 3
        steps = 7

        for _ in range(steps):
            adv_small = adv_small.detach()
            adv_small.requires_grad_(True)

            emb = facenet(adv_small)
            loss = targeted_loss(emb) if targeted else untargeted_loss(emb)
            loss.backward()

            adv_small = adv_small + alpha * adv_small.grad.sign()
            adv_small = torch.min(torch.max(adv_small, face_small - epsilon), face_small + epsilon)
            adv_small = torch.clamp(adv_small, 0, 1)

    delta_small = adv_small - face_small

    face_H = y2 - y1
    face_W = x2 - x1

    delta_big = torch.nn.functional.interpolate(
        delta_small,
        size=(face_H, face_W),
        mode='bilinear',
        align_corners=False
    )

    orig_tensor = to_tensor(orig_img).unsqueeze(0).to(device)
    perturbed = orig_tensor.clone()

    perturbed[:, :, y1:y2, x1:x2] = torch.clamp(
        orig_tensor[:, :, y1:y2, x1:x2] + delta_big,
        0, 1
    )

    adv_face_crop = transforms.ToPILImage()(perturbed[0, :, y1:y2, x1:x2].cpu())
    adv_face_small = face_preprocess(adv_face_crop).unsqueeze(0).to(device)
    adv_emb = facenet(adv_face_small).detach()

    metrics = {}

    orig_sim = float(F.cosine_similarity(orig_emb, orig_emb))
    adv_sim = float(F.cosine_similarity(orig_emb, adv_emb))
    emb_dist = float((orig_emb - adv_emb).norm())

    metrics["cosine_similarity_before"] = orig_sim
    metrics["cosine_similarity_after"] = adv_sim
    metrics["similarity_drop"] = 1.0 - adv_sim
    metrics["embedding_distance_original_vs_adv"] = emb_dist

    embedding_dim = orig_emb.shape[1]

    metrics["normalized_distance"] = emb_dist / embedding_dim
    metrics["adv_vs_orig_norm_ratio"] = emb_dist / (orig_emb.norm().item() + 1e-6)
    metrics["percent_change_in_distance"] = \
        float((emb_dist / (orig_emb.norm().item() + 1e-6)) * 100)

    metrics["embedding_moved_norm"] = emb_dist

    metrics["embedding_movement_per_pixel"] = emb_dist / (face_H * face_W)

    SUCCESS_THRESHOLD = 0.85
    metrics["attack_success"] = adv_sim < SUCCESS_THRESHOLD

    metrics["effective_cloaking_score"] = min(1.0, (1 - adv_sim) * 1.3)

    if targeted:
        tgt_sim_before = float(F.cosine_similarity(orig_emb, target_emb))
        tgt_sim_after = float(F.cosine_similarity(adv_emb, target_emb))

        metrics["target_similarity_before"] = tgt_sim_before
        metrics["target_similarity_after"] = tgt_sim_after
        metrics["push_toward_target"] = tgt_sim_after - tgt_sim_before

        metrics["target_push_strength"] = max(0.0, metrics["push_toward_target"])

    return perturbed, metrics


def pil_to_base64(pil_img, format="PNG"):
    buffer = io.BytesIO()
    pil_img.save(buffer, format=format)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def base64_to_pil(b64_string):
    img_bytes = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(img_bytes)).convert("RGB")


def tensor_to_base64(tensor, format="PNG"):
    buffer = io.BytesIO()
    save_image(tensor, buffer, format=format)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")

def face_cloak_from_base64(
    image_b64: str,
    intensity: float = 0.01,
    method: str = "fgsm",
    targeted: bool = False,
    target_image_b64: str | None = None,
):
    """
    Pure function:
    - Takes images as base64
    - Returns base64 cloaked image + metrics
    """

    # Decode input image
    orig_img = base64_to_pil(image_b64)

    target_identity_img = None
    if targeted:
        if target_image_b64 is None:
            return None, {"error": "Targeted attack requires target_image"}
        target_identity_img = base64_to_pil(target_image_b64)

    # ---- CORE PROCESSING (UNCHANGED) ----
    perturbed_tensor, metrics = cloak_face_facenet(
        orig_img,
        intensity=intensity,
        method=method,
        targeted=targeted,
        target_identity_img=target_identity_img
    )

    if perturbed_tensor is None:
        return None, metrics

    # Encode output tensor to base64
    cloaked_b64 = tensor_to_base64(perturbed_tensor)

    return cloaked_b64, metrics



@app.route("/face-cloak", methods=["POST"])
def cloak_face_api():
    """
    Accepts:
    - multipart file OR image_base64
    - optional target_image OR target_image_base64
    """

    # ---- INPUT IMAGE ----
    image_b64 = request.form.get("image_base64")

    if image_b64 is None:
        image_file = request.files.get("file")
        if image_file is None:
            return jsonify({"error": "No image provided"}), 400
        # convert multipart → base64
        orig_img = Image.open(image_file).convert("RGB")
        image_b64 = pil_to_base64(orig_img)

    # ---- PARAMETERS ----
    intensity = float(request.form.get("intensity", 0.01))
    method = request.form.get("method", "fgsm").lower()
    targeted = request.form.get("targeted", "false").lower() == "true"

    # ---- TARGET IMAGE (optional) ----
    target_image_b64 = request.form.get("target_image_base64")

    if targeted and target_image_b64 is None:
        target_file = request.files.get("target_image")
        if target_file is None:
            return jsonify({"error": "Targeted attack requires target_image"}), 400
        target_img = Image.open(target_file).convert("RGB")
        target_image_b64 = pil_to_base64(target_img)

    # ---- CALL PURE FUNCTION ----
    cloaked_b64, metrics = face_cloak_from_base64(
        image_b64=image_b64,
        intensity=intensity,
        method=method,
        targeted=targeted,
        target_image_b64=target_image_b64
    )

    if cloaked_b64 is None:
        return jsonify(metrics), 400

    return jsonify({
        "cloaked_image": cloaked_b64,
        "response": metrics
    }), 200


# @app.route("/face-cloak", methods=["POST"])
# def cloak_face_api():
#     """
#     Inputs:
#         - file: image
#         - intensity: float
#         - method: fgsm or pgd
#         - targeted: "true" or "false"
#         - target_image: optional file (for targeted attacks)
#     Returns: cloaked image + metrics
#     """

#     image_file = request.files.get("file")
#     if image_file is None:
#         return jsonify({"error": "No image file provided"}), 400

#     orig_img = Image.open(image_file).convert("RGB")

#     intensity = float(request.form.get("intensity", 0.01))
#     method = request.form.get("method", "fgsm").lower()
#     targeted = request.form.get("targeted", "false").lower() == "true"

#     target_identity_img = None
#     if targeted:
#         target_file = request.files.get("target_image")
#         if target_file is None:
#             return jsonify({"error": "Targeted attack requires target_image"}), 400
#         target_identity_img = Image.open(target_file).convert("RGB")

#     perturbed_tensor, metrics = cloak_face_facenet(
#         orig_img,
#         intensity=intensity,
#         method=method,
#         targeted=targeted,
#         target_identity_img=target_identity_img
#     )

#     if perturbed_tensor is None:
#         return jsonify(metrics), 400

#     buffer = io.BytesIO()
#     save_image(perturbed_tensor, buffer, format="PNG")
#     buffer.seek(0)

#     perturbed_tensor_pil = transforms.ToPILImage()(perturbed_tensor.squeeze(0).cpu())
#     perturbed_tensor_pil.save("facecloaked.png")
#     with open("facecloaked.png", "rb") as img_file:
#         encoded_string = base64.b64encode(img_file.read()).decode("utf-8")

#     return jsonify({
#         "cloaked_image": encoded_string,
#         "response": metrics
#     }), 200

if __name__ == "__main__":
    app.run(debug=True, port = 8080)
