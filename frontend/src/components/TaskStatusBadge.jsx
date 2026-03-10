import '../styles/TaskStatusBadge.css';

const TaskStatusBadge = ({ statut, priorite, isOverdue }) => {
  const getStatusLabel = (statut) => {
    const labels = {
      'a_faire': 'À faire',
      'en_cours': 'En cours',
      'terminee': 'Terminé',
      'archivee': 'Archivé'
    };
    return labels[statut] || statut;
  };

  const getPriorityLabel = (priorite) => {
    const labels = {
      'basse': 'Basse',
      'moyenne': 'Moyenne',
      'haute': 'Haute',
      'urgente': 'Urgente'
    };
    return labels[priorite] || priorite;
  };

  return (
    <div className="task-badges">
      {statut && (
        <span className={`status-badge status-${statut}`}>
          {getStatusLabel(statut)}
        </span>
      )}
      {priorite && (
        <span className={`priority-badge priority-${priorite}`}>
          {getPriorityLabel(priorite)}
        </span>
      )}
      {isOverdue && (
        <span className="overdue-badge">
          ⚠️ En retard
        </span>
      )}
    </div>
  );
};

export default TaskStatusBadge;