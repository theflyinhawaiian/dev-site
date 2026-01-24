import Starfield from './Starfield';

const projects = [
  {
    title: 'Project One',
    description: 'A brief description of your first project.',
    link: '#',
  },
  {
    title: 'Project Two',
    description: 'A brief description of your second project.',
    link: '#',
  },
  {
    title: 'Project Three',
    description: 'A brief description of your third project.',
    link: '#',
  },
];

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <span className="logo">Portfolio</span>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
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
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <a href={project.link}>View Project</a>
            </div>
          ))}
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
