import Starfield from './Starfield';
import Projects from './Projects';
import Jobs from './Jobs';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <span className="logo">Portfolio</span>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#jobs">Experience</a>
            <a href="#contact">Contact</a>
            <a href="#db-status">DB Status</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <Starfield />
        <h1>Hi, I'm Peter</h1>
        <p>Developer &amp; Creator</p>
      </header>

      <section id="about" className="section">
        <h2>About Me</h2>
        <p>
          I'm a developer passionate about building clean, functional
          applications. I enjoy working across the stack and learning new
          technologies.
        </p>
      </section>

      <section id="projects" className="section">
        <h2>Projects</h2>
        <div className="project-grid">
          <Projects />
        </div>
      </section>

      <section id="jobs" className="section">
        <h2>Experience</h2>
        <div className="jobs-grid">
          <Jobs />
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Interested in working together? Reach out.</p>
        <a className="contact-link" href="mailto:hello@example.com">
          hello@example.com
        </a>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Peter. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
