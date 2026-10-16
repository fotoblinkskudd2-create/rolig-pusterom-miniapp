"""Bygger landing/index.html fra src.html + data. Kjør: python3 landing/build.py"""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'landing/src.html').read_text()
hero = (root / 'promo/hero.svg').read_text().replace('viewBox="0 0 1600 900"', 'viewBox="800 80 780 760"').replace('<circle cx="1130" cy="450" r="170"', '<circle class="breath" cx="1130" cy="450" r="170"')
top = json.loads((root / 'data/top15.json').read_text())
ideas = json.loads((root / 'data/ideas250.json').read_text())
dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
out = src.replace('__HERO__', hero).replace('__TOP15__', dump(top)).replace('__IDEAS__', dump(ideas))
(root / 'landing/index.html').write_text(out)
print(f'landing/index.html: {len(out)//1024} KB')
