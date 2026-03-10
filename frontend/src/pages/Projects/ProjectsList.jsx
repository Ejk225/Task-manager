import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ProjectCard from '../../components/ProjectCard';
import projectService from '../../services/projectService';
import '../../styles/ProjectsList.css';

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAllProjects();
      setProjects(response.data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      loadProjects();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="projects-container">
          <div className="loading">Chargement des projets...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="projects-container">
        <div className="projects-header">
          <h1>Mes Projets</h1>
          <button 
            className="btn-create-project"
            onClick={() => navigate('/projects/new')}
          >
            ➕ Nouveau Projet
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun projet pour le moment</h2>
            <p>Créez votre premier projet pour commencer !</p>
            <button 
              className="btn-create-project"
              onClick={() => navigate('/projects/new')}
            >
              ➕ Créer un projet
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id_projet}
                project={project}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsList;