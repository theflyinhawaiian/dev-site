import { Job } from '@/model';
import Tag from '@components/Tag';
import styles from '@/styles/components/JobModal.module.css';

interface JobModalProps {
  job: Job;
  logoSrc: string;
  logoFallback: string;
  onClose: () => void;
}

export default function JobModal({ job, logoSrc, logoFallback, onClose }: JobModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        {job.logoFilename && (
          <img
            className={styles.logo}
            src={logoSrc}
            alt={job.companyName}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== window.location.origin + logoFallback) {
                target.src = logoFallback;
              }
            }}
          />
        )}
        <h3>{job.title}</h3>
        <p>{job.description}</p>
        {job.tags?.length > 0 && (
          <>
            <h4>Technologies Used</h4>
            <div className={styles.tags}>
              {job.tags.map((tag) => (
                <Tag key={tag.slug} slug={tag.slug} name={tag.name} postfix={tag.postfix} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
