import { useEffect, useState } from 'react';
import {
  getManagedAnnouncementsView,
  createManagedAnnouncement,
  updateManagedAnnouncement,
  deleteManagedAnnouncement,
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

const ANNOUNCEMENT_CATEGORIES = [
  'Vie associative',
  'Permanence',
  'Solidarité',
  'Événements',
  'Campus',
];

const DEFAULT_ANNOUNCEMENT_FORM = {
  title: '',
  category: 'Vie associative',
  content: '',
};

function ManagementAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [, setVersion] = useState(0);

  // État de l'éditeur (Création / Modification — Figma 2:62253)
  const [editorMode, setEditorMode] = useState(null); // 'CREATE' | 'EDIT' | null
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_ANNOUNCEMENT_FORM);
  const [editorError, setEditorError] = useState('');

  // État du dialogue de suppression (Figma 2:62087)
  const [deleteModalAnnouncement, setDeleteModalAnnouncement] = useState(null);
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

  const view = getManagedAnnouncementsView({
    search: searchQuery,
  });

  const visibleAnnouncements = view.announcements.filter((ann) =>
    categoryFilter === 'ALL' ? true : ann.category === categoryFilter
  );

  const handleOpenCreateModal = () => {
    setEditorMode('CREATE');
    setEditingAnnouncement(null);
    setFormData(DEFAULT_ANNOUNCEMENT_FORM);
    setEditorError('');
  };

  const handleOpenEditModal = (ann) => {
    setEditorMode('EDIT');
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title || '',
      category: ann.category || 'Vie associative',
      content: ann.content || ann.excerpt || '',
    });
    setEditorError('');
  };

  const handleCloseEditorModal = () => {
    setEditorMode(null);
    setEditingAnnouncement(null);
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

  const handleSubmitAnnouncementForm = (event) => {
    event.preventDefault();

    const payload = {
      title: formData.title,
      category: formData.category,
      content: formData.content,
    };

    if (editorMode === 'CREATE') {
      const result = createManagedAnnouncement(payload);
      if (!result.ok) {
        setEditorError(result.error || 'Impossible de publier cette annonce.');
        return;
      }
      setFeedbackMessage(result.message);
      handleCloseEditorModal();
      setVersion((v) => v + 1);
      return;
    }

    if (editorMode === 'EDIT' && editingAnnouncement) {
      const result = updateManagedAnnouncement(editingAnnouncement.id, payload);
      if (!result.ok) {
        setEditorError(
          result.error || 'Impossible d’enregistrer les modifications.'
        );
        return;
      }
      setFeedbackMessage(result.message);
      handleCloseEditorModal();
      setVersion((v) => v + 1);
    }
  };

  const handleOpenDeleteModal = (ann) => {
    setDeleteModalAnnouncement(ann);
    setDeleteError('');
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalAnnouncement(null);
    setDeleteError('');
  };

  const handleConfirmDeleteAnnouncement = (event) => {
    event.preventDefault();
    if (!deleteModalAnnouncement) {
      return;
    }
    const result = deleteManagedAnnouncement(deleteModalAnnouncement.id);
    if (!result.ok) {
      setDeleteError(result.error || 'Impossible de supprimer cette annonce.');
      return;
    }
    setFeedbackMessage(result.message);
    handleCloseDeleteModal();
    setVersion((v) => v + 1);
  };

  return (
    <>
      {/* 1. En-tête de page avec bouton Créer une annonce (2:60601 Bureau / 2:60694 Mobile) */}
      <div className="management-page-header" data-node-id="2:60601">
        <p className="management-page-header__eyebrow" data-node-id="2:60602">
          GESTION DES ANNONCES
        </p>

        <div className="management-page-header__row" data-node-id="2:60603">
          <div className="management-page-header__intro" data-node-id="2:60604">
            <h1
              className="management-page-header__title"
              data-node-id="2:60605"
            >
              La voix de votre association.
            </h1>
            <p
              className="management-page-header__subtitle"
              data-node-id="2:60606"
            >
              Partagez les infos qui font vivre le campus.
            </p>
          </div>

          <button
            type="button"
            className="management-btn-primary"
            onClick={handleOpenCreateModal}
            data-node-id="2:60607"
          >
            <img
              src={plusIcon}
              alt=""
              className="management-btn-primary__icon"
              data-node-id="2:63654"
            />
            <span data-node-id="2:60609">Créer une annonce</span>
          </button>
        </div>
      </div>

      {/* Message de retour après création, modification ou suppression */}
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

      {/* 2. Barre de recherche et filtre (2:60610 Bureau / 2:60703 Mobile) */}
      <div className="management-toolbar" data-node-id="2:60610">
        <label className="management-search-box" data-node-id="2:60611">
          <span className="management-search-box__icon" data-node-id="2:63657">
            <SearchFieldIcon />
          </span>
          <input
            type="search"
            className="management-search-box__input"
            placeholder="Rechercher une annonce"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Rechercher une annonce"
            data-node-id="2:60613"
          />
        </label>

        <select
          className="management-filter-select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filtrer les annonces publiées"
          data-node-id="2:60614"
        >
          <option value="ALL">
            Publiées · {view.totalPublishedCount}  ⌄
          </option>
          {ANNOUNCEMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Liste des cartes d'annonces (2:60616 Bureau / 2:60709 Mobile) */}
      <div className="management-announcements-list" data-node-id="2:60616">
        {visibleAnnouncements.length === 0 ? (
          <div className="management-announcement-card">
            <p className="management-table__secondary-text">
              Aucune annonce publiée ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          visibleAnnouncements.map((ann) => (
            <article
              key={ann.id}
              className="management-announcement-card"
              data-node-id="2:60617"
            >
              <div
                className="management-announcement-card__row"
                data-node-id="2:60618"
              >
                <div
                  className="management-announcement-card__body"
                  data-node-id="2:60619"
                >
                  <div
                    className="management-announcement-card__badges"
                    data-node-id="2:60620"
                  >
                    <span
                      className="management-status-badge management-status-badge--accepted"
                      data-node-id="2:60621"
                    >
                      {ann.publicationStatus || 'Publiée'}
                    </span>
                    <span
                      className="management-status-badge management-status-badge--category"
                      data-node-id="2:60623"
                    >
                      {ann.category}
                    </span>
                  </div>

                  <p
                    className="management-announcement-card__meta"
                    data-node-id="2:60625"
                  >
                    {ann.date} · {ann.authorName || 'Léa Moreau'}
                  </p>

                  <h2
                    className="management-announcement-card__title"
                    data-node-id="2:60626"
                  >
                    {ann.title}
                  </h2>

                  <p
                    className="management-announcement-card__content"
                    data-node-id="2:60627"
                  >
                    {ann.content || ann.excerpt}
                  </p>

                  <p
                    className="management-announcement-card__visibility"
                    data-node-id="2:60628"
                  >
                    {ann.visibilityNote ||
                      'Visible sur le site public et dans l’espace membre'}
                  </p>
                </div>

                <div
                  className="management-announcement-card__actions"
                  data-node-id="2:60629"
                >
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--outline"
                    onClick={() => handleOpenEditModal(ann)}
                    data-node-id="2:60630"
                  >
                    <span data-node-id="2:60631">Modifier</span>
                  </button>
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--danger"
                    onClick={() => handleOpenDeleteModal(ann)}
                    data-node-id="2:60632"
                  >
                    <span data-node-id="2:60633">Supprimer</span>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* 4. Pagination (2:60668) */}
      <div className="management-pagination" data-node-id="2:60668">
        <p className="management-pagination__info" data-node-id="2:60669">
          {visibleAnnouncements.length <= 1
            ? `${visibleAnnouncements.length} annonce publiée`
            : `${visibleAnnouncements.length} annonces publiées`}
        </p>

        <div className="management-pagination__pages" data-node-id="2:60670">
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page précédente"
            data-node-id="2:60671"
          >
            ←
          </button>
          <button
            type="button"
            className="management-page-btn management-page-btn--active"
            aria-current="page"
            data-node-id="2:60673"
          >
            1
          </button>
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page suivante"
            data-node-id="2:60675"
          >
            →
          </button>
        </div>
      </div>

      {/* Formulaire : Créer ou modifier une annonce (Figma 2:62253) */}
      {editorMode && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-editor-modal-title"
        >
          <form
            className="management-modal management-modal--editor"
            onSubmit={handleSubmitAnnouncementForm}
            noValidate
          >
            <div className="management-modal__top">
              <span className="management-modal__context-badge">
                GESTION DES ANNONCES
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseEditorModal}
                aria-label="Fermer le formulaire"
              >
                <CloseModalIcon />
              </button>
            </div>

            <h2
              id="announcement-editor-modal-title"
              className="management-modal__title"
            >
              {editorMode === 'CREATE'
                ? 'Créer une annonce'
                : 'Modifier l’annonce'}
            </h2>

            <p className="management-modal__desc">
              Cette annonce sera immédiatement visible sur la page d’accueil du
              site public et dans l’espace membre.
            </p>

            {/* Champ · Titre * */}
            <div className="management-modal__field">
              <label
                htmlFor="announcement-title-input"
                className="management-modal__label"
              >
                Titre *
              </label>
              <input
                id="announcement-title-input"
                type="text"
                className="management-modal__input"
                placeholder="Ex. Le programme de novembre est là ✨"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                required
              />
            </div>

            {/* Champ · Catégorie * */}
            <div className="management-modal__field">
              <label
                htmlFor="announcement-category-select"
                className="management-modal__label"
              >
                Catégorie *
              </label>
              <select
                id="announcement-category-select"
                className="management-modal__select"
                value={formData.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                {ANNOUNCEMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Champ · Contenu de l’annonce * */}
            <div className="management-modal__field">
              <label
                htmlFor="announcement-content-textarea"
                className="management-modal__label"
              >
                Contenu de l’annonce *
              </label>
              <textarea
                id="announcement-content-textarea"
                className="management-modal__textarea"
                placeholder="Rédigez le message complet destiné aux étudiants du campus."
                value={formData.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                required
              />
            </div>

            {editorError && (
              <p className="management-modal__error" role="alert">
                {editorError}
              </p>
            )}

            <div className="management-modal__actions">
              <button
                type="submit"
                className="management-modal__submit management-modal__submit--accept"
              >
                <span>
                  {editorMode === 'CREATE'
                    ? 'Publier l’annonce'
                    : 'Enregistrer les modifications'}
                </span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseEditorModal}
              >
                <span>Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dialogue : Supprimer cette annonce ? (Figma 2:62087) */}
      {deleteModalAnnouncement && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-announcement-modal-title"
        >
          <form
            className="management-modal"
            onSubmit={handleConfirmDeleteAnnouncement}
            noValidate
            data-node-id="2:62087"
          >
            <div className="management-modal__top" data-node-id="2:62088">
              <span
                className="management-modal__context-badge"
                data-node-id="2:62089"
              >
                GESTION DES ANNONCES
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseDeleteModal}
                aria-label="Fermer la fenêtre"
                data-node-id="2:63999"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div
              className="management-modal__symbol management-modal__symbol--danger"
              data-node-id="2:62092"
            >
              <TriangleAlertModalIcon />
            </div>

            <h2
              id="delete-announcement-modal-title"
              className="management-modal__title"
              data-node-id="2:62094"
            >
              Supprimer cette annonce ?
            </h2>

            <p className="management-modal__identity" data-node-id="2:62095">
              {deleteModalAnnouncement.title}
            </p>

            <p className="management-modal__desc" data-node-id="2:62096">
              L’annonce sera retirée de la page d’accueil publique et de
              l’espace membre.
            </p>

            {deleteError && (
              <p className="management-modal__error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="management-modal__actions" data-node-id="2:62097">
              <button
                type="submit"
                className="management-modal__submit management-modal__submit--danger"
                data-node-id="2:62098"
              >
                <span data-node-id="2:62099">Supprimer l’annonce</span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseDeleteModal}
                data-node-id="2:62100"
              >
                <span data-node-id="2:62101">Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ManagementAnnouncementsPage;
