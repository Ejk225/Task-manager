import { useState } from 'react';

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

const CommentItem = ({ comment, currentUserId, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.contenu);
  const [loading, setLoading] = useState(false);

  const isOwner = comment.id_utilisateur === currentUserId;

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    await onUpdate(comment.id_commentaire, editContent.trim());
    setEditing(false);
    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.contenu);
    setEditing(false);
  };

  return (
    <div className="comment-item">
      {/* Avatar */}
      <div className="comment-item__avatar">
        {getInitials(comment.auteur?.nom)}
      </div>

      <div className="comment-item__body">
        {/* Header */}
        <div className="comment-item__header">
          <span className="comment-item__author">{comment.auteur?.nom || 'Utilisateur'}</span>
          <span className="comment-item__time">{timeAgo(comment.date_commentaire)}</span>
        </div>

        {/* Contenu ou édition */}
        {editing ? (
          <div className="comment-item__edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="comment-item__edit-input"
              disabled={loading}
            />
            <div className="comment-item__edit-actions">
              <button
                className="btn-comment btn-comment--save"
                onClick={handleUpdate}
                disabled={loading || !editContent.trim()}
              >
                {loading ? 'Sauvegarde...' : '✅ Sauvegarder'}
              </button>
              <button
                className="btn-comment btn-comment--cancel"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-item__content">{comment.contenu}</p>
        )}

        {/* Actions (uniquement l'auteur) */}
        {isOwner && !editing && (
          <div className="comment-item__actions">
            <button
              className="btn-comment btn-comment--edit"
              onClick={() => setEditing(true)}
            >
              ✏️ Modifier
            </button>
            <button
              className="btn-comment btn-comment--delete"
              onClick={() => onDelete(comment.id_commentaire)}
            >
              🗑️ Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;