import styles from './EmptyState.module.scss';

interface Props {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: Props) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}
