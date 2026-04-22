import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import BookCard from '../../components/BookCard/BookCard';
import Spinner from '../../components/Spinner/Spinner';
import { searchBooks } from '../../services/api';
import { useBookCache } from '../../context/BookCacheContext';
import type { Book } from '../../types';
import styles from './Home.module.scss';

export default function Home() {
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { cacheBooks } = useBookCache();
  const navigate = useNavigate();

  const handleSearch = async (q: string) => {
    setIsLoading(true);
    setSearched(true);
    try {
      const books = await searchBooks(q, 8);
      setResults(books);
      cacheBooks(books);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>University Library</h1>
        <p className={styles.heroSub}>
          Search millions of books, borrow them, and track your loans.
        </p>
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {(searched || isLoading) && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Results</p>
          {isLoading ? (
            <Spinner />
          ) : results.length === 0 ? (
            <p className={styles.noResults}>No books found.</p>
          ) : (
            <>
              <div className={styles.grid}>
                {results.map((b) => <BookCard key={b.id} book={b} />)}
              </div>
              <button className={styles.moreLink} onClick={() => navigate('/catalog')}>
                Browse full catalog
              </button>
            </>
          )}
        </section>
      )}

      {!searched && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Quick Access</p>
          <div className={styles.quickLinks}>
            <Link to="/catalog" className={styles.quickCard}>
              <div className={styles.quickInfo}>
                <strong>Book Catalog</strong>
                <p>Browse and search our full collection</p>
              </div>
            </Link>
            <Link to="/loans" className={styles.quickCard}>
              <div className={styles.quickInfo}>
                <strong>My Loans</strong>
                <p>Active loans and due dates</p>
              </div>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
