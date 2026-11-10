import { Link } from 'react-router-dom';
import AuthSplitShell from './AuthSplitShell';
import { getLatestMembershipRequest } from '../../services/authService';
import circleCheckVioletIcon from '../../assets/icons/circle-check-violet.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';

function MembershipSentPage() {
  const request = getLatestMembershipRequest();
  const firstName = request?.firstName || 'Manon';
  const email = request?.email || 'manon.laurent@univ-lyon2.fr';
  const status = request?.status || 'EN_ATTENTE';

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
        <h2 className="auth-intro__title">C’est envoyé, {firstName} !</h2>
        <p className="auth-intro__subtitle">
          Ta demande d’adhésion a bien été reçue. On a hâte de te rencontrer.
        </p>
      </div>

      {/* Badge de statut EN_ATTENTE (2:58340 & 2:58376) */}
      <span className="auth-status-badge auth-status-badge--pending">
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
