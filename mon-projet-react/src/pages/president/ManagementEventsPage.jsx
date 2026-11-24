import { useEffect, useState } from 'react';
import { EVENT_PUBLICATION_STATUS } from '../../data/managementMockData';
import {
  getManagedEventsView,
  createManagedEvent,
  updateManagedEvent,
  deleteManagedEvent,
} from '../../services/managementService';
import plusIcon from '../../assets/icons/plus.svg';
import './ManagementPages.css';

function SearchFieldIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14.875 14.875L11.7938 11.7938M13.4583 7.79167C13.4583 10.9213 10.9213 13.4583 7.79167 13.4583C4.66205 13.4583 2.125 10.9213 2.125 7.79167C2.125 4.66205 4.66205 2.125 7.79167 2.125C10.9213 2.125 13.4583 4.66205 13.4583 7.79167Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TriangleAlertModalIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64149 19.6871 1.81442 19.9905C1.98736 20.2939 2.23672 20.5467 2.53771 20.7239C2.83869 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseModalIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DEFAULT_EVENT_FORM = {
  title: '',
  description: '',
  dateInput: '2026-12-05',
  timeInput: '18:00',
  location: '',
  totalCapacity: '50',
  priceAmount: '0',
  category: 'Soirée',
};

function getEventPublicationBadge(evt) {
  if (evt.publicationStatus === EVENT_PUBLICATION_STATUS.DRAFT) {
    return {
      label: 'Brouillon',
      className: 'management-status-badge management-status-badge--neutral',
    };
  }
  if (evt.effectiveTab === 'PAST') {
    return {
      label:
        evt.publicationStatus === EVENT_PUBLICATION_STATUS.PAST
          ? 'Passé'
          : 'Publié',
      className:
        evt.publicationStatus === EVENT_PUBLICATION_STATUS.PAST
          ? 'management-status-badge management-status-badge--neutral'
          : 'management-status-badge management-status-badge--accepted',
    };
  }
  return {
    label: 'Publié',
    className: 'management-status-badge management-status-badge--accepted',
  };
}

function formatEventsPaginationSummary(tab, count) {
  if (tab === 'DRAFTS') {
    return count <= 1
      ? `${count} brouillon en cours`
      : `${count} brouillons en cours`;
  }
  if (tab === 'PAST') {
    return count <= 1
      ? `${count} événement passé affiché`
      : `${count} événements passés affichés`;
  }
  return count <= 1
    ? `${count} événement publié`
    : `${count} événements publiés`;
}

function extractDateAndTimeFromEvent(evt) {
  const dateInput =
    evt.dateInput || (evt.startIso ? String(evt.startIso).slice(0, 10) : '2026-12-10');
  const timeInput =
    evt.timeInput || (evt.startIso ? String(evt.startIso).slice(11, 16) : '18:00');
  const numericPrice =
    evt.priceAmount !== undefined
      ? String(evt.priceAmount)
      : evt.priceText === 'Gratuit'
      ? '0'
      : String(parseFloat(evt.priceText) || 0);

  return {
    title: evt.title || '',
    description: evt.description || '',
    dateInput,
    timeInput,
    location: evt.location || '',
    totalCapacity: String(evt.totalCapacity || 50),
    priceAmount: numericPrice,
    category: evt.category || 'Soirée',
  };
}

