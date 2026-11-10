import { useState } from 'react';
import {
  getStudentSecurityConfig,
  updateStudentPassword,
} from '../../services/studentService';
import eyeOffIcon from '../../assets/icons/eye-off.svg';
import infoIcon from '../../assets/icons/info.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';
import './StudentPages.css';

function StudentSecurityPage() {
  const securityConfig = getStudentSecurityConfig();

  const [currentPassword, setCurrentPassword] = useState(
    securityConfig.hasCustomPassword
      ? ''
      : securityConfig.expectedDemoPassword || '••••••••••••'
  );
  const [newPassword, setNewPassword] = useState(
    securityConfig.hasCustomPassword ? '' : '••••••••••••'
  );
  const [confirmPassword, setConfirmPassword] = useState(
    securityConfig.hasCustomPassword ? '' : '•••••••••'
  );

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorField, setErrorField] = useState(
    securityConfig.hasCustomPassword ? '' : 'confirmPassword'
  );
  const [errorMessage, setErrorMessage] = useState(
    securityConfig.hasCustomPassword ? '' : securityConfig.mismatchErrorText
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorField('');
    setErrorMessage('');
    setFeedbackMessage('');

    const result = updateStudentPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.ok) {
      setErrorField(result.field || 'confirmPassword');
      setErrorMessage(result.error);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedbackMessage(result.message);
  };

  return (
    <>
      {/* En-tête de page (2:58885 Bureau / 2:58933 Mobile) */}
      <div className="student-page-header" data-node-id="2:58885">
        <div className="student-page-header__row" data-node-id="2:58886">
          <div className="student-page-header__intro" data-node-id="2:58887">
            <h1 className="student-page-header__title" data-node-id="2:58888">
              Sécurité du compte
            </h1>
            <p className="student-page-header__subtitle" data-node-id="2:58889">
              Un mot de passe unique pour protéger ton espace.
            </p>
          </div>
        </div>
      </div>

      {/* Conteneur Modifier le mot de passe (2:58890 Bureau / 2:58938 Mobile) */}
      <div className="student-security-container" data-node-id="2:58890">
        {/* Carte Changer mon mot de passe (2:58891) */}
        <div className="student-card" data-node-id="2:58891">
          <h2 className="student-card__title" data-node-id="2:58892">
            Changer mon mot de passe
          </h2>

          <form className="student-form" onSubmit={handleSubmit} noValidate>
            {/* Champ · Mot de passe actuel (2:58893) */}
            <div className="student-field" data-node-id="2:58893">
              <label
                className="student-field__label"
                htmlFor="security-current-password"
                data-node-id="2:58894"
              >
                Mot de passe actuel
              </label>
              <div
                className={`student-input-wrapper ${
                  errorField === 'currentPassword'
                    ? 'student-input-wrapper--error'
                    : ''
                }`}
                data-node-id="2:58895"
              >
                <input
                  id="security-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="student-input"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errorField === 'currentPassword') {
                      setErrorField('');
                      setErrorMessage('');
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="student-password-toggle"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword
                      ? 'Masquer le mot de passe actuel'
                      : 'Afficher le mot de passe actuel'
                  }
                  data-node-id="2:63135"
                >
                  <img
                    src={eyeOffIcon}
                    alt=""
                    className="student-password-toggle__icon"
                  />
                </button>
              </div>
              {errorField === 'currentPassword' && errorMessage && (
                <p className="student-field__error" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Champ · Nouveau mot de passe (2:58898) */}
            <div className="student-field" data-node-id="2:58898">
              <label
                className="student-field__label"
                htmlFor="security-new-password"
                data-node-id="2:58899"
              >
                Nouveau mot de passe
              </label>
              <div
                className={`student-input-wrapper ${
                  errorField === 'newPassword'
                    ? 'student-input-wrapper--error'
                    : ''
                }`}
                data-node-id="2:58900"
              >
                <input
                  id="security-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  className="student-input"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorField === 'newPassword') {
                      setErrorField('');
                      setErrorMessage('');
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="student-password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword
                      ? 'Masquer le nouveau mot de passe'
                      : 'Afficher le nouveau mot de passe'
                  }
                  data-node-id="2:63138"
                >
                  <img
                    src={eyeOffIcon}
                    alt=""
                    className="student-password-toggle__icon"
                  />
                </button>
              </div>
              <p className="student-field__hint" data-node-id="2:58903">
                {securityConfig.passwordRequirementHint}
              </p>
              {errorField === 'newPassword' && errorMessage && (
                <p className="student-field__error" role="alert">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Champ · Confirmer le nouveau mot de passe (2:58904) */}
            <div className="student-field" data-node-id="2:58904">
              <label
                className="student-field__label"
                htmlFor="security-confirm-password"
                data-node-id="2:58905"
              >
                Confirmer le nouveau mot de passe
              </label>
              <div
                className={`student-input-wrapper ${
                  errorField === 'confirmPassword'
                    ? 'student-input-wrapper--error'
                    : ''
                }`}
                data-node-id="2:58906"
              >
                <input
                  id="security-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="student-input"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorField === 'confirmPassword') {
                      setErrorField('');
                      setErrorMessage('');
                    }
                  }}
                  required
                />
                <button
                  type="button"
                  className="student-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? 'Masquer la confirmation du mot de passe'
                      : 'Afficher la confirmation du mot de passe'
                  }
                  data-node-id="2:63141"
                >
                  <img
                    src={eyeOffIcon}
                    alt=""
                    className="student-password-toggle__icon"
                  />
                </button>
              </div>
              {errorField === 'confirmPassword' && errorMessage && (
                <p
                  className="student-field__error"
                  role="alert"
                  data-node-id="2:58909"
                >
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Bouton · Mettre à jour le mot de passe (2:58910) */}
            <button
              type="submit"
              className="student-btn-primary student-btn-primary--mobile-full"
              data-node-id="2:58910"
            >
              Mettre à jour le mot de passe
            </button>

            <p className="student-field__hint" data-node-id="2:58912">
              {securityConfig.sessionDisconnectNote}
            </p>
          </form>
        </div>

        {/* Message de confirmation en cas de succès */}
        {feedbackMessage && (
          <div
            className="student-banner student-banner--success"
            role="status"
          >
            <img
              src={circleCheckGreenIcon}
              alt=""
              className="student-banner__icon"
            />
            <p className="student-banner__text">{feedbackMessage}</p>
          </div>
        )}

        {/* Message d'information (2:58913) */}
        <div
          className="student-banner student-banner--info"
          data-node-id="2:58913"
        >
          <img
            src={infoIcon}
            alt=""
            className="student-banner__icon"
            data-node-id="2:63144"
          />
          <p className="student-banner__text" data-node-id="2:58915">
            {securityConfig.forgotPasswordHelpText}
          </p>
        </div>
      </div>
    </>
  );
}

export default StudentSecurityPage;
