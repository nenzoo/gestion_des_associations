import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import HomePage from '../pages/public/HomePage';
import PublicCatalogPage from '../pages/public/PublicCatalogPage';
import LoginPage from '../pages/auth/LoginPage';
import MembershipRequestPage from '../pages/auth/MembershipRequestPage';
import MembershipSentPage from '../pages/auth/MembershipSentPage';

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

      {/* Redirection par défaut vers l'accueil */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
