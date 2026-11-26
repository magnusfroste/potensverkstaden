#!/usr/bin/env python3
"""mp3.py — färdiga röstfiler för Potensverkstaden.

Appen säger bara dessa meningar (app.js anropar tal() med dem):
  - nivåintrot, tre stycken
  - "Rätt!" och de tre ledtrådarna
  - "Nivå N klar. Du fick K stjärnor." (N=1..3, K=0..8)
  - "Alla tre nivåerna är klara!"

Kör: python3 mp3.py   (skriver public/ljud/*.mp3 och lines.js)
"""
import hashlib
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "public")
LJUD = os.path.join(PUB, "ljud")
os.makedirs(LJUD, exist_ok=True)

VOICE = "sv-SE-SofieNeural"
RATE = "-4%"

INTRO = {
    1: "Nivå 1. Skriv talet i grundpotensform. Välj siffran framför tian och stega exponenten.",
    2: "Nivå 2. Nu är talen små, så exponenten blir negativ.",
    3: ("Nivå 3. Läs prefixet och skriv talet i grundenheten. Giga är tio upphöjt till nio, "
        "mikro tio upphöjt till minus sex."),
}


def rader():
    ut = [INTRO[1], INTRO[2], INTRO[3]]
    ut += [
        "Rätt!",
        "Nästan. Siffran framför tian ska vara minst ett och mindre än tio.",
        "Nästan. Rätt siffra! Räkna hur många steg kommatecknet flyttas.",
        "Titta på den bricka som lyser.",
        "Alla tre nivåerna är klara!",
    ]
    for n in (1, 2, 3):
        for k in range(0, 9):
            ut.append(f"Nivå {n} klar. Du fick 1 stjärna." if k == 1
                      else f"Nivå {n} klar. Du fick {k} stjärnor.")
    seen, uni = set(), []
    for t in ut:
        if t not in seen:
            seen.add(t)
            uni.append(t)
    return uni


def synth(text):
    fid = hashlib.sha1((VOICE + "|" + text).encode("utf-8")).hexdigest()[:10]
    path = os.path.join(LJUD, fid + ".mp3")
    if os.path.exists(path) and os.path.getsize(path) > 400:
        return fid
    for _ in range(4):
        p = subprocess.run(
            ["edge-tts", "--text", text, "--voice", VOICE, "--rate", RATE, "--write-media", path],
            capture_output=True, text=True, timeout=90)
        if p.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 400:
            return fid
    if os.path.exists(path):
        os.remove(path)
    return None


def main():
    lista = rader()
    lines, miss = {}, 0
    for i, text in enumerate(lista, 1):
        fid = synth(text)
        if not fid:
            miss += 1
            print("MISS", text[:70])
            continue
        lines[text] = fid
        print(f"{i}/{len(lista)}", flush=True)
    with open(os.path.join(LJUD, "lines.js"), "w", encoding="utf-8") as f:
        f.write("window.__ROST = " + json.dumps(lines, ensure_ascii=False, indent=1) + ";\n")
    src = os.path.join(HERE, "..", "tools", "rosten.js")
    open(os.path.join(LJUD, "rosten.js"), "w", encoding="utf-8").write(
        open(src, encoding="utf-8").read())
    print(f"lines: {len(lines)}  miss: {miss}")


if __name__ == "__main__":
    main()