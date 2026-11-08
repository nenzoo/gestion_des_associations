import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import sparklesIcon from '../assets/icons/sparkles.svg';
import menuIcon from '../assets/icons/menu.svg';
import closeIcon from '../assets/icons/close.svg';
import './Navbar.css';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__logo-symbol">
            <img src={sparklesIcon} alt="" className="navbar__logo-icon" />
          </span>
          <span className="navbar__logo-text">agora</span>
          <span className="navbar__logo-campus">LYON 2</span>
        </Link>

        <nav className="navbar__links" aria-label="Navigation principale">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            L’association
          </NavLink>
          <NavLink
            to="/evenements"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Événements
          </NavLink>
          <Link to="/evenements#annonces" className="navbar__link">
            Annonces
          </Link>
          <Link to="/connexion" className="navbar__login-btn">
            Se connecter
          </Link>
        </nav>

        <button
          type="button"
          className="navbar__mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <img
            src={mobileMenuOpen ? closeIcon : menuIcon}
            alt=""
            className="navbar__mobile-toggle-icon"
          />
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="navbar__mobile-drawer" aria-label="Menu mobile">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
            }
            onClick={closeMenu}
          >
            L’association
          </NavLink>
          <NavLink
            to="/evenements"
            className={({ isActive }) =>
              `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
            }
            onClick={closeMenu}
          >
            Événements
          </NavLink>
          <Link
            to="/evenements#annonces"
            className="navbar__mobile-link"
            onClick={closeMenu}
          >
            Annonces
          </Link>
          <Link
            to="/connexion"
            className="navbar__login-btn navbar__login-btn--full"
            onClick={closeMenu}
          >
            Se connecter
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
