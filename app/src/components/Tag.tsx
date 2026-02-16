import { Tag as TagModel } from '@/model';
import styles from '@/styles/components/Tag.module.css';

function Tag({ name, slug, postfix }: TagModel) {
  return (
    <span className={styles.tag}>
      <img
        src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${postfix}.svg`}
        alt={name}
      />
      {name}
    </span>
  );
}

export default Tag;
