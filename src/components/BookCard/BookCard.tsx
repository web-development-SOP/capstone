import { Link } from 'react-router-dom';
import { getCoverUrl } from '../../services/api';
import { useLoans } from '../../context/LoansContext';
import type { Book } from '../../types';
import styles from './BookCard.module.scss';

interface Props {
  book: Book;
}

const statusLabel: Record<string, string> = {
  available: 'Available',
  'on-loan': 'On Loan',
};
const statusClass: Record<string, string> = {
  available: styles.available,
  'on-loan': styles.onLoan,
};

export default function BookCard({ book }: Props) {
  const { getAvailability } = useLoans();
  const availability = getAvailability(book.id);

  return (
    <div className={styles.card}>
      <div className={styles.coverWrapper}>
        <span className={`${styles.statusBadge} ${statusClass[availability]}`}>
          {statusLabel[availability]}
        </span>

        {book.coverId ? (
          <div className={styles.cover}>
            <img src={getCoverUrl(book.coverId, 'M')} alt={book.title} loading="lazy" />
          </div>
        ) : (
          <div className={styles.coverPlaceholder}>
            <span className={styles.placeholderLetter}>
              {book.title.charAt(0).toUpperCase()}
            </span>
            <span className={styles.placeholderLabel}>No cover</span>
          </div>
        )}

        <div className={styles.overlay}>
          <Link to={`/book/${book.id}`} className={styles.viewBtn}>
            View Details
          </Link>
        </div>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{book.title}</p>
        <p className={styles.author}>{book.author}</p>
        {book.firstPublishYear && (
          <p className={styles.year}>{book.firstPublishYear}</p>
        )}
      </div>
    </div>
  );
}
