import { useState } from 'react';

const CommentForm = ({ onSubmit, loading }) => {
  const [contenu, setContenu] = useState('');

  const handleSubmit = async () => {
    if (!contenu.trim()) return;
    await onSubmit(contenu.trim());
    setContenu('');
  };

  return (
    <div className="comment-form">
      <textarea
        className="comment-form__input"
        placeholder="Ajouter un commentaire..."
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        rows={3}
        disabled={loading}
      />
      <div className="comment-form__actions">
        <span className="comment-form__count">{contenu.length}/2000</span>
        <button
          className="comment-form__btn"
          onClick={handleSubmit}
          disabled={loading || !contenu.trim()}
        >
          {loading ? 'Envoi...' : '📤 Envoyer'}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;