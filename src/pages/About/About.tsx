import styles from './About.module.scss';

const features = [
  {
    icon: '🔍',
    title: 'Open Library Search',
    desc: 'Millions of books from the Open Library API at your fingertips.',
  },
  {
    icon: '📋',
    title: 'Loan Management',
    desc: 'Borrow books, track due dates, and return them with one click.',
  },
  {
    icon: '🔖',
    title: 'Reservations',
    desc: 'Reserve books that are currently on loan to others.',
  },
  {
    icon: '⭐',
    title: 'Reading Tracker',
    desc: 'Track your reading status: Reading, Completed, or Wishlist.',
  },
  {
    icon: '🌙',
    title: 'Light / Dark Theme',
    desc: 'Toggle between dark and light mode to suit your preference.',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    desc: 'Works seamlessly on desktop, tablet, and mobile.',
  },
];

const stack = [
  'React 18',
  'TypeScript',
  'Vite',
  'React Router v6',
  'CSS Modules',
  'SASS',
  'Axios',
  'Context API',
  'Open Library API',
];

export default function About() {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>About the project</p>
      <h1 className={styles.title}>University Library</h1>
      <p className={styles.lead}>
        UniLib is a university library management SPA built as a web development
        capstone project. It connects to the Open Library API to let students
        search, borrow, reserve and track their reading — all in the browser,
        with no backend required.
      </p>

      <p className={styles.sectionTitle}>Features</p>
      <div className={styles.featureGrid}>
        {features.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <span className={styles.icon}>{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      <p className={styles.sectionTitle}>Tech Stack</p>
      <div className={styles.stack}>
        {stack.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
