import { Link, useLocation } from 'react-router-dom';
import AuthSplitShell from './AuthSplitShell';
import { MEMBERSHIP_STATUS } from '../../data/authMockData';
import { getLatestMembershipRequest } from '../../services/authService';
import circleCheckVioletIcon from '../../assets/icons/circle-check-violet.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';
import infoIcon from '../../assets/icons/info.svg';

function MembershipSentPage() {
  const location = useLocation();
  const request = getLatestMembershipRequest({
    requestId: location.state?.requestId,
    email: location.state?.email,
  });

  if (!request) {
    return (
      <AuthSplitShell>
        <div className="auth-intro">
          <div className="auth-intro__badge-icon">
            <img
              src={circleCheckVioletIcon}
              alt=""
              className="auth-intro__icon"
            />
          </div>
          <h2 className="auth-intro__title">Suivi de demande d’adhésion</h2>
          <p className="auth-intro__subtitle">
            Aucune demande active n’a pu être identifiée dans cette session.
            Connecte-toi avec tes identifiants ou dépose une demande d’adhésion.
          </p>
        </div>

        <div className="auth-banner auth-banner--error" role="status">
          <img src={infoIcon} alt="" className="auth-banner__icon" />
          <p className="auth-banner__text">
            Pour protéger la confidentialité des candidatures, le suivi de
            dossier nécessite une connexion ou une soumission directe depuis le
            formulaire d’adhésion.
          </p>
        </div>

        <Link to="/connexion" className="auth-primary-btn">
          Se connecter pour suivre mon dossier
        </Link>

        <Link to="/adhesion" className="auth-ghost-btn">
          Déposer une demande d’adhésion
        </Link>
      </AuthSplitShell>
    );
  }

  const firstName = request.firstName;
  const email = request.email;
  const status = request.status || MEMBERSHIP_STATUS.EN_ATTENTE;
  const isRefused = status === MEMBERSHIP_STATUS.REFUSEE;
  const isRevoked = status === 'REVOQUEE';
  const isDenied = isRefused || isRevoked;

  return (
    <AuthSplitShell>
      {/* Présentation de la confirmation (2:58335 & 2:58371) */}
      <div className="auth-intro">
        <div className="auth-intro__badge-icon">
          <img
            src={circleCheckVioletIcon}
            alt=""
            className="auth-intro__icon"
          />
        </div>
        <h2 className="auth-intro__title">
          {isRevoked
            ? `Accès membre révoqué, ${firstName}`
            : isRefused
            ? `Demande non retenue, ${firstName}`
            : `C’est envoyé, ${firstName} !`}
        </h2>
        <p className="auth-intro__subtitle">
          {isRevoked
            ? 'Ton accès à l’espace membre a été retiré par le bureau. Contacte l’association pour plus d’informations.'
            : isRefused
            ? 'Ta demande d’adhésion n’a pas pu être validée par le bureau. L’accès à l’espace membre n’est pas disponible.'
            : 'Ta demande d’adhésion a bien été reçue. On a hâte de te rencontrer.'}
        </p>
      </div>

      {/* Badge de statut EN_ATTENTE, REFUSEE ou REVOQUEE (2:58340 & 2:58376) */}
      <span
        className={`auth-status-badge ${
          isDenied
            ? 'auth-status-badge--refused'
            : 'auth-status-badge--pending'
        }`}
      >
        {status}
      </span>

      {/* Prochaines étapes (2:58342 & 2:58378) */}
      <div className="auth-steps-box">
        <div className="auth-step-item">
          <p className="auth-step-item__title">1. Vérification par le bureau</p>
          <p className="auth-step-item__desc">
            Nous vérifions ton statut étudiant sous 48 h.
          </p>
        </div>

        <div className="auth-step-item">
          <p className="auth-step-item__title">2. Un e-mail pour la suite</p>
          <p className="auth-step-item__desc">
            Si ta demande est acceptée, tu recevras un lien pour créer ton mot
            de passe.
          </p>
        </div>

        <div className="auth-step-item">
          <p className="auth-step-item__title">3. Bienvenue chez Agora</p>
          <p className="auth-step-item__desc">
            Connecte-toi et inscris-toi aux événements.
          </p>
        </div>
      </div>

      {/* Message de retour (2:58352 & 2:58388) */}
      {isDenied ? (
        <div className="auth-banner auth-banner--error" role="status">
          <img src={infoIcon} alt="" className="auth-banner__icon" />
          <p className="auth-banner__text">
            Statut du dossier associé à {email} : {status}. Seuls les membres
            actifs au statut ACCEPTEE peuvent accéder à l’espace étudiant.
          </p>
        </div>
      ) : (
        <div className="auth-banner auth-banner--success" role="status">
          <img
            src={circleCheckGreenIcon}
            alt=""
            className="auth-banner__icon"
          />
          <p className="auth-banner__text">
            Confirmation envoyée à {email}. Pense à vérifier tes courriers
            indésirables.
          </p>
        </div>
      )}

      {/* Bouton · Découvrir les événements (2:58355 & 2:58391) */}
      <Link to="/evenements" className="auth-primary-btn">
        Découvrir les événements
      </Link>

      {/* Bouton · Retour à l’accueil (2:58357 & 2:58393) */}
      <Link to="/" className="auth-ghost-btn">
        Retour à l’accueil
      </Link>
    </AuthSplitShell>
  );
}

export default MembershipSentPage;
