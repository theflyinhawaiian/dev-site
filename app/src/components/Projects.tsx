import { useState, useEffect } from 'react';
import { Project } from '@/model';
import Tag from '@components/Tag';
import styles from '@/styles/components/Projects.module.css';

function DbStatus() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const data: Project[] = await response.json();
      if(response !== null){
        setProjects(data);
        console.log(data);
      }
    } catch (error) {
      setProjects(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!projects) {
    return null;
  }

  return (
    <>
      {projects.map((project) => (
        <div className={styles['project-card']} key={project.name}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          {project.tags?.length > 0 && (
            <>
              <h4 className="tags-header">Technologies Used</h4>
                <div className={styles['project-tags']}>
                  {project.tags?.map((tag) => (
                    <Tag key={tag.slug} slug={tag.slug} name={tag.name} postfix={tag.postfix} />
                  ))}
                </div>
            </>
          )}
          <div className={styles['project-links']}>
            {project.projectLinks
              .filter((link) => link.link && link.title)
              .map((link) => (
                <a key={link.title} href={link.link} target="_blank" rel="noreferrer">
                  {link.title}
                </a>
              ))}
            {project.hostedLink?.link && (
              <a href={project.hostedLink.link} target="_blank" rel="noreferrer">
                {project.hostedLink.title}
              </a>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export default DbStatus;
