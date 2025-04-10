"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    setEmail(storedEmail);
  }, []);

  const handleClick = () => {
    if (email) {
      window.location.href = "/login-success";
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Aura</h1>
        <p className={styles.description}>
          Empowering your journey with cutting-edge solutions.
        </p>
        <button onClick={handleClick} className={styles.ctaButton}>
          Get Started
        </button>
      </div>
    </>
  );
}
