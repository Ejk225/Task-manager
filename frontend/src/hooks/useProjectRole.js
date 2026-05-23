import { useState, useEffect } from 'react';
import api from '../services/api';

const useProjectRole = (projectId) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchRole = async () => {
      try {
        const response = await api.get(`/projects/${projectId}/my-role`);
        setRole(response.data.data.role);
      } catch {
        setRole('membre');
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [projectId]);

  const isGuest = role === 'invite';
  const isMember = role === 'membre' || role === 'proprietaire';
  const isOwner = role === 'proprietaire';

  return { role, loading, isGuest, isMember, isOwner };
};

export default useProjectRole;