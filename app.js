const actions = [
  "Gå ut i frisk luft i 5 minutter",
  "Drikk et glass vann sakte",
  "Sett deg og kjenn føttene i gulvet",
  "Skriv ned én ting du er takknemlig for",
  "Ta tre dype pust der du er",
  "Legg telefonen bort i 10 minutter",
  "Strekk armene over hodet",
  "Skriv én setning som er sann akkurat nå",
  "Legg merke til tre ting du kan se, høre og kjenne"
];

let selectedMood = null;
let breathing = false;
let breathTimer = null;
let phase = 0; // 0 inhale, 1 hold, 2 exhale

document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = btn.dataset.mood;
  });
});

document.querySelectorAll('.nav button').forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.dataset.page));
});
document.getElementById('breathBtn').addEventListener('click', toggleBreath);
document.getElementById('checkinBtn').addEventListener('click', saveCheckin);
document.getElementById('gotoPusteromBtn').addEventListener('click', () => switchPage('pusterom'));

function saveCheckin() {
  if (!selectedMood) {
    alert('Velg hvordan du har det først.');
    return;
  }
  const note = document.getElementById('note').value.trim();
  const entry = {
    date: new Date().toISOString(),
    mood: selectedMood,
    note: note
  };
  const list = JSON.parse(localStorage.getItem('checkins') || '[]');
  list.unshift(entry);
  localStorage.setItem('checkins', JSON.stringify(list));
  document.getElementById('saveMsg').classList.add('show');
  document.getElementById('note').value = '';
  selectedMood = null;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  setTimeout(() => document.getElementById('saveMsg').classList.remove('show'), 4000);
  renderHistory();
}

function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.page === name);
  });
  if (name === 'historikk') renderHistory();
  if (name === 'grep') renderActions();
}

function toggleBreath() {
  const btn = document.getElementById('breathBtn');
  const circle = document.getElementById('breathCircle');
  const text = document.getElementById('breathText');
  if (!breathing) {
    breathing = true;
    btn.textContent = 'Stopp';
    phase = 0;
    runBreathCycle();
  } else {
    breathing = false;
    clearTimeout(breathTimer);
    btn.textContent = 'Start';
    text.textContent = 'Trykk start';
    circle.className = 'circle';
  }
}

function runBreathCycle() {
  if (!breathing) return;
  const circle = document.getElementById('breathCircle');
  const text = document.getElementById('breathText');
  if (phase === 0) {
    text.textContent = 'Pust inn…';
    circle.className = 'circle inhale';
    breathTimer = setTimeout(() => { phase = 1; runBreathCycle(); }, 4000);
  } else if (phase === 1) {
    text.textContent = 'Hold…';
    breathTimer = setTimeout(() => { phase = 2; runBreathCycle(); }, 2000);
  } else {
    text.textContent = 'Pust ut…';
    circle.className = 'circle exhale';
    breathTimer = setTimeout(() => { phase = 0; runBreathCycle(); }, 6000);
  }
}

function renderActions() {
  const done = JSON.parse(localStorage.getItem('doneActions') || '{}');
  const today = new Date().toDateString();
  const list = document.getElementById('actionsList');
  list.innerHTML = '';
  actions.forEach((a, i) => {
    const isDone = done[today] && done[today].includes(i);
    const card = document.createElement('div');
    card.className = 'action-card' + (isDone ? ' done' : '');
    const label = document.createElement('span');
    label.textContent = a;
    const doneBtn = document.createElement('button');
    doneBtn.textContent = isDone ? '✓' : 'Gjør';
    doneBtn.addEventListener('click', () => toggleAction(i));
    card.append(label, doneBtn);
    list.appendChild(card);
  });
}

function toggleAction(i) {
  const done = JSON.parse(localStorage.getItem('doneActions') || '{}');
  const today = new Date().toDateString();
  if (!done[today]) done[today] = [];
  const idx = done[today].indexOf(i);
  if (idx > -1) done[today].splice(idx, 1);
  else done[today].push(i);
  localStorage.setItem('doneActions', JSON.stringify(done));
  renderActions();
}

function renderHistory() {
  const list = JSON.parse(localStorage.getItem('checkins') || '[]');
  const container = document.getElementById('historyList');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p class="support">Ingen sjekk-ins ennå. Det er greit.</p>';
  } else {
    list.slice(0, 20).forEach(e => {
      const d = new Date(e.date);
      const moodEmoji = ['', '😔', '😕', '😐', '🙂', '😌'][e.mood] || '😐';
      const item = document.createElement('div');
      item.className = 'history-item';
      const dateDiv = document.createElement('div');
      dateDiv.className = 'date';
      dateDiv.textContent = `${d.toLocaleDateString('no-NO', {weekday:'short', day:'numeric', month:'short'})} · ${moodEmoji}`;
      item.appendChild(dateDiv);
      if (e.note) {
        const noteDiv = document.createElement('div');
        noteDiv.textContent = e.note;
        item.appendChild(noteDiv);
      }
      container.appendChild(item);
    });
  }
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const weekCount = list.filter(e => new Date(e.date) > weekAgo).length;
  document.getElementById('weekSummary').textContent = `Du har tatt vare på deg selv ${weekCount} ganger denne uken. Det er fint.`;
}

renderActions();
renderHistory();
