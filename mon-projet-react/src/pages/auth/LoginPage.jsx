import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthSplitShell from './AuthSplitShell';
import {
  getInitialLoginForm,
  loginWithCredentials,
} from '../../services/authService';
import logInIcon from '../../assets/icons/log-in.svg';
import eyeOffIcon from '../../assets/icons/eye-off.svg';
import checkIcon from '../../assets/icons/check.svg';
import arrowRightIcon from '../../assets/icons/arrow-right.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';

function LoginPage() {
  const navigate = useNavigate();
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

    // Règle fondamentale §4 : Si la demande d'adhésion est encore EN_ATTENTE,
    // l'étudiant consulte le statut de sa demande sans accéder au Dashboard membre.
    if (result.pendingRequest) {
      navigate('/adhesion/envoyee');
      return;
    }

    setFeedbackMessage(
      `Connexion simulée réussie (${result.user.firstName} ${result.user.lastName} · ${result.user.role}).`
    );
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
