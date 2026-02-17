import { useState, useEffect } from 'react';
import { Job } from '@/model';
import Tag from '@components/Tag';
import JobModal from '@components/JobModal';
import { useThemeStore } from '@hooks/themeStore';
import styles from '@/styles/components/Jobs.module.css';

function Jobs() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs');
      const data: Job[] = await response.json();
      if(response !== null){
        setJobs(data);
      }
    } catch (error) {
      setJobs(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!jobs) {
    return null;
  }

  return (
    <>
      {selectedJob && (
        <JobModal
          job={selectedJob}
          logoSrc={`/logos/${isDark ? selectedJob.logoFilename.replace(/\.png$/, '-dark.png') : selectedJob.logoFilename}`}
          logoFallback={`/logos/${selectedJob.logoFilename}`}
          onClose={() => setSelectedJob(null)}
        />
      )}
      {jobs.map((job) => (
        <div className={styles['job-card']} key={job.companyName}>
          {job.logoFilename && (
            <div className={styles['job-logo-container']}>
              <img
                className={styles['job-logo']}
                src={`/logos/${isDark ? job.logoFilename.replace(/\.png$/, '-dark.png') : job.logoFilename}`}
                alt={job.companyName}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = `/logos/${job.logoFilename}`;
                  if (target.src !== window.location.origin + fallback) {
                    target.src = fallback;
                  }
                }}
              />
            </div>
          )}
          <div className={styles['job-content']}>
            <h3>{job.title}</h3>
            <p className={styles['job-description']}>{job.description}</p>
            {job.tags?.length > 0 && (
              <>
                <h4>Technologies Used</h4>
                <div className={styles['project-tags']}>
                  {job.tags.map((tag) => (
                    <Tag key={tag.slug} slug={tag.slug} name={tag.name} postfix={tag.postfix} />
                  ))}
                </div>
              </>
            )}
            <a className={styles['read-more']} href="#" onClick={(e) => { e.preventDefault(); setSelectedJob(job); }}>Read more</a>
          </div>
        </div>
      ))}
    </>
  );
}

export default Jobs;
