import torch
import torchvision.transforms as transforms
import torch.nn.functional as F
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1
from torchvision.utils import save_image

device = "cuda" if torch.cuda.is_available() else "cpu"

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
        print("No face detected")
        return orig_img, {}

    x1, y1, x2, y2 = map(int, boxes[0])

    face_crop = orig_img.crop((x1, y1, x2, y2))

    face_small = face_preprocess(face_crop).unsqueeze(0).to(device)
    face_small.requires_grad = True

    orig_emb = facenet(face_small).detach()

    if targeted:
        if target_identity_img is None:
            raise ValueError("Targeted attack requires target identity image")
        target_face = face_preprocess(target_identity_img).unsqueeze(0).to(device)
        target_emb = facenet(target_face).detach()
    else:
        target_emb = None

    def untargeted_loss(adv_emb, orig_emb):
        return -F.cosine_similarity(adv_emb, orig_emb).mean()

    def targeted_loss(adv_emb, target_emb):
        return F.cosine_similarity(adv_emb, target_emb).mean()

    if method == "fgsm":
        emb = facenet(face_small)
        loss = targeted_loss(emb, target_emb) if targeted else untargeted_loss(emb, orig_emb)
        loss.backward()

        epsilon = intensity
        adv_small = torch.clamp(face_small + epsilon * face_small.grad.sign(), 0, 1).detach()

    elif method == "pgd":
        adv_small = face_small.clone()
        epsilon = intensity
        alpha = epsilon / 3
        steps = 7

        for _ in range(steps):
            adv_small.requires_grad = True
            emb = facenet(adv_small)
            loss = targeted_loss(emb, target_emb) if targeted else untargeted_loss(emb, orig_emb)
            loss.backward()

            adv_small = adv_small + alpha * adv_small.grad.sign()
            adv_small = torch.min(torch.max(adv_small, face_small - epsilon), face_small + epsilon)
            adv_small = torch.clamp(adv_small, 0, 1).detach()

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
    perturbed_tensor = orig_tensor.clone()

    perturbed_tensor[:, :, y1:y2, x1:x2] = torch.clamp(
        orig_tensor[:, :, y1:y2, x1:x2] + delta_big,
        0, 1
    )

    adv_face_crop = transforms.ToPILImage()(perturbed_tensor[0, :, y1:y2, x1:x2].cpu())
    adv_face_small = face_preprocess(adv_face_crop).unsqueeze(0).to(device)
    adv_emb = facenet(adv_face_small).detach()

    metrics = {}

    orig_sim = F.cosine_similarity(orig_emb, orig_emb).item()
    adv_sim = F.cosine_similarity(orig_emb, adv_emb).item()
    emb_dist = (orig_emb - adv_emb).norm().item()

    metrics["cosine_similarity_before"] = 1.0
    metrics["cosine_similarity_after"] = adv_sim
    metrics["embedding_distance_original_vs_adv"] = emb_dist
    metrics["similarity_drop"] = 1.0 - adv_sim

    if targeted:
        tgt_sim_before = F.cosine_similarity(orig_emb, target_emb).item()
        tgt_sim_after = F.cosine_similarity(adv_emb, target_emb).item()

        metrics["target_similarity_before"] = tgt_sim_before
        metrics["target_similarity_after"] = tgt_sim_after
        metrics["push_toward_target"] = tgt_sim_after - tgt_sim_before

    return perturbed_tensor, metrics
