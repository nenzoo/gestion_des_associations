import { Navigate, useLocation } from 'react-router-dom';
import { MEMBERSHIP_STATUS, ROLES } from '../data/authMockData';
import { getCurrentUser } from '../services/authService';

/**
 * Garde de route pour l'espace gestion Présidence & Secrétariat.
 * - Non connecté -> redirection vers /connexion
 * - Connecté avec un statut non ACCEPTEE -> redirection vers /adhesion/envoyee
 * - Connecté en tant qu'étudiant simple (Membre) -> redirection vers /etudiant/profil
 * - Connecté avec un rôle non autorisé pour la route (ex: Secrétaire sur /presidente/tresorerie)
 *   -> redirection vers la vue d'ensemble de son rôle
 */
function ProtectedManagementRoute({
  children,
  allowedRoles = [ROLES.PRESIDENT, ROLES.SECRETARY],
}) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (
    user.role !== ROLES.ADMIN &&
    (user.membershipStatus !== MEMBERSHIP_STATUS.ACCEPTEE ||
      user.membershipAccessStatus === 'REVOQUEE')
  ) {
    return (
      <Navigate
        to="/adhesion/envoyee"
        state={{
          from: location,
          email: user.email,
          status:
            user.membershipAccessStatus === 'REVOQUEE'
              ? 'REVOQUEE'
              : user.membershipStatus,
        }}
        replace
      />
    );
  }

  if (user.role === ROLES.STUDENT) {
    return <Navigate to="/etudiant/profil" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === ROLES.SECRETARY) {
      return <Navigate to="/secretaire/dashboard" replace />;
    }
    if (user.role === ROLES.PRESIDENT) {
      return <Navigate to="/president/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedManagementRoute;
