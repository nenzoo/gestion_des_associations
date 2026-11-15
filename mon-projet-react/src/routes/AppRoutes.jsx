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
import StudentRegistrationsPage from '../pages/student/StudentRegistrationsPage';
import StudentEventsPage from '../pages/student/StudentEventsPage';

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

      {/* Redirection par défaut vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
