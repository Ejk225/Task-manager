import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import TaskCard from '../../components/TaskCard';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { exportTasksToPDF } from '../../services/pdfExportService';
import '../../styles/TasksList.css';

const TasksList = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [filters, setFilters] = useState({
    statut: '',
    priorite: '',
    assignee: '',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectResponse] = await Promise.all([
        taskService.getTasksByProject(projectId, filters),
        projectService.getProjectById(projectId)
      ]);
      setTasks(tasksResponse.data);
      setProject(projectResponse.data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      loadData();
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      statut: '',
      priorite: '',
      assignee: '',
      search: ''
    });
  };

  // Statistiques
  const stats = {
    total: tasks.length,
    a_faire: tasks.filter(t => t.statut === 'a_faire').length,
    en_cours: tasks.filter(t => t.statut === 'en_cours').length,
    terminee: tasks.filter(t => t.statut === 'terminee').length,
    en_retard: tasks.filter(t => t.is_overdue).length
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="tasks-container">
          <div className="loading">Chargement des tâches...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="tasks-container">
        <button 
          className="btn-back" 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          ← Retour au projet
        </button>

        <div className="tasks-header">
          <div>
            <h1>Tâches - {project?.nom}</h1>
            <div className="tasks-stats">
              <span className="stat-item">📊 {stats.total} tâches</span>
              <span className="stat-item">⭕ {stats.a_faire} à faire</span>
              <span className="stat-item">🔵 {stats.en_cours} en cours</span>
              <span className="stat-item">✅ {stats.terminee} terminées</span>
              {stats.en_retard > 0 && (
                <span className="stat-item stat-overdue">⚠️ {stats.en_retard} en retard</span>
              )}
            </div>
          </div>
          <button
            className="btn-create-task"
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
          >
            ➕ Nouvelle Tâche
          </button>
          <button
            className="btn-export-pdf"
            onClick={() => exportTasksToPDF(project?.nom || 'projet', tasks, filters)}
          >
            📥 Exporter les tâches
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filtres */}
        <div className="tasks-filters">
          <div className="filter-group">
            <label>Statut :</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="a_faire">À faire</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminé</option>
              <option value="archivee">Archivé</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priorité :</label>
            <select
              value={filters.priorite}
              onChange={(e) => handleFilterChange('priorite', e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Assigné :</label>
            <select
              value={filters.assignee}
              onChange={(e) => handleFilterChange('assignee', e.target.value)}
            >
              <option value="">Tous</option>
              <option value="me">Mes tâches</option>
              <option value="unassigned">Non assignées</option>
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Recherche :</label>
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {(filters.statut || filters.priorite || filters.assignee || filters.search) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              ✕ Effacer
            </button>
          )}
        </div>

        {/* Liste des tâches */}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h2>Aucune tâche pour le moment</h2>
            <p>Créez votre première tâche pour commencer !</p>
            <button
              className="btn-create-task"
              onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
            >
              ➕ Créer une tâche
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id_tache}
                task={task}
                projectId={projectId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TasksList;