function ManagementEventsPage() {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [, setVersion] = useState(0);

  // État de l'éditeur (Création / Modification / Publication de brouillon — Figma 2:62262)
  const [editorMode, setEditorMode] = useState(null); // 'CREATE' | 'EDIT' | null
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_EVENT_FORM);
  const [publishConsent, setPublishConsent] = useState(true);
  const [editorError, setEditorError] = useState('');

  // État du dialogue de suppression (Figma 2:62067)
  const [deleteModalEvent, setDeleteModalEvent] = useState(null);
  const [deleteConsent, setDeleteConsent] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const handleSync = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener('clubmanager:management-updated', handleSync);
    window.addEventListener('clubmanager:user-updated', handleSync);
    return () => {
      window.removeEventListener('clubmanager:management-updated', handleSync);
      window.removeEventListener('clubmanager:user-updated', handleSync);
    };
  }, []);

  const view = getManagedEventsView({
    tab: activeTab,
    search: searchQuery,
    category: selectedCategory,
  });

  const categoryOptions = (view.categories || []).filter(
    (cat) => cat.id !== 'all'
  );

  const handleOpenCreateModal = () => {
    setEditorMode('CREATE');
    setEditingEvent(null);
    setFormData(DEFAULT_EVENT_FORM);
    setPublishConsent(true);
    setEditorError('');
  };

  const handleOpenEditModal = (evt) => {
    setEditorMode('EDIT');
    setEditingEvent(evt);
    setFormData(extractDateAndTimeFromEvent(evt));
    setPublishConsent(true);
    setEditorError('');
  };

  const handleCloseEditorModal = () => {
    setEditorMode(null);
    setEditingEvent(null);
    setEditorError('');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (editorError) {
      setEditorError('');
    }
  };

  const handleSubmitEventForm = (event, { asDraft = false, publishDraft = false } = {}) => {
    if (event) {
      event.preventDefault();
    }

    if (!asDraft && !publishConsent) {
      setEditorError(
        'Veuillez confirmer la vérification des informations avant publication.'
      );
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      dateInput: formData.dateInput,
      timeInput: formData.timeInput,
      location: formData.location,
      totalCapacity: Number(formData.totalCapacity),
      priceAmount: Number(formData.priceAmount),
      category: formData.category,
    };

    if (editorMode === 'CREATE') {
      const result = createManagedEvent(payload, { asDraft });
      if (!result.ok) {
        setEditorError(result.error || 'Impossible de créer cet événement.');
        return;
      }
      setFeedbackMessage(result.message);
      setActiveTab(asDraft ? 'DRAFTS' : 'UPCOMING');
      handleCloseEditorModal();
      setVersion((v) => v + 1);
      return;
    }

    if (editorMode === 'EDIT' && editingEvent) {
      const result = updateManagedEvent(editingEvent.id, payload, {
        publishIfDraft: publishDraft,
      });
      if (!result.ok) {
        setEditorError(
          result.error || 'Impossible d’enregistrer les modifications.'
        );
        return;
      }
      setFeedbackMessage(result.message);
      if (publishDraft) {
        setActiveTab('UPCOMING');
      }
      handleCloseEditorModal();
      setVersion((v) => v + 1);
    }
  };

  const handleOpenDeleteModal = (evt) => {
    setDeleteModalEvent(evt);
    setDeleteConsent(false);
    setDeleteError('');
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalEvent(null);
    setDeleteConsent(false);
    setDeleteError('');
  };

  const handleConfirmDeleteEvent = (event) => {
    event.preventDefault();
    if (!deleteModalEvent) {
      return;
    }
    if (!deleteConsent) {
      setDeleteError(
        'Veuillez cocher la case pour confirmer la suppression définitive.'
      );
      return;
    }
    const result = deleteManagedEvent(deleteModalEvent.id);
    if (!result.ok) {
      setDeleteError(result.error || 'Impossible de supprimer cet événement.');
      return;
    }
    setFeedbackMessage(result.message);
    handleCloseDeleteModal();
    setVersion((v) => v + 1);
  };

  return (
    <>
      {/* 1. En-tête de page avec bouton Créer un événement (2:60331 Bureau / 2:60459 Mobile) */}
      <div className="management-page-header" data-node-id="2:60331">
        <p className="management-page-header__eyebrow" data-node-id="2:60332">
          GESTION DES ÉVÉNEMENTS
        </p>

        <div className="management-page-header__row" data-node-id="2:60333">
          <div className="management-page-header__intro" data-node-id="2:60334">
            <h1
              className="management-page-header__title"
              data-node-id="2:60335"
            >
              Des moments à faire vivre.
            </h1>
            <p
              className="management-page-header__subtitle"
              data-node-id="2:60336"
            >
              Créez les prochains rendez-vous et suivez les inscriptions.
            </p>
          </div>

          <button
            type="button"
            className="management-btn-primary"
            onClick={handleOpenCreateModal}
            data-node-id="2:60337"
          >
            <img
              src={plusIcon}
              alt=""
              className="management-btn-primary__icon"
              data-node-id="2:63591"
            />
            <span data-node-id="2:60339">Créer un événement</span>
          </button>
        </div>
      </div>

      {/* 2. Onglets par état (2:60340 Bureau / 2:60468 Mobile) */}
      <div
        className="management-tabs"
        role="tablist"
        aria-label="Filtrer les événements par état"
        data-node-id="2:60340"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'UPCOMING'}
          className={`management-tab ${
            activeTab === 'UPCOMING' ? 'management-tab--active' : ''
          }`}
          onClick={() => setActiveTab('UPCOMING')}
          data-node-id="2:60341"
        >
          <span data-node-id="2:60342">À venir · {view.counts.upcoming}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'DRAFTS'}
          className={`management-tab ${
            activeTab === 'DRAFTS' ? 'management-tab--active' : ''
          }`}
          onClick={() => setActiveTab('DRAFTS')}
          data-node-id="2:60343"
        >
          <span data-node-id="2:60344">Brouillons · {view.counts.drafts}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PAST'}
          className={`management-tab ${
            activeTab === 'PAST' ? 'management-tab--active' : ''
          }`}
          onClick={() => setActiveTab('PAST')}
          data-node-id="2:60345"
        >
          <span data-node-id="2:60346">Passés · {view.counts.past}</span>
        </button>
      </div>

      {/* Message de retour après création, modification, publication ou suppression */}
      {feedbackMessage && (
        <div className="management-feedback-banner" role="status">
          <span>{feedbackMessage}</span>
          <button
            type="button"
            className="management-feedback-banner__close"
            onClick={() => setFeedbackMessage('')}
            aria-label="Fermer la notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Barre de recherche et filtre par catégorie (2:60347 Bureau / 2:60475 Mobile) */}
      <div className="management-toolbar" data-node-id="2:60347">
        <label className="management-search-box" data-node-id="2:60348">
          <span className="management-search-box__icon" data-node-id="2:63594">
            <SearchFieldIcon />
          </span>
          <input
            type="search"
            className="management-search-box__input"
            placeholder="Rechercher un événement"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Rechercher un événement"
            data-node-id="2:60350"
          />
        </label>

        <select
          className="management-filter-select"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          aria-label="Filtrer par catégorie d’événement"
          data-node-id="2:60351"
        >
          <option value="all">Toutes les catégories  ⌄</option>
          {categoryOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4A. Tableau des événements — Vue Bureau (2:60353) */}
      <div className="management-table" data-node-id="2:60353">
        <div className="management-table__head" data-node-id="2:60354">
          <p className="management-table__col" data-node-id="2:60355">
            Événement
          </p>
          <p className="management-table__col" data-node-id="2:60356">
            Date et heure
          </p>
          <p className="management-table__col" data-node-id="2:60357">
            Inscriptions
          </p>
          <p className="management-table__col" data-node-id="2:60358">
            Publication
          </p>
          <p className="management-table__col" data-node-id="2:60359">
            Actions
          </p>
        </div>

        {view.events.length === 0 ? (
          <div className="management-table__empty">
            Aucun événement ne correspond aux critères sélectionnés.
          </div>
        ) : (
          view.events.map((evt) => {
            const badge = getEventPublicationBadge(evt);

            return (
              <div
                key={evt.id}
                className="management-table__row"
                data-node-id="2:60360"
              >
                <div className="management-table__cell" data-node-id="2:60361">
                  <div
                    className="management-table__identity"
                    data-node-id="2:60362"
                  >
                    <p
                      className="management-table__primary-text"
                      data-node-id="2:60363"
                    >
                      {evt.title}
                    </p>
                    <p
                      className="management-table__secondary-text"
                      data-node-id="2:60364"
                    >
                      {evt.location}
                    </p>
                  </div>
                </div>

                <p
                  className="management-table__col management-table__text"
                  data-node-id="2:60365"
                >
                  {evt.schedule}
                </p>

                <div className="management-table__cell" data-node-id="2:60366">
                  <div className="management-gauge" data-node-id="2:60367">
                    <p
                      className="management-gauge__count"
                      data-node-id="2:60368"
                    >
                      {evt.registrationGaugeText}
                    </p>
                    <p
                      className="management-gauge__remaining"
                      data-node-id="2:60369"
                    >
                      {evt.remainingSeatsText}
                    </p>
                  </div>
                </div>

                <div className="management-table__cell" data-node-id="2:60370">
                  <span className={badge.className} data-node-id="2:60371">
                    {badge.label}
                  </span>
                </div>

                <div className="management-table__cell" data-node-id="2:60373">
                  <div
                    className="management-row-actions"
                    data-node-id="2:60374"
                  >
                    <button
                      type="button"
                      className="management-action-btn management-action-btn--outline"
                      onClick={() => handleOpenEditModal(evt)}
                      data-node-id="2:60375"
                    >
                      <span data-node-id="2:60376">Modifier</span>
                    </button>
                    <button
                      type="button"
                      className="management-action-btn management-action-btn--danger"
                      onClick={() => handleOpenDeleteModal(evt)}
                      data-node-id="2:60377"
                    >
                      <span data-node-id="2:60378">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4B. Cartes des événements — Vue Mobile (2:60481) */}
      <div className="management-mobile-list" data-node-id="2:60481">
        {view.events.length === 0 ? (
          <div className="management-mobile-card">
            <p className="management-table__secondary-text">
              Aucun événement ne correspond aux critères sélectionnés.
            </p>
          </div>
        ) : (
          view.events.map((evt) => {
            const badge = getEventPublicationBadge(evt);

            return (
              <div
                key={evt.id}
                className="management-mobile-card"
                data-node-id="2:60482"
              >
                <div
                  className="management-table__identity"
                  data-node-id="2:60483"
                >
                  <p
                    className="management-table__primary-text"
                    data-node-id="2:60484"
                  >
                    {evt.title}
                  </p>
                  <p
                    className="management-table__secondary-text"
                    data-node-id="2:60485"
                  >
                    {evt.location}
                  </p>
                </div>

                <p className="management-table__text" data-node-id="2:60486">
                  {evt.schedule}
                </p>

                <div className="management-gauge" data-node-id="2:60487">
                  <p
                    className="management-gauge__count"
                    data-node-id="2:60488"
                  >
                    {evt.registrationGaugeText}
                  </p>
                  <p
                    className="management-gauge__remaining"
                    data-node-id="2:60489"
                  >
                    {evt.remainingSeatsText}
                  </p>
                </div>

                <span className={badge.className} data-node-id="2:60490">
                  {badge.label}
                </span>

                <div className="management-row-actions" data-node-id="2:60492">
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--outline"
                    onClick={() => handleOpenEditModal(evt)}
                    data-node-id="2:60493"
                  >
                    <span data-node-id="2:60494">Modifier</span>
                  </button>
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--danger"
                    onClick={() => handleOpenDeleteModal(evt)}
                    data-node-id="2:60495"
                  >
                    <span data-node-id="2:60496">Supprimer</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Pagination (2:60417) */}
      <div className="management-pagination" data-node-id="2:60417">
        <p className="management-pagination__info" data-node-id="2:60418">
          {formatEventsPaginationSummary(activeTab, view.events.length)}
        </p>

        <div className="management-pagination__pages" data-node-id="2:60419">
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page précédente"
            data-node-id="2:60420"
          >
            ←
          </button>
          <button
            type="button"
            className="management-page-btn management-page-btn--active"
            aria-current="page"
            data-node-id="2:60422"
          >
            1
          </button>
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page suivante"
            data-node-id="2:60424"
          >
            →
          </button>
        </div>
      </div>

      {/* 6. Section "Brouillon en cours" (2:60426 / 2:60427) */}
      {view.draftEvents.length > 0 && (
        <>
          <p className="management-section-label" data-node-id="2:60426">
            Brouillon en cours
          </p>

          {/* 6A. Tableau des brouillons — Vue Bureau (2:60427) */}
          <div className="management-table" data-node-id="2:60427">
            <div className="management-table__head" data-node-id="2:60428">
              <p className="management-table__col" data-node-id="2:60429">
                Événement
              </p>
              <p className="management-table__col" data-node-id="2:60430">
                Prévu le
              </p>
              <p className="management-table__col" data-node-id="2:60431">
                Statut
              </p>
              <p className="management-table__col" data-node-id="2:60432">
                Action
              </p>
            </div>

            {view.draftEvents.map((draft) => (
              <div
                key={draft.id}
                className="management-table__row"
                data-node-id="2:60433"
              >
                <p
                  className="management-table__col management-table__semi-text"
                  data-node-id="2:60434"
                >
                  {draft.title}
                </p>

                <p
                  className="management-table__col management-table__text"
                  data-node-id="2:60435"
                >
                  {draft.schedule}
                </p>

                <div className="management-table__cell" data-node-id="2:60436">
                  <span
                    className="management-status-badge management-status-badge--neutral"
                    data-node-id="2:60437"
                  >
                    Brouillon
                  </span>
                </div>

                <div className="management-table__cell" data-node-id="2:60439">
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--outline"
                    onClick={() => handleOpenEditModal(draft)}
                    data-node-id="2:60440"
                  >
                    <span data-node-id="2:60441">Reprendre l’édition</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 6B. Cartes des brouillons — Vue Mobile */}
          <div className="management-mobile-list">
            {view.draftEvents.map((draft) => (
              <div key={draft.id} className="management-mobile-card">
                <p className="management-mobile-card__title">{draft.title}</p>
                <p className="management-table__text">
                  Prévu le : {draft.schedule}
                </p>
                <span className="management-status-badge management-status-badge--neutral">
                  Brouillon
                </span>
                <button
                  type="button"
                  className="management-action-btn management-action-btn--outline"
                  onClick={() => handleOpenEditModal(draft)}
                >
                  <span>Reprendre l’édition</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Formulaire : Créer ou modifier un événement (Figma 2:62262) */}
      {editorMode && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-editor-modal-title"
        >
          <form
            className="management-modal management-modal--editor"
            onSubmit={(e) =>
              handleSubmitEventForm(e, {
                asDraft: false,
                publishDraft:
                  editorMode === 'EDIT' &&
                  editingEvent?.publicationStatus ===
                    EVENT_PUBLICATION_STATUS.DRAFT,
              })
            }
            noValidate
            data-node-id="2:62262"
          >
            <div className="management-modal__top" data-node-id="2:62263">
              <span
                className="management-modal__context-badge"
                data-node-id="2:62264"
              >
                GESTION DES ÉVÉNEMENTS
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseEditorModal}
                aria-label="Fermer le formulaire"
                data-node-id="2:64059"
              >
                <CloseModalIcon />
              </button>
            </div>

            <h2
              id="event-editor-modal-title"
              className="management-modal__title"
              data-node-id="2:62267"
            >
              {editorMode === 'CREATE'
                ? 'Créer un événement'
                : editingEvent?.publicationStatus ===
                  EVENT_PUBLICATION_STATUS.DRAFT
                ? 'Finaliser et publier le brouillon'
                : 'Modifier l’événement'}
            </h2>

            <p className="management-modal__desc" data-node-id="2:62268">
              Renseignez les informations pratiques visibles dans le catalogue
              public et dans l’espace étudiant.
            </p>

            {/* Champ · Titre * (2:62269) */}
            <div className="management-modal__field" data-node-id="2:62269">
              <label
                htmlFor="event-title-input"
                className="management-modal__label"
              >
                Titre *
              </label>
              <input
                id="event-title-input"
                type="text"
                className="management-modal__input"
                placeholder="Ex. Soirée d’hiver Agora"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                required
              />
            </div>

            {/* Champ · Description * (2:62273) */}
            <div className="management-modal__field" data-node-id="2:62273">
              <label
                htmlFor="event-description-input"
                className="management-modal__label"
              >
                Description *
              </label>
              <textarea
                id="event-description-input"
                className="management-modal__textarea"
                placeholder="Présentez le programme et les informations utiles pour les participants."
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                required
              />
            </div>

            {/* Grille 2 colonnes : Date * & Heure * (2:62277) */}
            <div className="management-modal__grid-2" data-node-id="2:62277">
              <div className="management-modal__field" data-node-id="2:62278">
                <label
                  htmlFor="event-date-input"
                  className="management-modal__label"
                >
                  Date *
                </label>
                <input
                  id="event-date-input"
                  type="date"
                  className="management-modal__input"
                  value={formData.dateInput}
                  onChange={(e) =>
                    handleFieldChange('dateInput', e.target.value)
                  }
                  required
                />
              </div>

              <div className="management-modal__field" data-node-id="2:62282">
                <label
                  htmlFor="event-time-input"
                  className="management-modal__label"
                >
                  Heure *
                </label>
                <input
                  id="event-time-input"
                  type="time"
                  className="management-modal__input"
                  value={formData.timeInput}
                  onChange={(e) =>
                    handleFieldChange('timeInput', e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* Champ · Lieu * (2:62286) */}
            <div className="management-modal__field" data-node-id="2:62286">
              <label
                htmlFor="event-location-input"
                className="management-modal__label"
              >
                Lieu *
              </label>
              <input
                id="event-location-input"
                type="text"
                className="management-modal__input"
                placeholder="Ex. Maison des étudiants, Campus Berges du Rhône"
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                required
              />
            </div>

            {/* Grille 2 colonnes : Nombre de places * & Tarif (€) * (2:62290) */}
            <div className="management-modal__grid-2" data-node-id="2:62290">
              <div className="management-modal__field" data-node-id="2:62291">
                <label
                  htmlFor="event-capacity-input"
                  className="management-modal__label"
                >
                  Nombre de places *
                </label>
                <input
                  id="event-capacity-input"
                  type="number"
                  min="1"
                  step="1"
                  className="management-modal__input"
                  value={formData.totalCapacity}
                  onChange={(e) =>
                    handleFieldChange('totalCapacity', e.target.value)
                  }
                  required
                />
                <span className="management-modal__hint">
                  {editingEvent
                    ? `Inscrits actuels : ${editingEvent.registeredCount || 0}`
                    : 'Capacité maximale d’accueil'}
                </span>
              </div>

              <div className="management-modal__field" data-node-id="2:62296">
                <label
                  htmlFor="event-price-input"
                  className="management-modal__label"
                >
                  Tarif (€) *
                </label>
                <input
                  id="event-price-input"
                  type="number"
                  min="0"
                  step="1"
                  className="management-modal__input"
                  value={formData.priceAmount}
                  onChange={(e) =>
                    handleFieldChange('priceAmount', e.target.value)
                  }
                  required
                />
                <span className="management-modal__hint">
                  Indiquez 0 pour un événement gratuit
                </span>
              </div>
            </div>

            {/* Champ · Catégorie * (2:62301) */}
            <div className="management-modal__field" data-node-id="2:62301">
              <label
                htmlFor="event-category-select"
                className="management-modal__label"
              >
                Catégorie *
              </label>
              <select
                id="event-category-select"
                className="management-modal__select"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Consentement avant publication (2:62308) */}
            <label
              className="management-modal__consent"
              data-node-id="2:62308"
            >
              <input
                type="checkbox"
                className="management-modal__checkbox"
                checked={publishConsent}
                onChange={(e) => setPublishConsent(e.target.checked)}
              />
              <span>
                Je confirme que la date, le lieu et la capacité d’accueil ont
                été vérifiés par le bureau.
              </span>
            </label>

            {editorError && (
              <p className="management-modal__error" role="alert">
                {editorError}
              </p>
            )}

            <div className="management-modal__actions">
              {editorMode === 'CREATE' ? (
                <>
                  <button
                    type="submit"
                    className="management-modal__submit management-modal__submit--accept"
                  >
                    <span>Publier l’événement</span>
                  </button>
                  <div className="management-modal__actions-row">
                    <button
                      type="button"
                      className="management-modal__cancel"
                      onClick={(e) =>
                        handleSubmitEventForm(e, { asDraft: true })
                      }
                    >
                      <span>Enregistrer en brouillon</span>
                    </button>
                    <button
                      type="button"
                      className="management-modal__cancel"
                      onClick={handleCloseEditorModal}
                    >
                      <span>Annuler</span>
                    </button>
                  </div>
                </>
              ) : editingEvent?.publicationStatus ===
                EVENT_PUBLICATION_STATUS.DRAFT ? (
                <>
                  <button
                    type="submit"
                    className="management-modal__submit management-modal__submit--accept"
                  >
                    <span>Publier l’événement</span>
                  </button>
                  <div className="management-modal__actions-row">
                    <button
                      type="button"
                      className="management-modal__cancel"
                      onClick={(e) =>
                        handleSubmitEventForm(e, { publishDraft: false })
                      }
                    >
                      <span>Enregistrer le brouillon</span>
                    </button>
                    <button
                      type="button"
                      className="management-modal__cancel"
                      onClick={handleCloseEditorModal}
                    >
                      <span>Annuler</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    className="management-modal__submit management-modal__submit--accept"
                  >
                    <span>Enregistrer les modifications</span>
                  </button>
                  <button
                    type="button"
                    className="management-modal__cancel"
                    onClick={handleCloseEditorModal}
                  >
                    <span>Annuler</span>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Dialogue : Supprimer cet événement ? (Figma 2:62067) */}
      {deleteModalEvent && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-modal-title"
        >
          <form
            className="management-modal"
            onSubmit={handleConfirmDeleteEvent}
            noValidate
            data-node-id="2:62067"
          >
            <div className="management-modal__top" data-node-id="2:62068">
              <span
                className="management-modal__context-badge"
                data-node-id="2:62069"
              >
                GESTION DES ÉVÉNEMENTS
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseDeleteModal}
                aria-label="Fermer la fenêtre"
                data-node-id="2:63990"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div
              className="management-modal__symbol management-modal__symbol--danger"
              data-node-id="2:62072"
            >
              <TriangleAlertModalIcon />
            </div>

            <h2
              id="delete-event-modal-title"
              className="management-modal__title"
              data-node-id="2:62074"
            >
              Supprimer cet événement ?
            </h2>

            <p className="management-modal__identity" data-node-id="2:62075">
              {deleteModalEvent.title} · {deleteModalEvent.schedule}
            </p>

            <p className="management-modal__desc" data-node-id="2:62076">
              L’événement sera retiré du catalogue et toutes les inscriptions
              associées seront annulées.
            </p>

            <label
              className="management-modal__consent"
              data-node-id="2:62077"
            >
              <input
                type="checkbox"
                className="management-modal__checkbox"
                checked={deleteConsent}
                onChange={(e) => {
                  setDeleteConsent(e.target.checked);
                  if (deleteError) {
                    setDeleteError('');
                  }
                }}
              />
              <span data-node-id="2:62080">
                Je comprends que cette suppression est définitive.
              </span>
            </label>

            {deleteError && (
              <p className="management-modal__error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="management-modal__actions" data-node-id="2:62081">
              <button
                type="submit"
                className="management-modal__submit management-modal__submit--danger"
                data-node-id="2:62082"
              >
                <span data-node-id="2:62083">Supprimer l’événement</span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseDeleteModal}
                data-node-id="2:62084"
              >
                <span data-node-id="2:62085">Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ManagementEventsPage;
