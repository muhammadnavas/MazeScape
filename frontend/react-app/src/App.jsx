import { useState } from 'react';
import {
 ArrowRight,
 BrainCircuit,
 CircleHelp,
 Crown,
 LogIn,
 Menu,
 Settings2,
 ShieldCheck,
 UserPlus,
 Zap,
 X,
} from 'lucide-react';

const features = [
 { icon: BrainCircuit, title: 'Think ahead', description: 'Find your route through a new maze every run.' },
 { icon: Zap, title: 'Use your power-ups', description: 'Make smart moves when the chase gets close.' },
 { icon: ShieldCheck, title: 'Beat the chase', description: 'Avoid the ghost and reach the exit to win.' },
];

function Button({ children, variant = 'secondary', onClick }) {
 return <button type="button" className={`button button-${variant}`} onClick={onClick}>{children}</button>;
}

function MazeIllustration() {
 const walls = new Set([1,2,3,8,11,18,21,22,23,25,28,31,35,38,41,42,45,48,51,55,58,61,62,65,68,71,75,78,81,82,85,88,91,92,93,98]);
 return (
 <div className="maze-card" aria-label="Illustration of a maze">
 <div className="maze-card-heading"><span>THE DAILY CHALLENGE</span><span className="maze-status"><i /> READY TO PLAY</span></div>
 <div className="maze-board">
 {Array.from({ length: 100 }, (_, index) => (
 <div key={index} className={['maze-tile', walls.has(index) ? 'maze-wall': '', index === 90 ? 'maze-player': '', index === 18 ? 'maze-ghost': '', index === 9 ? 'maze-exit': ''].filter(Boolean).join(' ')}>
 {index === 90 && <span />}
 {index === 18 && <span />}
 {index === 9 && <span />}
 </div>
 ))}
 </div>
 <div className="maze-card-footer"><span><i className="key-player" /> Your position</span><span><i className="key-ghost" /> The ghost</span><span><i className="key-exit" /> Exit</span></div>
 </div>
 );
}

export default function App() {
 const [panel, setPanel] = useState('home');
 const [mobileNavOpen, setMobileNavOpen] = useState(false);

 const openPanel = (name) => {
 setPanel(name);
 setMobileNavOpen(false);
 };

 return (
 <main className="app-shell">
 <header className="topbar">
 <a className="brand" href="#home" onClick={() => openPanel('home')} aria-label="MazeScape home">
 <span className="brand-symbol">M</span>
 <span>MazeScape</span>
 </a>
 <button className="mobile-menu-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label={mobileNavOpen ? 'Close navigation': 'Open navigation'}>
 {mobileNavOpen ? <X size={19} />: <Menu size={19} />}
 </button>
 <nav className={mobileNavOpen ? 'nav-links nav-open': 'nav-links'} aria-label="Main navigation">
 <button onClick={() => openPanel('help')}><CircleHelp size={16} /> How to play</button>
 <button onClick={() => openPanel('leaderboard')}><Crown size={16} /> Leaderboard</button>
 <button onClick={() => openPanel('settings')}><Settings2 size={16} /> Settings</button>
 <Button onClick={() => openPanel('login')}><LogIn size={15} /> Sign in</Button>
 </nav>
 </header>

 {panel === 'home' ? (
 <section className="home-content">
 <div className="hero">
 <div className="hero-copy">
 <p className="eyebrow"><span /> A MAZE. A MIND. A WAY OUT.</p>
 <h1>Every move<br />makes a difference.</h1>
 <p className="hero-description">Find your way through a changing maze, stay one step ahead of the ghost, and reach the exit. How far can you get?</p>
 <div className="hero-actions">
 <Button variant="primary" onClick={() => openPanel('game')}>Play MazeScape <ArrowRight size={17} /></Button>
 <Button onClick={() => openPanel('help')}>How to play</Button>
 </div>
 <p className="hero-note">Free to play <span>·</span> New maze every run</p>
 </div>
 <MazeIllustration />
 </div>

 <section className="features-section" aria-labelledby="features-title">
 <div className="section-heading">
 <div><p className="eyebrow">BUILT AROUND YOUR NEXT MOVE</p><h2 id="features-title">Simple to learn. Hard to master.</h2></div>
 </div>
 <div className="feature-grid">
 {features.map(({ icon: Icon, title, description }, index) => (
 <article className="feature-card" key={title}>
 <span className="feature-number">0{index + 1}</span>
 <div className="feature-icon"><Icon size={19} strokeWidth={1.8} /></div>
 <h3>{title}</h3>
 <p>{description}</p>
 </article>
 ))}
 </div>
 </section>
 </section>
 ): (
 <section className="subpage">
 <button className="back-link" onClick={() => openPanel('home')}>← Back to home</button>
 <div className="subpage-card">
 {panel === 'game' && <>
 <div className="subpage-icon"><BrainCircuit size={23} /></div><p className="eyebrow">GAME INTEGRATION</p><h1>Getting the maze ready.</h1>
 <p className="subpage-copy">The new interface is being prepared separately while the existing Canvas game is preserved. Gameplay and controls need to be connected before this screen can launch the real game.</p>
 <Button variant="primary" onClick={() => openPanel('home')}>Back to home <ArrowRight size={16} /></Button>
 </>}
 {panel === 'help' && <>
 <div className="subpage-icon"><CircleHelp size={23} /></div><p className="eyebrow">QUICK GUIDE</p><h1>How to play</h1>
 <ul className="guide-list"><li><b>Move through the maze</b><span>Use your keyboard or the on-screen controls on mobile.</span></li><li><b>Keep an eye on the ghost</b><span>It uses pathfinding to track you through the maze.</span></li><li><b>Reach the exit</b><span>Collect power-ups and get to the golden exit to win.</span></li></ul>
 </>}
 {panel === 'leaderboard' && <>
 <div className="subpage-icon"><Crown size={23} /></div><p className="eyebrow">HALL OF FAME</p><h1>Leaderboard</h1><p className="subpage-copy">The existing leaderboard will be connected to this page during the gameplay integration.</p>
 </>}
 {panel === 'settings' && <>
 <div className="subpage-icon"><Settings2 size={23} /></div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="subpage-copy">Your existing game preferences will be connected during the integration stage.</p>
 </>}
 {panel === 'login' && <>
 <div className="subpage-icon"><LogIn size={23} /></div><p className="eyebrow">WELCOME BACK</p><h1>Sign in to MazeScape</h1><p className="subpage-copy">The existing authentication flow will be connected before the new interface goes live.</p>
 <div className="auth-actions"><Button variant="primary" onClick={() => openPanel('home')}>Back to home</Button><Button onClick={() => openPanel('register')}><UserPlus size={15} /> Create account</Button></div>
 </>}
 {panel === 'register' && <>
 <div className="subpage-icon"><UserPlus size={23} /></div><p className="eyebrow">JOIN THE GAME</p><h1>Create an account</h1><p className="subpage-copy">The existing registration API will be connected during migration.</p><Button variant="primary" onClick={() => openPanel('login')}>Already registered? Sign in</Button>
 </>}
 </div>
 </section>
 )}

 <footer className="site-footer"><a className="footer-brand" href="#home" onClick={() => openPanel('home')}>MazeScape</a><span>Navigate thoughtfully. Escape boldly.</span><span> MazeScape</span></footer>
 </main>
 );
}
