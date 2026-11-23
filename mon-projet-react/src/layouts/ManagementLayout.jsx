import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ROLES } from '../data/authMockData';
import { getCurrentUser, logout } from '../services/authService';
import sparklesIcon from '../assets/icons/sparkles.svg';
import sunIcon from '../assets/icons/sun.svg';
import moonIcon from '../assets/icons/moon.svg';
import bellIcon from '../assets/icons/bell.svg';
import menuIcon from '../assets/icons/menu.svg';
import closeIcon from '../assets/icons/close.svg';
import './ManagementLayout.css';

const THEME_STORAGE_KEY = 'clubmanager_theme';
const MANAGEMENT_REQUESTS_STORAGE_KEY = 'clubmanager_management_requests';
const DEFAULT_PENDING_REQUESTS_COUNT = 3;

function LayoutDashboardNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 2.25H6.75C7.16421 2.25 7.5 2.58579 7.5 3V8.25C7.5 8.66421 7.16421 9 6.75 9H3C2.58579 9 2.25 8.66421 2.25 8.25V3C2.25 2.58579 2.58579 2.25 3 2.25ZM11.25 2.25H15C15.4142 2.25 15.75 2.58579 15.75 3V5.25C15.75 5.66421 15.4142 6 15 6H11.25C10.8358 6 10.5 5.66421 10.5 5.25V3C10.5 2.58579 10.8358 2.25 11.25 2.25ZM11.25 9H15C15.4142 9 15.75 9.33579 15.75 9.75V15C15.75 15.4142 15.4142 15.75 15 15.75H11.25C10.8358 15.75 10.5 15.4142 10.5 15V9.75C10.5 9.33579 10.8358 9 11.25 9ZM3 12H6.75C7.16421 12 7.5 12.3358 7.5 12.75V15C7.5 15.4142 7.16421 15.75 6.75 15.75H3C2.58579 15.75 2.25 15.4142 2.25 15V12.75C2.25 12.3358 2.58579 12 3 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InboxNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
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

function UsersNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
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

function CalendarDaysNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
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

function MegaphoneNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 10.5C4.5 12.4473 5.1316 14.3421 6.3 15.9C6.53869 16.2183 6.89404 16.4287 7.28787 16.4849C7.68169 16.5412 8.08174 16.4387 8.4 16.2C8.71826 15.9613 8.92866 15.606 8.98492 15.2121C9.04119 14.8183 8.9387 14.4183 8.7 14.1C7.92107 13.0614 7.5 11.7982 7.5 10.5M6 4.5V10.5M8.25 4.5C10.531 4.55876 12.7604 3.81563 14.55 2.4C14.6614 2.31643 14.7939 2.26554 14.9326 2.25303C15.0714 2.24052 15.2108 2.26689 15.3354 2.32918C15.46 2.39147 15.5648 2.48722 15.638 2.6057C15.7112 2.72418 15.75 2.86072 15.75 3V12C15.75 12.1393 15.7112 12.2758 15.638 12.3943C15.5648 12.5128 15.46 12.6085 15.3354 12.6708C15.2108 12.7331 15.0714 12.7595 14.9326 12.747C14.7939 12.7345 14.6614 12.6836 14.55 12.6C12.7604 11.1844 10.531 10.4412 8.25 10.5H3.75C3.35218 10.5 2.97064 10.342 2.68934 10.0607C2.40804 9.77936 2.25 9.39782 2.25 9V6C2.25 5.60218 2.40804 5.22064 2.68934 4.93934C2.97064 4.65804 3.35218 4.5 3.75 4.5H8.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WalletNavIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="18"
      height="18"
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

