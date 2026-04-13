import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCoverUrl, getWorkDetails } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoansContext';
import { useWishlist } from '../../context/WishlistContext';
import { useBookCache } from '../../context/BookCacheContext';
import Spinner from '../../components/Spinner/Spinner';
import type { Book, ReadingStatus } from '../../types';
import styles from './BookDetail.module.scss';

function daysUntil(iso: string): number {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { borrowBook, returnBook, getAvailability, getActiveLoan } = useLoans();
  const { addToWishlist, removeFromWishlist, updateStatus, getItem, isInWishlist } = useWishlist();
  const { getBook } = useBookCache();

  const [book, setBook] = useState<Book | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const cached = getBook(id);
    if (cached) {
      setBook(cached);
      setIsLoading(false);
    }
    getWorkDetails(id)
      .then((details) => {
        if (!cached) {
          setBook({
            id,
            title: details.title,
            author: 'Unknown Author',
            coverId: details.covers?.[0],
            subjects: details.subjects?.slice(0, 5),
          });
        }
        const desc = details.description;
        if (typeof desc === 'string') setDescription(desc);
        else if (desc && typeof desc === 'object') setDescription(desc.value);
      })
      .catch(() => { if (!cached) setBook(null); })
      .finally(() => setIsLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Spinner />;
  if (!book)
    return (
      <div style={{ padding: 24, color: 'var(--text-secondary)' }}>
        Book not found.{' '}
        <button onClick={() => navigate(-1)} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          Go back
        </button>
      </div>
    );

  const availability = getAvailability(book.id);
  const activeLoan = getActiveLoan(book.id);
  const userLoan = user && activeLoan?.userId === user.id ? activeLoan : undefined;
  const wishlistItem = getItem(book.id);
  const inWishlist = isInWishlist(book.id);

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          &larr; Back
        </button>

        <div className={styles.cover}>
          {book.coverId ? (
            <img src={getCoverUrl(book.coverId, 'L')} alt={book.title} />
          ) : (
            <div className={styles.coverPlaceholder}>
              {book.title.charAt(0)}
            </div>
          )}
        </div>

        <div className={styles.meta}>
          <span className={`${styles.availability} ${styles[availability === 'on-loan' ? 'onLoan' : availability]}`}>
            {availability === 'available' ? 'Available' : 'On Loan'}
          </span>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <p className={styles.bookAuthor}>{book.author}</p>
          <div className={styles.bookMeta}>
            {book.firstPublishYear && <span>Published {book.firstPublishYear}</span>}
            {book.isbn && <span>ISBN: {book.isbn}</span>}
          </div>
          {book.subjects && book.subjects.length > 0 && (
            <div className={styles.subjects}>
              {book.subjects.map((s) => (
                <span key={s} className={styles.subject}>{s}</span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            {user ? (
              userLoan ? (
                <>
                  <div className={styles.loanInfo}>
                    Due: {new Date(userLoan.dueDate).toLocaleDateString()} —{' '}
                    <strong>{daysUntil(userLoan.dueDate)} days left</strong>
                  </div>
                  <button className={styles.btnDanger} onClick={() => returnBook(userLoan.id)}>
                    Return Book
                  </button>
                </>
              ) : availability === 'available' ? (
                <button className={styles.btnPrimary} onClick={() => borrowBook(book, user.id)}>
                  Borrow Book
                </button>
              ) : (
                <span className={styles.onLoanNote}>
                  This book is currently on loan by another user.
                </span>
              )
            ) : (
              <Link to="/login" className={styles.btnPrimary}>
                Sign in to borrow
              </Link>
            )}

            <div className={styles.wishlistRow}>
              {inWishlist ? (
                <>
                  <select
                    className={styles.statusSelect}
                    value={wishlistItem?.status}
                    onChange={(e) => updateStatus(book.id, e.target.value as ReadingStatus)}
                  >
                    <option value="Wishlist">Wishlist</option>
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    className={styles.btnSecondary}
                    onClick={() => removeFromWishlist(book.id)}
                  >
                    Remove from Wishlist
                  </button>
                </>
              ) : (
                <button
                  className={styles.btnSecondary}
                  onClick={() => addToWishlist(book)}
                >
                  + Add to Wishlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.sectionLabel}>About this book</p>
        <p className={styles.description}>
          {description ?? 'No description available.'}
        </p>
      </div>
    </div>
  );
}
