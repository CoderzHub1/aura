import React, { useEffect, useState } from 'react';
import styles from '../styles/login-success.module.css';
import { useRouter } from 'next/router';
import Navbar from './components/Navbar';


const LoginSuccess = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email || 'Unknown User');
    if (userEmail === "Unknown User") {
      router.push('/get-started');
    }
    setTimeout(() => {
      router.push("/gestures");
      console.log("Redirecting to gestures page...");
    }, 2500);

    return ()=>{
      console.clear();
    }
  }, [userEmail]);

  
  return (
    <div className='transition-zoom-in'>

      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Login Successful!</h1>
        <p className={styles.message}>
          Welcome to Aura. You have successfully logged in with the account: <strong>{userEmail}</strong>.
        </p>
      </div>
    </div>
  );
};

export default LoginSuccess;