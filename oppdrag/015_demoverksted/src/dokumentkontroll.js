// Dokumentkontroll (samme regler som oppdrag 8, i nettleseren): filtype, størrelse, obligatoriske krav.
export function kontroller(input) {
  const resultat = input.krav.map(k => {
    const fil = input.filer.filter(f => f.krav === k.id).at(-1);
    const feil = [];
    if (fil) {
      const ext = fil.filnavn.split(".").pop().toLowerCase();
      if (!k.filtyper.includes(ext)) feil.push(`filtype .${ext} ikke tillatt (${k.filtyper.join(", ")})`);
      if (fil.kb > k.maksKB) feil.push(`${fil.kb} kB over maks ${k.maksKB} kB`);
    }
    const status = !fil ? "mangler" : feil.length ? "avvist" : fil.godkjent ? "oppfylt" : "til kontroll";
    return { ...k, fil: fil ? fil.filnavn : null, feil, status };
  });
  const blokkerer = resultat.filter(r => r.obligatorisk && r.status !== "oppfylt").map(r => `${r.id} ${r.navn}: ${r.status}`);
  return { resultat, blokkerer, kanFerdigstilles: blokkerer.length === 0 };
}
