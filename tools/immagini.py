#!/usr/bin/env python3
"""
Ritaglia e ottimizza le foto del sito.

  python3 tools/immagini.py

Legge gli originali da assets/img/originali/ e scrive i derivati in assets/img/.
Ogni derivato esce in piu' larghezze (srcset) e in formato WebP.
I metadati EXIF (fra cui la posizione GPS) vengono rimossi.
"""

import os
import sys

from PIL import Image, ImageOps

QUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(QUI, "assets", "img", "originali")
DEST = os.path.join(QUI, "assets", "img")

# Larghezze generate per ogni slot (la piu' grande e' quella di riferimento).
LARGHEZZE = {
    "21-9": [2400, 1600, 1000],
    "2-1": [1800, 1200, 800],
    "4-5": [1400, 1000, 700],
    "1-1": [1200, 800, 500],
}

# nome_uscita, file_originale, proporzione, fuoco_x, fuoco_y
#   fuoco_x / fuoco_y = punto (0..1) che deve restare al centro del ritaglio.
RICETTE = [
    # ---- sopra la piega ----
    ("hero",          "grigliata-bosco.jpg",   "21-9", 0.50, 0.62),
    ("chill-cover",   "vista-finestra.jpg",    "4-5",  0.50, 0.50),
    ("sfascio-cover", "bar-bottiglie.jpg",     "4-5",  0.50, 0.55),
    # ---- schede destinazione ----
    ("chill-1",       "casa-notte.jpg",        "4-5",  0.50, 0.52),
    ("sfascio-1",     "concerto.jpg",          "4-5",  0.575, 0.45),
    # Quando arriva la foto dello chalet, mettila in originali/chalet-quota.jpg,
    # riporta qui sopra sfascio-cover su "chalet-quota.jpg" e rilancia lo script.
    # ---- archivio: mare, montagna, estate, inverno ----
    ("arch-1",        "spiaggia-montagna.jpg", "2-1",  0.50, 0.62),
    ("arch-2",        "barca-tramonto.jpg",    "1-1",  0.50, 0.55),
    ("arch-3",        "piscina-alto.jpg",      "1-1",  0.50, 0.60),
    ("arch-4",        "tramonto-mare.jpg",     "1-1",  0.50, 0.71),
    ("arch-5",        "cortile-fontana.jpg",   "1-1",  0.50, 0.55),
    ("arch-6",        "banus-notte.jpg",       "2-1",  0.50, 0.50),
    ("arch-7",        "piscina-residence.jpg", "2-1",  0.50, 0.55),
    ("arch-8",        "yacht-costa.jpg",       "1-1",  0.50, 0.52),
    ("arch-9",        "grigliata-bosco.jpg",   "1-1",  0.42, 0.62),
    ("arch-10",       "concerto.jpg",          "1-1",  0.575, 0.40),
    ("arch-11",       "casa-notte.jpg",        "1-1",  0.50, 0.62),
]

PROPORZIONI = {"21-9": 21 / 9, "2-1": 2 / 1, "4-5": 4 / 5, "1-1": 1 / 1}


def ritaglia(im, rapporto, fx, fy):
    """Ritaglio piu' grande possibile con la proporzione voluta, centrato sul fuoco."""
    w, h = im.size
    if w / h > rapporto:
        nh, nw = h, int(round(h * rapporto))
    else:
        nw, nh = w, int(round(w / rapporto))
    sx = min(max(int(round(fx * w - nw / 2)), 0), w - nw)
    sy = min(max(int(round(fy * h - nh / 2)), 0), h - nh)
    return im.crop((sx, sy, sx + nw, sy + nh))


def main():
    if not os.path.isdir(ORIG):
        sys.exit("manca la cartella %s" % ORIG)

    fatti, saltati, peso = 0, [], 0
    for nome, sorgente, prop, fx, fy in RICETTE:
        percorso = os.path.join(ORIG, sorgente)
        if not os.path.exists(percorso):
            saltati.append((nome, sorgente))
            continue

        im = ImageOps.exif_transpose(Image.open(percorso)).convert("RGB")
        tagliata = ritaglia(im, PROPORZIONI[prop], fx, fy)

        for larghezza in LARGHEZZE[prop]:
            if larghezza > tagliata.width:
                larghezza = tagliata.width
            altezza = int(round(larghezza / PROPORZIONI[prop]))
            fuori = tagliata.resize((larghezza, altezza), Image.LANCZOS)
            uscita = os.path.join(DEST, "%s-%d.webp" % (nome, larghezza))
            fuori.save(uscita, "WEBP", quality=80, method=6)
            peso += os.path.getsize(uscita)
            fatti += 1
        print("  %-14s %s  %dx%d" % (nome, prop, tagliata.width, tagliata.height))

    print("\n%d file, %.1f MB in totale" % (fatti, peso / 1048576))
    if saltati:
        print("\nOriginali mancanti (slot lasciati vuoti nel sito):")
        for nome, sorgente in saltati:
            print("  %-14s attende assets/img/originali/%s" % (nome, sorgente))


if __name__ == "__main__":
    main()
