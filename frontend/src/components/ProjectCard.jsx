import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = user?.id_utilisateur === project.id_utilisateur_createur;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.nom}" ?`)) {
      onDelete(project.id_projet);
    }
  };

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id_projet}`)}>
      <div className="project-card-header">
        <h3 className="project-title">{project.nom}</h3>
        {isOwner && <span className="owner-badge">Propriétaire</span>}
      </div>

      <p className="project-description">
        {project.description || 'Aucune description'}
      </p>

      <div className="project-meta">
        <div className="project-info">
          <span className="info-item">
            👥 {project.nombre_membres || 0} membre{(project.nombre_membres || 0) > 1 ? 's' : ''}
          </span>
          <span className="info-item">
            📅 {formatDate(project.date_creation)}
          </span>
        </div>

        {project.createur_nom && (
          <p className="project-creator">
            Créé par: {project.createur_nom}
          </p>
        )}
      </div>

      {isOwner && (
        <div className="project-actions" onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn-edit"
            onClick={() => navigate(`/projects/${project.id_projet}/edit`)}
          >
            ✏️ Modifier
          </button>
          <button 
            className="btn-delete"
            onClick={handleDelete}
          >
            🗑️ Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;