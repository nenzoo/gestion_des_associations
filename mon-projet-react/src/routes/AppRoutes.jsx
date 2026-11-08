import { Routes, Route, Navigate, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';

function RoutePlaceholder({ badge, title, description }) {
  return (
    <section
      style={{
        padding: 'var(--space-64) var(--space-80)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-16)',
        maxWidth: '720px',
      }}
    >
      <span
        style={{
          alignSelf: 'flex-start',
          backgroundColor: 'var(--color-violet-soft)',
          color: 'var(--color-violet)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--weight-bold)',
          padding: '5px 9px',
          borderRadius: 'var(--radius-badge)',
        }}
      >
        {badge}
      </span>
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-extrabold)',
          color: 'var(--color-text-primary)',
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 'var(--text-md)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {description}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}>
        <Link to="/" className="navbar__login-btn">
          Accueil
        </Link>
        <Link to="/adhesion" className="navbar__login-btn">
          Demande d’adhésion
        </Link>
        <Link to="/connexion" className="navbar__login-btn">
          Connexion
        </Link>
      </div>
    </section>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques avec Navbar et Footer */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            <RoutePlaceholder
              badge="UNIVERSITÉ LUMIÈRE LYON 2"
              title="Accueil public · Agora"
              description="La Landing Page complète sera développée lors de la Tâche 1.4."
            />
          }
        />
        <Route
          path="/evenements"
          element={
            <RoutePlaceholder
              badge="AGENDA PUBLIC"
              title="Événements et annonces"
              description="Catalogue public des événements et annonces de l'association Agora."
            />
          }
        />
        <Route
          path="/connexion"
          element={
            <RoutePlaceholder
              badge="AUTHENTIFICATION"
              title="Connexion à votre espace Agora"
              description="La page de connexion sera développée lors de la Tâche 1.5."
            />
          }
        />
        <Route
          path="/adhesion"
          element={
            <RoutePlaceholder
              badge="ADHÉSION ÉTUDIANT"
              title="Demande d’adhésion à l’association"
              description="Le formulaire de demande d'adhésion (statut EN_ATTENTE) sera développé lors de la Tâche 1.5."
            />
          }
        />
        <Route
          path="/inscription"
          element={<Navigate to="/adhesion" replace />}
        />
      </Route>

      {/* Redirection par défaut vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
