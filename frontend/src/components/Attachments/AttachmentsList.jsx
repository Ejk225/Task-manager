import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import attachmentService from '../../services/attachmentService';
import '../../styles/Attachments.css';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType === 'text/plain' || mimeType === 'text/csv') return '📃';
  return '📎';
};

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jour(s)`;
};

const AttachmentsList = ({ taskId }) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const response = await attachmentService.getAttachments(taskId);
      setAttachments(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des pièces jointes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Validation taille (10MB max)
    const oversized = fileArray.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      setError(`Fichier(s) trop volumineux (max 10 Mo) : ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    // Max 5 fichiers
    if (fileArray.length > 5) {
      setError('Maximum 5 fichiers par upload');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const response = await attachmentService.uploadAttachments(taskId, fileArray);
      setAttachments(prev => [...response.data, ...prev]);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    try {
      await attachmentService.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id_piece_jointe !== attachmentId));
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDownload = (attachment) => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:5000/api/attachments/${attachment.id_piece_jointe}/download`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = attachment.nom_original;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(() => setError('Erreur lors du téléchargement'));
  };

  return (
    <section className="attachments-section">
      <h2 className="attachments-title">
        📎 Pièces jointes
        <span className="attachments-count">{attachments.length}</span>
      </h2>

      {error && (
        <div className="attachments-error">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Zone de drop */}
      <div
        className={`drop-zone ${dragOver ? 'drop-zone--active' : ''} ${uploading ? 'drop-zone--uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="drop-zone__uploading">
            <div className="upload-spinner" />
            <span>Upload en cours...</span>
          </div>
        ) : (
          <>
            <span className="drop-zone__icon">📁</span>
            <span className="drop-zone__text">
              Glissez vos fichiers ici ou <strong>cliquez pour parcourir</strong>
            </span>
            <span className="drop-zone__hint">
              Images, PDF, Word, Excel • Max 10 Mo • 5 fichiers max
            </span>
          </>
        )}
      </div>

      {/* Liste des fichiers */}
      {loading ? (
        <div className="attachments-loading">Chargement...</div>
      ) : attachments.length === 0 ? (
        <div className="attachments-empty">Aucune pièce jointe pour l'instant</div>
      ) : (
        <div className="attachments-list">
          {attachments.map(attachment => (
            <div key={attachment.id_piece_jointe} className="attachment-item">
              <span className="attachment-item__icon">
                {getFileIcon(attachment.type_mime)}
              </span>
              <div className="attachment-item__info">
                <span className="attachment-item__name">{attachment.nom_original}</span>
                <span className="attachment-item__meta">
                  {formatSize(attachment.taille)} • {attachment.uploader?.nom} • {timeAgo(attachment.date_upload)}
                </span>
              </div>
              <div className="attachment-item__actions">
                <button
                  className="btn-attachment btn-attachment--download"
                  onClick={() => handleDownload(attachment)}
                  title="Télécharger"
                >
                  ⬇️
                </button>
                {attachment.id_utilisateur === user?.id_utilisateur && (
                  <button
                    className="btn-attachment btn-attachment--delete"
                    onClick={() => handleDelete(attachment.id_piece_jointe)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AttachmentsList;