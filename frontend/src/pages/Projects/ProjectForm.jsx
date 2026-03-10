import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import projectService from '../../services/projectService';
import '../../styles/ProjectForm.css';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && id) {
      loadProject(parseInt(id));
    }
  }, [id, isEditMode]);

  const loadProject = async (projectId) => {
    try {
      const response = await projectService.getProjectById(projectId);
      setFormData({
        nom: response.data.nom,
        description: response.data.description || ''
      });
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du projet');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom.trim()) {
      setError('Le nom du projet est requis');
      setLoading(false);
      return;
    }

    try {
      if (isEditMode && id) {
        await projectService.updateProject(parseInt(id), formData);
      } else {
        await projectService.createProject(formData);
      }
      navigate('/projects');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="project-form-container">
        <div className="project-form-card">
          <h1>{isEditMode ? 'Modifier le projet' : 'Nouveau projet'}</h1>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label htmlFor="nom">Nom du projet *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Site Web E-commerce"
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
                placeholder="Décrivez votre projet..."
                rows={5}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/projects')}
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

export default ProjectForm;