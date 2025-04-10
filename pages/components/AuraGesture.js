'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './AuraGesture.module.css';

export default function AuraGesture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [auraActive, setAuraActive] = useState(false);
  const [distress, setDistress] = useState(false);
  const distressCounterRef = useRef(0);
  const DISTRESS_THRESHOLD = 5;

  useEffect(() => {
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
            for (const landmarks of results.multiHandLandmarks) {
              drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
              drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
              detectGestures(landmarks);
            }
          }
        }

        function detectGestures(hand) {
          const y = (i) => hand[i].y;
          const x = (i) => hand[i].x;

          const isVictory = y(8) < y(20) && y(12) < y(20) && y(16) > y(20);
          const isOppVictory = y(8) > y(20) && y(12) > y(20) && y(16) < y(20);
          const fingersFolded = [8, 12, 16, 20].every((i) => y(i) > y(i - 2));
          const thumbInside = x(4) > x(8) && x(4) < x(20);

          if (isVictory) setAuraActive(true);
          else if (isOppVictory) setAuraActive(false);

          if (fingersFolded && thumbInside) {
            distressCounterRef.current += 1;
          } else {
            distressCounterRef.current = 0;
          }

          setDistress(distressCounterRef.current >= DISTRESS_THRESHOLD);
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
  }, []);

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
