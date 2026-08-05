import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function PlanScreen({ planId, onDone }) {
  const [plan, setPlan] = useState(null);
  const [steps, setSteps] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPlan(planId).then((p) => {
      setPlan(p);
      setSteps(p.steps);
    });
  }, [planId]);

  if (!plan) return <div className="page center-page">Loading your plan…</div>;

  function updateStepText(index, text) {
    setSaved(false);
    setSteps((s) => s.map((step, i) => (i === index ? { ...step, text } : step)));
  }

  function toggleDone(index) {
    setSteps((s) => s.map((step, i) => (i === index ? { ...step, done: !step.done } : step)));
  }

  function removeStep(index) {
    setSaved(false);
    setSteps((s) => s.filter((_, i) => i !== index));
  }

  function addStep() {
    setSaved(false);
    setSteps((s) => [...s, { text: '', done: false }]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.savePlan(planId, steps);
      setSteps(updated.steps);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page plan-page">
      <div className="hero-emoji">🗺️</div>
      <h1>Your action plan</h1>
      <p className="subtitle">Three small steps, based on what you both shared. Edit anything you like.</p>

      <div className="stack">
        {steps.map((step, i) => (
          <div className="plan-step" key={i}>
            <input
              type="checkbox"
              checked={step.done}
              onChange={() => toggleDone(i)}
              aria-label="Mark step done"
            />
            <input
              className="text-input plan-step-input"
              value={step.text}
              onChange={(e) => updateStepText(i, e.target.value)}
            />
            <button className="icon-btn" onClick={() => removeStep(i)} aria-label="Remove step">
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={addStep}>
        + Add a step
      </button>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save plan'}
      </button>

      <button className="btn btn-link" onClick={onDone}>
        Done for now
      </button>
    </div>
  );
}
