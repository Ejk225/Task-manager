import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/TaskHistory.css';

const champsLabels = {
  titre: 'Titre',
  statut: 'Statut',
  priorité: 'Priorité',
  description: 'Description',
  échéance: 'Échéance',
  assignation: 'Assignation'
};

const statutLabels = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
  archivee: 'Archivée'
};

const prioriteLabels = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente'
};

const formatValue = (champ, value) => {
  if (!value || value === 'null') return '—';
  if (champ === 'statut') return statutLabels[value] || value;
  if (champ === 'priorité') return prioriteLabels[value] || value;
  if (champ === 'échéance') {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }
  if (value.length > 50) return value.substring(0, 50) + '...';
  return value;
};

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} jour(s)`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

const getInitials = (nom) => {
  if (!nom) return '?';
  return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// --- Nouveau : rendu spécifique pour les événements complexes (colonne JSONB) ---
const renderChange = (entry) => {
  if (entry.details) {
    if (entry.details.type === 'piece_jointe') {
      return (
        <span className="history-item__change">
          📎 Pièce jointe ajoutée : <strong>{entry.details.fichier?.nom}</strong>
          <span className="history-item__meta">
            {' '}({Math.round((entry.details.fichier?.taille || 0) / 1024)} Ko)
          </span>
        </span>
      );
    }
    if (entry.details.type === 'reassignation') {
      return (
        <span className="history-item__change">
          🔄 Réassigné de <strong>{entry.details.ancien_assigne?.nom || '—'}</strong>
          {' '}à <strong>{entry.details.nouveau_assigne?.nom || '—'}</strong>
        </span>
      );
    }
  }

  // Fallback : comportement inchangé pour les changements simples existants
  return (
    <span className="history-item__change">
      <span className="history-item__field">
        {champsLabels[entry.champ_modifie] || entry.champ_modifie}
      </span>
      <span className="history-item__arrow"> : </span>
      <span className="history-item__old">
        {formatValue(entry.champ_modifie, entry.ancienne_valeur)}
      </span>
      <span className="history-item__arrow"> → </span>
      <span className="history-item__new">
        {formatValue(entry.champ_modifie, entry.nouvelle_valeur)}
      </span>
    </span>
  );
};

const TaskHistoryComponent = ({ taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [taskId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}/history`);
      setHistory(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="history-section">
      <h2 className="history-title">
        📜 Historique des modifications
        <span className="history-count">{history.length}</span>
      </h2>

      {error && <div className="history-error">{error}</div>}

      {loading ? (
        <div className="history-loading">Chargement...</div>
      ) : history.length === 0 ? (
        <div className="history-empty">Aucune modification enregistrée</div>
      ) : (
        <div className="history-list">
          {history.map(entry => (
            <div key={entry.id_historique} className="history-item">
              <div className="history-item__avatar">
                {getInitials(entry.modificateur?.nom)}
              </div>
              <div className="history-item__body">
                <div className="history-item__header">
                  <span className="history-item__author">
                    {entry.modificateur?.nom || 'Utilisateur'}
                  </span>
                  <span className="history-item__time">
                    {timeAgo(entry.date_modification)}
                  </span>
                </div>
                {renderChange(entry)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TaskHistoryComponent;