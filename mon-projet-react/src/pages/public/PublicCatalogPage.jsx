import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import EventCard from '../../components/EventCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import {
  getEventCategories,
  getPublicAnnouncements,
  getPublicEvents,
} from '../../services/publicService';
import searchIcon from '../../assets/icons/search.svg';
import './PublicCatalogPage.css';

function PublicCatalogPage() {
  const location = useLocation();
  const categories = getEventCategories();
  const announcements = getPublicAnnouncements();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = getPublicEvents({
    category: selectedCategory,
    search: searchQuery,
  });

  useEffect(() => {
    if (location.hash === '#annonces') {
      const target = document.getElementById('annonces');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className="catalog-page">
      {/* Section 1 : La vie du campus — Événements (2:57978 & 2:58095) */}
      <section className="catalog-section">
        <div className="catalog-header">
          <p className="catalog-header__eyebrow">
            LE RENDEZ-VOUS DES ÉTUDIANTS DE LYON 2
          </p>
          <div className="catalog-header__presentation">
            <h1 className="catalog-header__title">Ton agenda, en mieux.</h1>
            <p className="catalog-header__subtitle">
              Événements, rencontres et nouvelles du campus. Ne rate rien de la
              vie d’Agora.
            </p>
          </div>
        </div>

        {/* Recherche et filtre mensuel (2:57985 & 2:58102) */}
        <div className="catalog-filters">
          <label className="catalog-search" htmlFor="catalog-search-input">
            <img
              src={searchIcon}
              alt=""
              className="catalog-search__icon"
            />
            <input
              id="catalog-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un événement"
              className="catalog-search__input"
            />
          </label>

          <button type="button" className="catalog-month-btn">
            Novembre 2026  ⌄
          </button>
        </div>

        {/* Catégories (2:57991 & 2:58108) */}
        <div
          className="catalog-categories"
          role="tablist"
          aria-label="Filtrer par catégorie"
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`catalog-category-pill ${
                  isActive ? 'catalog-category-pill--active' : ''
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grille des événements ouverts (2:58000 & 2:58117) */}
        <div className="catalog-events-grid">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actionLabel="Se connecter pour s’inscrire"
              actionTo="/connexion"
            />
          ))}
        </div>

        <p className="catalog-events-note">
          {filteredEvents.length} événement
          {filteredEvents.length > 1 ? 's' : ''} à venir · Les inscriptions sont
          réservées aux membres actifs.
        </p>

        {/* Section 2 : Fil des annonces (2:58053 & 2:58170) */}
        <div className="catalog-announcements" id="annonces">
          <div className="catalog-header__presentation">
            <h2 className="catalog-header__title">Les nouvelles du campus</h2>
            <p className="catalog-header__subtitle">
              Les dernières infos, directement du bureau.
            </p>
          </div>

          <div className="catalog-announcements-grid">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PublicCatalogPage;
