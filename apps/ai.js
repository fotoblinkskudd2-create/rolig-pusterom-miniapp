// Shared helpers for the prototypes in /apps.
// Every app works offline in demo mode. Claude is opt-in: the user pastes their own
// Anthropic API key, which is stored only in this browser (localStorage) and sent
// only to api.anthropic.com.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }
};

const AI = {
  model: 'claude-opus-5-5',

  key() { return store.get('anthropic_key', ''); },
  enabled() { return !!this.key(); },

  // Renders the "Use Claude" bar into `el`. `onChange` fires when the key is set or cleared.
  mountKeyBar(el, onChange) {
    const draw = () => {
      if (this.enabled()) {
        el.innerHTML = '<span class="pill">Claude on</span><span>Text you submit is sent to Anthropic.</span>' +
          '<button class="small ghost" type="button">Turn off</button>';
        el.querySelector('button').onclick = () => { store.set('anthropic_key', ''); draw(); onChange && onChange(); };
      } else {
        el.innerHTML = '<span class="pill warn">Demo mode</span>' +
          '<input type="password" placeholder="Anthropic API key (optional)" autocomplete="off">' +
          '<button class="small" type="button">Use Claude</button>';
        el.querySelector('button').onclick = () => {
          const v = el.querySelector('input').value.trim();
          if (v) { store.set('anthropic_key', v); draw(); onChange && onChange(); }
        };
      }
    };
    draw();
  },

  // Reads a File into a content block Claude can see (image or PDF). Returns null for other types.
  async fileBlock(file) {
    if (!file) return null;
    const data = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    if (file.type === 'application/pdf') {
      return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } };
    }
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return { type: 'image', source: { type: 'base64', media_type: file.type, data } };
    }
    return null;
  },

  // One Messages API call that returns JSON matching `schema` (structured outputs).
  // `content` is a string or an array of content blocks.
  async json({ system, content, schema, effort = 'low' }) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.key(),
        'anthropic-version': '2026-10-21',
        'anthropic-beta': 'server-side-fallback-2026-07-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 16000,
        fallbacks: 'default',
        system,
        output_config: { effort, format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content }]
      })
    });
    if (!res.ok) {
      let detail = res.status + '';
      try { detail = (await res.json()).error.message; } catch (e) { /* keep status */ }
      throw new Error('Claude request failed: ' + detail);
    }
    const msg = await res.json();
    if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request.');
    if (msg.stop_reason === 'max_tokens') throw new Error('Response was cut off. Try a shorter input.');
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    return JSON.parse(text);
  }
};

// Strict JSON-schema helper: every listed property is required, no extras.
const obj = (properties) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false
});
const str = { type: 'string' };
const num = { type: 'number' };
const arr = (items) => ({ type: 'array', items });
