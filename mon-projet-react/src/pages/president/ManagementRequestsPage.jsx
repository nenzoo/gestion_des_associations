import { useEffect, useState } from 'react';
import { MEMBERSHIP_STATUS } from '../../data/authMockData';
import {
  getMembershipRequestsView,
  acceptMembershipRequest,
  refuseMembershipRequest,
} from '../../services/managementService';
import './ManagementPages.css';

function InfoCircleIcon() {
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
        d="M9 12V9M9 6H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function CircleCheckModalIcon() {
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
        d="M9 12L11 14L15 10M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke="currentColor"
        strokeWidth="2"
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

function getStatusBadgeClassName(status) {
  if (status === MEMBERSHIP_STATUS.ACCEPTEE) {
    return 'management-status-badge management-status-badge--accepted';
  }
  if (status === MEMBERSHIP_STATUS.REFUSEE) {
    return 'management-status-badge management-status-badge--refused';
  }
  return 'management-status-badge management-status-badge--pending';
}

function formatPaginationSummary(tab, count) {
  if (tab === MEMBERSHIP_STATUS.ACCEPTEE) {
    return count <= 1
      ? `${count} demande acceptée affichée`
      : `${count} demandes acceptées affichées`;
  }
  if (tab === MEMBERSHIP_STATUS.REFUSEE) {
    return count <= 1
      ? `${count} demande refusée affichée`
      : `${count} demandes refusées affichées`;
  }
  if (count === 0) {
    return 'Aucune demande en attente';
  }
  if (count === 1) {
    return '1 demande en attente';
  }
  return `${count} demandes en attente`;
}

function ManagementRequestsPage() {
  const [activeTab, setActiveTab] = useState(MEMBERSHIP_STATUS.EN_ATTENTE);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('oldest');
  const [, setVersion] = useState(0);

  // État des dialogues de décision (2:61977 Accepter / 2:61994 Refuser)
  const [acceptModalRequest, setAcceptModalRequest] = useState(null);
  const [refuseModalRequest, setRefuseModalRequest] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [modalError, setModalError] = useState('');
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

  const view = getMembershipRequestsView({
    tab: activeTab,
    search: searchQuery,
    sortOrder,
  });

  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'oldest' ? 'newest' : 'oldest'));
  };

  const handleOpenAcceptModal = (request) => {
    setModalError('');
    setAcceptModalRequest(request);
  };

  const handleCloseAcceptModal = () => {
    setAcceptModalRequest(null);
    setModalError('');
  };

  const handleConfirmAccept = () => {
    if (!acceptModalRequest) {
      return;
    }
    const result = acceptMembershipRequest(acceptModalRequest.id);
    if (!result.ok) {
      setModalError(result.error || 'Impossible de valider cette demande.');
      return;
    }
    setFeedbackMessage(result.message);
    setAcceptModalRequest(null);
    setModalError('');
    setVersion((v) => v + 1);
  };

  const handleOpenRefuseModal = (request) => {
    setModalError('');
    setRefusalReason('');
    setRefuseModalRequest(request);
  };

  const handleCloseRefuseModal = () => {
    setRefuseModalRequest(null);
    setRefusalReason('');
    setModalError('');
  };

  const handleConfirmRefuse = (event) => {
    event.preventDefault();
    if (!refuseModalRequest) {
      return;
    }
    const result = refuseMembershipRequest(refuseModalRequest.id, refusalReason);
    if (!result.ok) {
      setModalError(result.error || 'Le motif du refus est obligatoire.');
      return;
    }
    setFeedbackMessage(result.message);
    setRefuseModalRequest(null);
    setRefusalReason('');
    setModalError('');
    setVersion((v) => v + 1);
  };

  return (
    <>
      {/* 1. En-tête de page (2:59826 Bureau / 2:59950 Mobile) */}
      <div className="management-page-header" data-node-id="2:59826">
        <p className="management-page-header__eyebrow" data-node-id="2:59827">
          DEMANDES D’ADHÉSION
        </p>
        <div className="management-page-header__row" data-node-id="2:59828">
          <div className="management-page-header__intro" data-node-id="2:59829">
            <h1
              className="management-page-header__title"
              data-node-id="2:59830"
            >
              Chaque rencontre commence ici.
            </h1>
            <p
              className="management-page-header__subtitle"
              data-node-id="2:59831"
            >
              Vérifiez les demandes et ouvrez la porte aux nouveaux membres.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Onglets par statut de demande (2:59832 Bureau / 2:59956 Mobile) */}
      <div
        className="management-tabs"
        role="tablist"
        aria-label="Filtrer les demandes par statut"
        data-node-id="2:59832"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === MEMBERSHIP_STATUS.EN_ATTENTE}
          className={`management-tab ${
            activeTab === MEMBERSHIP_STATUS.EN_ATTENTE
              ? 'management-tab--active'
              : ''
          }`}
          onClick={() => setActiveTab(MEMBERSHIP_STATUS.EN_ATTENTE)}
          data-node-id="2:59833"
        >
          <span data-node-id="2:59834">
            En attente · {view.counts.pending}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === MEMBERSHIP_STATUS.ACCEPTEE}
          className={`management-tab ${
            activeTab === MEMBERSHIP_STATUS.ACCEPTEE
              ? 'management-tab--active'
              : ''
          }`}
          onClick={() => setActiveTab(MEMBERSHIP_STATUS.ACCEPTEE)}
          data-node-id="2:59835"
        >
          <span data-node-id="2:59836">
            Acceptées · {view.counts.accepted}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === MEMBERSHIP_STATUS.REFUSEE}
          className={`management-tab ${
            activeTab === MEMBERSHIP_STATUS.REFUSEE
              ? 'management-tab--active'
              : ''
          }`}
          onClick={() => setActiveTab(MEMBERSHIP_STATUS.REFUSEE)}
          data-node-id="2:59837"
        >
          <span data-node-id="2:59838">
            Refusées · {view.counts.refused}
          </span>
        </button>
      </div>

      {/* 3. Bandeau d'information métier (2:59839 Bureau / 2:59963 Mobile) */}
      <div className="management-info-banner" data-node-id="2:59839">
        <span className="management-info-banner__icon" data-node-id="2:63462">
          <InfoCircleIcon />
        </span>
        <p className="management-info-banner__text" data-node-id="2:59841">
          Présidence et secrétariat : vous pouvez accepter ou refuser une
          demande. Un e-mail informe automatiquement l’étudiant de votre
          décision.
        </p>
      </div>

      {/* Message de confirmation après décision */}
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

      {/* 4. Barre de recherche et tri (2:59842 Bureau / 2:59966 Mobile) */}
      <div className="management-toolbar" data-node-id="2:59842">
        <label className="management-search-box" data-node-id="2:59843">
          <span className="management-search-box__icon" data-node-id="2:63465">
            <SearchFieldIcon />
          </span>
          <input
            type="search"
            className="management-search-box__input"
            placeholder="Rechercher un étudiant"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Rechercher un étudiant"
            data-node-id="2:59845"
          />
        </label>

        <button
          type="button"
          className="management-filter-btn"
          onClick={handleToggleSortOrder}
          data-node-id="2:59846"
        >
          <span data-node-id="2:59847">
            {sortOrder === 'oldest'
              ? 'Plus anciennes d’abord  ⌄'
              : 'Plus récentes d’abord  ⌄'}
          </span>
        </button>
      </div>

      {/* 5A. Tableau des demandes — Vue Bureau (2:59848) */}
      <div className="management-table" data-node-id="2:59848">
        <div className="management-table__head" data-node-id="2:59849">
          <p className="management-table__col" data-node-id="2:59850">
            Étudiant
          </p>
          <p className="management-table__col" data-node-id="2:59851">
            N° étudiant
          </p>
          <p className="management-table__col" data-node-id="2:59852">
            {activeTab === MEMBERSHIP_STATUS.EN_ATTENTE
              ? 'Reçue le'
              : 'Traitée le'}
          </p>
          <p className="management-table__col" data-node-id="2:59853">
            Statut
          </p>
          <p className="management-table__col" data-node-id="2:59854">
            Décision
          </p>
        </div>

        {view.items.length === 0 ? (
          <div className="management-table__empty">
            Aucune demande ne correspond à votre recherche dans cet onglet.
          </div>
        ) : (
          view.items.map((item) => {
            const fullName = `${item.firstName} ${item.lastName}`;
            const dateLabel =
              item.submittedAtLabel || item.processedAtLabel || '6 nov. 2026';
            const isPending = item.status === MEMBERSHIP_STATUS.EN_ATTENTE;

            return (
              <div
                key={item.id}
                className="management-table__row"
                data-node-id="2:59855"
              >
                <div className="management-table__cell" data-node-id="2:59856">
                  <div
                    className="management-table__identity"
                    data-node-id="2:59857"
                  >
                    <p
                      className="management-table__primary-text"
                      data-node-id="2:59858"
                    >
                      {fullName}
                    </p>
                    <p
                      className="management-table__secondary-text"
                      data-node-id="2:59859"
                    >
                      {item.email}
                    </p>
                  </div>
                </div>

                <p
                  className="management-table__col management-table__text"
                  data-node-id="2:59860"
                >
                  {item.studentNumber}
                </p>

                <p
                  className="management-table__col management-table__text"
                  data-node-id="2:59861"
                >
                  {dateLabel}
                </p>

                <div className="management-table__cell" data-node-id="2:59862">
                  <span
                    className={getStatusBadgeClassName(item.status)}
                    data-node-id="2:59863"
                  >
                    {item.status}
                  </span>
                </div>

                <div className="management-table__cell" data-node-id="2:59865">
                  {isPending ? (
                    <div
                      className="management-row-actions"
                      data-node-id="2:59866"
                    >
                      <button
                        type="button"
                        className="management-action-btn management-action-btn--accept"
                        onClick={() => handleOpenAcceptModal(item)}
                        data-node-id="2:59867"
                      >
                        <span data-node-id="2:59868">Accepter</span>
                      </button>
                      <button
                        type="button"
                        className="management-action-btn management-action-btn--danger"
                        onClick={() => handleOpenRefuseModal(item)}
                        data-node-id="2:59869"
                      >
                        <span data-node-id="2:59870">Refuser</span>
                      </button>
                    </div>
                  ) : (
                    <div className="management-table__identity">
                      <p className="management-table__text">
                        Traitée par {item.processedBy || 'le bureau'}
                      </p>
                      {item.reason && (
                        <p className="management-table__secondary-text">
                          Motif : {item.reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5B. Liste de cartes — Vue Mobile (2:59972) */}
      <div className="management-mobile-list" data-node-id="2:59972">
        {view.items.length === 0 ? (
          <div className="management-mobile-card">
            <p className="management-table__secondary-text">
              Aucune demande ne correspond à votre recherche dans cet onglet.
            </p>
          </div>
        ) : (
          view.items.map((item) => {
            const fullName = `${item.firstName} ${item.lastName}`;
            const dateLabel =
              item.submittedAtLabel || item.processedAtLabel || '6 nov. 2026';
            const isPending = item.status === MEMBERSHIP_STATUS.EN_ATTENTE;

            return (
              <div
                key={item.id}
                className="management-mobile-card"
                data-node-id="2:59973"
              >
                <div
                  className="management-table__identity"
                  data-node-id="2:59974"
                >
                  <p
                    className="management-table__primary-text"
                    data-node-id="2:59975"
                  >
                    {fullName}
                  </p>
                  <p
                    className="management-table__secondary-text"
                    data-node-id="2:59976"
                  >
                    {item.email}
                  </p>
                </div>

                <p className="management-table__text" data-node-id="2:59977">
                  N° étudiant : {item.studentNumber}
                </p>

                <p className="management-table__text" data-node-id="2:59978">
                  {isPending ? 'Reçue le' : 'Traitée le'} : {dateLabel}
                </p>

                <span
                  className={getStatusBadgeClassName(item.status)}
                  data-node-id="2:59979"
                >
                  {item.status}
                </span>

                {isPending ? (
                  <div
                    className="management-row-actions"
                    data-node-id="2:59981"
                  >
                    <button
                      type="button"
                      className="management-action-btn management-action-btn--accept"
                      onClick={() => handleOpenAcceptModal(item)}
                      data-node-id="2:59982"
                    >
                      <span data-node-id="2:59983">Accepter</span>
                    </button>
                    <button
                      type="button"
                      className="management-action-btn management-action-btn--danger"
                      onClick={() => handleOpenRefuseModal(item)}
                      data-node-id="2:59984"
                    >
                      <span data-node-id="2:59985">Refuser</span>
                    </button>
                  </div>
                ) : (
                  <div className="management-table__identity">
                    <p className="management-table__text">
                      Traitée par : {item.processedBy || 'le bureau'}
                    </p>
                    {item.reason && (
                      <p className="management-table__secondary-text">
                        Motif : {item.reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Pagination (2:59903 Bureau / 2:60012 Mobile) */}
      <div className="management-pagination" data-node-id="2:59903">
        <p className="management-pagination__info" data-node-id="2:59904">
          {formatPaginationSummary(activeTab, view.items.length)}
        </p>

        <div className="management-pagination__pages" data-node-id="2:59905">
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page précédente"
            data-node-id="2:59906"
          >
            ←
          </button>
          <button
            type="button"
            className="management-page-btn management-page-btn--active"
            aria-current="page"
            data-node-id="2:59908"
          >
            1
          </button>
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page suivante"
            data-node-id="2:59910"
          >
            →
          </button>
        </div>
      </div>

      {/* 7. Section "Dernières décisions" (2:59912 Bureau / 2:60021 Mobile) */}
      <p className="management-section-label" data-node-id="2:59912">
        Dernières décisions
      </p>

      {/* 7A. Tableau des dernières décisions — Vue Bureau (2:59913) */}
      <div className="management-table" data-node-id="2:59913">
        <div className="management-table__head" data-node-id="2:59914">
          <p className="management-table__col" data-node-id="2:59915">
            Étudiant
          </p>
          <p className="management-table__col" data-node-id="2:59916">
            Décision
          </p>
          <p className="management-table__col" data-node-id="2:59917">
            Traitée par
          </p>
          <p className="management-table__col" data-node-id="2:59918">
            Date
          </p>
        </div>

        {view.recentDecisions.map((decision) => (
          <div
            key={decision.id}
            className="management-table__row"
            data-node-id="2:59919"
          >
            <p
              className="management-table__col management-table__semi-text"
              data-node-id="2:59920"
            >
              {decision.firstName} {decision.lastName}
            </p>

            <div className="management-table__cell" data-node-id="2:59921">
              <span
                className={getStatusBadgeClassName(decision.status)}
                data-node-id="2:59922"
              >
                {decision.status}
              </span>
            </div>

            <p
              className="management-table__col management-table__text"
              data-node-id="2:59924"
            >
              {decision.processedBy}
            </p>

            <p
              className="management-table__col management-table__text"
              data-node-id="2:59925"
            >
              {decision.processedAtLabel}
            </p>
          </div>
        ))}
      </div>

      {/* 7B. Cartes des dernières décisions — Vue Mobile (2:60022) */}
      <div className="management-mobile-list" data-node-id="2:60022">
        {view.recentDecisions.map((decision) => (
          <div
            key={decision.id}
            className="management-mobile-card"
            data-node-id="2:60023"
          >
            <p
              className="management-mobile-card__title"
              data-node-id="2:60024"
            >
              {decision.firstName} {decision.lastName}
            </p>

            <span
              className={getStatusBadgeClassName(decision.status)}
              data-node-id="2:60025"
            >
              {decision.status}
            </span>

            <p className="management-table__text" data-node-id="2:60027">
              Traitée par : {decision.processedBy}
            </p>

            <p className="management-table__text" data-node-id="2:60028">
              Date : {decision.processedAtLabel}
            </p>
          </div>
        ))}
      </div>

      {/* Dialogue 1 : Accepter cette adhésion ? (Figma 2:61977) */}
      {acceptModalRequest && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accept-modal-title"
        >
          <div className="management-modal" data-node-id="2:61977">
            <div className="management-modal__top" data-node-id="2:61978">
              <span
                className="management-modal__context-badge"
                data-node-id="2:61979"
              >
                DEMANDE D’ADHÉSION
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseAcceptModal}
                aria-label="Fermer la fenêtre"
                data-node-id="2:63960"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div
              className="management-modal__symbol management-modal__symbol--accept"
              data-node-id="2:61982"
            >
              <CircleCheckModalIcon />
            </div>

            <h2
              id="accept-modal-title"
              className="management-modal__title"
              data-node-id="2:61984"
            >
              Accepter cette adhésion ?
            </h2>

            <p className="management-modal__identity" data-node-id="2:61985">
              {acceptModalRequest.firstName} {acceptModalRequest.lastName} · N°{' '}
              {acceptModalRequest.studentNumber}
            </p>

            <p className="management-modal__desc" data-node-id="2:61986">
              L’étudiant deviendra membre actif d’Agora et pourra s’inscrire aux
              événements depuis son espace personnel.
            </p>

            <span
              className="management-status-badge management-status-badge--accepted"
              data-node-id="2:61987"
            >
              ACCEPTEE
            </span>

            {modalError && (
              <p className="management-modal__error" role="alert">
                {modalError}
              </p>
            )}

            <div className="management-modal__actions" data-node-id="2:61989">
              <button
                type="button"
                className="management-modal__submit management-modal__submit--accept"
                onClick={handleConfirmAccept}
                data-node-id="2:61990"
              >
                <span data-node-id="2:61991">Accepter l’adhésion</span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseAcceptModal}
                data-node-id="2:61992"
              >
                <span data-node-id="2:61993">Annuler</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue 2 : Refuser cette demande ? (Figma 2:61994) */}
      {refuseModalRequest && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="refuse-modal-title"
        >
          <form
            className="management-modal"
            onSubmit={handleConfirmRefuse}
            noValidate
            data-node-id="2:61994"
          >
            <div className="management-modal__top" data-node-id="2:61995">
              <span
                className="management-modal__context-badge"
                data-node-id="2:61996"
              >
                DEMANDE D’ADHÉSION
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseRefuseModal}
                aria-label="Fermer la fenêtre"
                data-node-id="2:63966"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div
              className="management-modal__symbol management-modal__symbol--danger"
              data-node-id="2:61999"
            >
              <TriangleAlertModalIcon />
            </div>

            <h2
              id="refuse-modal-title"
              className="management-modal__title"
              data-node-id="2:62001"
            >
              Refuser cette demande ?
            </h2>

            <p className="management-modal__identity" data-node-id="2:62002">
              {refuseModalRequest.firstName} {refuseModalRequest.lastName} · N°{' '}
              {refuseModalRequest.studentNumber}
            </p>

            <p className="management-modal__desc" data-node-id="2:62003">
              Précisez le motif du refus qui sera communiqué à l’étudiant dans
              le suivi de sa demande.
            </p>

            <div className="management-modal__field" data-node-id="2:62004">
              <label
                htmlFor="refusal-reason-textarea"
                className="management-modal__label"
                data-node-id="2:62005"
              >
                Motif du refus *
              </label>
              <textarea
                id="refusal-reason-textarea"
                className="management-modal__textarea"
                placeholder="Ex. Numéro étudiant Lyon 2 invalide ou dossier incomplet pour l’année 2026–2027."
                value={refusalReason}
                onChange={(event) => {
                  setRefusalReason(event.target.value);
                  if (modalError) {
                    setModalError('');
                  }
                }}
                required
                data-node-id="2:62006"
              />
              {modalError && (
                <p className="management-modal__error" role="alert">
                  {modalError}
                </p>
              )}
            </div>

            <span
              className="management-status-badge management-status-badge--refused"
              data-node-id="2:62008"
            >
              REFUSEE
            </span>

            <div className="management-modal__actions" data-node-id="2:62010">
              <button
                type="submit"
                className="management-modal__submit management-modal__submit--danger"
                data-node-id="2:62011"
              >
                <span data-node-id="2:62012">Refuser la demande</span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseRefuseModal}
                data-node-id="2:62013"
              >
                <span data-node-id="2:62014">Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ManagementRequestsPage;
