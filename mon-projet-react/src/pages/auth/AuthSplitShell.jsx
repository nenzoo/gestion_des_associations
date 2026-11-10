import { Link } from 'react-router-dom';
import { getTrustAvatars } from '../../services/authService';
import sparklesIcon from '../../assets/icons/sparkles.svg';
import authCampusImg from '../../assets/images/auth-campus.png';
import './AuthPages.css';

function AuthSplitShell({ children }) {
  const trustAvatars = getTrustAvatars();

  return (
    <div className="auth-page">
      {/* Navigation (2:58399 / 2:58203 / 2:58312) */}
      <header className="auth-header">
        <Link to="/" className="auth-header__brand">
          <span className="auth-header__logo-symbol">
            <img
              src={sparklesIcon}
              alt=""
              className="auth-header__logo-icon"
            />
          </span>
          <span className="auth-header__logo-text">agora</span>
          <span className="auth-header__logo-campus">LYON 2</span>
        </Link>

        <Link to="/" className="auth-header__back-link">
          ← Retour à l’accueil
        </Link>
      </header>

      {/* Accès Agora (2:58406 / 2:58210 / 2:58319) */}
      <main className="auth-main">
        {/* Colonne gauche Desktop : Esprit campus */}
        <aside className="auth-campus">
          <span className="auth-campus__badge">
            L’ASSOCIATION QUI VOUS RASSEMBLE
          </span>

          <h1 className="auth-campus__title">
            <span className="auth-campus__title-line">Moins de démarches.</span>
            <span className="auth-campus__title-line">
              Plus de vie étudiante.
            </span>
          </h1>

          <p className="auth-campus__description">
            Vos rencontres, vos projets, votre campus. Tout commence avec Agora,
            à l’Université Lumière Lyon 2.
          </p>

          <div className="auth-campus__media">
            <img
              src={authCampusImg}
              alt="Vie étudiante à l'Université Lumière Lyon 2"
              className="auth-campus__image"
            />
          </div>

          <div className="auth-campus__trust">
            {trustAvatars.map((initials) => (
              <span key={initials} className="auth-campus__avatar">
                {initials}
              </span>
            ))}
            <p className="auth-campus__trust-text">
              248 étudiants font déjà partie de l’aventure.
            </p>
          </div>
        </aside>

        {/* Colonne droite : Carte Formulaire / Confirmation */}
        <section className="auth-card">{children}</section>
      </main>

      {/* Pied de page (2:58447 / 2:58261 / 2:58359) */}
      <footer className="auth-footer">
        <p className="auth-footer__text">
          © 2026 Agora · Confidentialité · Besoin d’aide ?
        </p>
      </footer>
    </div>
  );
}

export default AuthSplitShell;
