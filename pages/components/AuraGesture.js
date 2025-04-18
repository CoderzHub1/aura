'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/AuraGesture.module.css';

export default function AuraGesture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [auraActive, setAuraActive] = useState(false);
  const [distress, setDistress] = useState(false);
  const distressCounterRef = useRef(0);
  const distressNotifiedRef = useRef(false);
  const DISTRESS_THRESHOLD = 5;
  const [userEmail, setUserEmail] = useState('');
  const [location, setLocation] = useState(null);

  // Helper function to check if a hand is in distress position
  const isHandInDistressPosition = (landmarks) => {
    // Get y coordinates for key points
    const y = (i) => landmarks[i].y;

    // Check if fingers are folded (all finger tips are below their middle joints)
    const fingersFolded = [8, 12, 16, 20].every((i) => y(i) > y(i - 2));
    
    return fingersFolded;
  };

  useEffect(() => {
    // Get user email from local storage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }

    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    let hands;
    let animationFrameId;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) return resolve();

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.body.appendChild(script);
      });
    };

    const setup = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');

        const Hands = window.Hands;
        const drawConnectors = window.drawConnectors;
        const drawLandmarks = window.drawLandmarks;
        const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

        hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.75,
          minTrackingConfidence: 0.75,
          
        });

        hands.onResults(onResults);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        console.log('Video devices:', videoDevices);
        const selectedDeviceId = videoDevices[0]?.deviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId,
            width: { ideal: 1080 },
            height: { ideal: 720 },
          },
        });

        const video = videoRef.current;
        video.srcObject = stream;

        await video.play();

        const processFrame = async () => {
          if (video.readyState >= 2) {
            await hands.send({ image: video });
          }
          animationFrameId = requestAnimationFrame(processFrame);
        };

        processFrame();

        function onResults(results) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks) {
            // Check for distress in any detected hand
            const anyHandInDistress = results.multiHandLandmarks.some(isHandInDistressPosition);
            
            if (anyHandInDistress) {
              distressCounterRef.current += 1;
            } else {
              distressCounterRef.current = 0;
              if (distress) {
                distressNotifiedRef.current = false;
              }
            }

            const isDistressDetected = distressCounterRef.current >= DISTRESS_THRESHOLD;
            setDistress(isDistressDetected);

            // Send notification when distress is first detected
            if (isDistressDetected && !distressNotifiedRef.current && userEmail) {
              sendEmergencyEmail();
              distressNotifiedRef.current = true;
            }

            // Draw hand landmarks
            for (const landmarks of results.multiHandLandmarks) {
              drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
              drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
              detectGestures(landmarks);
            }
          }
        }

        function detectGestures(landmarks) {
          const y = (i) => landmarks[i].y;
          const x = (i) => landmarks[i].x;

          const isVictory = y(8) < y(20) && y(12) < y(20) && y(16) > y(20);
          const isOppVictory = y(8) > y(20) && y(12) > y(20) && y(16) < y(20);

          if (isVictory) setAuraActive(true);
          else if (isOppVictory) setAuraActive(false);
        }
      } catch (err) {
        console.error('❌ Error during setup:', err);
      }
    };

    setup();

    return () => {
      if (hands) hands.close();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [userEmail]);

  const sendEmergencyEmail = async () => {
    try {
      if (!userEmail) {
        console.error('User email not available');
        return;
      }

      const locationString = location 
        ? `Latitude: ${location.latitude}, Longitude: ${location.longitude}
          Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        : null;

      const response = await fetch('/api/sendEmergencyEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          message: 'DISTRESS DETECTED: Emergency assistance may be needed!',
          location: locationString,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Emergency emails sent successfully');
      } else {
        console.error('Failed to send emergency emails:', data.message);
      }
    } catch (error) {
      console.error('Error sending emergency emails:', error);
    }
  };

  return (
    <div className={styles.container}>
      <video ref={videoRef} style={{ display: 'none' }} width={1080} height={720} />
      <canvas 
        ref={canvasRef} 
        width={1080} 
        height={720}
        className={styles.canvas}
      />
      <div className={styles.glassPanel}>
        <div className={styles.statusContainer}>
          <div className={`${styles.statusText} ${auraActive ? styles.active : styles.inactive}`}>
            <div className={`${styles.statusDot} ${auraActive ? styles.active : styles.inactive}`}/>
            {auraActive ? 'Aura Activated' : 'Aura Deactivated'}
          </div>
          
          {distress && (
            <div className={styles.distressAlert}>
              <svg className={styles.alertIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              DISTRESS DETECTED
              {distressNotifiedRef.current && <div className={styles.notificationSent}>Emergency contacts notified</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
