import Link from 'next/link';
import styles from '../../styles/Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">Aura</Link>
            </div>
            <ul className={styles.navLinks}>
                <li>
                    <Link href="/about">About</Link>
                </li>
                <li>
                    <Link href="/services">Services</Link>
                </li>
                <li>
                    <Link href="/contact">Contact</Link>
                </li>
            </ul>
            <div className={styles.ctaButton}>
                <Link href="/get-started">Get Started</Link>
            </div>
        </nav>
    );
};

export default Navbar;