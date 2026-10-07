// Jev-transport. KUN Node / server. Aldri i nettleseren: nøkkelen ville ligget åpent i sidekilden.
// Av som standard. Appen (index.html) bruker den ikke. Den er lokal-first.
//
// Nøkkel og endepunkt leses fra miljøet (.env, se .env.example). Aldri i kode, aldri i logg.
//
// UVERIFISERT: Formen på forespørsel og svar under er bygget fra offentlige beskrivelser
// (state + typede spørsmål inn, etikett + sannsynligheter + confidence ut).
// Sjekk mot Jevs egen API-dokumentasjon før bruk og rett toRequest/fromResponse.

function toRequest(q) {
  return {
    state: q.state,
    questions: [{ id: q.id, type: 'choice', question: q.text, options: q.options }]
  };
}

function fromResponse(body, q) {
  const a = (body.answers || []).find(x => x.id === q.id) || (body.answers || [])[0] || {};
  return { label: String(a.answer ?? a.label ?? ''), confidence: Number(a.confidence) };
}

function jevTransport({ apiKey = process.env.JEV_API_KEY, endpoint = process.env.JEV_ENDPOINT, timeoutMs = 3000 } = {}) {
  if (!apiKey || !endpoint) throw new Error('JEV_API_KEY og JEV_ENDPOINT må settes i .env');
  return async q => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(toRequest(q)),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) throw new Error(`Jev svarte ${res.status}`);
    return fromResponse(await res.json(), q);
  };
}

module.exports = { jevTransport, toRequest, fromResponse };
