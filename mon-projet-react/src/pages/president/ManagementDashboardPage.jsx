import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROLES } from '../../data/authMockData';
import { getCurrentUser } from '../../services/authService';
import { getManagementDashboardOverview } from '../../services/managementService';
import plusIcon from '../../assets/icons/plus.svg';
import './ManagementPages.css';

function KpiUsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.0002 15.75V14.25C12.0002 13.4544 11.6841 12.6913 11.1215 12.1287C10.5588 11.5661 9.79571 11.25 9 11.25H4.49964C3.70393 11.25 2.9408 11.5661 2.37815 12.1287C1.8155 12.6913 1.4994 13.4544 1.4994 14.25V15.75M12.0002 2.34595C12.6436 2.51272 13.2134 2.8884 13.6201 3.41399C14.0269 3.93959 14.2476 4.58536 14.2476 5.24995C14.2476 5.91453 14.0269 6.5603 13.6201 7.0859C13.2134 7.6115 12.6436 7.98717 12.0002 8.15395M16.5006 15.7499V14.2499C16.5001 13.5852 16.2788 12.9395 15.8716 12.4141C15.4643 11.8888 14.8941 11.5136 14.2504 11.3474M9.75006 5.25C9.75006 6.90685 8.40681 8.25 6.74982 8.25C5.09283 8.25 3.74958 6.90685 3.74958 5.25C3.74958 3.59315 5.09283 2.25 6.74982 2.25C8.40681 2.25 9.75006 3.59315 9.75006 5.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiInboxIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.5006 9H12.0002L10.5001 11.2498H7.49988L5.99976 9H1.4994M1.4994 9L4.08711 3.83302C4.2113 3.58313 4.40275 3.37284 4.63993 3.22579C4.87712 3.07873 5.15063 3.00075 5.42971 3.0006H12.5703C12.8494 3.00075 13.1229 3.07873 13.3601 3.22579C13.5972 3.37284 13.7887 3.58313 13.9129 3.83302L16.5006 9V13.4996C16.5006 13.8973 16.3426 14.2788 16.0612 14.5601C15.7799 14.8414 15.3983 14.9994 15.0005 14.9994H2.99952C2.60166 14.9994 2.2201 14.8414 1.93877 14.5601C1.65745 14.2788 1.4994 13.8973 1.4994 13.4996V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiCalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 1.4994V2.99952M6 2.99952V4.49964M6 2.99952H3.75C2.92157 2.99952 2.25 3.67115 2.25 4.49964V7.49988M6 2.99952H12M12 1.4994V2.99952M12 2.99952V4.49964M12 2.99952H14.25C15.0784 2.99952 15.75 3.67115 15.75 4.49964V7.49988M2.25 7.49988H15.75M2.25 7.49988V15.0005C2.25 15.829 2.92157 16.5006 3.75 16.5006H14.25C15.0784 16.5006 15.75 15.829 15.75 15.0005V7.49988M6 10.5001H6.0075M9 10.5001H9.0075M12 10.5001H12.0075M6 13.5004H6.0075M9 13.5004H9.0075M12 13.5004H12.0075"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KpiWalletIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14.25 5.25V3C14.25 2.80109 14.171 2.61032 14.0303 2.46967C13.8897 2.32902 13.6989 2.25 13.5 2.25H3.75C3.35218 2.25 2.97064 2.40804 2.68934 2.68934C2.40804 2.97064 2.25 3.35218 2.25 3.75M14.25 5.25H3.75C3.35218 5.25 2.97064 5.09196 2.68934 4.81066C2.40804 4.52936 2.25 4.14782 2.25 3.75M14.25 5.25H15C15.1989 5.25 15.3897 5.32902 15.5303 5.46967C15.671 5.61032 15.75 5.80109 15.75 6V9M2.25 3.75V14.25C2.25 14.6478 2.40804 15.0294 2.68934 15.3107C2.97064 15.592 3.35218 15.75 3.75 15.75H15C15.1989 15.75 15.3897 15.671 15.5303 15.5303C15.671 15.3897 15.75 15.1989 15.75 15V12M15.75 9H13.5C13.1022 9 12.7206 9.15804 12.4393 9.43934C12.158 9.72064 12 10.1022 12 10.5C12 10.8978 12.158 11.2794 12.4393 11.5607C12.7206 11.842 13.1022 12 13.5 12H15.75M15.75 9C15.9489 9 16.1397 9.07902 16.2803 9.21967C16.421 9.36032 16.5 9.55109 16.5 9.75V11.25C16.5 11.4489 16.421 11.6397 16.2803 11.7803C16.1397 11.921 15.9489 12 15.75 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowUpRightMeetingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.83333 14.1667L14.1667 5.83333M14.1667 5.83333H5.83333M14.1667 5.83333V14.1667"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatHighlightBannerTitle(pendingCount) {
  if (pendingCount === 0) {
    return 'Toutes les demandes d’adhésion sont à jour.';
  }
  if (pendingCount === 1) {
    return '1 étudiant attend de vous rejoindre.';
  }
  return `${pendingCount} étudiants attendent de vous rejoindre.`;
}

