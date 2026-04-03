import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../context/LoansContext';
import { getCoverUrl } from '../../services/api';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './Loans.module.scss';

function daysUntil(iso: string) {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function progressPercent(borrowedAt: string, dueDate: string): number {
  const total = new Date(dueDate).getTime() - new Date(borrowedAt).getTime();
  const elapsed = Date.now() - new Date(borrowedAt).getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export default function Loans() {
  const { user } = useAuth();
  const { loans, returnBook } = useLoans();

  const myLoans = loans.filter((l) => l.userId === user?.id);
  const activeLoans = myLoans.filter((l) => !l.returnedAt);
  const returnedLoans = myLoans.filter((l) => l.returnedAt);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>My Loans</h1>
      <p className={styles.subtitle}>Active loans and borrowing history.</p>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Active Loans ({activeLoans.length})</p>
        {activeLoans.length === 0 ? (
          <EmptyState title="No active loans" description="Go to the catalog and borrow a book." />
        ) : (
          <ul className={styles.loanList}>
            {activeLoans.map((loan) => {
              const days = daysUntil(loan.dueDate);
              const pct = progressPercent(loan.borrowedAt, loan.dueDate);
              const isOverdue = days < 0;
              const isSoon = days >= 0 && days <= 3;
              return (
                <li key={loan.id} className={styles.loanCard}>
                  {loan.bookCoverId ? (
                    <div className={styles.loanCover}>
                      <img src={getCoverUrl(loan.bookCoverId, 'S')} alt={loan.bookTitle} />
                    </div>
                  ) : (
                    <div className={styles.loanCoverPlaceholder}>
                      {loan.bookTitle.charAt(0)}
                    </div>
                  )}
                  <div className={styles.loanInfo}>
                    <p className={styles.loanTitle}>
                      <Link to={`/book/${loan.bookId}`}>{loan.bookTitle}</Link>
                    </p>
                    <p className={styles.loanAuthor}>{loan.bookAuthor}</p>
                    <div className={styles.loanDates}>
                      <span>Borrowed: {new Date(loan.borrowedAt).toLocaleDateString()}</span>
                      <span className={isOverdue ? styles.overdue : isSoon ? styles.dueSoon : ''}>
                        {isOverdue
                          ? `Overdue by ${Math.abs(days)} days`
                          : `Due in ${days} days (${new Date(loan.dueDate).toLocaleDateString()})`}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${isOverdue ? styles.overdueFill : isSoon ? styles.low : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className={styles.loanActions}>
                    <button className={styles.returnBtn} onClick={() => returnBook(loan.id)}>
                      Return
                    </button>
                    <Link to={`/book/${loan.bookId}`} className={styles.detailLink}>
                      Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {returnedLoans.length > 0 && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>History ({returnedLoans.length})</p>
          <ul className={styles.loanList}>
            {returnedLoans.map((loan) => (
              <li key={loan.id} className={`${styles.loanCard} ${styles.returnedCard}`}>
                <div className={styles.loanCoverPlaceholder}>{loan.bookTitle.charAt(0)}</div>
                <div className={styles.loanInfo}>
                  <p className={styles.loanTitle}>{loan.bookTitle}</p>
                  <p className={styles.loanAuthor}>{loan.bookAuthor}</p>
                  <div className={styles.loanDates}>
                    <span>Returned: {new Date(loan.returnedAt!).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.loanActions}>
                  <span className={styles.returnedBadge}>Returned</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
