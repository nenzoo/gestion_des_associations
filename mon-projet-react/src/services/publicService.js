import {
  ASSOCIATION_STATS,
  EVENT_CATEGORIES,
  PUBLIC_ANNOUNCEMENTS,
  PUBLIC_EVENTS,
} from '../data/publicMockData.js';
import { getSynchronizedEventSeats } from './studentService.js';

/**
 * Service public préparé pour le remplacement futur par des appels API Laravel
 * (ex: GET /api/public/stats, GET /api/public/events, GET /api/public/announcements).
 *
 * Synchronisé en lecture avec `clubmanager_event_seats` via `getSynchronizedEventSeats()`
 * afin que les places restantes affichées sur la Landing Page (`/`) et le catalogue
 * public (`/evenements`) soient toujours cohérentes avec l'espace étudiant,
 * sans jamais modifier `PUBLIC_EVENTS` dans `publicMockData.js`.
 */

function formatRemainingSeatsText(seats) {
  const safeSeats = Math.max(0, Number(seats) || 0);
  if (safeSeats === 0) {
    return 'Complet';
  }
  if (safeSeats === 1) {
    return '1 place restante';
  }
  return `${safeSeats} places restantes`;
}

export function getAssociationStats() {
  return ASSOCIATION_STATS;
}

export function getEventCategories() {
  return EVENT_CATEGORIES;
}

export function getPublicEvents({ category = 'all', search = '' } = {}) {
  const normalizedSearch = search.trim().toLowerCase();

  return PUBLIC_EVENTS.map((event) => {
    const currentRemainingSeats = getSynchronizedEventSeats(
      event.id,
      event.remainingSeats
    );

    return {
      ...event,
      remainingSeats: currentRemainingSeats,
      remainingSeatsText: formatRemainingSeatsText(currentRemainingSeats),
    };
  }).filter((event) => {
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
