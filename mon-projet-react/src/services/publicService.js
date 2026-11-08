import {
  ASSOCIATION_STATS,
  EVENT_CATEGORIES,
  PUBLIC_ANNOUNCEMENTS,
  PUBLIC_EVENTS,
} from '../data/publicMockData';

/**
 * Service public préparé pour le remplacement futur par des appels API Laravel
 * (ex: GET /api/public/stats, GET /api/public/events, GET /api/public/announcements).
 */

export function getAssociationStats() {
  return ASSOCIATION_STATS;
}

export function getEventCategories() {
  return EVENT_CATEGORIES;
}

export function getPublicEvents({ category = 'all', search = '' } = {}) {
  const normalizedSearch = search.trim().toLowerCase();

  return PUBLIC_EVENTS.filter((event) => {
    const matchesCategory = category === 'all' || event.category === category;
    const matchesSearch =
      !normalizedSearch ||
      event.title.toLowerCase().includes(normalizedSearch) ||
      event.location.toLowerCase().includes(normalizedSearch) ||
      event.category.toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}

export function getHomeAnnouncements() {
  return PUBLIC_ANNOUNCEMENTS.filter((item) => item.featuredOnHome);
}

export function getPublicAnnouncements() {
  return PUBLIC_ANNOUNCEMENTS;
}
