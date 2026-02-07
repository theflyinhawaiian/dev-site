import { useState, useEffect } from 'react';
import { Project } from './model';

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
    return (
      <div className="projects">
        <h2>Projects</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!projects) {
    return null;
  }

  return (
    <div className="projects">
      <h2>Projects</h2>
      
    </div>
  );
}

export default DbStatus;
