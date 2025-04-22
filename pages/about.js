import React from 'react';
import { useRouter } from 'next/router';
import Navbar from './components/Navbar';
import styles from '../styles/about.module.css';

const About = () => {
  const router = useRouter();

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>About Aura</h1>
        
        <section className={styles.section}>
          <h2>What is Aura?</h2>
          <p>
            Aura is an innovative gesture recognition application designed to enhance accessibility and provide a new way of interacting with technology. 
            Our platform uses advanced computer vision and machine learning to detect and interpret hand gestures, making technology more accessible to everyone.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            At Aura, we believe that technology should be accessible to everyone. Our mission is to break down barriers by providing intuitive, 
            gesture-based interfaces that can be used by people of all abilities. We are committed to creating a more inclusive digital world.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Key Features</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>Gesture Recognition</h3>
              <p>Advanced algorithms that accurately detect and interpret hand gestures in real-time.</p>
            </div>
            <div className={styles.feature}>
              <h3>Emergency Contacts</h3>
              <p>Store up to 5 emergency contacts that can be quickly accessed when needed.</p>
            </div>
            <div className={styles.feature}>
              <h3>User Profiles</h3>
              <p>Personalized profiles to manage your information and emergency contacts.</p>
            </div>
            <div className={styles.feature}>
              <h3>Accessibility Focus</h3>
              <p>Designed with accessibility in mind to serve users of all abilities.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Create an Account</h3>
              <p>Sign up with your email to get started with Aura.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Set Up Your Profile</h3>
              <p>Add your information and emergency contacts to your profile.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Learn Gestures</h3>
              <p>Explore and practice the various gestures supported by Aura.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <h3>Start Using</h3>
              <p>Begin using gestures to interact with your device and access emergency contacts when needed.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Get Started Today</h2>
          <p>
            Ready to experience the power of gesture recognition? Sign up for Aura today and take the first step toward a more accessible future.
          </p>
          <button 
            className={styles.ctaButton}
            onClick={() => router.push('/get-started')}
          >
            Get Started
          </button>
        </section>
      </div>
    </div>
  );
};

export default About; 