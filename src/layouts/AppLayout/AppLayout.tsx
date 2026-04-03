import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import styles from './AppLayout.module.scss';

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
