import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TaskStatusBadge from '../../components/TaskStatusBadge';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/TaskDetail.css';

const TaskDetail = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskResponse, membersResponse] = await Promise.all([
        taskService.getTaskById(taskId),
        projectService.getMembers(projectId)
      ]);
      setTask(taskResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.titre}" ?`)) {
      try {
        await taskService.deleteTask(taskId);
        navigate(`/projects/${projectId}/tasks`);
      } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleAssign = async (userId) => {
    try {
      await taskService.assignTask(taskId, userId);
      loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'assignation');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pas d\'échéance';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="task-detail-container">
          <div className="loading">Chargement...</div>
        </div>
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <Navbar />
        <div className="task-detail-container">
          <div className="error-message">{error || 'Tâche non trouvée'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="task-detail-container">
        <button 
          className="btn-back" 
          onClick={() => navigate(`/projects/${projectId}/tasks`)}
        >
          ← Retour aux tâches
        </button>

        <div className="task-detail-header">
          <div>
            <h1>{task.titre}</h1>
            <TaskStatusBadge 
              statut={task.statut} 
              priorite={task.priorite}
              isOverdue={task.is_overdue}
            />
          </div>

          <div className="task-actions-detail">
            <button
              className="btn-edit"
              onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}
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
        </div>

        <div className="task-detail-content">
          {/* Informations principales */}
          <section className="task-info-section">
            <h2>Description</h2>
            <p>{task.description || 'Aucune description'}</p>
          </section>

          {/* Détails */}
          <section className="task-details-section">
            <h2>Détails</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">📅 Échéance :</span>
                <span className="detail-value">{formatDate(task.date_echeance)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📆 Créée le :</span>
                <span className="detail-value">{formatDateTime(task.date_creation)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">👤 Assignée à :</span>
                <span className="detail-value">
                  {task.utilisateur_assigne?.nom || 'Non assignée'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📁 Projet :</span>
                <span className="detail-value">{task.projet?.nom}</span>
              </div>
            </div>
          </section>

          {/* Actions rapides */}
          <section className="quick-actions-section">
            <h2>Actions rapides</h2>
            
            <div className="action-group">
              <h3>Changer le statut</h3>
              <div className="status-buttons">
                <button
                  className={`btn-status ${task.statut === 'a_faire' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('a_faire')}
                  disabled={task.statut === 'a_faire'}
                >
                  À faire
                </button>
                <button
                  className={`btn-status ${task.statut === 'en_cours' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('en_cours')}
                  disabled={task.statut === 'en_cours'}
                >
                  En cours
                </button>
                <button
                  className={`btn-status ${task.statut === 'terminee' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('terminee')}
                  disabled={task.statut === 'terminee'}
                >
                  Terminé
                </button>
              </div>
            </div>

            <div className="action-group">
              <h3>Réassigner</h3>
              <select
                className="assign-select"
                value={task.id_utilisateur_assigne || ''}
                onChange={(e) => handleAssign(e.target.value || null)}
              >
                <option value="">Non assigné</option>
                {members.map(member => (
                  <option key={member.id_utilisateur} value={member.id_utilisateur}>
                    {member.nom}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default TaskDetail;