import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [102, 126, 234],
  dark: [44, 62, 80],
  gray: [128, 128, 128],
  light: [245, 245, 245],
  white: [255, 255, 255],
  success: [46, 204, 113],
  danger: [231, 76, 60],
  warning: [243, 156, 18],
};

const addHeader = (doc, title, subtitle = '') => {
  // Bande colorée en haut
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 28, 'F');

  // Titre
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 13);

  // Sous-titre
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 21);
  }

  // Date de génération
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.text(`Généré le ${dateStr}`, 196, 21, { align: 'right' });

  // Reset couleur texte
  doc.setTextColor(...COLORS.dark);
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(
      `Page ${i} / ${pageCount}`,
      105, 290, { align: 'center' }
    );
    doc.text('Task Manager — Export PDF', 14, 290);
  }
};

const statusLabel = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
  archivee: 'Archivée'
};

const prioriteLabel = {
  basse: 'Basse',
  moyenne: 'Moyenne',
  haute: 'Haute',
  urgente: 'Urgente'
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

// ─── Export liste des projets ───────────────────────────────────────────────
export const exportProjectsToPDF = (projects) => {
  const doc = new jsPDF();
  addHeader(doc, 'Liste des Projets', `${projects.length} projet(s) au total`);

  autoTable(doc, {
    startY: 35,
    head: [['Nom du projet', 'Description', 'Créé le']],
    body: projects.map(p => [
      p.nom,
      p.description
        ? (p.description.length > 60 ? p.description.substring(0, 60) + '...' : p.description)
        : '—',
      formatDate(p.date_creation)
    ]),
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 10
    },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 105 },
      2: { cellWidth: 30, halign: 'center' }
    }
  });

  addFooter(doc);
  doc.save('projets.pdf');
};

// ─── Export détails d'un projet ─────────────────────────────────────────────
export const exportProjectDetailToPDF = (project, members, tasks = []) => {
  tasks = tasks || [];
  members = members || [];
  const doc = new jsPDF();
  addHeader(doc, project.nom, 'Détails du projet');

  let y = 38;

  // Description
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  const desc = project.description || 'Aucune description';
  const descLines = doc.splitTextToSize(desc, 182);
  doc.text(descLines, 14, y);
  y += descLines.length * 5 + 6;
  doc.setTextColor(...COLORS.dark);

  // Stats rapides
  const completed = tasks.filter(t => t.statut === 'terminee').length;
  const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  doc.setFillColor(...COLORS.light);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const stats = [
    { label: 'Membres', value: members.length },
    { label: 'Total tâches', value: tasks.length },
    { label: 'Terminées', value: completed },
    { label: 'Complétion', value: `${rate}%` }
  ];
  stats.forEach((s, i) => {
    const x = 14 + i * 46 + 10;
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(14);
    doc.text(String(s.value), x, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(s.label, x, y + 17);
  });
  y += 30;

  // Membres
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Membres', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Nom', 'Email', 'Rôle']],
    body: members.map(m => [m.nom, m.email, m.role || 'Membre']),
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // Tâches
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tâches', 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [['Titre', 'Statut', 'Priorité', 'Assigné à', 'Échéance']],
    body: tasks.map(t => [
      t.titre,
      statusLabel[t.statut] || t.statut,
      prioriteLabel[t.priorite] || t.priorite,
      t.utilisateur_assigne?.nom || '—',
      formatDate(t.date_echeance)
    ]),
    headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 40 },
      4: { cellWidth: 28, halign: 'center' }
    },
    margin: { left: 14, right: 14 }
  });

  addFooter(doc);
  doc.save(`projet-${project.nom.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

// ─── Export liste des tâches d'un projet ────────────────────────────────────
export const exportTasksToPDF = (projectName, tasks, filters = {}) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  addHeader(doc, `Tâches — ${projectName}`, `${tasks.length} tâche(s) exportée(s)`);

  let y = 35;

  // Filtres actifs
  const activeFilters = Object.entries(filters).filter(([, v]) => v);
  if (activeFilters.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    const filterStr = 'Filtres : ' + activeFilters.map(([k, v]) => `${k}: ${v}`).join(' · ');
    doc.text(filterStr, 14, y);
    y += 8;
  }

  autoTable(doc, {
    startY: y,
    head: [['Titre', 'Description', 'Statut', 'Priorité', 'Assigné à', 'Échéance', 'Créée le']],
    body: tasks.map(t => [
      t.titre,
      t.description
        ? (t.description.length > 40 ? t.description.substring(0, 40) + '...' : t.description)
        : '—',
      statusLabel[t.statut] || t.statut,
      prioriteLabel[t.priorite] || t.priorite,
      t.utilisateur_assigne?.nom || '—',
      formatDate(t.date_echeance),
      formatDate(t.date_creation)
    ]),
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 38 },
      5: { cellWidth: 30, halign: 'center' },
      6: { cellWidth: 30, halign: 'center' }
    }
  });

  addFooter(doc);
  doc.save(`taches-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};