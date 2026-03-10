import { useNavigate } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import '../styles/TaskCard.css';

const TaskCard = ({ task, onStatusChange, onDelete, projectId }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Pas d\'échéance';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStatusChange = (e, newStatus) => {
    e.stopPropagation();
    onStatusChange(task.id_tache, newStatus);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.titre}" ?`)) {
      onDelete(task.id_tache);
    }
  };

  return (
    <div 
      className="task-card" 
      onClick={() => navigate(`/projects/${projectId}/tasks/${task.id_tache}`)}
    >
      <div className="task-card-header">
        <h3 className="task-title">{task.titre}</h3>
        <TaskStatusBadge 
          statut={task.statut} 
          priorite={task.priorite}
          isOverdue={task.is_overdue}
        />
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-info">
          <span className="info-item">
            👤 {task.utilisateur_assigne?.nom || 'Non assigné'}
          </span>
          <span className="info-item">
            📅 {formatDate(task.date_echeance)}
          </span>
        </div>
      </div>

      <div className="task-actions" onClick={(e) => e.stopPropagation()}>
        {task.statut !== 'terminee' && (
          <button
            className="btn-quick-action btn-complete"
            onClick={(e) => handleStatusChange(e, 'terminee')}
            title="Marquer comme terminé"
          >
            ✓ Terminer
          </button>
        )}
        {task.statut === 'a_faire' && (
          <button
            className="btn-quick-action btn-progress"
            onClick={(e) => handleStatusChange(e, 'en_cours')}
            title="Passer en cours"
          >
            ▶ En cours
          </button>
        )}
        <button
          className="btn-quick-action btn-delete-task"
          onClick={handleDelete}
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TaskCard;