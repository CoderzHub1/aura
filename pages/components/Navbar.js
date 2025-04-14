import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../../styles/Navbar.module.css';

const Navbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (email) {
            setIsLoggedIn(true);
            setUserEmail(email);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        router.push('/get-started');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">Aura</Link>
            </div>
            <ul className={styles.navLinks}>
                <li>
                    <Link href="/gestures">Gestures</Link>
                </li>
                <li>
                    <Link href="/profile">Profile</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
            </ul>
            <div className={styles.authSection}>
                {isLoggedIn ? (
                    <>
                        <span className={styles.userEmail}>{userEmail}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link href="/get-started" className={styles.ctaButton}>
                        Get Started
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;