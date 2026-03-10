import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import '../../styles/TaskForm.css';

const TaskForm = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  const isEditMode = !!taskId;

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'a_faire',
    priorite: 'moyenne',
    date_echeance: '',
    id_utilisateur_assigne: ''
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId, taskId]);

  const loadData = async () => {
    try {
      // Charger les membres du projet
      const membersResponse = await projectService.getMembers(projectId);
      setMembers(membersResponse.data);

      // Si mode édition, charger la tâche
      if (isEditMode && taskId) {
        const taskResponse = await taskService.getTaskById(taskId);
        const task = taskResponse.data;
        setFormData({
          titre: task.titre,
          description: task.description || '',
          statut: task.statut,
          priorite: task.priorite,
          date_echeance: task.date_echeance || '',
          id_utilisateur_assigne: task.id_utilisateur_assigne || ''
        });
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.titre.trim()) {
      setError('Le titre est requis');
      setLoading(false);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        id_utilisateur_assigne: formData.id_utilisateur_assigne || null
      };

      if (isEditMode && taskId) {
        await taskService.updateTask(taskId, dataToSend);
      } else {
        await taskService.createTask(projectId, dataToSend);
      }
      navigate(`/projects/${projectId}/tasks`);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="task-form-container">
        <div className="task-form-card">
          <h1>{isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}</h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="titre">Titre *</label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex: Développer l'API"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Détails de la tâche..."
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="statut">Statut</label>
                <select
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                >
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminé</option>
                  <option value="archivee">Archivé</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priorite">Priorité</label>
                <select
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date_echeance">Date d'échéance</label>
                <input
                  type="date"
                  id="date_echeance"
                  name="date_echeance"
                  value={formData.date_echeance}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="id_utilisateur_assigne">Assigner à</label>
                <select
                  id="id_utilisateur_assigne"
                  name="id_utilisateur_assigne"
                  value={formData.id_utilisateur_assigne}
                  onChange={handleChange}
                >
                  <option value="">Non assigné</option>
                  {members.map(member => (
                    <option key={member.id_utilisateur} value={member.id_utilisateur}>
                      {member.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(`/projects/${projectId}/tasks`)}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskForm;