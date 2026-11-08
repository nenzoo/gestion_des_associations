import { useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../../components/EventCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import {
  getAssociationStats,
  getHomeAnnouncements,
  getPublicEvents,
} from '../../services/publicService';
import heroCampusImg from '../../assets/images/hero-campus.png';
import arrowUpRightIcon from '../../assets/icons/arrow-up-right.svg';
import heartIcon from '../../assets/icons/heart.svg';
import './HomePage.css';

function HomePage() {
  const stats = getAssociationStats();
  const events = getPublicEvents();
  const announcements = getHomeAnnouncements();

  const [activeSlide, setActiveSlide] = useState(0);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="home-page">
      {/* 1. Bienvenue chez Agora (Hero — 2:57731 & 2:57869) */}
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-hero__badge">UNIVERSITÉ LUMIÈRE LYON 2</span>

          <h1 className="home-hero__title">
            <span className="home-hero__title-line">Ta vie de campus,</span>
            <span className="home-hero__title-line">en plus grand.</span>
          </h1>

          <p className="home-hero__description">
            Des rencontres qui comptent. Des projets qui bougent. Rejoins Agora
            et fais de tes années étudiantes bien plus que des cours.
          </p>

          <Link to="/adhesion" className="home-hero__cta">
            <img
              src={arrowUpRightIcon}
              alt=""
              className="home-hero__cta-icon"
            />
            <span>Adhérer à l&apos;association</span>
          </Link>

          <p className="home-hero__subnote">
            Ouvert à tous les étudiants de Lyon 2 · Adhésion : 10 € / an
          </p>

          <div className="home-hero__community">
            <div className="home-hero__community-counter">248</div>
            <div className="home-hero__community-text">
              <p>étudiants, une même énergie.</p>
              <p>Et bientôt toi.</p>
            </div>
          </div>
        </div>

        <div className="home-hero__visual">
          <img
            src={heroCampusImg}
            alt="Rencontres étudiantes à Lyon"
            className="home-hero__image"
          />

          <div className="home-hero__floating-card">
            <div className="home-hero__floating-symbol">
              <img
                src={heartIcon}
                alt=""
                className="home-hero__floating-icon"
              />
            </div>
            <div className="home-hero__floating-message">
              <p className="home-hero__floating-title">
                Ton prochain souvenir commence ici.
              </p>
              <p className="home-hero__floating-subtitle">
                Culture, entraide &amp; belles rencontres
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Repères associatifs (2:57753 & 2:57891) */}
      <section className="home-stats" aria-label="Repères associatifs">
        {stats.map((stat) => (
          <div key={stat.id} className="home-stats__item">
            <p className="home-stats__value">{stat.value}</p>
            <p className="home-stats__label">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 3. Événements à venir (2:57763 & 2:57901) */}
      <section className="home-events" id="evenements">
        <div className="home-events__header">
          <div className="home-events__heading">
            <h2 className="home-events__title">On se retrouve où ?</h2>
            <p className="home-events__subtitle">
              Les prochains rendez-vous de ta communauté.
            </p>
          </div>

          <Link to="/evenements" className="home-events__all-link">
            Tous les événements →
          </Link>
        </div>

        {/* Vue Desktop : les 3 cartes côte à côte */}
        <div className="home-events__grid home-events__grid--desktop">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actionLabel="Découvrir"
              actionTo="/evenements"
            />
          ))}
        </div>

        {/* Vue Mobile : carte active du carrousel (fidèle à 2:57859) */}
        <div className="home-events__grid home-events__grid--mobile">
          {events[activeSlide] && (
            <EventCard
              event={events[activeSlide]}
              actionLabel="Découvrir"
              actionTo="/evenements"
            />
          )}
        </div>

        <div className="home-events__carousel-nav">
          <p className="home-events__dots" aria-label="Position du carrousel">
            {events
              .map((_, index) => (index === activeSlide ? '●' : '○'))
              .join('  ')}
          </p>

          <div className="home-events__arrows">
            <button
              type="button"
              className="home-events__arrow-btn"
              onClick={handlePrevSlide}
              aria-label="Événement précédent"
            >
              ←
            </button>
            <button
              type="button"
              className="home-events__arrow-btn"
              onClick={handleNextSlide}
              aria-label="Événement suivant"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* 4. Dernières annonces (2:57829 & 2:57932) */}
      <section className="home-announcements" id="annonces">
        <h2 className="home-announcements__title">La vie d’Agora</h2>

        <div className="home-announcements__grid">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      </section>

      {/* 5. Invitation à adhérer (2:57848 & 2:57952) */}
      <section className="home-invitation">
        <div className="home-invitation__message">
          <h2 className="home-invitation__title">
            Une place t’attend chez nous.
          </h2>
          <p className="home-invitation__subtitle">
            Quelques minutes pour adhérer. Toute une année pour partager.
          </p>
        </div>

        <Link to="/adhesion" className="home-invitation__btn">
          Adhérer à l&apos;association
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
