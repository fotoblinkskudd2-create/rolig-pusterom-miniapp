export default function NavBar({ screen, onNavigate }) {
  return (
    <nav className="nav-bar">
      <button
        className={screen === 'home' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onNavigate('home')}
      >
        <span className="nav-icon">🏡</span>
        Home
      </button>
      <button
        className={screen === 'history' ? 'nav-btn active' : 'nav-btn'}
        onClick={() => onNavigate('history')}
      >
        <span className="nav-icon">📖</span>
        History
      </button>
    </nav>
  );
}
