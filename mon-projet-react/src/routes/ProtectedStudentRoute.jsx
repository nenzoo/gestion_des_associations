import { Navigate, useLocation } from 'react-router-dom';
import { MEMBERSHIP_STATUS } from '../data/authMockData';
import { getCurrentUser } from '../services/authService';

/**
 * Garde de route pour l'espace étudiant (/etudiant/*).
 * Règle métier validée :
 * - Non connecté -> redirection vers /connexion
 * - Statut EN_ATTENTE ou REFUSEE -> redirection vers /adhesion/envoyee (sans accès au Dashboard)
 * - Statut ACCEPTEE -> accès autorisé à StudentLayout et ses pages enfants
 */
function ProtectedStudentRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (user.membershipStatus !== MEMBERSHIP_STATUS.ACCEPTEE) {
    return (
      <Navigate
        to="/adhesion/envoyee"
        state={{ from: location, status: user.membershipStatus }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedStudentRoute;
