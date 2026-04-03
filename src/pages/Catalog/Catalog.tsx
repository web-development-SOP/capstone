import { useState, useMemo, useEffect } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import BookCard from '../../components/BookCard/BookCard';
import Spinner from '../../components/Spinner/Spinner';
import { searchBooks } from '../../services/api';
import { useBookCache } from '../../context/BookCacheContext';
import type { Book, SortField } from '../../types';
import styles from './Catalog.module.scss';

const SUBJECTS = [
  'All',
  'Fiction',
  'Science',
  'History',
  'Philosophy',
  'Technology',
  'Art',
  'Biography',
  'Children',
];

const DEFAULT_QUERIES = [
  'classic literature',
  'science fiction',
  'world history',
  'philosophy',
  'mystery',
  'biography',
  'popular science',
  'adventure',
];

export default function Catalog() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState('All');
  const [sort, setSort] = useState<SortField>('title');
  const { cacheBooks } = useBookCache();

  useEffect(() => {
    const q = DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
    handleSearch(q);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (q: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchBooks(q, 40);
      setBooks(results);
      cacheBooks(results);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = books;

    if (subject !== 'All') {
      list = list.filter((b) =>
        b.subjects?.some((s) =>
          s.toLowerCase().includes(subject.toLowerCase())
        )
      );
    }

    return [...list].sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'author') return a.author.localeCompare(b.author);
      if (sort === 'year')
        return (b.firstPublishYear ?? 0) - (a.firstPublishYear ?? 0);
      return 0;
    });
  }, [books, subject, sort]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Book Catalog</h1>
        <div className={styles.toolbar}>
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            placeholder="Search the catalogue…"
          />
          <div className={styles.filters}>
            <select
              className={styles.select}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All subjects' : s}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortField)}
            >
              <option value="title">Sort: Title A–Z</option>
              <option value="author">Sort: Author A–Z</option>
              <option value="year">Sort: Newest first</option>
            </select>
            {!isLoading && filtered.length > 0 && (
              <span className={styles.resultCount}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading && <Spinner label="Searching catalogue…" />}

      {error && !isLoading && (
        <div className={styles.errorBox}>{error}</div>
      )}

      {!isLoading && filtered.length === 0 && !error && (
        <div className={styles.prompt}>
          <p>No books match your filters. Try adjusting the subject.</p>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
