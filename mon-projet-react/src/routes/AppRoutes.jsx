import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import ProtectedStudentRoute from './ProtectedStudentRoute';
import HomePage from '../pages/public/HomePage';
import PublicCatalogPage from '../pages/public/PublicCatalogPage';
import LoginPage from '../pages/auth/LoginPage';
import MembershipRequestPage from '../pages/auth/MembershipRequestPage';
import MembershipSentPage from '../pages/auth/MembershipSentPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentSecurityPage from '../pages/student/StudentSecurityPage';

function StudentRoutePlaceholder({ eyebrow, title, subtitle }) {
  return (
    <>
      <div className="student-page-header">
        <p className="student-page-header__eyebrow">{eyebrow}</p>
        <div className="student-page-header__row">
          <div className="student-page-header__intro">
            <h1 className="student-page-header__title">{title}</h1>
            <p className="student-page-header__subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="student-placeholder-card">
        <h2 className="student-placeholder-card__title">{title}</h2>
        <p className="student-placeholder-card__text">
          Vue prête à être implémentée dans la tâche dédiée du Jour 2.
        </p>
      </div>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Pages publiques avec Navbar et Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/evenements" element={<PublicCatalogPage />} />
      </Route>

      {/* Vues d'authentification et d'adhésion (avec leur propre en-tête/pied minimaliste Figma) */}
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/adhesion" element={<MembershipRequestPage />} />
      <Route path="/adhesion/envoyee" element={<MembershipSentPage />} />
      <Route path="/inscription" element={<Navigate to="/adhesion" replace />} />

      {/* Espace étudiant protégé (statut métier ACCEPTEE requis) */}
      <Route
        path="/etudiant"
        element={
          <ProtectedStudentRoute>
            <StudentLayout />
          </ProtectedStudentRoute>
        }
      >
        <Route index element={<Navigate to="profil" replace />} />
        <Route path="profil" element={<StudentProfilePage />} />
        <Route path="securite" element={<StudentSecurityPage />} />
        <Route
          path="inscriptions"
          element={
            <StudentRoutePlaceholder
              eyebrow="MES INSCRIPTIONS"
              title="Tes prochains rendez-vous"
              subtitle="2 inscriptions confirmées. Retrouve les détails et gère ta participation."
            />
          }
        />
        <Route
          path="evenements"
          element={
            <StudentRoutePlaceholder
              eyebrow="VIE DU CAMPUS"
              title="Événements & Annonces"
              subtitle="Inscris-toi aux événements et consulte les annonces d’Agora."
            />
          }
        />
      </Route>

      {/* Redirection par défaut vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
