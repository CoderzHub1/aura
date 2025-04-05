import Image from "next/image";
import Navbar from "./components/Navbar";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Aura</h1>
        <p className={styles.description}>
          Empowering your journey with cutting-edge solutions.
        </p>
        <Link href="/get-started" className={styles.ctaButton}>
          Get Started
        </Link>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2025 Aura. All rights reserved.</p>
      </footer>
    </>
  );
}
