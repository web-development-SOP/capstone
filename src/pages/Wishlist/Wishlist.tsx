import { Link } from 'react-router-dom';
import { getCoverUrl } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import type { ReadingStatus } from '../../types';
import styles from './Wishlist.module.scss';

const STATUS_OPTIONS: ReadingStatus[] = ['Wishlist', 'Reading', 'Completed'];

export default function Wishlist() {
  const { items, removeFromWishlist, updateStatus } = useWishlist();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your wishlist is empty.</p>
        <Link to="/catalog">Browse the catalog</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My Wishlist</h1>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.cover}>
              {item.bookCoverId ? (
                <img src={getCoverUrl(item.bookCoverId, 'S')} alt={item.bookTitle} />
              ) : (
                <div className={styles.coverPlaceholder}>{item.bookTitle.charAt(0)}</div>
              )}
            </div>

            <div className={styles.info}>
              <Link to={`/book/${item.bookId}`} className={styles.title}>
                {item.bookTitle}
              </Link>
              <p className={styles.author}>{item.bookAuthor}</p>
              <p className={styles.added}>
                Added {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>

            <div className={styles.controls}>
              <select
                className={styles.statusSelect}
                value={item.status}
                onChange={(e) => updateStatus(item.bookId, e.target.value as ReadingStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                className={styles.removeBtn}
                onClick={() => removeFromWishlist(item.bookId)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
