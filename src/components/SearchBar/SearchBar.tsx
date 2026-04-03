import { useState, FormEvent } from 'react';
import styles from './SearchBar.module.scss';

interface Props {
  onSearch: (query: string) => void;
  initialValue?: string;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  initialValue = '',
  isLoading = false,
  placeholder = 'Search books, authors, subjects…',
}: Props) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q) onSearch(q);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </span>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
        />
      </div>
      <button className={styles.btn} type="submit" disabled={isLoading || !value.trim()}>
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
