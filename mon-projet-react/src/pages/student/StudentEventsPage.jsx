import { useState } from 'react';
import EventCard from '../../components/EventCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import {
  cancelEventRegistration,
  getEventsWithRegistrationState,
  getStudentAnnouncements,
  getStudentEventCategories,
  registerForEvent,
} from '../../services/studentService';
import searchIcon from '../../assets/icons/search.svg';
import plusIcon from '../../assets/icons/plus.svg';
import infoIcon from '../../assets/icons/info.svg';
import circleCheckGreenIcon from '../../assets/icons/circle-check-green.svg';
import './StudentPages.css';

function StudentEventsPage() {
  const categories = getStudentEventCategories();
  const announcements = getStudentAnnouncements();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setRefreshIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredEvents = getEventsWithRegistrationState({
    category: selectedCategory,
    search: searchQuery,
  });

  const handleEventAction = (event) => {
    setFeedbackMessage('');
    setErrorMessage('');

    const result = event.isRegistered
      ? cancelEventRegistration(event.id)
      : registerForEvent(event.id);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    setRefreshIndex((prev) => prev + 1);
    setFeedbackMessage(result.message);
  };

  return (
    <>
      {/* Section 1 : En-tête Événements (fidèle à 2:57979) */}
      <div className="student-page-header" data-node-id="2:57979">
        <p className="student-page-header__eyebrow" data-node-id="2:57980">
          LE RENDEZ-VOUS DES ÉTUDIANTS DE LYON 2
        </p>
        <div className="student-page-header__row" data-node-id="2:57981">
          <div className="student-page-header__intro" data-node-id="2:57982">
            <h1 className="student-page-header__title" data-node-id="2:57983">
              Ton agenda, en mieux.
            </h1>
            <p className="student-page-header__subtitle" data-node-id="2:57984">
              Événements, rencontres et nouvelles du campus. Ne rate rien de la
              vie d’Agora.
            </p>
          </div>
        </div>
      </div>

      {/* Recherche et filtre mensuel (2:57985 Bureau / 2:58102 Mobile) */}
      <div className="student-catalog-filters" data-node-id="2:57985">
        <label
          className="student-catalog-search"
          htmlFor="student-catalog-search-input"
          data-node-id="2:57986"
        >
          <img
            src={searchIcon}
            alt=""
            className="student-catalog-search__icon"
          />
          <input
            id="student-catalog-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un événement"
            className="student-catalog-search__input"
          />
        </label>

        <button
          type="button"
          className="student-catalog-month-btn"
          data-node-id="2:57989"
        >
          Novembre 2026  ⌄
        </button>
      </div>

      {/* Catégories (2:57991 Bureau / 2:58108 Mobile) */}
      <div
        className="student-catalog-categories"
        role="tablist"
        aria-label="Filtrer par catégorie"
        data-node-id="2:57991"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`student-catalog-pill ${
                isActive ? 'student-catalog-pill--active' : ''
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          );
        })}
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

      {/* Grille des événements (2:58000 Bureau / 2:58117 Mobile) */}
      {filteredEvents.length > 0 ? (
        <div className="student-events-grid" data-node-id="2:58000">
          {filteredEvents.map((event) => {
            const isRegistered = Boolean(event.isRegistered);
            const isCancelled = Boolean(event.isCancelled);
            const isFull = Boolean(event.isFull);
            const isCancellationClosed = Boolean(event.isCancellationClosed);

            let actionLabel = 'M’inscrire';
            let actionVariant = 'primary';
            let actionIcon = plusIcon;
            let actionDisabled = false;

            if (isCancelled) {
              actionLabel = 'Événement annulé';
              actionVariant = 'secondary';
              actionIcon = null;
              actionDisabled = true;
            } else if (isRegistered) {
              actionLabel = isCancellationClosed
                ? 'Annulation fermée (< 24 h)'
                : 'Annuler mon inscription';
              actionVariant = 'secondary';
              actionIcon = null;
              actionDisabled = isCancellationClosed;
            } else if (isFull) {
              actionLabel = 'Complet';
              actionVariant = 'secondary';
              actionIcon = null;
              actionDisabled = true;
            }

            return (
              <div key={event.id} className="student-registration-item">
                {(isRegistered || isCancelled) && (
                  <span
                    className={`student-registration-badge ${
                      isCancelled
                        ? 'student-registration-badge--cancelled'
                        : ''
                    }`}
                  >
                    {isCancelled
                      ? 'Événement annulé'
                      : event.confirmedBadgeLabel}
                  </span>
                )}

                <EventCard
                  event={event}
                  actionLabel={actionLabel}
                  actionVariant={actionVariant}
                  actionIcon={actionIcon}
                  actionDisabled={actionDisabled}
                  onAction={handleEventAction}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="student-placeholder-card">
          <h2 className="student-placeholder-card__title">
            Aucun événement ne correspond à ta recherche
          </h2>
          <p className="student-placeholder-card__text">
            Essaie un autre mot-clé ou sélectionne la catégorie « Tout ».
          </p>
        </div>
      )}

      <p className="student-events-note" data-node-id="2:58052">
        {filteredEvents.length} événement
        {filteredEvents.length > 1 ? 's' : ''} à venir · Les inscriptions sont
        réservées aux membres actifs.
      </p>

      {/* Section 2 : Fil des annonces (2:58053 Bureau / 2:58170 Mobile) */}
      <div
        className="student-announcements-section"
        id="annonces"
        data-node-id="2:58053"
      >
        <div className="student-page-header__intro" data-node-id="2:58056">
          <h2 className="student-page-header__title" data-node-id="2:58057">
            Les nouvelles du campus
          </h2>
          <p className="student-page-header__subtitle" data-node-id="2:58058">
            Les dernières infos, directement du bureau.
          </p>
        </div>

        <div className="student-announcements-grid" data-node-id="2:58059">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default StudentEventsPage;
