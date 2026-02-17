import { useState } from 'react';
import styles from '@/styles/components/HamburgerMenu.module.css';

const links = [
  { href: '#about', label: 'About' },
  { href: '#jobs', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.hamburger}>
      <button
        className={`${styles.toggle} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className={styles.dropdown}>
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
