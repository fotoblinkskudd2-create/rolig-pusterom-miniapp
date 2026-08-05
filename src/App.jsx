import { useState } from 'react';
import { useCouple } from './context/CoupleContext.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Session from './pages/Session.jsx';
import PlanScreen from './pages/PlanScreen.jsx';
import History from './pages/History.jsx';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const { me } = useCouple();
  const [screen, setScreen] = useState('home');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);

  if (!me) return <Onboarding />;

  function goHome() {
    setActiveSessionId(null);
    setActivePlanId(null);
    setScreen('home');
  }

  function startSession(sessionId) {
    setActiveSessionId(sessionId);
    setScreen('session');
  }

  function sessionFinished(planId) {
    setActivePlanId(planId);
    setScreen('plan');
  }

  function viewPlan(planId) {
    setActivePlanId(planId);
    setScreen('plan');
  }

  const showNav = screen === 'home' || screen === 'history';

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === 'home' && <Home onStartSession={startSession} />}
        {screen === 'session' && activeSessionId && (
          <Session sessionId={activeSessionId} onDone={sessionFinished} onExit={goHome} />
        )}
        {screen === 'plan' && activePlanId && <PlanScreen planId={activePlanId} onDone={goHome} />}
        {screen === 'history' && <History onViewPlan={viewPlan} />}
      </main>
      {showNav && <NavBar screen={screen} onNavigate={setScreen} />}
    </div>
  );
}
