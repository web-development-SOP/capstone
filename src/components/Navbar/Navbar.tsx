import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLoans } from '../../context/LoansContext';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { loans } = useLoans();
  const navigate = useNavigate();
  const location = useLocation();

  const activeLoans = loans.filter(
    (l) => !l.returnedAt && l.userId === user?.id
  ).length;

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? styles.active : undefined;

  return (
    <>
      <div className={styles.mobileBar}>
        <span className={styles.mobileLogo}>UniLib</span>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>UniLib</div>

        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink to="/" end className={navClass}>Home</NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/catalog" className={navClass}>Catalog</NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/loans" className={navClass}>
              My Loans
              {activeLoans > 0 && (
                <span className={styles.loansBadge}>{activeLoans}</span>
              )}
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink to="/wishlist" className={navClass}>Wishlist</NavLink>
          </li>
        </ul>

        <div className={styles.bottom}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {user ? (
            <div className={styles.userCard}>
              <div className={styles.userInfo}>
                <span className={styles.username}>{user.username}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={styles.loginBtn}>Sign In</NavLink>
          )}
        </div>
      </nav>
    </>
  );
}
