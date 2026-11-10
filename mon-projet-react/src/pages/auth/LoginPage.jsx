import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthSplitShell from './AuthSplitShell';
import { MEMBERSHIP_STATUS } from '../../data/authMockData';
import {
  getInitialLoginForm,
  loginWithCredentials,
} from '../../services/authService';
import logInIcon from '../../assets/icons/log-in.svg';
import eyeOffIcon from '../../assets/icons/eye-off.svg';
import checkIcon from '../../assets/icons/check.svg';
import arrowRightIcon from '../../assets/icons/arrow-right.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';

const TEST_STUDENT_PROFILES = [
  {
    label: 'Manon Laurent (ACCEPTEE)',
    email: 'manon.laurent@univ-lyon2.fr',
  },
  {
    label: 'Étudiant test (EN_ATTENTE)',
    email: 'etudiant.attente@univ-lyon2.fr',
  },
  {
    label: 'Étudiant test (REFUSEE)',
    email: 'etudiant.refuse@univ-lyon2.fr',
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialForm = getInitialLoginForm();

  const [email, setEmail] = useState(initialForm.email);
  const [password, setPassword] = useState(initialForm.password);
  const [rememberMe, setRememberMe] = useState(initialForm.rememberMe);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    setFeedbackMessage('');

    const result = loginWithCredentials({ email, password, rememberMe });

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    // Règle fondamentale §4 : Si la demande d'adhésion est EN_ATTENTE ou REFUSEE,
    // l'étudiant consulte le statut de sa demande sans accéder à l'espace membre.
    if (result.user.membershipStatus !== MEMBERSHIP_STATUS.ACCEPTEE) {
      navigate('/adhesion/envoyee', {
        replace: true,
        state: { status: result.user.membershipStatus },
      });
      return;
    }

    const destination = location.state?.from?.pathname || '/etudiant/profil';
    navigate(destination, { replace: true });
  };

  return (
    <AuthSplitShell>
      {/* Présentation du formulaire (2:58422 & 2:58459) */}
      <div className="auth-intro">
        <div className="auth-intro__badge-icon">
          <img src={logInIcon} alt="" className="auth-intro__icon" />
        </div>
        <h2 className="auth-intro__title">Heureux de te revoir.</h2>
        <p className="auth-intro__subtitle">
          Connecte-toi à ton espace Agora, le point de départ de ta vie
          associative.
        </p>
      </div>

      {/* Sélecteur des 3 profils étudiants fictifs validés (Point 3) */}
      <div className="auth-demo-profiles">
        <span className="auth-demo-profiles__title">
          PROFILS DE TEST ÉTUDIANTS
        </span>
        <div className="auth-demo-profiles__list">
          {TEST_STUDENT_PROFILES.map((profile) => {
            const isSelected =
              email.trim().toLowerCase() === profile.email.toLowerCase();
            return (
              <button
                key={profile.email}
                type="button"
                className={`auth-demo-profiles__btn ${
                  isSelected ? 'auth-demo-profiles__btn--active' : ''
                }`}
                onClick={() => {
                  setEmail(profile.email);
                  setErrorMessage('');
                  setFeedbackMessage('');
                }}
              >
                {profile.label}
              </button>
            );
          })}
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Champ · E-mail universitaire (2:58427 & 2:58464) */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-email">
            E-mail universitaire
          </label>
          <div
            className={`auth-input-wrapper auth-input-wrapper--active ${
              errorMessage ? 'auth-input-wrapper--error' : ''
            }`}
          >
            <input
              id="login-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@univ-lyon2.fr"
              required
            />
          </div>
        </div>

        {/* Champ · Mot de passe (2:58431 & 2:58468) */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-password">
            Mot de passe
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
            >
              <img
                src={eyeOffIcon}
                alt=""
                className="auth-password-toggle__icon"
              />
            </button>
          </div>
        </div>

        {/* Options de connexion (2:58436 & 2:58473) */}
        <div className="auth-options-row">
          <label className="auth-checkbox-label" htmlFor="login-remember">
            <input
              id="login-remember"
              type="checkbox"
              className="auth-checkbox-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span
              className={`auth-checkbox-box ${
                rememberMe ? 'auth-checkbox-box--checked' : ''
              }`}
            >
              {rememberMe && (
                <img src={checkIcon} alt="" className="auth-checkbox-icon" />
              )}
            </span>
            <span className="auth-checkbox-text">
              Rester connecté sur cet appareil
            </span>
          </label>

          <button
            type="button"
            className="auth-forgot-link"
            onClick={() =>
              setFeedbackMessage(
                'Un lien de réinitialisation fictif a été préparé pour ton adresse universitaire.'
              )
            }
          >
            Mot de passe oublié ?
          </button>
        </div>

        {errorMessage && (
          <p className="auth-field__error" role="alert">
            {errorMessage}
          </p>
        )}

        {feedbackMessage && (
          <div className="auth-banner auth-banner--success" role="status">
            <img
              src={circleCheckGreenIcon}
              alt=""
              className="auth-banner__icon"
            />
            <p className="auth-banner__text">{feedbackMessage}</p>
          </div>
        )}

        {/* Bouton · Se connecter (2:58442 & 2:58479) */}
        <button type="submit" className="auth-primary-btn">
          <img src={arrowRightIcon} alt="" className="auth-primary-btn__icon" />
          <span>Se connecter</span>
        </button>

        {/* Liens bas de carte (2:58445 & 2:58446) */}
        <p className="auth-Switch-text">
          Pas encore membre ?{' '}
          <Link to="/adhesion" className="auth-switch-inline-link">
            Adhérer à l’association
          </Link>
        </p>

        <p className="auth-meta-note">
          Connexion sécurisée · Ton rôle détermine ton espace.
        </p>
      </form>
    </AuthSplitShell>
  );
}

export default LoginPage;
