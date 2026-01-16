import torch
import torch.nn as nn
import torch.nn.functional as F

class EmbeddingPoisoner(nn.Module):
    def __init__(self, facenet, epsilon=0.001, targeted=False, target_embedding=None):
        super().__init__()
        self.facenet = facenet.eval()
        self.epsilon = epsilon
        self.targeted = targeted
        self.target_embedding = target_embedding

    def forward(self, x):
        x = x.clone().detach().requires_grad_(True)

        emb = self.facenet(x)

        if self.targeted and self.target_embedding is not None:
            loss = -F.cosine_similarity(emb, self.target_embedding).mean()
        else:
            loss = torch.norm(emb, p=2)

        grad = torch.autograd.grad(loss, x, retain_graph=False, create_graph=False)[0]

        x_adv = x + self.epsilon * grad.sign()
        x_adv = torch.clamp(x_adv, 0, 1)

        return x_adv.detach()
