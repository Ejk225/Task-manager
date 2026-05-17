import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import commentService from '../../services/commentService';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import '../../styles/Comments.css';

const CommentsList = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getComments(taskId);
      setComments(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (contenu) => {
    setSubmitting(true);
    try {
      const response = await commentService.addComment(taskId, contenu);
      // Ajouter en tête de liste (ordre DESC)
      setComments(prev => [response.data, ...prev]);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (commentId, contenu) => {
    try {
      const response = await commentService.updateComment(commentId, contenu);
      setComments(prev =>
        prev.map(c => c.id_commentaire === commentId ? response.data : c)
      );
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id_commentaire !== commentId));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <section className="comments-section">
      <h2 className="comments-title">
        💬 Commentaires
        <span className="comments-count">{comments.length}</span>
      </h2>

      {error && (
        <div className="comments-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Formulaire d'ajout */}
      <CommentForm onSubmit={handleAdd} loading={submitting} />

      {/* Liste */}
      {loading ? (
        <div className="comments-loading">Chargement des commentaires...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          Aucun commentaire pour l'instant. Soyez le premier ! 💬
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id_commentaire}
              comment={comment}
              currentUserId={user?.id_utilisateur}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentsList;