import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getStudentProfile,
  updateStudentProfile,
} from '../../services/studentService';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';
import './StudentPages.css';

function StudentProfilePage() {
  const initialProfile = getStudentProfile();

  const [profile, setProfile] = useState(initialProfile);
  const [firstName, setFirstName] = useState(initialProfile?.firstName || '');
  const [lastName, setLastName] = useState(initialProfile?.lastName || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [studyTrack, setStudyTrack] = useState(
    initialProfile?.studyTrack || ''
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(
    'Tes informations ont été mises à jour.'
  );

  if (!profile) {
    return null;
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    setFeedbackMessage('');

    const result = updateStudentProfile({
      firstName,
      lastName,
      email,
      studyTrack,
    });

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setProfile(result.profile);
    setFirstName(result.profile.firstName);
    setLastName(result.profile.lastName);
    setEmail(result.profile.email);
    setStudyTrack(result.profile.studyTrack);
    setFeedbackMessage(result.message);
  };

  return (
    <>
      {/* En-tête de page (2:58698 Bureau / 2:58775 Mobile) */}
      <div className="student-page-header" data-node-id="2:58698">
        <p className="student-page-header__eyebrow" data-node-id="2:58699">
          MON ESPACE AGORA
        </p>
        <div className="student-page-header__row" data-node-id="2:58700">
          <div className="student-page-header__intro" data-node-id="2:58701">
            <h1 className="student-page-header__title" data-node-id="2:58702">
              Mon profil
            </h1>
            <p className="student-page-header__subtitle" data-node-id="2:58703">
              Tes informations, toujours à jour.
            </p>
          </div>
        </div>
      </div>

      {/* Grille Profil et adhésion (2:58704 Bureau / 2:58781 Mobile) */}
      <div className="student-profile-grid" data-node-id="2:58704">
        {/* Colonne principale : Informations personnelles (2:58705) */}
        <div className="student-profile-main" data-node-id="2:58705">
          <div className="student-card" data-node-id="2:58706">
            <h2 className="student-card__title" data-node-id="2:58707">
              Informations personnelles
            </h2>

            {/* Identité : Avatar + Nom + Rôle (2:58708) */}
            <div className="student-identity" data-node-id="2:58708">
              <div className="student-identity__avatar" data-node-id="2:58709">
                <span data-node-id="2:58710">{profile.initials}</span>
              </div>
              <div className="student-identity__meta" data-node-id="2:58711">
                <p className="student-identity__name" data-node-id="2:58712">
                  {fullName}
                </p>
                <span
                  className="student-identity__role-chip"
                  data-node-id="2:58713"
                >
                  {profile.role}
                </span>
              </div>
            </div>

            <form className="student-form" onSubmit={handleSubmit} noValidate>
              {/* Nom complet : Prénom & Nom (2:58715 Bureau / 2:58792 Mobile) */}
              <div className="student-form__row-2" data-node-id="2:58715">
                <div className="student-field" data-node-id="2:58716">
                  <label
                    className="student-field__label"
                    htmlFor="student-first-name"
                    data-node-id="2:58717"
                  >
                    Prénom
                  </label>
                  <div className="student-input-wrapper" data-node-id="2:58718">
                    <input
                      id="student-first-name"
                      type="text"
                      className="student-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="student-field" data-node-id="2:58720">
                  <label
                    className="student-field__label"
                    htmlFor="student-last-name"
                    data-node-id="2:58721"
                  >
                    Nom
                  </label>
                  <div className="student-input-wrapper" data-node-id="2:58722">
                    <input
                      id="student-last-name"
                      type="text"
                      className="student-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Champ · E-mail universitaire (2:58724) */}
              <div className="student-field" data-node-id="2:58724">
                <label
                  className="student-field__label"
                  htmlFor="student-email"
                  data-node-id="2:58725"
                >
                  E-mail universitaire
                </label>
                <div className="student-input-wrapper" data-node-id="2:58726">
                  <input
                    id="student-email"
                    type="email"
                    className="student-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="student-field__hint" data-node-id="2:58728">
                  Une modification nécessite de vérifier la nouvelle adresse.
                </p>
              </div>

              {/* Champ · Numéro étudiant en lecture seule (2:58729) */}
              <div className="student-field" data-node-id="2:58729">
                <label
                  className="student-field__label"
                  htmlFor="student-number"
                  data-node-id="2:58730"
                >
                  Numéro étudiant
                </label>
                <div
                  className="student-input-wrapper student-input-wrapper--readonly"
                  data-node-id="2:58731"
                >
                  <input
                    id="student-number"
                    type="text"
                    className="student-input"
                    value={profile.studentNumber}
                    readOnly
                    aria-readonly="true"
                  />
                </div>
                <p className="student-field__hint" data-node-id="2:58733">
                  Pour le modifier, contacte le bureau.
                </p>
              </div>

              {/* Champ · Formation (2:58734) */}
              <div className="student-field" data-node-id="2:58734">
                <label
                  className="student-field__label"
                  htmlFor="student-study-track"
                  data-node-id="2:58735"
                >
                  Formation
                </label>
                <div className="student-input-wrapper" data-node-id="2:58736">
                  <input
                    id="student-study-track"
                    type="text"
                    className="student-input"
                    value={studyTrack}
                    onChange={(e) => setStudyTrack(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="student-field__error" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Bouton · Enregistrer les modifications (2:58738) */}
              <button
                type="submit"
                className="student-btn-primary"
                data-node-id="2:58738"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>

          {/* Message de retour (2:58740) */}
          {feedbackMessage && (
            <div
              className="student-banner student-banner--success"
              role="status"
              data-node-id="2:58740"
            >
              <img
                src={circleCheckGreenIcon}
                alt=""
                className="student-banner__icon"
              />
              <p className="student-banner__text" data-node-id="2:58742">
                {feedbackMessage}
              </p>
            </div>
          )}
        </div>

        {/* Colonne latérale droite : Adhésion & Sécurité (2:58743) */}
        <aside className="student-profile-aside" data-node-id="2:58743">
          {/* Carte Mon adhésion (2:58744) */}
          <div className="student-card" data-node-id="2:58744">
            <h2 className="student-card__title" data-node-id="2:58745">
              Mon adhésion
            </h2>

            {/* Badge de présentation ACTIVE (statut métier ACCEPTEE) (2:58746) */}
            <span
              className="student-membership-badge"
              data-node-id="2:58746"
              data-membership-status={profile.membership.membershipStatus}
            >
              {profile.membership.badgeLabel}
            </span>

            <p className="student-membership-year" data-node-id="2:58748">
              {profile.membership.academicYear}
            </p>

            <p className="student-card__description" data-node-id="2:58749">
              {profile.membership.description}
            </p>

            <p className="student-membership-fee" data-node-id="2:58750">
              {profile.membership.feeText}
            </p>

            {/* Bouton · Contacter le bureau (2:58751) — visuel sans destination inventée */}
            <span
              className="student-btn-secondary student-btn-secondary--static"
              data-node-id="2:58751"
            >
              Contacter le bureau
            </span>
          </div>

          {/* Carte Sécurité du compte (2:58753) */}
          <div className="student-card" data-node-id="2:58753">
            <h2 className="student-card__title" data-node-id="2:58754">
              Sécurité du compte
            </h2>

            <p className="student-card__description" data-node-id="2:58755">
              Dernière modification du mot de passe :{' '}
              {profile.security.lastPasswordUpdate}.
            </p>

            <Link
              to="/etudiant/securite"
              className="student-btn-secondary"
              data-node-id="2:58756"
            >
              Changer mon mot de passe
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

export default StudentProfilePage;
