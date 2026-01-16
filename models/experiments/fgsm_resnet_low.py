import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import numpy as np
import torch.nn.functional as F
from torchvision.datasets.utils import download_url

import ssl
ssl._create_default_https_context = ssl._create_unverified_context


url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
imagenet_classes_file = "imagenet_classes.txt"
download_url(url, ".", imagenet_classes_file, None)
with open(imagenet_classes_file) as f:
    idx_to_class = [line.strip() for line in f.readlines()]

device = 'cuda' if torch.cuda.is_available() else 'cpu'

resnet = models.resnet50(pretrained=True).eval().to(device)

transform = transforms.Compose([
    transforms.ToTensor(),
])

image_path = "cat_img.png"
img = Image.open(image_path).convert("RGB")
x = transform(img).unsqueeze(0).to(device)
x.requires_grad = True

class_prompt = "tiger cat"  
target_class_idx = idx_to_class.index(class_prompt)

output = resnet(x)
loss = output[0, target_class_idx] 

loss.backward()
epsilon = 0.01
perturbed = x - epsilon * x.grad.data.sign()
perturbed = torch.clamp(perturbed, 0, 1).detach()

from torchvision.utils import save_image
save_image(x, "original.png", normalize=True)
save_image(perturbed, "cloaked.png", normalize=True)

with torch.no_grad():
    probs_original = F.softmax(resnet(x), dim=1)[0]
    probs_cloaked = F.softmax(resnet(perturbed), dim=1)[0]

original_top = torch.topk(probs_original, 5)
cloaked_top = torch.topk(probs_cloaked, 5)

print("🔍 Top classes before cloaking:")
for i in range(5):
    print(f"{idx_to_class[original_top.indices[i]]}: {original_top.values[i].item():.4f}")

print("\n👻 Top classes after cloaking:")
for i in range(5):
    print(f"{idx_to_class[cloaked_top.indices[i]]}: {cloaked_top.values[i].item():.4f}")
