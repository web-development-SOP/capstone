import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import SearchBar from '../../components/SearchBar/SearchBar';
import BookCard from '../../components/BookCard/BookCard';
import Spinner from '../../components/Spinner/Spinner';
import { searchBooks, getCoverUrl } from '../../services/api';
import { useBookCache } from '../../context/BookCacheContext';
import type { Book } from '../../types';
import styles from './Home.module.scss';

export default function Home() {
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [featured, setFeatured] = useState<Book[]>([]);
  const { cacheBooks } = useBookCache();
  const navigate = useNavigate();

  useEffect(() => {
    searchBooks('subject:bestseller', 12)
      .then((books) => setFeatured(books.filter((b) => b.coverId)))
      .catch(() => {});
  }, []);

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

      {!searched && featured.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Featured Books</p>
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              480: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              960: { slidesPerView: 5 },
            }}
            className={styles.carousel}
          >
            {featured.map((book) => (
              <SwiperSlide key={book.id}>
                <Link to={`/book/${book.id}`} className={styles.carouselCard}>
                  <img
                    src={getCoverUrl(book.coverId!, 'M')}
                    alt={book.title}
                    className={styles.carouselCover}
                    loading="lazy"
                  />
                  <p className={styles.carouselTitle}>{book.title}</p>
                  <p className={styles.carouselAuthor}>{book.author}</p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

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
