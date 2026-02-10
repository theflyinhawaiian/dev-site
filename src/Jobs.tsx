import { useState, useEffect } from 'react';
import { Job } from './model';
import Tag from './Tag';

function Jobs() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(true);

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
      {jobs.map((job) => (
        <div className="job-card" key={job.companyName}>
          {job.logoFilename && (
            <div className="job-logo-container">
              <img
                className="job-logo"
                src={`/logos/${job.logoFilename}`}
                alt={job.companyName}
              />
            </div>
          )}
          <div className="job-content">
            <h3>{job.title}</h3>
            <span className="job-company">{job.companyName}</span>
            <p>{job.description}</p>
            {job.tags?.length > 0 && (
              <>
                <h4 className="tags-header">Technologies Used</h4>
                <div className="project-tags">
                  {job.tags.map((tag) => (
                    <Tag key={tag.slug} slug={tag.slug} name={tag.name} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default Jobs;
