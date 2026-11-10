import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import sparklesIcon from '../assets/icons/sparkles.svg';
import sunIcon from '../assets/icons/sun.svg';
import moonIcon from '../assets/icons/moon.svg';
import bellIcon from '../assets/icons/bell.svg';
import menuIcon from '../assets/icons/menu.svg';
import closeIcon from '../assets/icons/close.svg';
import './StudentLayout.css';

const THEME_STORAGE_KEY = 'clubmanager_theme';

function UserRoundNavIcon() {
  return (
    <svg
      className="student-layout__nav-svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 9.75C11.0709 9.75 12.7496 8.07107 12.7496 6C12.7496 3.92893 11.0709 2.25 9 2.25C6.92914 2.25 5.25038 3.92893 5.25038 6C5.25038 8.07107 6.92914 9.75 9 9.75ZM9 9.75C10.5911 9.75 12.1171 10.3821 13.2422 11.5074C14.3673 12.6326 14.9994 14.1587 14.9994 15.75M9 9.75C7.40886 9.75 5.88289 10.3821 4.75778 11.5074C3.63268 12.6326 3.0006 14.1587 3.0006 15.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockKeyholeNavIcon() {
  return (
    <svg
      className="student-layout__nav-svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.25 7.49988V5.2497C5.25 4.25506 5.64509 3.30116 6.34835 2.59784C7.05161 1.89452 8.00544 1.4994 9 1.4994C9.99456 1.4994 10.9484 1.89452 11.6517 2.59784C12.3549 3.30116 12.75 4.25506 12.75 5.2497V7.49988M5.25 7.49988H3.75C2.92157 7.49988 2.25 8.17151 2.25 9V15.0005C2.25 15.829 2.92157 16.5006 3.75 16.5006H14.25C15.0784 16.5006 15.75 15.829 15.75 15.0005V9C15.75 8.17151 15.0784 7.49988 14.25 7.49988H12.75M5.25 7.49988H12.75M9.75 12.0002C9.75 12.4145 9.41421 12.7503 9 12.7503C8.58579 12.7503 8.25 12.4145 8.25 12.0002C8.25 11.586 8.58579 11.2502 9 11.2502C9.41421 11.2502 9.75 11.586 9.75 12.0002Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketNavIcon() {
  return (
    <svg
      className="student-layout__nav-svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9.75006 3.7494V5.24957M9.75006 3.7494H15.0005C15.3983 3.7494 15.7799 3.90745 16.0612 4.18879C16.3426 4.47013 16.5006 4.8517 16.5006 5.24957V6.74974C15.9038 6.74974 15.3315 6.98682 14.9095 7.40883C14.4875 7.83083 14.2504 8.40319 14.2504 9C14.2504 9.59681 14.4875 10.1692 14.9095 10.5912C15.3315 11.0132 15.9038 11.2503 16.5006 11.2503V12.7504C16.5006 13.1483 16.3426 13.5299 16.0612 13.8112C15.7799 14.0925 15.3983 14.2506 15.0005 14.2506H9.75006M9.75006 3.7494H2.99952C2.60166 3.7494 2.2201 3.90745 1.93877 4.18879C1.65745 4.47013 1.4994 4.8517 1.4994 5.24957V6.74974C2.09618 6.74974 2.66853 6.98682 3.09052 7.40883C3.51251 7.83083 3.74958 8.40319 3.74958 9C3.74958 9.59681 3.51251 10.1692 3.09052 10.5912C2.66853 11.0132 2.09618 11.2503 1.4994 11.2503V12.7504C1.4994 13.1483 1.65745 13.5299 1.93877 13.8112C2.2201 14.0925 2.60166 14.2506 2.99952 14.2506H9.75006M9.75006 12.7504V14.2506M9.75006 8.24991V9.75009"
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
      className="student-layout__nav-svg"
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

const SIDEBAR_ITEMS = [
  {
    to: '/etudiant/profil',
    label: 'Mon profil',
    mobileLabel: 'Profil',
    breadcrumb: 'Agora / Mon profil',
    Icon: UserRoundNavIcon,
    inMobileBar: true,
  },
  {
    to: '/etudiant/securite',
    label: 'Sécurité',
    mobileLabel: 'Sécurité',
    breadcrumb: 'Agora / Sécurité',
    Icon: LockKeyholeNavIcon,
    inMobileBar: true,
  },
  {
    to: '/etudiant/inscriptions',
    label: 'Mes inscriptions',
    mobileLabel: 'Inscriptions',
    breadcrumb: 'Agora / Mes inscriptions',
    Icon: TicketNavIcon,
    inMobileBar: true,
  },
  {
    to: '/etudiant/evenements',
    label: 'Événements',
    mobileLabel: 'Événements',
    breadcrumb: 'Agora / Événements',
    Icon: CalendarDaysNavIcon,
    inMobileBar: false,
  },
];

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

function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [theme, setTheme] = useState(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Manon Laurent';
  const roleLabel = user?.role || 'Membre';

  const activeItem =
    SIDEBAR_ITEMS.find((item) => location.pathname.startsWith(item.to)) ||
    SIDEBAR_ITEMS[0];

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/connexion', { replace: true });
  };

  return (
    <div className="student-layout" data-node-id="2:58659">
      {/* Navigation latérale Bureau (2:58660) */}
      <aside
        className="student-layout__sidebar"
        aria-label="Navigation espace membre"
        data-node-id="2:58660"
      >
        {/* Identité Agora (2:58661) */}
        <Link to="/" className="student-layout__brand" data-node-id="2:58661">
          <span
            className="student-layout__brand-symbol"
            data-node-id="2:58662"
          >
            <img
              src={sparklesIcon}
              alt=""
              className="student-layout__brand-icon"
            />
          </span>
          <span className="student-layout__brand-name" data-node-id="2:58664">
            agora
          </span>
          <span className="student-layout__brand-campus" data-node-id="2:58665">
            LYON 2
          </span>
        </Link>

        {/* Sous-titre université (2:58666) */}
        <p className="student-layout__university" data-node-id="2:58666">
          Université Lumière Lyon 2 · 2026–2027
        </p>

        {/* Libellé section (2:58667) */}
        <p className="student-layout__section-label" data-node-id="2:58667">
          ESPACE MEMBRE
        </p>

        {/* Liens de navigation (2:58668 - 2:58677) */}
        <nav className="student-layout__nav">
          {SIDEBAR_ITEMS.map((item) => {
            const IconComponent = item.Icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `student-layout__nav-link ${
                    isActive ? 'student-layout__nav-link--active' : ''
                  }`
                }
              >
                <span className="student-layout__nav-icon">
                  <IconComponent />
                </span>
                <span className="student-layout__nav-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Pied de barre latérale (2:58680 - 2:58684) */}
        <div className="student-layout__sidebar-footer">
          {/* Lien visuel reproduit fidèlement sans destination inventée (2:58680) */}
          <span
            className="student-layout__contact-link"
            data-node-id="2:58680"
          >
            Contacter le bureau ↗
          </span>

          <p className="student-layout__user-name" data-node-id="2:58681">
            {fullName}
          </p>

          <span className="student-layout__role-chip" data-node-id="2:58682">
            {roleLabel}
          </span>

          <button
            type="button"
            className="student-layout__logout-btn"
            onClick={handleLogout}
            data-node-id="2:58684"
          >
            ↪ Se déconnecter
          </button>
        </div>
      </aside>

      {/* Colonne principale Contenu (2:58685 / 2:58760) */}
      <div className="student-layout__main" data-node-id="2:58685">
        {/* Barre de navigation supérieure (2:58686 Bureau / 2:58761 Mobile) */}
        <header className="student-layout__topbar" data-node-id="2:58686">
          {/* Fil d'Ariane Bureau (2:58687) */}
          <p className="student-layout__breadcrumb" data-node-id="2:58687">
            {activeItem.breadcrumb}
          </p>

          {/* Identité Agora Mobile (2:58762) */}
          <Link
            to="/"
            className="student-layout__mobile-brand"
            data-node-id="2:58762"
          >
            <span className="student-layout__brand-symbol">
              <img
                src={sparklesIcon}
                alt=""
                className="student-layout__brand-icon"
              />
            </span>
            <span className="student-layout__brand-name">agora</span>
            <span className="student-layout__brand-campus">LYON 2</span>
          </Link>

          {/* Outils barre supérieure (2:58688 / 2:58767) */}
          <div className="student-layout__tools" data-node-id="2:58688">
            {/* Sélecteur de thème (2:58689) */}
            <div
              className="student-layout__theme-switch"
              role="group"
              aria-label="Sélecteur de thème"
              data-node-id="2:58689"
            >
              <button
                type="button"
                className={`student-layout__theme-btn ${
                  theme === 'light' ? 'student-layout__theme-btn--active' : ''
                }`}
                onClick={() => setTheme('light')}
                aria-label="Thème clair"
                aria-pressed={theme === 'light'}
                data-node-id="2:58690"
              >
                <img
                  src={sunIcon}
                  alt=""
                  className="student-layout__theme-icon"
                />
              </button>
              <button
                type="button"
                className={`student-layout__theme-btn ${
                  theme === 'dark' ? 'student-layout__theme-btn--active' : ''
                }`}
                onClick={() => setTheme('dark')}
                aria-label="Thème sombre"
                aria-pressed={theme === 'dark'}
                data-node-id="2:58692"
              >
                <img
                  src={moonIcon}
                  alt=""
                  className="student-layout__theme-icon"
                />
              </button>
            </div>

            {/* Icône notification Bureau (2:63081) — uniquement visuelle */}
            <span
              className="student-layout__bell"
              aria-hidden="true"
              data-node-id="2:63081"
            >
              <img
                src={bellIcon}
                alt=""
                className="student-layout__bell-icon"
              />
            </span>

            {/* Puce de rôle Bureau (2:58695) */}
            <span
              className="student-layout__role-chip student-layout__role-chip--topbar"
              data-node-id="2:58695"
            >
              {roleLabel}
            </span>

            {/* Bouton Menu Mobile (2:63096) */}
            <button
              type="button"
              className="student-layout__mobile-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={
                mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
              }
              aria-expanded={mobileMenuOpen}
              data-node-id="2:63096"
            >
              <img
                src={mobileMenuOpen ? closeIcon : menuIcon}
                alt=""
                className="student-layout__mobile-menu-icon"
              />
            </button>
          </div>
        </header>

        {/* Tiroir de menu Mobile (pour accéder à Événements, identité et déconnexion sur mobile) */}
        {mobileMenuOpen && (
          <div className="student-layout__mobile-drawer">
            <div className="student-layout__mobile-drawer-user">
              <span className="student-layout__user-name">{fullName}</span>
              <span className="student-layout__role-chip">{roleLabel}</span>
            </div>

            <nav
              className="student-layout__mobile-drawer-nav"
              aria-label="Navigation mobile secondaire"
            >
              {SIDEBAR_ITEMS.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `student-layout__nav-link ${
                        isActive ? 'student-layout__nav-link--active' : ''
                      }`
                    }
                  >
                    <span className="student-layout__nav-icon">
                      <IconComponent />
                    </span>
                    <span className="student-layout__nav-text">
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="student-layout__mobile-drawer-footer">
              <span className="student-layout__contact-link">
                Contacter le bureau ↗
              </span>
              <button
                type="button"
                className="student-layout__logout-btn"
                onClick={handleLogout}
              >
                ↪ Se déconnecter
              </button>
            </div>
          </div>
        )}

        {/* Corps de page (2:58697 Bureau / 2:58774 Mobile) */}
        <main className="student-layout__body" data-node-id="2:58697">
          <Outlet />
        </main>

        {/* Navigation mobile inférieure (2:58835) */}
        <nav
          className="student-layout__mobile-bottom-nav"
          aria-label="Navigation mobile"
          data-node-id="2:58835"
        >
          {SIDEBAR_ITEMS.filter((item) => item.inMobileBar).map((item) => {
            const IconComponent = item.Icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `student-layout__mobile-dest ${
                    isActive ? 'student-layout__mobile-dest--active' : ''
                  }`
                }
              >
                <span className="student-layout__mobile-dest-icon">
                  <IconComponent />
                </span>
                <span className="student-layout__mobile-dest-label">
                  {item.mobileLabel}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default StudentLayout;
