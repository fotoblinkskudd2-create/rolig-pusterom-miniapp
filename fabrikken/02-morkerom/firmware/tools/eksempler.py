#!/usr/bin/env python3
"""Lager seks prosedyriske eksempel-«fotografier» (JPEG 1600×1200) som simulatorens kamera «tar».
Ingen ekte bilder, ingen personer. Deterministisk (fast frø)."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

UT = Path(__file__).resolve().parent / "eksempler"
UT.mkdir(exist_ok=True)
W, H = 1600, 1200
rng = np.random.default_rng(48)


def korn(a, styrke=10.0):
    a = a + rng.normal(0, styrke, a.shape)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    v = 1 - 0.35 * np.clip(r - 0.5, 0, 1) ** 1.5
    a = a * (v[..., None] if a.ndim == 3 else v)
    return np.clip(a, 0, 255)


def lagre(a, navn, blur=1.2):
    im = Image.fromarray(a.astype(np.uint8))
    im = im.filter(ImageFilter.GaussianBlur(blur))
    im.save(UT / f"{navn}.jpg", quality=88)
    print("skrev", navn)


def rygg(base, amp, frekv, fase):
    x = np.linspace(0, 1, W)
    y = base + sum(a * np.sin(2 * np.pi * f * x + p) for a, f, p in zip(amp, frekv, fase))
    return y.astype(int)


def fjord():
    yy = np.mgrid[0:H, 0:W][0].astype(float)
    a = np.zeros((H, W, 3))
    t = yy / (H * 0.55)
    himmel = np.stack([60 + 150 * t, 70 + 110 * t, 110 + 60 * t], -1)
    a[:] = himmel
    for base, farge, amp in [(480, (40, 45, 60), (60, 25, 12)), (560, (25, 28, 38), (40, 30, 8)), (620, (14, 16, 22), (30, 12, 6))]:
        r = rygg(base, amp, (1.3, 3.1, 7.7), rng.uniform(0, 6, 3))
        for x in range(W):
            a[r[x]:660, x] = farge
    # vann med speiling
    spe = a[660 - (np.arange(H - 660) * 0.9).astype(int)[::-1].clip(0, 659)].copy() * 0.55
    rips = (np.sin(np.linspace(0, 80, H - 660))[:, None] * 6)
    a[660:] = np.clip(spe + rips[..., None], 0, 255)
    # husvinduer
    im = Image.fromarray(a.astype(np.uint8))
    d = ImageDraw.Draw(im)
    for x in (300, 318, 905, 1240):
        d.rectangle([x, 640, x + 6, 648], fill=(255, 220, 150))
        d.rectangle([x, 690, x + 6, 740], fill=(120, 100, 70))
    a = np.asarray(im).astype(float)
    lagre(korn(a.mean(-1, keepdims=True).repeat(3, -1) * 0.3 + a * 0.7, 12), "fjord")


def vindu():
    a = np.full((H, W, 3), 28.0)
    im = Image.fromarray(a.astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.rectangle([520, 140, 1180, 760], fill=(235, 238, 242))
    d.rectangle([840, 140, 860, 760], fill=(30, 30, 30))
    d.rectangle([520, 440, 1180, 460], fill=(30, 30, 30))
    d.polygon([(520, 760), (1180, 760), (1500, 1200), (300, 1200)], fill=(120, 118, 112))
    d.polygon([(840, 760), (860, 760), (1100, 1200), (1060, 1200)], fill=(40, 40, 40))
    for i in range(14):  # plante
        x0 = 600 + rng.integers(-40, 40)
        d.ellipse([x0 + i * 6, 520 - i * 18, x0 + 70 + i * 6, 560 - i * 18], fill=(20, 24, 20))
    d.rectangle([590, 700, 700, 760], fill=(60, 40, 30))
    lagre(korn(np.asarray(im).astype(float), 9), "vindu", 2.0)


def kopp():
    yy, xx = np.mgrid[0:H, 0:W]
    a = np.full((H, W, 3), 60.0) + (yy / H * 80)[..., None]
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 760, W, H], fill=(150, 120, 90))
    for y in range(760, H, 34):
        d.line([0, y, W, y + 10], fill=(130, 100, 75), width=3)
    d.ellipse([560, 940, 1100, 1040], fill=(70, 55, 40))
    d.rectangle([600, 560, 1040, 980], fill=(225, 222, 214))
    d.ellipse([600, 940, 1040, 1010], fill=(225, 222, 214))
    d.ellipse([600, 520, 1040, 600], fill=(200, 196, 188))
    d.ellipse([630, 535, 1010, 590], fill=(70, 40, 25))
    d.ellipse([1010, 640, 1160, 860], outline=(220, 218, 210), width=34)
    a = np.asarray(im).astype(float)
    for k in range(3):  # damp
        ys = np.arange(150, 520)
        xs = 820 + k * 60 + 40 * np.sin(ys / 50 + k)
        for y, x in zip(ys, xs):
            a[y, int(x) - 6:int(x) + 6] += 50 * (1 - (520 - y) / 400)
    lagre(korn(a, 8), "kopp", 1.8)


def sno():
    a = np.full((H, W, 3), 210.0)
    yy = np.mgrid[0:H, 0:W][0]
    a -= (yy < 600)[..., None] * 25
    im = Image.fromarray(a.astype(np.uint8))
    d = ImageDraw.Draw(im)
    for x, w, h in [(200, 40, 800), (520, 60, 900), (760, 30, 700), (1100, 70, 1000), (1420, 45, 850)]:
        d.rectangle([x, 1000 - h, x + w, 1000], fill=(35, 32, 30))
        for g in range(6):
            yg = 1000 - h + g * h // 7
            d.line([x + w // 2, yg, x + w // 2 + rng.integers(-160, 160), yg - 80], fill=(40, 38, 36), width=8)
    d.rectangle([0, 980, W, H], fill=(236, 236, 238))
    a = np.asarray(im).astype(float)
    flak = rng.random((H, W)) > 0.9985
    a[flak] = 255
    lagre(korn(a, 6), "sno", 1.4)


def lampe():
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot(xx - 980, yy - 420)
    a = 18 + 220 * np.exp(-r / 220)
    a = np.repeat(a[..., None], 3, -1)
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    d.polygon([(860, 300), (1100, 300), (1180, 470), (780, 470)], fill=(245, 230, 200))
    d.rectangle([970, 470, 990, 1000], fill=(30, 30, 30))
    d.ellipse([860, 980, 1100, 1030], fill=(30, 30, 30))
    d.rectangle([0, 1020, W, H], fill=(55, 50, 45))
    lagre(korn(np.asarray(im).astype(float), 10), "lampe", 2.2)


def trapp():
    a = np.full((H, W, 3), 40.0)
    im = Image.fromarray(a.astype(np.uint8))
    d = ImageDraw.Draw(im)
    for i in range(10):
        y = 1150 - i * 100
        x0 = 200 + i * 60
        d.rectangle([x0, y - 30, W, y], fill=(200 - i * 8,) * 3)      # inntrinn
        d.rectangle([x0, y, W, y + 70], fill=(110 - i * 5,) * 3)      # opptrinn
    d.line([180, 1180, 820, 120], fill=(20, 20, 20), width=14)          # rekkverk
    lagre(korn(np.asarray(im).astype(float), 8), "trapp", 1.5)


for f in (fjord, vindu, kopp, sno, lampe, trapp):
    f()
