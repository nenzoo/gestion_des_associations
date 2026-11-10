import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthSplitShell from './AuthSplitShell';
import {
  getInitialMembershipForm,
  submitMembershipRequest,
} from '../../services/authService';
import heartHandshakeIcon from '../../assets/icons/heart-handshake.svg';
import checkIcon from '../../assets/icons/check.svg';
import infoIcon from '../../assets/icons/info.svg';
import arrowRightIcon from '../../assets/icons/arrow-right.svg';

function MembershipRequestPage() {
  const navigate = useNavigate();
  const initialForm = getInitialMembershipForm();

  const [formData, setFormData] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (
      !formData.lastName.trim() ||
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.studentNumber.trim()
    ) {
      setErrorMessage('Merci de renseigner tous les champs obligatoires (*).');
      return;
    }

    if (!formData.acceptedTerms) {
      setErrorMessage(
        'Merci d’accepter les statuts de l’association et la politique de confidentialité.'
      );
      return;
    }

    submitMembershipRequest(formData);
    navigate('/adhesion/envoyee');
  };

  return (
    <AuthSplitShell>
      {/* Présentation du formulaire (2:58226 & 2:58273) */}
      <div className="auth-intro">
        <div className="auth-intro__badge-icon">
          <img src={heartHandshakeIcon} alt="" className="auth-intro__icon" />
        </div>
        <h2 className="auth-intro__title">Bienvenue dans l’aventure.</h2>
        <p className="auth-intro__subtitle">
          Demande ton adhésion à Agora. Le bureau vérifie ton statut étudiant
          sous 48 h.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Identité : Nom * & Prénom * (2:58231 & 2:58278) */}
        <div className="auth-row-2">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="req-lastname">
              Nom *
            </label>
            <div className="auth-input-wrapper">
              <input
                id="req-lastname"
                type="text"
                className="auth-input"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                placeholder="Laurent"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="req-firstname">
              Prénom *
            </label>
            <div className="auth-input-wrapper">
              <input
                id="req-firstname"
                type="text"
                className="auth-input"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                placeholder="Manon"
                required
              />
            </div>
          </div>
        </div>

        {/* Champ · E-mail universitaire * (2:58240 & 2:58287) */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="req-email">
            E-mail universitaire *
          </label>
          <div className="auth-input-wrapper">
            <input
              id="req-email"
              type="email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="manon.laurent@univ-lyon2.fr"
              required
            />
          </div>
          <p className="auth-field__hint">
            Ton lien d’activation sera envoyé à cette adresse.
          </p>
        </div>

        {/* Champ · Numéro étudiant * (2:58245 & 2:58292) */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="req-student-number">
            Numéro étudiant *
          </label>
          <div className="auth-input-wrapper">
            <input
              id="req-student-number"
              type="text"
              inputMode="numeric"
              className="auth-input"
              value={formData.studentNumber}
              onChange={handleChange('studentNumber')}
              placeholder="22610482"
              required
            />
          </div>
          <p className="auth-field__hint">
            8 chiffres · Présent sur ta carte étudiante.
          </p>
        </div>

        {/* Consentement (2:58250 & 2:58297) */}
        <label className="auth-checkbox-label" htmlFor="req-consent">
          <input
            id="req-consent"
            type="checkbox"
            className="auth-checkbox-input"
            checked={formData.acceptedTerms}
            onChange={handleChange('acceptedTerms')}
          />
          <span
            className={`auth-checkbox-box ${
              formData.acceptedTerms ? 'auth-checkbox-box--checked' : ''
            }`}
          >
            {formData.acceptedTerms && (
              <img src={checkIcon} alt="" className="auth-checkbox-icon" />
            )}
          </span>
          <span className="auth-checkbox-text">
            J’accepte les statuts de l’association et la politique de
            confidentialité. Mes données servent uniquement à la gestion de mon
            adhésion.
          </span>
        </label>

        {/* Message d'information cotisation (2:58254 & 2:58301) */}
        <div className="auth-banner auth-banner--info">
          <img src={infoIcon} alt="" className="auth-banner__icon" />
          <p className="auth-banner__text">
            Cotisation annuelle : 10 €. Les modalités de paiement te seront
            transmises après acceptation.
          </p>
        </div>

        {errorMessage && (
          <p className="auth-field__error" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Bouton · Envoyer ma demande (2:58257 & 2:58304) */}
        <button type="submit" className="auth-primary-btn">
          <img src={arrowRightIcon} alt="" className="auth-primary-btn__icon" />
          <span>Envoyer ma demande</span>
        </button>

        {/* Pied de formulaire (2:58260 & 2:58307) */}
        <p className="auth-required-note">
          * Champs obligatoires · Déjà membre ?{' '}
          <Link to="/connexion" className="auth-switch-inline-link">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthSplitShell>
  );
}

export default MembershipRequestPage;
