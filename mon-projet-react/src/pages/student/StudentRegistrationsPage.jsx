import { useState } from 'react';
import EventCard from '../../components/EventCard';
import {
  cancelEventRegistration,
  getStudentRegistrationsOverview,
  registerForEvent,
} from '../../services/studentService';
import infoIcon from '../../assets/icons/info.svg';
import plusIcon from '../../assets/icons/plus.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';
import './StudentPages.css';

function formatConfirmedSubtitle(count) {
  if (count === 0) {
    return 'Aucune inscription confirmée. Retrouve les détails et gère ta participation.';
  }
  if (count === 1) {
    return '1 inscription confirmée. Retrouve les détails et gère ta participation.';
  }
  return `${count} inscriptions confirmées. Retrouve les détails et gère ta participation.`;
}

function StudentRegistrationsPage() {
  const [overview, setOverview] = useState(() =>
    getStudentRegistrationsOverview()
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const refreshOverview = () => {
    setOverview(getStudentRegistrationsOverview());
  };

  const handleCancelRegistration = (event) => {
    setFeedbackMessage('');
    setErrorMessage('');

    const result = cancelEventRegistration(event.id);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    refreshOverview();
    setFeedbackMessage(result.message);
  };

  const handleRegister = (eventId) => {
    setFeedbackMessage('');
    setErrorMessage('');

    const result = registerForEvent(eventId);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    refreshOverview();
    setFeedbackMessage(result.message);
  };

  const { confirmedCount, confirmedEvents, suggestedEvents, labels } = overview;

  return (
    <>
      {/* En-tête de page (2:59014 Bureau / 2:59095 Mobile) */}
      <div className="student-page-header" data-node-id="2:59014">
        <p className="student-page-header__eyebrow" data-node-id="2:59015">
          MES INSCRIPTIONS
        </p>
        <div className="student-page-header__row" data-node-id="2:59016">
          <div className="student-page-header__intro" data-node-id="2:59017">
            <h1 className="student-page-header__title" data-node-id="2:59018">
              Tes prochains rendez-vous
            </h1>
            <p className="student-page-header__subtitle" data-node-id="2:59019">
              {formatConfirmedSubtitle(confirmedCount)}
            </p>
          </div>
        </div>
      </div>

      {/* Message d'information (2:59020 Bureau / 2:59101 Mobile) */}
      <div
        className="student-banner student-banner--info"
        data-node-id="2:59020"
      >
        <img
          src={infoIcon}
          alt=""
          className="student-banner__icon"
          data-node-id="2:63204"
        />
        <p className="student-banner__text" data-node-id="2:59022">
          {labels.cancelNotice}
        </p>
      </div>

      {feedbackMessage && (
        <div className="student-banner student-banner--success" role="status">
          <img
            src={circleCheckGreenIcon}
            alt=""
            className="student-banner__icon"
          />
          <p className="student-banner__text">{feedbackMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="student-banner student-banner--error" role="alert">
          <img src={infoIcon} alt="" className="student-banner__icon" />
          <p className="student-banner__text">{errorMessage}</p>
        </div>
      )}

      {/* Grille des inscriptions confirmées (2:59023 Bureau / 2:59104 Mobile) */}
      {confirmedEvents.length > 0 ? (
        <div className="student-registrations-grid" data-node-id="2:59023">
          {confirmedEvents.map((event) => {
            const isCancelled = Boolean(event.isCancelled);
            const isCancellationClosed = Boolean(event.isCancellationClosed);
            const badgeText = isCancelled
              ? 'Événement annulé'
              : event.confirmedBadgeLabel || labels.confirmedBadge;
            const actionLabel = isCancelled
              ? 'Événement annulé'
              : isCancellationClosed
              ? 'Annulation fermée (< 24 h)'
              : 'Annuler mon inscription';

            return (
              <div
                key={event.id}
                className="student-registration-item"
                data-node-id="2:59024"
              >
                <span
                  className={`student-registration-badge ${
                    isCancelled ? 'student-registration-badge--cancelled' : ''
                  }`}
                  data-node-id="2:59025"
                >
                  {badgeText}
                </span>

                <EventCard
                  event={event}
                  actionLabel={actionLabel}
                  actionVariant="secondary"
                  actionDisabled={isCancelled || isCancellationClosed}
                  onAction={handleCancelRegistration}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="student-placeholder-card">
          <h2 className="student-placeholder-card__title">
            Aucune inscription active pour le moment
          </h2>
          <p className="student-placeholder-card__text">
            Choisis un événement ci-dessous pour réserver ta place.
          </p>
        </div>
      )}

      {/* Section de suggestion "Et si tu nous rejoignais aussi ?" (2:59064 & 2:59069) */}
      <div className="student-page-header" data-node-id="2:59064">
        <div className="student-page-header__row" data-node-id="2:59065">
          <div className="student-page-header__intro" data-node-id="2:59066">
            <h2 className="student-page-header__title" data-node-id="2:59067">
              Et si tu nous rejoignais aussi ?
            </h2>
            <p className="student-page-header__subtitle" data-node-id="2:59068">
              Encore un peu de place pour de nouveaux souvenirs.
            </p>
          </div>
        </div>
      </div>

      {suggestedEvents.length > 0 ? (
        <div className="student-suggestions-list">
          {suggestedEvents.map((event) => (
            <div
              key={event.id}
              className="student-suggestion-card"
              data-node-id="2:59069"
            >
              <div
                className="student-suggestion-card__details"
                data-node-id="2:59071"
              >
                <h3
                  className="student-suggestion-card__title"
                  data-node-id="2:59072"
                >
                  {event.title}
                </h3>
                <p
                  className="student-suggestion-card__schedule"
                  data-node-id="2:59073"
                >
                  {event.schedule} · {event.location}
                </p>
                <p
                  className="student-suggestion-card__meta"
                  data-node-id="2:59074"
                >
                  {event.remainingSeatsText} · {event.priceText}
                </p>
              </div>

              <button
                type="button"
                className="student-btn-primary student-btn-primary--mobile-full"
                onClick={() => handleRegister(event.id)}
                data-node-id="2:59075"
              >
                <img
                  src={plusIcon}
                  alt=""
                  className="student-btn-icon"
                  data-node-id="2:63213"
                />
                <span data-node-id="2:59077">M’inscrire</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="student-placeholder-card">
          <h3 className="student-placeholder-card__title">
            Tu participes déjà à tous les événements programmés
          </h3>
          <p className="student-placeholder-card__text">
            De nouveaux rendez-vous seront bientôt annoncés par le bureau Agora.
          </p>
        </div>
      )}
    </>
  );
}

export default StudentRegistrationsPage;
