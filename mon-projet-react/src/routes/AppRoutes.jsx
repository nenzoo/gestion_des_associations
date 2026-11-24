import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../data/authMockData';
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import ManagementLayout from '../layouts/ManagementLayout';
import ProtectedStudentRoute from './ProtectedStudentRoute';
import ProtectedManagementRoute from './ProtectedManagementRoute';
import HomePage from '../pages/public/HomePage';
import PublicCatalogPage from '../pages/public/PublicCatalogPage';
import LoginPage from '../pages/auth/LoginPage';
import MembershipRequestPage from '../pages/auth/MembershipRequestPage';
import MembershipSentPage from '../pages/auth/MembershipSentPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentSecurityPage from '../pages/student/StudentSecurityPage';
import StudentRegistrationsPage from '../pages/student/StudentRegistrationsPage';
import StudentEventsPage from '../pages/student/StudentEventsPage';
import ManagementDashboardPage from '../pages/president/ManagementDashboardPage';
import ManagementRequestsPage from '../pages/president/ManagementRequestsPage';
import ManagementMembersPage from '../pages/president/ManagementMembersPage';
import ManagementEventsPage from '../pages/president/ManagementEventsPage';
import ManagementAnnouncementsPage from '../pages/president/ManagementAnnouncementsPage';

function ManagementRoutePlaceholder({ eyebrow, title, subtitle }) {
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
          Vue de l’espace gestion prête à être implémentée dans la tâche dédiée.
        </p>
      </div>
    </>
  );
}

function renderManagementChildRoutes({ includeTreasury = false }) {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ManagementDashboardPage />} />
      <Route path="demandes" element={<ManagementRequestsPage />} />
      <Route path="membres" element={<ManagementMembersPage />} />
      <Route path="evenements" element={<ManagementEventsPage />} />
      <Route path="annonces" element={<ManagementAnnouncementsPage />} />
      {includeTreasury && (
        <Route
          path="tresorerie"
          element={
            <ManagementRoutePlaceholder
              eyebrow="TRÉSORERIE · LECTURE SEULE"
              title="Trésorerie de l’association"
              subtitle="Consultation en lecture seule du solde et des transactions (Jour 4)."
            />
          }
        />
      )}
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
        <Route path="inscriptions" element={<StudentRegistrationsPage />} />
        <Route path="evenements" element={<StudentEventsPage />} />
      </Route>

      {/* Espace Présidence protégé (rôle Présidente requis) */}
      <Route
        path="/presidente"
        element={
          <ProtectedManagementRoute allowedRoles={[ROLES.PRESIDENT]}>
            <ManagementLayout />
          </ProtectedManagementRoute>
        }
      >
        {renderManagementChildRoutes({ includeTreasury: true })}
      </Route>

      <Route
        path="/president"
        element={
          <ProtectedManagementRoute allowedRoles={[ROLES.PRESIDENT]}>
            <ManagementLayout />
          </ProtectedManagementRoute>
        }
      >
        {renderManagementChildRoutes({ includeTreasury: true })}
      </Route>

      {/* Espace Secrétariat protégé (rôle Secrétaire ou Présidente) */}
      <Route
        path="/secretaire"
        element={
          <ProtectedManagementRoute
            allowedRoles={[ROLES.SECRETARY, ROLES.PRESIDENT]}
          >
            <ManagementLayout />
          </ProtectedManagementRoute>
        }
      >
        {renderManagementChildRoutes({ includeTreasury: false })}
      </Route>

      {/* Redirection par défaut vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
