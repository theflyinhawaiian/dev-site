import Starfield from '@components/Starfield';
import Projects from '@components/Projects';
import Jobs from '@components/Jobs';
import { useThemeStore } from '@hooks/themeStore';
import DarkModeBtn from '@components/DarkModeBtn';
import Calendly from '@components/Calendly';
import HeroText from '@components/HeroText';
import HamburgerMenu from '@components/HamburgerMenu';
import About from '@components/About';
import styles from '@/styles/components/App.module.css';
import heroStyles from '@/styles/components/Hero.module.css';

function App() {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className={`app${isDark ? ' dark' : ''}`}>
      <nav className={styles.nav}>
        <div className={styles['nav-content']}>
          <div className={styles['nav-links']}>
            <a className={styles.header} href="#about">About</a>
            <a className={styles.header} href="#jobs">Experience</a>
            <a className={styles.header} href="#projects">Projects</a>
            <a className={styles.header} href="#contact">Contact</a>
          </div>
          <HamburgerMenu />
          <DarkModeBtn isDark={isDark} onClick={toggle} />
        </div>
      </nav>

      <header className={heroStyles.hero}>
        <Starfield />
        <HeroText />
      </header>

      <section id="about" className={styles.section}>
        <About />
      </section>

      <section id="jobs" className={styles.section}>
        <h2>Experience</h2>
        <div className={styles['jobs-grid']}>
          <Jobs />
        </div>
      </section>

      <section id="projects" className={styles.section}>
        <h2>Projects</h2>
        <div className={styles['project-grid']}>
          <Projects />
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <h2>Contact</h2>
        <p>Interested in working together? Appreciate my vibe? Wanna hang out? Hit me up! I always welcome new connections. Fill out the calendly form below and let's have a chat!</p>
        <Calendly />
      </section>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Peter. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