function MenuBottomIcon() {
  return (
    <svg
      className="management-layout__nav-svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.33333 5H16.6667M3.33333 10H16.6667M3.33333 15H16.6667"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore storage read errors
  }
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

function readPendingRequestsCount() {
  try {
    const raw = window.localStorage.getItem(MANAGEMENT_REQUESTS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PENDING_REQUESTS_COUNT;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((req) => req.status === 'EN_ATTENTE').length;
    }
  } catch {
    // Ignore storage parse errors
  }
  return DEFAULT_PENDING_REQUESTS_COUNT;
}

function buildSidebarItems(basePath, role, pendingCount) {
  const items = [
    {
      to: `${basePath}/dashboard`,
      label: 'Vue d’ensemble',
      mobileLabel: 'Accueil',
      breadcrumb: 'Agora / Vue d’ensemble',
      Icon: LayoutDashboardNavIcon,
      inMobileBar: true,
    },
    {
      to: `${basePath}/demandes`,
      label: `Demandes · ${pendingCount}`,
      mobileLabel: 'Demandes',
      breadcrumb: 'Agora / Demandes',
      Icon: InboxNavIcon,
      inMobileBar: true,
    },
    {
      to: `${basePath}/membres`,
      label: 'Membres',
      mobileLabel: 'Membres',
      breadcrumb: 'Agora / Membres',
      Icon: UsersNavIcon,
      inMobileBar: false,
    },
    {
      to: `${basePath}/evenements`,
      label: 'Événements',
      mobileLabel: 'Événements',
      breadcrumb: 'Agora / Événements',
      Icon: CalendarDaysNavIcon,
      inMobileBar: true,
    },
    {
      to: `${basePath}/annonces`,
      label: 'Annonces',
      mobileLabel: 'Annonces',
      breadcrumb: 'Agora / Annonces',
      Icon: MegaphoneNavIcon,
      inMobileBar: false,
    },
  ];

  // La Présidente dispose en plus du lien "Trésorerie" (Lecture seule) dans la Sidebar (2:59194 & 2:60073)
  if (role === ROLES.PRESIDENT) {
    items.push({
      to: `${basePath}/tresorerie`,
      label: 'Trésorerie',
      mobileLabel: 'Trésorerie',
      breadcrumb: 'Agora / Trésorerie',
      Icon: WalletNavIcon,
      inMobileBar: false,
    });
  }

  return items;
}

function ManagementLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setVersion] = useState(0);
  const user = getCurrentUser();

  const [theme, setTheme] = useState(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener('clubmanager:user-updated', handleSync);
    window.addEventListener('clubmanager:management-updated', handleSync);
    return () => {
      window.removeEventListener('clubmanager:user-updated', handleSync);
      window.removeEventListener('clubmanager:management-updated', handleSync);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write errors
    }
  }, [theme]);

  const roleLabel = user?.role || ROLES.PRESIDENT;
  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : roleLabel === ROLES.SECRETARY
    ? 'Léa Moreau'
    : 'Emma Martin';

  const basePath = location.pathname.startsWith('/secretaire')
    ? '/secretaire'
    : location.pathname.startsWith('/presidente')
    ? '/presidente'
    : '/president';

  const pendingCount = readPendingRequestsCount();
  const sidebarItems = buildSidebarItems(basePath, roleLabel, pendingCount);

  const activeItem =
    sidebarItems.find((item) => location.pathname.startsWith(item.to)) ||
    sidebarItems[0];

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/connexion', { replace: true });
  };

  return (
    <div className="management-layout" data-node-id="2:59170">
      {/* Navigation latérale Bureau (2:59171 / 2:59785) */}
      <aside
        className="management-layout__sidebar"
        aria-label="Navigation espace gestion"
        data-node-id="2:59171"
      >
        {/* Identité Agora (2:59172) */}
        <Link
          to="/"
          className="management-layout__brand"
          data-node-id="2:59172"
        >
          <span
            className="management-layout__brand-symbol"
            data-node-id="2:59173"
          >
            <img
              src={sparklesIcon}
              alt=""
              className="management-layout__brand-icon"
            />
          </span>
          <span
            className="management-layout__brand-name"
            data-node-id="2:59175"
          >
            agora
          </span>
          <span
            className="management-layout__brand-campus"
            data-node-id="2:59176"
          >
            LYON 2
          </span>
        </Link>

        {/* Sous-titre université (2:59177) */}
        <p className="management-layout__university" data-node-id="2:59177">
          Université Lumière Lyon 2 · 2026–2027
        </p>

        {/* Libellé section (2:59178) */}
        <p className="management-layout__section-label" data-node-id="2:59178">
          ESPACE GESTION
        </p>

        {/* Liens de navigation (2:59179 - 2:59194) */}
        <nav className="management-layout__nav">
          {sidebarItems.map((item) => {
            const IconComponent = item.Icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `management-layout__nav-link ${
                    isActive ? 'management-layout__nav-link--active' : ''
                  }`
                }
              >
                <span className="management-layout__nav-icon">
                  <IconComponent />
                </span>
                <span className="management-layout__nav-text">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Pied de barre latérale (2:59197 - 2:59201) */}
        <div className="management-layout__sidebar-footer">
          <span
            className="management-layout__contact-link"
            data-node-id="2:59197"
          >
            Contacter le bureau ↗
          </span>

          <p className="management-layout__user-name" data-node-id="2:59198">
            {fullName}
          </p>

          <span
            className="management-layout__role-chip"
            data-node-id="2:59199"
          >
            {roleLabel}
          </span>

          <button
            type="button"
            className="management-layout__logout-btn"
            onClick={handleLogout}
            data-node-id="2:59201"
          >
            ↪ Se déconnecter
          </button>
        </div>
      </aside>

      {/* Colonne principale Contenu (2:59202 / 2:59334) */}
      <div className="management-layout__main" data-node-id="2:59202">
        {/* Barre de navigation supérieure (2:59203 Bureau / 2:59335 Mobile) */}
        <header className="management-layout__topbar" data-node-id="2:59203">
          {/* Fil d'Ariane Bureau (2:59204) */}
          <p className="management-layout__breadcrumb" data-node-id="2:59204">
            {activeItem.breadcrumb}
          </p>

          {/* Identité Agora Mobile (2:59336) */}
          <Link
            to="/"
            className="management-layout__mobile-brand"
            data-node-id="2:59336"
          >
            <span className="management-layout__brand-symbol">
              <img
                src={sparklesIcon}
                alt=""
                className="management-layout__brand-icon"
              />
            </span>
            <span className="management-layout__brand-name">agora</span>
            <span className="management-layout__brand-campus">LYON 2</span>
          </Link>

          {/* Outils barre supérieure (2:59205 / 2:59341) */}
          <div className="management-layout__tools" data-node-id="2:59205">
            {/* Sélecteur de thème (2:59206) */}
            <div
              className="management-layout__theme-switch"
              role="group"
              aria-label="Sélecteur de thème"
              data-node-id="2:59206"
            >
              <button
                type="button"
                className={`management-layout__theme-btn ${
                  theme === 'light'
                    ? 'management-layout__theme-btn--active'
                    : ''
                }`}
                onClick={() => setTheme('light')}
                aria-label="Thème clair"
                aria-pressed={theme === 'light'}
                data-node-id="2:59207"
              >
                <img
                  src={sunIcon}
                  alt=""
                  className="management-layout__theme-icon"
                />
              </button>
              <button
                type="button"
                className={`management-layout__theme-btn ${
                  theme === 'dark'
                    ? 'management-layout__theme-btn--active'
                    : ''
                }`}
                onClick={() => setTheme('dark')}
                aria-label="Thème sombre"
                aria-pressed={theme === 'dark'}
                data-node-id="2:59209"
              >
                <img
                  src={moonIcon}
                  alt=""
                  className="management-layout__theme-icon"
                />
              </button>
            </div>

            {/* Icône notification Bureau (2:63276) */}
            <span
              className="management-layout__bell"
              aria-hidden="true"
              data-node-id="2:63276"
            >
              <img
                src={bellIcon}
                alt=""
                className="management-layout__bell-icon"
              />
            </span>

            {/* Puce de rôle Bureau (2:59212) */}
            <span
              className="management-layout__role-chip management-layout__role-chip--topbar"
              data-node-id="2:59212"
            >
              {roleLabel}
            </span>

            {/* Bouton Menu Mobile (2:63312) */}
            <button
              type="button"
              className="management-layout__mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={
                mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
              }
              aria-expanded={mobileMenuOpen}
              data-node-id="2:63312"
            >
              <img
                src={mobileMenuOpen ? closeIcon : menuIcon}
                alt=""
                className="management-layout__mobile-menu-icon"
              />
            </button>
          </div>
        </header>

        {/* Tiroir de menu Mobile (pour accéder à Membres, Annonces, Trésorerie et Déconnexion sur mobile) */}
        {mobileMenuOpen && (
          <div className="management-layout__mobile-drawer">
            <div className="management-layout__mobile-drawer-user">
              <span className="management-layout__user-name">{fullName}</span>
              <span className="management-layout__role-chip">{roleLabel}</span>
            </div>

            <nav
              className="management-layout__mobile-drawer-nav"
              aria-label="Navigation mobile complète"
            >
              {sidebarItems.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `management-layout__nav-link ${
                        isActive ? 'management-layout__nav-link--active' : ''
                      }`
                    }
                  >
                    <span className="management-layout__nav-icon">
                      <IconComponent />
                    </span>
                    <span className="management-layout__nav-text">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="management-layout__mobile-drawer-footer">
              <span className="management-layout__contact-link">
                Contacter le bureau ↗
              </span>
              <button
                type="button"
                className="management-layout__logout-btn"
                onClick={handleLogout}
              >
                ↪ Se déconnecter
              </button>
            </div>
          </div>
        )}

        {/* Corps de page (2:59214 Bureau / 2:59348 Mobile) */}
        <main className="management-layout__body" data-node-id="2:59214">
          <Outlet />
        </main>

        {/* Navigation mobile inférieure à 4 destinations (2:59463 / 2:60035) :
            Accueil, Demandes, Événements, Menu */}
        <nav
          className="management-layout__mobile-bottom-nav"
          aria-label="Navigation mobile"
          data-node-id="2:59463"
        >
          {sidebarItems
            .filter((item) => item.inMobileBar)
            .map((item) => {
              const IconComponent = item.Icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `management-layout__mobile-dest ${
                      isActive ? 'management-layout__mobile-dest--active' : ''
                    }`
                  }
                >
                  <span className="management-layout__mobile-dest-icon">
                    <IconComponent />
                  </span>
                  <span className="management-layout__mobile-dest-label">
                    {item.mobileLabel}
                  </span>
                </NavLink>
              );
            })}

          <button
            type="button"
            className={`management-layout__mobile-dest management-layout__mobile-dest--btn ${
              mobileMenuOpen ? 'management-layout__mobile-dest--active' : ''
            }`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            data-node-id="2:59473"
          >
            <span className="management-layout__mobile-dest-icon">
              <MenuBottomIcon />
            </span>
            <span className="management-layout__mobile-dest-label">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default ManagementLayout;
