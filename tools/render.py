"""Liten z-buffer-rasterizer for CAD-bilder. Ingen GPU, ingen nett — bare numpy + matplotlib (imsave).

    from render import render
    render([(mesh, (0.6, 0.75, 0.7))], "ut.png", elev=30, azim=-55)

Ortografisk kamera, Lambert + svak spekulær, myke vertex-normaler der vinkelen er liten,
og kantlinjer fra dybde-/normal-sprang (CAD-uttrykk). Brukt av products/*/cad/*.py.
"""
import math

import numpy as np


def _camera(elev, azim):
    e, a = math.radians(elev), math.radians(azim)
    fwd = -np.array([math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)])  # fra kamera inn i scenen
    up0 = np.array([0, 0, 1.0])
    right = np.cross(fwd, up0); right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    return right, up, fwd


def render(meshes, path, elev=30, azim=-55, size=(1400, 1000), title=None, bg=(1, 1, 1), margin=0.08,
           light=(0.4, -0.5, 0.85), outline=True):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    W, H = size
    right, up, fwd = _camera(elev, azim)
    L = np.asarray(light, float); L /= np.linalg.norm(L)
    allv = np.vstack([m.vertices for m, _ in meshes])
    sx, sy = allv @ right, allv @ up
    span = max(np.ptp(sx), np.ptp(sy) * W / H) * (1 + 2 * margin)
    cx, cy = (sx.max() + sx.min()) / 2, (sy.max() + sy.min()) / 2
    scale = W / span

    zbuf = np.full((H, W), np.inf)
    img = np.ones((H, W, 3)) * np.asarray(bg, float)
    nbuf = np.zeros((H, W, 3))
    idbuf = np.full((H, W), -1, int)

    for mi, (m, color) in enumerate(meshes):
        col = np.asarray(color, float)
        V = m.vertices
        px = (V @ right - cx) * scale + W / 2
        py = H / 2 - (V @ up - cy) * scale
        pz = V @ fwd
        F = m.faces
        cull = m.is_watertight
        fn = m.face_normals
        # myke normaler: vertex-normal hvis den ligger nær flatenormalen, ellers flat (skarpe kanter beholdes)
        vn = np.zeros_like(V, dtype=float)                 # areavektede vertex-normaler, uten scipy
        np.add.at(vn, F.ravel(), np.repeat(fn * m.area_faces[:, None], 3, axis=0))
        vn /= np.linalg.norm(vn, axis=1, keepdims=True) + 1e-12
        for fi in np.argsort(-(pz[F].mean(1))):  # bakfra og frem gir tidlig z-avvisning
            n = fn[fi]
            if cull and n @ fwd > 0.02:
                continue  # baksidetrekant
            i0, i1, i2 = F[fi]
            x0, x1, x2 = px[i0], px[i1], px[i2]
            y0, y1, y2 = py[i0], py[i1], py[i2]
            xmin, xmax = int(max(min(x0, x1, x2), 0)), int(min(max(x0, x1, x2) + 1, W))
            ymin, ymax = int(max(min(y0, y1, y2), 0)), int(min(max(y0, y1, y2) + 1, H))
            if xmax <= xmin or ymax <= ymin:
                continue
            den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
            if abs(den) < 1e-12:
                continue
            gx, gy = np.meshgrid(np.arange(xmin, xmax) + 0.5, np.arange(ymin, ymax) + 0.5)
            w0 = ((y1 - y2) * (gx - x2) + (x2 - x1) * (gy - y2)) / den
            w1 = ((y2 - y0) * (gx - x2) + (x0 - x2) * (gy - y2)) / den
            w2 = 1 - w0 - w1
            inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
            if not inside.any():
                continue
            z = w0 * pz[i0] + w1 * pz[i1] + w2 * pz[i2]
            sub = zbuf[ymin:ymax, xmin:xmax]
            mask = inside & (z < sub)
            if not mask.any():
                continue
            ns = []
            for vi in (i0, i1, i2):
                ns.append(vn[vi] if vn[vi] @ n > 0.995 else n)
            nn = w0[..., None] * ns[0] + w1[..., None] * ns[1] + w2[..., None] * ns[2]
            nn /= np.linalg.norm(nn, axis=-1, keepdims=True) + 1e-12
            diff = np.clip(nn @ L, 0, 1)
            h = L - fwd; h /= np.linalg.norm(h)
            spec = np.clip(nn @ h, 0, 1) ** 40 * 0.25
            shade = 0.32 + 0.68 * diff
            c = np.clip(shade[..., None] * col + spec[..., None], 0, 1)
            sub[mask] = z[mask]
            img[ymin:ymax, xmin:xmax][mask] = c[mask]
            nbuf[ymin:ymax, xmin:xmax][mask] = nn[mask]
            idbuf[ymin:ymax, xmin:xmax][mask] = mi

    if outline:
        hit = np.isfinite(zbuf)
        zz = np.where(hit, zbuf, zbuf[hit].max() + 50 if hit.any() else 0)
        edge = np.zeros((H, W), bool)
        for dy, dx in ((0, 1), (1, 0)):
            a, b = zz[: H - dy, : W - dx], zz[dy:, dx:]
            dz = np.abs(a - b) > 1.2 / scale * 4
            dn = (nbuf[: H - dy, : W - dx] * nbuf[dy:, dx:]).sum(-1) < 0.75
            did = idbuf[: H - dy, : W - dx] != idbuf[dy:, dx:]
            both = hit[: H - dy, : W - dx] & hit[dy:, dx:]
            e = ((dz | dn) & both) | did
            edge[: H - dy, : W - dx] |= e
        img[edge] = img[edge] * 0.35

    fig = plt.figure(figsize=(W / 200, H / 200), dpi=200)
    ax = fig.add_axes([0, 0, 1, 1]); ax.imshow(img); ax.axis("off")
    if title:
        ax.text(W / 2, H * 0.05, title, ha="center", va="top", fontsize=11, color="#3a4a3f")
    fig.savefig(path, facecolor=bg); plt.close(fig)
    return path
