import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../Login/Login.module.scss';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!username.trim()) next.username = 'Username is required';
    else if (username.length < 3) next.username = 'At least 3 characters';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    else if (password.length < 4) next.password = 'At least 4 characters';
    if (!confirm) next.confirm = 'Please confirm your password';
    else if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      const ok = register(username, email, password);
      if (!ok) {
        setGlobalError('An account with this email already exists.');
        setIsLoading(false);
      } else {
        navigate('/');
      }
    }, 300);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <h1>Create an account</h1>
          <p>Join UniLib to borrow books</p>
        </div>

        {globalError && <div className={styles.globalError}>{globalError}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              className={`${styles.input} ${errors.username ? styles.error : ''}`}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              autoComplete="username"
            />
            {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="email"
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className={`${styles.input} ${errors.confirm ? styles.error : ''}`}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirm && <span className={styles.fieldError}>{errors.confirm}</span>}
          </div>

          <button className={styles.submitBtn} type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
