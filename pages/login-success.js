import React, { useEffect, useState } from 'react';
import styles from '../styles/login-success.module.css';
import { useRouter } from 'next/router';

const LoginSuccess = () => {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email || 'Unknown User');
    if (userEmail === "Unknown User") {
        router.push('/get-started');
    }
  }, [userEmail]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login Successful!</h1>
      <p className={styles.message}>
        Welcome to Aura. You have successfully logged in with the account: <strong>{userEmail}</strong>.
      </p>
    </div>
  );
};

export default LoginSuccess;