function formatProcessRequestsButtonLabel(pendingCount) {
  if (pendingCount === 0) {
    return 'Consulter les demandes';
  }
  if (pendingCount === 1) {
    return 'Traiter la demande';
  }
  return `Traiter les ${pendingCount} demandes`;
}

function ManagementDashboardPage() {
  const location = useLocation();
  const user = getCurrentUser();
  const [, setVersion] = useState(0);

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

  const overview = getManagementDashboardOverview();
  const isPresident = user?.role === ROLES.PRESIDENT;

  // Conserver les chemins existants dans AppRoutes.jsx (/president/* ou /secretaire/*, ou /presidente/* si appelé via cet alias)
  const basePath = location.pathname.startsWith('/secretaire')
    ? '/secretaire'
    : location.pathname.startsWith('/presidente')
    ? '/presidente'
    : '/president';

  const eventsPath = `${basePath}/evenements`;
  const requestsPath = `${basePath}/demandes`;
  const membersPath = `${basePath}/membres`;
  const treasuryPath = `${basePath}/tresorerie`;

  return (
    <>
      {/* 1. En-tête de page (2:59215 Bureau / 2:59349 Mobile) */}
      <div className="management-page-header" data-node-id="2:59215">
        <p className="management-page-header__eyebrow" data-node-id="2:59216">
          ESPACE PRÉSIDENCE · SECRÉTARIAT
        </p>

        <div className="management-page-header__row" data-node-id="2:59217">
          <div
            className="management-page-header__intro"
            data-node-id="2:59218"
          >
            <h1
              className="management-page-header__title"
              data-node-id="2:59219"
            >
              {overview.greetingTitle}
            </h1>
            <p
              className="management-page-header__subtitle"
              data-node-id="2:59220"
            >
              {overview.dateSubtitle}
            </p>
          </div>

          <Link
            to={eventsPath}
            className="management-btn-primary"
            data-node-id="2:59221"
          >
            <img
              src={plusIcon}
              alt=""
              className="management-btn-primary__icon"
              data-node-id="2:63279"
            />
            <span data-node-id="2:59223">Nouvel événement</span>
          </Link>
        </div>
      </div>

      {/* 2. Bannière "À la une" (2:59224 Bureau / 2:59358 Mobile) */}
      <section className="management-highlight-banner" data-node-id="2:59224">
        <div
          className="management-highlight-banner__content"
          data-node-id="2:59225"
        >
          <p
            className="management-highlight-banner__eyebrow"
            data-node-id="2:59226"
          >
            LE CAMPUS BOUGE, VOUS AUSSI.
          </p>
          <h2
            className="management-highlight-banner__title"
            data-node-id="2:59227"
          >
            {formatHighlightBannerTitle(overview.pendingCount)}
          </h2>
          <p
            className="management-highlight-banner__desc"
            data-node-id="2:59228"
          >
            Un petit clic pour vous. Le début d’une belle aventure pour eux.
          </p>
        </div>

        <Link
          to={requestsPath}
          className="management-highlight-banner__cta"
          data-node-id="2:59229"
        >
          <span data-node-id="2:59230">Voir les demandes →</span>
        </Link>
      </section>

      {/* 3. Grille des 4 Chiffres clés / KPI (2:59231 Bureau / 2:59365 Mobile) */}
      <section
        className="management-kpi-grid"
        aria-label="Chiffres clés de l’association"
        data-node-id="2:59231"
      >
        {/* Carte 1 : Membres actifs (2:59232) */}
        <Link
          to={membersPath}
          className="management-kpi-card management-kpi-card--link"
          data-node-id="2:59232"
        >
          <div className="management-kpi-card__header" data-node-id="2:59233">
            <p className="management-kpi-card__label" data-node-id="2:59234">
              Membres actifs
            </p>
            <span className="management-kpi-card__icon" data-node-id="2:63282">
              <KpiUsersIcon />
            </span>
          </div>
          <p className="management-kpi-card__value" data-node-id="2:59236">
            {overview.kpis.activeMembersCount}
          </p>
          <p className="management-kpi-card__note" data-node-id="2:59237">
            {overview.kpis.activeMembersDeltaText}
          </p>
        </Link>

        {/* Carte 2 : Demandes à traiter (2:59238) */}
        <Link
          to={requestsPath}
          className="management-kpi-card management-kpi-card--link"
          data-node-id="2:59238"
        >
          <div className="management-kpi-card__header" data-node-id="2:59239">
            <p className="management-kpi-card__label" data-node-id="2:59240">
              Demandes à traiter
            </p>
            <span className="management-kpi-card__icon" data-node-id="2:63285">
              <KpiInboxIcon />
            </span>
          </div>
          <p className="management-kpi-card__value" data-node-id="2:59242">
            {overview.kpis.pendingRequestsCount}
          </p>
          <p className="management-kpi-card__note" data-node-id="2:59243">
            {overview.kpis.oldestPendingText}
          </p>
        </Link>

        {/* Carte 3 : Événements à venir (2:59244) */}
        <Link
          to={eventsPath}
          className="management-kpi-card management-kpi-card--link"
          data-node-id="2:59244"
        >
          <div className="management-kpi-card__header" data-node-id="2:59245">
            <p className="management-kpi-card__label" data-node-id="2:59246">
              Événements à venir
            </p>
            <span className="management-kpi-card__icon" data-node-id="2:63288">
              <KpiCalendarIcon />
            </span>
          </div>
          <p className="management-kpi-card__value" data-node-id="2:59248">
            {overview.kpis.upcomingEventsCount}
          </p>
          <p className="management-kpi-card__note" data-node-id="2:59249">
            {overview.kpis.totalRegistrationsText}
          </p>
        </Link>

        {/* Carte 4 : Solde disponible (2:59250) — cliquable pour la Présidente, indicateur lecture seule pour la Secrétaire */}
        {isPresident ? (
          <Link
            to={treasuryPath}
            className="management-kpi-card management-kpi-card--link"
            data-node-id="2:59250"
          >
            <div className="management-kpi-card__header" data-node-id="2:59251">
              <p className="management-kpi-card__label" data-node-id="2:59252">
                Solde disponible
              </p>
              <span
                className="management-kpi-card__icon"
                data-node-id="2:63291"
              >
                <KpiWalletIcon />
              </span>
            </div>
            <p className="management-kpi-card__value" data-node-id="2:59254">
              {overview.kpis.treasuryBalanceText}
            </p>
            <p className="management-kpi-card__note" data-node-id="2:59255">
              {overview.kpis.treasuryNoteText}
            </p>
          </Link>
        ) : (
          <div className="management-kpi-card" data-node-id="2:59250">
            <div className="management-kpi-card__header" data-node-id="2:59251">
              <p className="management-kpi-card__label" data-node-id="2:59252">
                Solde disponible
              </p>
              <span
                className="management-kpi-card__icon"
                data-node-id="2:63291"
              >
                <KpiWalletIcon />
              </span>
            </div>
            <p className="management-kpi-card__value" data-node-id="2:59254">
              {overview.kpis.treasuryBalanceText}
            </p>
            <p className="management-kpi-card__note" data-node-id="2:59255">
              {overview.kpis.treasuryNoteText}
            </p>
          </div>
        )}
      </section>

      {/* 4. Activité du bureau : 2 colonnes Bureau / 1 colonne Mobile (2:59256 / 2:59390) */}
      <div className="management-activity-grid" data-node-id="2:59256">
        {/* Colonne gauche : Gestion courante (2:59257) */}
        <div className="management-activity-main" data-node-id="2:59257">
          {/* Carte : Les prochaines rencontres (2:59258) */}
          <section className="management-card" data-node-id="2:59258">
            <h2 className="management-card__title" data-node-id="2:59259">
              Les prochaines rencontres
            </h2>

            {overview.upcomingMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                to={eventsPath}
                className="management-meeting-row"
                data-node-id="2:59260"
              >
                <div
                  className="management-meeting-row__date"
                  data-node-id="2:59261"
                >
                  <span
                    className="management-meeting-row__day"
                    data-node-id="2:59262"
                  >
                    {meeting.dayNumber}
                  </span>
                  <span
                    className="management-meeting-row__month"
                    data-node-id="2:59263"
                  >
                    {meeting.monthShort}
                  </span>
                </div>

                <div
                  className="management-meeting-row__info"
                  data-node-id="2:59264"
                >
                  <p
                    className="management-meeting-row__title"
                    data-node-id="2:59265"
                  >
                    {meeting.title}
                  </p>
                  <p
                    className="management-meeting-row__meta"
                    data-node-id="2:59266"
                  >
                    {meeting.registeredCount} / {meeting.totalCapacity} inscrits
                    {' · '}
                    {meeting.location}
                  </p>
                </div>

                <span
                  className="management-meeting-row__arrow"
                  data-node-id="2:63294"
                >
                  <ArrowUpRightMeetingIcon />
                </span>
              </Link>
            ))}
          </section>

          {/* Carte : Dernières demandes (2:59284) */}
          <section className="management-card" data-node-id="2:59284">
            <h2 className="management-card__title" data-node-id="2:59285">
              Dernières demandes
            </h2>

            {overview.latestPendingRequests.map((req) => (
              <div
                key={req.id}
                className="management-request-row"
                data-node-id="2:59286"
              >
                <div
                  className="management-request-row__avatar"
                  data-node-id="2:59287"
                >
                  <span data-node-id="2:59288">{req.initials}</span>
                </div>

                <div
                  className="management-request-row__info"
                  data-node-id="2:59289"
                >
                  <p
                    className="management-request-row__name"
                    data-node-id="2:59290"
                  >
                    {req.firstName} {req.lastName}
                  </p>
                  <p
                    className="management-request-row__date"
                    data-node-id="2:59291"
                  >
                    {req.dashboardSubmittedLabel}
                  </p>
                </div>

                <span
                  className="management-status-badge management-status-badge--pending"
                  data-node-id="2:59292"
                >
                  {req.status}
                </span>
              </div>
            ))}

            <Link
              to={requestsPath}
              className="management-btn-secondary"
              data-node-id="2:59310"
            >
              <span data-node-id="2:59311">
                {formatProcessRequestsButtonLabel(overview.pendingCount)}
              </span>
            </Link>
          </section>
        </div>

        {/* Colonne droite : Suivi de l’association (2:59312) */}
        <aside className="management-activity-aside" data-node-id="2:59312">
          {/* Carte : Cap sur novembre (2:59313) */}
          <section className="management-card" data-node-id="2:59313">
            <h2 className="management-card__title" data-node-id="2:59314">
              Cap sur novembre
            </h2>

            <div className="management-goal-header" data-node-id="2:59315">
              <span
                className="management-goal-header__label"
                data-node-id="2:59316"
              >
                Objectif membres
              </span>
              <span
                className="management-goal-header__value"
                data-node-id="2:59317"
              >
                {overview.goalProgress.current} / {overview.goalProgress.target}
              </span>
            </div>

            <div
              className="management-goal-track"
              role="progressbar"
              aria-valuenow={overview.goalProgress.current}
              aria-valuemin={0}
              aria-valuemax={overview.goalProgress.target}
              data-node-id="2:59318"
            >
              <div
                className="management-goal-fill"
                style={{ width: `${overview.goalProgress.percentage}%` }}
                data-node-id="2:59319"
              />
            </div>

            <p className="management-goal-summary" data-node-id="2:59320">
              {overview.goalProgress.summaryText}
            </p>
          </section>

          {/* Carte : Le fil du bureau (2:59321) */}
          <section className="management-card" data-node-id="2:59321">
            <h2 className="management-card__title" data-node-id="2:59322">
              Le fil du bureau
            </h2>

            {overview.boardActivityFeed.map((item) => (
              <div
                key={item.id}
                className="management-feed-item"
                data-node-id="2:59323"
              >
                <p
                  className="management-feed-item__time"
                  data-node-id="2:59324"
                >
                  {item.timeLabel}
                </p>
                <p
                  className="management-feed-item__text"
                  data-node-id="2:59325"
                >
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}

export default ManagementDashboardPage;
