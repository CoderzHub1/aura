import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/register.module.css';
import Link from 'next/link'; 

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/addUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      setSuccess('Login successful!');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);

      router.push(`/login-success`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>Name:</label>
          <input
            type="name"
            id="name"
            name="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Register</button>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <Link href="/get-started" className={styles.registerLink}>
          Already have an account? <strong>Sign In</strong> here
        </Link>
      </form>
    </div>
  );
};

export default Register;