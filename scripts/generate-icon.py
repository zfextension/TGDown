#!/usr/bin/env python3
"""Generate TG download extension icons (blue paper plane + download arrow)."""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / 'public' / 'icons'


def make_icon(size: int) -> Image.Image:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    blue_top = (56, 189, 248, 255)
    blue_bottom = (37, 99, 235, 255)
    white = (255, 255, 255, 255)
    white_soft = (255, 255, 255, 70)

    for y in range(size):
        t = y / max(size - 1, 1)
        color = tuple(
            int(blue_top[i] + (blue_bottom[i] - blue_top[i]) * t) for i in range(3)
        ) + (255,)
        draw.line([(0, y), (size, y)], fill=color)

    pad = max(2, size // 13)
    radius = max(6, size // 6)
    left, top, right, bottom = pad, pad, size - pad, size - pad
    notch_w = max(10, size // 5)
    notch_h = max(4, size // 13)
    cx = size // 2
    line_w = max(2, size // 22)

    def corner_pts(x0: float, y0: float, r: float, start_deg: float, steps: int = 8):
        pts = []
        for i in range(steps + 1):
            ang = math.radians(start_deg + i * (90 / steps))
            pts.append((x0 + r * math.cos(ang), y0 + r * math.sin(ang)))
        return pts

    frame = [
        (left + radius, top),
        (cx - notch_w // 2, top),
        (cx - notch_w // 4, top - notch_h),
        (cx + notch_w // 4, top - notch_h),
        (cx + notch_w // 2, top),
        (right - radius, top),
        *corner_pts(right - radius, top + radius, radius, 270),
        (right, bottom - radius),
        *corner_pts(right - radius, bottom - radius, radius, 0),
        (left + radius, bottom),
        *corner_pts(left + radius, bottom - radius, radius, 90),
        (left, top + radius),
        *corner_pts(left + radius, top + radius, radius, 180),
    ]

    inset = max(2, size // 18)
    il, it, ir, ib = left + inset, top + inset, right - inset, bottom - inset
    inner_r = max(4, radius - 2)
    inner = [
        (il + inner_r, it),
        (cx - notch_w // 2 + 2, it),
        (cx - notch_w // 4 + 1, it - notch_h + 2),
        (cx + notch_w // 4 - 1, it - notch_h + 2),
        (cx + notch_w // 2 - 2, it),
        (ir - inner_r, it),
        *corner_pts(ir - inner_r, it + inner_r, inner_r, 270),
        (ir, ib - inner_r),
        *corner_pts(ir - inner_r, ib - inner_r, inner_r, 0),
        (il + inner_r, ib),
        *corner_pts(il + inner_r, ib - inner_r, inner_r, 90),
        (il, it + inner_r),
        *corner_pts(il + inner_r, it + inner_r, inner_r, 180),
    ]

    draw.polygon(inner, fill=white_soft)
    draw.line(frame + [frame[0]], fill=white, width=line_w, joint='curve')

    k = size / 128.0
    sx = sy = 3.6 * k
    ox, oy = 18 * k, 12 * k

    def sp(x: float, y: float):
        return (ox + x * sx, oy + y * sy)

    plane = [sp(2, 9.5), sp(22, 3), sp(13.5, 21), sp(11, 13.5)]
    draw.polygon(plane, fill=white)
    draw.line([sp(11, 13.5), sp(22, 3)], fill=(200, 230, 255, 160), width=max(1, int(2 * k)))

    ax = size // 2
    ay1, ay2 = int(86 * k), int(104 * k)
    aw = int(10 * k)
    shaft_w = max(2, int(8 * k))
    draw.rounded_rectangle(
        (ax - shaft_w // 2, ay1, ax + shaft_w // 2, ay2 - int(6 * k)),
        radius=max(1, int(2 * k)),
        fill=white,
    )
    draw.polygon(
        [(ax - aw, ay2 - int(8 * k)), (ax + aw, ay2 - int(8 * k)), (ax, ay2 + int(2 * k))],
        fill=white,
    )

    return img


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for s in (16, 32, 48, 128):
        path = OUT_DIR / f'logo_{s}.png'
        make_icon(s).save(path, 'PNG')
        print(f'saved {path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
