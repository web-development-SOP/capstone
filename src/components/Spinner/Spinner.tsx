import styles from './Spinner.module.scss';

interface Props {
  label?: string;
}

export default function Spinner({ label = 'Loading…' }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <span>{label}</span>
    </div>
  );
}
