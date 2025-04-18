import AuraGesture from "./components/AuraGesture";
import Navbar from "./components/Navbar";
import VoiceRecognition from "./components/VoiceRecognition";
import styles from "../styles/gestures.module.css";

export default function GesturePage() {
  return (
    <div className={styles.container}>
      <Navbar/>
      <h1 className={styles.title}>Aura Gesture Detection</h1>
      <div className={styles.gestureWrapper}>
        <AuraGesture />
      </div>
      <VoiceRecognition />
    </div>
  );
}
