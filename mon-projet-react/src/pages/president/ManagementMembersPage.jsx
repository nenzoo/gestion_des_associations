import { useEffect, useState } from 'react';
import { MEMBER_BADGE_STATUS } from '../../data/managementMockData';
import {
  getAssociationMembersView,
  revokeAssociationMember,
  exportAssociationMembersCsv,
} from '../../services/managementService';
import downloadIcon from '../../assets/icons/download.svg';
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

function getMemberBadgeClassName(badgeLabel) {
  if (badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE) {
    return 'management-status-badge management-status-badge--refused';
  }
  return 'management-status-badge management-status-badge--accepted';
}

function formatMembersPaginationInfo({
  visibleCount,
  statusFilter,
  searchQuery,
  activeCount,
  revokedCount,
  totalDirectoryCount,
}) {
  if (searchQuery.trim()) {
    return visibleCount <= 1
      ? `${visibleCount} membre trouvé`
      : `${visibleCount} membres trouvés`;
  }
  if (statusFilter === MEMBER_BADGE_STATUS.ACTIVE) {
    return visibleCount === 0
      ? `0 sur ${activeCount} membres actifs`
      : `1–${visibleCount} sur ${activeCount} membres actifs`;
  }
  if (statusFilter === MEMBER_BADGE_STATUS.REVOQUEE) {
    return visibleCount <= 1
      ? `${visibleCount} sur ${revokedCount} membre révoqué`
      : `1–${visibleCount} sur ${revokedCount} membres révoqués`;
  }
  return visibleCount === 0
    ? `0 sur ${totalDirectoryCount} membres`
    : `1–${visibleCount} sur ${totalDirectoryCount} membres`;
}

function ManagementMembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [, setVersion] = useState(0);

  // État du dialogue de révocation (Figma 2:62015)
  const [revokeModalMember, setRevokeModalMember] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
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

  const view = getAssociationMembersView({
    search: searchQuery,
    statusFilter,
  });

  const handleExportCsv = () => {
    const csvContent = exportAssociationMembersCsv();
    if (!csvContent) {
      return;
    }
    const filename = 'agora-membres-2026-2027.csv';
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    const linesCount = Math.max(0, csvContent.trim().split('\n').length - 1);
    setFeedbackMessage(
      `Liste exportée (${filename} · ${linesCount} membres).`
    );
  };

  const handleOpenRevokeModal = (member) => {
    setModalError('');
    setRevocationReason('');
    setRevokeModalMember(member);
  };

  const handleCloseRevokeModal = () => {
    setRevokeModalMember(null);
    setRevocationReason('');
    setModalError('');
  };

  const handleConfirmRevoke = (event) => {
    event.preventDefault();
    if (!revokeModalMember) {
      return;
    }
    const result = revokeAssociationMember(
      revokeModalMember.id,
      revocationReason
    );
    if (!result.ok) {
      setModalError(
        result.error || 'Le motif de la révocation est obligatoire.'
      );
      return;
    }
    setFeedbackMessage(result.message);
    setRevokeModalMember(null);
    setRevocationReason('');
    setModalError('');
    setVersion((v) => v + 1);
  };

  return (
    <>
      {/* 1. En-tête de page avec bouton Exporter la liste (2:60094 Bureau / 2:60204 Mobile) */}
      <div className="management-page-header" data-node-id="2:60094">
        <p className="management-page-header__eyebrow" data-node-id="2:60095">
          ANNUAIRE DES MEMBRES
        </p>

        <div className="management-page-header__row" data-node-id="2:60096">
          <div className="management-page-header__intro" data-node-id="2:60097">
            <h1
              className="management-page-header__title"
              data-node-id="2:60098"
            >
              Une communauté qui grandit.
            </h1>
            <p
              className="management-page-header__subtitle"
              data-node-id="2:60099"
            >
              {view.activeCount} membres actifs · {view.academicYearLabel}
            </p>
          </div>

          <button
            type="button"
            className="management-btn-outline"
            onClick={handleExportCsv}
            data-node-id="2:60100"
          >
            <img
              src={downloadIcon}
              alt=""
              className="management-btn-outline__icon"
              data-node-id="2:63528"
            />
            <span data-node-id="2:60102">Exporter la liste</span>
          </button>
        </div>
      </div>

      {/* Message de retour après révocation ou export CSV */}
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

      {/* 2. Barre de recherche et filtre par statut (2:60103 Bureau / 2:60213 Mobile) */}
      <div className="management-toolbar" data-node-id="2:60103">
        <label className="management-search-box" data-node-id="2:60104">
          <span className="management-search-box__icon" data-node-id="2:63531">
            <SearchFieldIcon />
          </span>
          <input
            type="search"
            className="management-search-box__input"
            placeholder="Nom, e-mail ou numéro étudiant"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Rechercher par nom, e-mail ou numéro étudiant"
            data-node-id="2:60106"
          />
        </label>

        <select
          className="management-filter-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filtrer par statut d’adhésion"
          data-node-id="2:60107"
        >
          <option value="ALL">Tous les statuts ⌄</option>
          <option value={MEMBER_BADGE_STATUS.ACTIVE}>
            Actifs (ACTIVE · {view.activeCount})
          </option>
          <option value={MEMBER_BADGE_STATUS.REVOQUEE}>
            Révoqués (REVOQUEE · {view.revokedCount})
          </option>
        </select>
      </div>

      {/* 3A. Tableau de l'annuaire — Vue Bureau (2:60109) */}
      <div className="management-table" data-node-id="2:60109">
        <div className="management-table__head" data-node-id="2:60110">
          <p className="management-table__col" data-node-id="2:60111">
            Membre
          </p>
          <p className="management-table__col" data-node-id="2:60112">
            N° étudiant
          </p>
          <p className="management-table__col" data-node-id="2:60113">
            Rôle
          </p>
          <p className="management-table__col" data-node-id="2:60114">
            Adhésion
          </p>
          <p className="management-table__col" data-node-id="2:60115">
            Action
          </p>
        </div>

        {view.members.length === 0 ? (
          <div className="management-table__empty">
            Aucun membre ne correspond aux critères sélectionnés.
          </div>
        ) : (
          view.members.map((member) => {
            const fullName = `${member.firstName} ${member.lastName}`;
            const isRevoked =
              member.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE;
            const isBoard = Boolean(member.isBoardAccount);

            return (
              <div
                key={member.id}
                className="management-table__row"
                data-node-id="2:60116"
              >
                <div className="management-table__cell" data-node-id="2:60117">
                  <div
                    className="management-table__identity"
                    data-node-id="2:60118"
                  >
                    <p
                      className="management-table__primary-text"
                      data-node-id="2:60119"
                    >
                      {fullName}
                    </p>
                    <p
                      className="management-table__secondary-text"
                      data-node-id="2:60120"
                    >
                      {member.email}
                    </p>
                  </div>
                </div>

                <p
                  className="management-table__col management-table__text"
                  data-node-id="2:60121"
                >
                  {member.studentNumber}
                </p>

                <div className="management-table__cell" data-node-id="2:60122">
                  <span
                    className="management-role-pill"
                    data-node-id="2:60123"
                  >
                    {member.role}
                  </span>
                </div>

                <div className="management-table__cell" data-node-id="2:60125">
                  <span
                    className={getMemberBadgeClassName(member.badgeLabel)}
                    data-node-id="2:60126"
                  >
                    {member.badgeLabel}
                  </span>
                </div>

                <div className="management-table__cell" data-node-id="2:60128">
                  {isBoard ? (
                    <p
                      className="management-table__muted"
                      data-node-id="2:60153"
                    >
                      Compte du bureau
                    </p>
                  ) : isRevoked ? (
                    <p
                      className="management-table__muted"
                      data-node-id="2:60175"
                    >
                      {member.revokedAtLabel || member.actionNote || 'Révoquée'}
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="management-action-btn management-action-btn--danger"
                      onClick={() => handleOpenRevokeModal(member)}
                      data-node-id="2:60129"
                    >
                      <span data-node-id="2:60130">Révoquer</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3B. Cartes de l'annuaire — Vue Mobile (2:60219) */}
      <div className="management-mobile-list" data-node-id="2:60219">
        {view.members.length === 0 ? (
          <div className="management-mobile-card">
            <p className="management-table__secondary-text">
              Aucun membre ne correspond aux critères sélectionnés.
            </p>
          </div>
        ) : (
          view.members.map((member) => {
            const fullName = `${member.firstName} ${member.lastName}`;
            const isRevoked =
              member.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE;
            const isBoard = Boolean(member.isBoardAccount);

            return (
              <div
                key={member.id}
                className="management-mobile-card"
                data-node-id="2:60220"
              >
                <div
                  className="management-table__identity"
                  data-node-id="2:60221"
                >
                  <p
                    className="management-table__primary-text"
                    data-node-id="2:60222"
                  >
                    {fullName}
                  </p>
                  <p
                    className="management-table__secondary-text"
                    data-node-id="2:60223"
                  >
                    {member.email}
                  </p>
                </div>

                <p className="management-table__text" data-node-id="2:60224">
                  N° étudiant : {member.studentNumber}
                </p>

                <span className="management-role-pill" data-node-id="2:60225">
                  {member.role}
                </span>

                <span
                  className={getMemberBadgeClassName(member.badgeLabel)}
                  data-node-id="2:60227"
                >
                  {member.badgeLabel}
                </span>

                {isBoard ? (
                  <p className="management-table__muted" data-node-id="2:60247">
                    Compte du bureau
                  </p>
                ) : isRevoked ? (
                  <p className="management-table__muted" data-node-id="2:60263">
                    {member.revokedAtLabel || member.actionNote || 'Révoquée'}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="management-action-btn management-action-btn--danger"
                    onClick={() => handleOpenRevokeModal(member)}
                    data-node-id="2:60229"
                  >
                    <span data-node-id="2:60230">Révoquer</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Barre de pagination (2:60176 Bureau / 2:60264 Mobile) */}
      <div className="management-pagination" data-node-id="2:60176">
        <p className="management-pagination__info" data-node-id="2:60177">
          {formatMembersPaginationInfo({
            visibleCount: view.members.length,
            statusFilter,
            searchQuery,
            activeCount: view.activeCount,
            revokedCount: view.revokedCount,
            totalDirectoryCount: view.totalDirectoryCount,
          })}
        </p>

        <div className="management-pagination__pages" data-node-id="2:60178">
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page précédente"
            data-node-id="2:60179"
          >
            ←
          </button>
          <button
            type="button"
            className="management-page-btn management-page-btn--active"
            aria-current="page"
            data-node-id="2:60181"
          >
            1
          </button>
          <button
            type="button"
            className="management-page-btn"
            disabled
            aria-label="Page suivante"
            data-node-id="2:60183"
          >
            →
          </button>
        </div>
      </div>

      {/* 5. Note de gestion en pied de page (2:60185 Bureau / 2:60273 Mobile) */}
      <p className="management-footnote" data-node-id="2:60185">
        La révocation retire l’accès membre et annule les inscriptions à venir.
        Les mandats du bureau (Présidence nommée par l’administrateur,
        Secrétariat et Trésorerie nommés par la présidence) ne peuvent pas être
        révoqués depuis cet annuaire.
      </p>

      {/* Dialogue : Révoquer cette adhésion ? (Figma 2:62015) */}
      {revokeModalMember && (
        <div
          className="management-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="revoke-modal-title"
        >
          <form
            className="management-modal"
            onSubmit={handleConfirmRevoke}
            noValidate
            data-node-id="2:62015"
          >
            <div className="management-modal__top" data-node-id="2:62016">
              <span
                className="management-modal__context-badge"
                data-node-id="2:62017"
              >
                ANNUAIRE DES MEMBRES
              </span>
              <button
                type="button"
                className="management-modal__close"
                onClick={handleCloseRevokeModal}
                aria-label="Fermer la fenêtre"
                data-node-id="2:63972"
              >
                <CloseModalIcon />
              </button>
            </div>

            <div
              className="management-modal__symbol management-modal__symbol--danger"
              data-node-id="2:62020"
            >
              <TriangleAlertModalIcon />
            </div>

            <h2
              id="revoke-modal-title"
              className="management-modal__title"
              data-node-id="2:62022"
            >
              Révoquer cette adhésion ?
            </h2>

            <p className="management-modal__identity" data-node-id="2:62023">
              {revokeModalMember.firstName} {revokeModalMember.lastName} · N°{' '}
              {revokeModalMember.studentNumber}
            </p>

            <p className="management-modal__desc" data-node-id="2:62024">
              Cette décision bloque l’accès du membre à son espace personnel,
              annule ses inscriptions aux événements à venir et libère les
              places correspondantes.
            </p>

            <div className="management-modal__field" data-node-id="2:62025">
              <label
                htmlFor="revocation-reason-textarea"
                className="management-modal__label"
              >
                Motif de la révocation *
              </label>
              <textarea
                id="revocation-reason-textarea"
                className="management-modal__textarea"
                placeholder="Ex. Non-respect de la charte associative ou radiation demandée."
                value={revocationReason}
                onChange={(event) => {
                  setRevocationReason(event.target.value);
                  if (modalError) {
                    setModalError('');
                  }
                }}
                required
              />
              {modalError && (
                <p className="management-modal__error" role="alert">
                  {modalError}
                </p>
              )}
            </div>

            <span className="management-status-badge management-status-badge--refused">
              REVOQUEE
            </span>

            <div className="management-modal__actions">
              <button
                type="submit"
                className="management-modal__submit management-modal__submit--danger"
              >
                <span>Révoquer l’adhésion</span>
              </button>
              <button
                type="button"
                className="management-modal__cancel"
                onClick={handleCloseRevokeModal}
              >
                <span>Annuler</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ManagementMembersPage;
