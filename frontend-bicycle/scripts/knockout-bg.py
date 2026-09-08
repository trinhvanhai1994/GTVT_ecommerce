"""Download product shots and knock out near-white studio background from edges."""
from __future__ import annotations

import io
import urllib.request
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "products"
OUT.mkdir(parents=True, exist_ok=True)

ITEMS = [
    ("bluera-bl8", "https://dailyxedien.vn/wp-content/uploads/2025/06/MAKET-CT-XEDAPDIEN-Copy-40.jpg"),
    ("bluera-bl8-new", "https://dailyxedien.vn/wp-content/uploads/2025/08/MAKET-CT-XEDAPDIEN-Copy-41-1.jpg"),
    ("bluera-s6", "https://dailyxedien.vn/wp-content/uploads/2025/05/MAKET-CT-XEDAPDIEN-Copy-47.jpg"),
    ("bluera-s6-plus", "https://dailyxedien.vn/wp-content/uploads/2026/06/z7953831716649_9f53b0aea06acae139dd1d92479fb2fc.jpg"),
    ("cap-super-max-2025", "https://dailyxedien.vn/wp-content/uploads/2025/07/MAKET-CT-XEDAPDIEN-Copy-67.jpg"),
    ("swan-ai-2026", "https://dailyxedien.vn/wp-content/uploads/2025/10/MAKET-CT-XEDAPDIEN-Copy-15-1.jpg"),
    ("camelo-i8-ai-2026", "https://dailyxedien.vn/wp-content/uploads/2025/10/MAKET-CT-XEDAPDIEN-Copy-09-1.jpg"),
    ("bee-u-ai", "https://dailyxedien.vn/wp-content/uploads/2025/10/MAKET-CT-XEDAPDIEN-Copy-01-1.jpg"),
    ("133-ip6-x24s", "https://dailyxedien.vn/wp-content/uploads/2024/02/MAKET-CT-XEDAPDIEN-Copy-72.jpg"),
    ("133-ip6-pro-s", "https://dailyxedien.vn/wp-content/uploads/2024/11/MAKET-CT-XEDAPDIEN-Copy-85.jpg"),
    ("minion-s", "https://dailyxedien.vn/wp-content/uploads/2024/11/xe-dap-dien-Bluera-minion-s.png"),
    ("mini-kute-s", "https://dailyxedien.vn/wp-content/uploads/2024/11/Xe-dap-dien-Mini-Kute-s.png"),
    ("camelo-i8", "https://dailyxedien.vn/wp-content/uploads/2024/07/xe-dap-dien-CameloI8-01.jpg"),
    ("mini-kute", "https://dailyxedien.vn/wp-content/uploads/2024/07/Xe-dap-dien-Mini-Kute-01.jpg"),
    ("swan-i6", "https://dailyxedien.vn/wp-content/uploads/2024/07/xe-dap-dien-Swan-I6-01.jpg"),
]


def is_bg(r: int, g: int, b: int, a: int) -> bool:
    if a < 16:
        return True
    mx, mn = max(r, g, b), min(r, g, b)
    # near-white / light gray studio
    if r > 228 and g > 228 and b > 228 and (mx - mn) < 28:
        return True
    return False


def knock_out(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def idx(x: int, y: int) -> int:
        return y * w + x

    def push(x: int, y: int) -> None:
        i = idx(x, y)
        if seen[i]:
            return
        r, g, b, a = px[x, y]
        if not is_bg(r, g, b, a):
            return
        seen[i] = 1
        q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        if x:
            push(x - 1, y)
        if x + 1 < w:
            push(x + 1, y)
        if y:
            push(x, y - 1)
        if y + 1 < h:
            push(x, y + 1)

    # soften remaining near-white fringe next to transparent
    src = im.copy().load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = src[x, y]
            if a == 0:
                continue
            if r > 250 and g > 250 and b > 250:
                n = 0
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < w and 0 <= yy < h and src[xx, yy][3] == 0:
                        n += 1
                if n:
                    px[x, y] = (r, g, b, 0)

    return im


def fetch(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=40) as res:
        data = res.read()
    return Image.open(io.BytesIO(data))


def main() -> None:
    for name, url in ITEMS:
        dest = OUT / f"{name}.png"
        print("processing", name)
        try:
            im = fetch(url)
        except Exception as e:
            print("  fail download", e)
            continue
        out = knock_out(im)
        # crop transparent padding a bit
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        out.save(dest, "PNG")
        print("  saved", dest.name, out.size)


if __name__ == "__main__":
    main()
