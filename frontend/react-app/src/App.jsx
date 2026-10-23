import { useState } from 'react';
import { ArrowUpRight, BrainCircuit, CircleHelp, Crown, LogIn, Menu, Settings2, Shield, Sparkles, UserPlus, Zap } from 'lucide-react';

const features = [
  { icon: BrainCircuit, title: 'Clever pursuit', description: 'A ghost that uses A* pathfinding to track your route.' },
  { icon: Zap, title: 'Power-ups', description: 'Freeze your pursuer, burst forward, or break through walls.' },
  { icon: Shield, title: 'Every run counts', description: 'Survive longer, reach the exit, and build your high score.' },
];

function ActionButton({ children, primary = false, onClick }) {
  return <button className={primary ? 'action-button action-primary' : 'action-button'} onClick={onClick} type="button">{children}</button>;
}

export default function App() {
  const [panel, setPanel] = useState('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const openPanel = (name) => { setPanel(name); setMobileNavOpen(false); };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => openPanel('home')} aria-label="MazeScape home">
          <span className="brand-mark"><Sparkles size={19} /></span><span>maze<span className="brand-accent">scape</span></span>
        </a>
        <button className="mobile-menu-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation"><Menu size={21} /></button>
        <nav className={mobileNavOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
          <button onClick={() => openPanel('help')}><CircleHelp size={16} /> How to play</button>
          <button onClick={() => openPanel('leaderboard')}><Crown size={16} /> Leaderboard</button>
          <button onClick={() => openPanel('settings')}><Settings2 size={16} /> Settings</button>
          <button className="nav-login" onClick={() => openPanel('login')}><LogIn size={16} /> Sign in</button>
        </nav>
      </header>

      {panel === 'home' ? (
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> THE MAZE IS WAITING</div>
            <h1>Think fast.<br /><span>Find your way out.</span></h1>
            <p className="hero-description">Every turn is a decision. Outsmart the hunter, collect power-ups, and make it to the exit before the maze closes in.</p>
            <div className="hero-actions">
              <ActionButton primary onClick={() => openPanel('game')}>Enter the maze <ArrowUpRight size={18} /></ActionButton>
              <ActionButton onClick={() => openPanel('help')}>How to play</ActionButton>
            </div>
            <div className="hero-meta"><span><i className="meta-dot green" /> Procedural mazes</span><span><i className="meta-dot blue" /> AI-powered pursuit</span></div>
          </div>

          <div className="maze-preview" aria-label="Decorative maze preview">
            <div className="preview-topline"><span>SECTOR 07</span><span className="live-label"><i /> LIVE SIMULATION</span></div>
            <div className="maze-grid">
              {Array.from({ length: 100 }, (_, index) => {
                const walls = [1,2,7,8,11,17,21,22,23,27,31,37,41,42,47,48,51,57,61,62,67,71,72,73,77,81,87,91,92,97,98];
                const className = ['maze-cell', walls.includes(index) ? 'cell-wall' : '', index === 90 ? 'cell-player' : '', index === 18 ? 'cell-ghost' : '', index === 9 ? 'cell-exit' : ''].filter(Boolean).join(' ');
                return <div key={index} className={className}>{index === 90 && <span className="player-core" />}{index === 18 && <span className="ghost-core" />}{index === 9 && <span className="exit-core" />}</div>;
              })}
            </div>
            <div className="preview-footer"><span><i className="legend-player" /> YOU</span><span><i className="legend-ghost" /> PURSUER</span><span><i className="legend-exit" /> EXIT</span></div>
          </div>

          <div className="feature-strip">{features.map(({ icon: Icon, title, description }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={19} /></div><div><h2>{title}</h2><p>{description}</p></div></article>)}</div>
        </section>
      ) : (
        <section className="subpage">
          <button className="back-link" onClick={() => openPanel('home')}>← Back to home</button>
          <div className="subpage-card">
            {panel === 'game' && <><div className="subpage-icon"><BrainCircuit size={25} /></div><p className="eyebrow">GAME ENGINE INTEGRATION</p><h1>The maze is being prepared.</h1><p className="subpage-copy">This React interface is scaffolded separately while the existing Canvas game is preserved. The next migration step is to connect the original game engine and controls here before this frontend replaces the live site.</p><ActionButton primary onClick={() => openPanel('home')}>Back to menu</ActionButton></>}
            {panel === 'help' && <><div className="subpage-icon"><CircleHelp size={25} /></div><p className="eyebrow">QUICK GUIDE</p><h1>Three things to remember.</h1><ul className="guide-list"><li><b>Move with purpose.</b><span>Use your keyboard to navigate the maze.</span></li><li><b>Watch the pursuer.</b><span>The ghost plans a route toward you.</span></li><li><b>Find the exit.</b><span>Use power-ups wisely and reach the golden exit.</span></li></ul></>}
            {panel === 'leaderboard' && <><div className="subpage-icon"><Crown size={25} /></div><p className="eyebrow">HALL OF FAME</p><h1>Leaderboard</h1><p className="subpage-copy">Leaderboard data will be connected to the existing API during the integration phase.</p></>}
            {panel === 'settings' && <><div className="subpage-icon"><Settings2 size={25} /></div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="subpage-copy">Game preferences will be wired to the existing settings controls during migration.</p></>}
            {panel === 'login' && <><div className="subpage-icon"><LogIn size={25} /></div><p className="eyebrow">WELCOME BACK</p><h1>Sign in to MazeScape</h1><p className="subpage-copy">The current authentication flow will be connected before launch.</p><div className="auth-actions"><ActionButton primary onClick={() => openPanel('home')}>Return to menu</ActionButton><ActionButton onClick={() => openPanel('register')}><UserPlus size={16} /> Create account</ActionButton></div></>}
            {panel === 'register' && <><div className="subpage-icon"><UserPlus size={25} /></div><p className="eyebrow">JOIN THE RUN</p><h1>Create your account</h1><p className="subpage-copy">The existing registration API will be connected during migration.</p><ActionButton primary onClick={() => openPanel('login')}>Already have an account? Sign in</ActionButton></>}
          </div>
        </section>
      )}
      <footer className="site-footer"><span>MAZESCAPE <b className="footer-separator">/</b> NAVIGATE · SURVIVE · ESCAPE</span><span>BUILT FOR THE CURIOUS</span></footer>
    </main>
  );
}
