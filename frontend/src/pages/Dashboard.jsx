import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/Dashboard.css';

// Couleurs alignées sur TaskStatusBadge.css pour une cohérence visuelle totale
const STATUS_COLORS = {
  a_faire: '#95a5a6',
  en_cours: '#3498db',
  terminee: '#2ecc71'
};
const PRIORITY_COLORS = {
  basse: '#1abc9c',
  moyenne: '#f39c12',
  haute: '#e67e22',
  urgente: '#e74c3c'
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setStats(response.data.data);
    } catch (err) {
      setError('Impossible de charger les statistiques pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  const statusData = stats ? [
    { name: 'À faire', value: stats.tasks_todo, color: STATUS_COLORS.a_faire },
    { name: 'En cours', value: stats.tasks_in_progress, color: STATUS_COLORS.en_cours },
    { name: 'Terminé', value: stats.tasks_completed, color: STATUS_COLORS.terminee }
  ] : [];

  const priorityData = stats ? [
    { name: 'Basse', value: stats.tasks_by_priority.basse, color: PRIORITY_COLORS.basse },
    { name: 'Moyenne', value: stats.tasks_by_priority.moyenne, color: PRIORITY_COLORS.moyenne },
    { name: 'Haute', value: stats.tasks_by_priority.haute, color: PRIORITY_COLORS.haute },
    { name: 'Urgente', value: stats.tasks_by_priority.urgente, color: PRIORITY_COLORS.urgente }
  ] : [];

  return (
    <>
      <Navbar />
      <div className="dashboard-main">
        <div className="welcome-card">
          <div className="welcome-header">
            <div>
              <h2>Bienvenue, {user?.nom} ! 👋</h2>
              <p className="welcome-date">{today}</p>
            </div>
          </div>

          <p className="welcome-citation">
            « Un projet bien organisé, c'est la moitié du travail accompli. »
          </p>

          <div className="welcome-actions">
            <button className="btn-go-projects" onClick={() => navigate('/projects')}>
              📁 Accéder à mes projets
            </button>
            <button className="btn-new-project" onClick={() => navigate('/projects/new')}>
              ➕ Créer un projet
            </button>
          </div>
        </div>

        {/* ---- Tableau de bord statistique (disposition bento) ---- */}
        {loading ? (
          <div className="stats-loading">Chargement des statistiques...</div>
        ) : error ? (
          <div className="stats-error">{error}</div>
        ) : stats && (
          <div className="stats-bento">

            {/* Colonne KPI */}
            <div className="bento-kpis">
              <div className="kpi-card kpi-navy">
                <span className="kpi-value">{stats.projects_count}</span>
                <span className="kpi-label">Projets actifs</span>
              </div>
              <div className="kpi-card kpi-blue">
                <span className="kpi-value">{stats.tasks_total}</span>
                <span className="kpi-label">Tâches totales</span>
              </div>
              <div className="kpi-card kpi-success">
                <span className="kpi-value">{stats.completion_rate}%</span>
                <span className="kpi-label">Taux de complétion</span>
              </div>
              <div className={`kpi-card ${stats.tasks_overdue > 0 ? 'kpi-danger' : 'kpi-neutral'}`}>
                <span className="kpi-value">{stats.tasks_overdue}</span>
                <span className="kpi-label">En retard</span>
              </div>
            </div>

            {/* Donut statut */}
            <div className="bento-card bento-donut">
              <h3>Par statut</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mini-legend">
                {statusData.map((s, i) => (
                  <span key={i} className="mini-legend-item">
                    <span className="legend-dot" style={{ background: s.color }}></span>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Barres priorité */}
            <div className="bento-card bento-priority">
              <h3>Par priorité</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tâches récentes — colonne verticale à droite */}
            {stats.recent_tasks.length > 0 && (
              <div className="bento-card bento-recent">
                <h3>Tâches récentes</h3>
                <ul className="recent-tasks-list">
                  {stats.recent_tasks.map((task) => (
                    <li
                      key={task.id_tache}
                      className="recent-task-item"
                      onClick={() => navigate(`/projects/${task.id_projet}/tasks/${task.id_tache}`)}
                    >
                      <span className={`status-dot status-${task.statut}`}></span>
                      <div className="recent-task-text">
                        <span className="recent-task-title">{task.titre}</span>
                        <span className="recent-task-project">{task.projet?.nom}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Charge par projet — large, en bas */}
            {stats.tasks_by_project.length > 0 && (
              <div className="bento-card bento-workload">
                <h3>Charge de travail par projet</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.tasks_by_project} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="project_name" width={130} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2E75B6" radius={[0, 8, 8, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;