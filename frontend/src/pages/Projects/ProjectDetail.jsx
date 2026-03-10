import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ProjectDetail.css';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    if (id) {
      loadProjectData(parseInt(id));
    }
  }, [id]);

  const loadProjectData = async (projectId) => {
    try {
      setLoading(true);
      const [projectResponse, membersResponse] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getMembers(projectId)
      ]);
      setProject(projectResponse.data);
      setMembers(membersResponse.data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!id || !memberEmail.trim()) return;

    try {
      await projectService.addMember(parseInt(id), { email: memberEmail });
      setMemberEmail('');
      setShowAddMember(false);
      loadProjectData(parseInt(id));
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'ajout du membre');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!id) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      try {
        await projectService.removeMember(parseInt(id), memberId);
        loadProjectData(parseInt(id));
      } catch (err) {
        alert(err.message || 'Erreur lors du retrait du membre');
      }
    }
  };

  const handleDelete = async () => {
    if (!id || !project) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.nom}" ?`)) {
      try {
        await projectService.deleteProject(parseInt(id));
        navigate('/projects');
      } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="project-detail-container">
          <div className="loading">Chargement...</div>
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Navbar />
        <div className="project-detail-container">
          <div className="error-message">{error || 'Projet non trouvé'}</div>
        </div>
      </>
    );
  }

  const isOwner = user?.id_utilisateur === project.id_utilisateur_createur;

  return (
    <>
      <Navbar />
      <div className="project-detail-container">
        <button className="btn-back" onClick={() => navigate('/projects')}>
          ← Retour aux projets
        </button>

        <div className="project-detail-header">
          <div>
            <h1>{project.nom}</h1>
            {isOwner && <span className="owner-badge">Propriétaire</span>}
          </div>
          
          <div className="project-actions">
            <button 
              className="btn-view-tasks"
              onClick={() => navigate(`/projects/${id}/tasks`)}
            >
              📋 Voir les tâches
            </button>
            {isOwner && (
              <>
                <button 
                  className="btn-edit"
                  onClick={() => navigate(`/projects/${id}/edit`)}
                >
                  ✏️ Modifier
                </button>
                <button 
                  className="btn-delete"
                  onClick={handleDelete}
                >
                  🗑️ Supprimer
                </button>
              </>
            )}
          </div>
        </div>

        <div className="project-detail-content">
          <section className="project-info-section">
            <h2>Description</h2>
            <p>{project.description || 'Aucune description'}</p>
          </section>

          <section className="members-section">
            <div className="members-header">
              <h2>Membres ({members.length})</h2>
              {isOwner && (
                <button 
                  className="btn-add-member"
                  onClick={() => setShowAddMember(!showAddMember)}
                >
                  ➕ Inviter un membre
                </button>
              )}
            </div>

            {showAddMember && (
              <div className="add-member-form">
                <input
                  type="email"
                  placeholder="Email du membre"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                <button onClick={handleAddMember} className="btn-submit">
                  Ajouter
                </button>
                <button onClick={() => setShowAddMember(false)} className="btn-cancel">
                  Annuler
                </button>
              </div>
            )}

            <div className="members-list">
              {members.map((member) => (
                <div key={member.id_utilisateur} className="member-card">
                  <div className="member-info">
                    <div>
                      <h4>{member.nom}</h4>
                      <p>{member.email}</p>
                    </div>
                    {member.is_owner && <span className="role-badge owner">Propriétaire</span>}
                  </div>
                  
                  {isOwner && !member.is_owner && (
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveMember(member.id_utilisateur)}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;