import AuraGesture from "./components/AuraGesture";
import Navbar from "./components/Navbar";
import styles from "./gestures.module.css";

export default function GesturePage() {
  return (
    <div className={styles.container}>
      <Navbar/>
      <h1 className={styles.title}>Aura Gesture Detection</h1>
      <div className={styles.gestureWrapper}>
        <AuraGesture />
      </div>
    </div>
  );
}
