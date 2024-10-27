import Image from 'next/image';
import styles from '@/styles/app.module.css';
import Logo from '/public/nostra.png';

export default function Home() {
  return (
    <main className={`${styles.main} ${styles.matrixBackground}`}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative', zIndex: 1 }}>
        <Image src={Logo} alt="Nostra" width={500} height={500} />
      </div>
      <h2 style={{ color: 'black', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', position: 'relative', zIndex: 1 }}>NOSTRA</h2>
      <div className={styles.matrixAnimation}></div>
    </main>
  );
}