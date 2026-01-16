import torch
from facenet_pytorch import InceptionResnetV1
from torchvision import transforms
from PIL import Image
import torchvision.utils as vutils
import matplotlib.pyplot as plt
import os
from model import EmbeddingPoisoner

device = 'cuda' if torch.cuda.is_available() else 'cpu'

import ssl
ssl._create_default_https_context = ssl._create_unverified_context

# Load FaceNet
facenet = InceptionResnetV1(pretrained='vggface2').eval().to(device)

# Load and preprocess image
transform = transforms.Compose([
    transforms.Resize((160, 160)),
    transforms.ToTensor()
])

image_path = "image.png"
if not os.path.exists(image_path):
    raise FileNotFoundError(f"Couldn't find {image_path}. Please add a test image.")

img = Image.open(image_path).convert("RGB")
x = transform(img).unsqueeze(0).to(device)

# Poisoner model
poisoner = EmbeddingPoisoner(facenet, epsilon=0.01).to(device)

# Original embedding
with torch.no_grad():
    original_emb = facenet(x)

# Get cloaked image
x_cloaked = poisoner(x)

# Embedding for cloaked image
with torch.no_grad():
    cloaked_emb = facenet(x_cloaked)

# Cosine similarity
cos = torch.nn.CosineSimilarity(dim=1)
similarity = cos(original_emb, cloaked_emb).item()

# Delta
delta_emb = cloaked_emb - original_emb
delta_norm = torch.norm(delta_emb).item()

# Save images
vutils.save_image(x, "original.png", normalize=True)
vutils.save_image(x_cloaked, "cloaked.png", normalize=True)

# Display images
original_img = transforms.ToPILImage()(x.squeeze().cpu())
cloaked_img = transforms.ToPILImage()(x_cloaked.squeeze().cpu())

fig, axs = plt.subplots(1, 2, figsize=(10, 5))
axs[0].imshow(original_img)
axs[0].set_title("Original Image")
axs[0].axis('off')

axs[1].imshow(cloaked_img)
axs[1].set_title("Cloaked Image")
axs[1].axis('off')

plt.tight_layout()
plt.show()

# Print embedding info
print("\n=========================")
print("Original Embedding:")
print(original_emb.cpu().numpy())

print("\nCloaked Embedding:")
print(cloaked_emb.cpu().numpy())

print("\nCosine Similarity:", round(similarity, 4))
print("Embedding Δ Norm: ", round(delta_norm, 4))
print("=========================\n")