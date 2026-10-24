"""Minimalt kontrollrammeverk.

Hvert oppdrag har en kontroll.py som registrerer sjekker og skriver
faktisk resultat til resultat/kontroll.txt. Exitkode != 0 ved feil.
"""
import os
import sys
import time
import traceback


class Kontroll:
    def __init__(self, navn, mappe):
        self.navn = navn
        self.mappe = mappe
        self.linjer = []
        self.ok = 0
        self.feil = 0

    def sjekk(self, beskrivelse, betingelse, detalj=""):
        status = "BESTÅTT" if betingelse else "FEILET"
        if betingelse:
            self.ok += 1
        else:
            self.feil += 1
        linje = f"[{status}] {beskrivelse}"
        if detalj != "":
            linje += f"  — {detalj}"
        self.linjer.append(linje)
        print(linje)
        return betingelse

    def lik(self, beskrivelse, faktisk, forventet, toleranse=None):
        if toleranse is None:
            ok = faktisk == forventet
        else:
            ok = abs(faktisk - forventet) <= toleranse
        return self.sjekk(beskrivelse, ok, f"faktisk={faktisk!r} forventet={forventet!r}")

    def kaster(self, beskrivelse, funksjon, unntak=Exception):
        try:
            funksjon()
        except unntak as e:
            return self.sjekk(beskrivelse, True, f"{type(e).__name__}: {e}")
        except Exception as e:  # feil type unntak
            return self.sjekk(beskrivelse, False, f"uventet {type(e).__name__}: {e}")
        return self.sjekk(beskrivelse, False, "ingen feil ble kastet")

    def notat(self, tekst):
        self.linjer.append(f"  · {tekst}")
        print(f"  · {tekst}")

    def ferdig(self):
        os.makedirs(os.path.join(self.mappe, "resultat"), exist_ok=True)
        tid = time.strftime("%Y-%m-%d %H:%M:%S")
        hode = [f"# Kontroll: {self.navn}", f"Kjørt: {tid}",
                f"Resultat: {self.ok} bestått, {self.feil} feilet", ""]
        with open(os.path.join(self.mappe, "resultat", "kontroll.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(hode + self.linjer) + "\n")
        print(f"\n{self.ok} bestått, {self.feil} feilet")
        sys.exit(1 if self.feil else 0)


def kjor(navn, mappe, funksjon):
    k = Kontroll(navn, mappe)
    try:
        funksjon(k)
    except Exception:
        k.sjekk("kontrollskriptet kjørte uten krasj", False, traceback.format_exc().splitlines()[-1])
        traceback.print_exc()
    k.ferdig()
