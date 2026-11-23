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
 * Synchronisé en lecture avec `clubmanager_event_seats`, `clubmanager_management_events`
 * et `clubmanager_management_announcements` afin que les places restantes, événements
 * et annonces soient toujours cohérents entre les espaces public, étudiant et gestion,
 * sans jamais modifier `PUBLIC_EVENTS` ou `PUBLIC_ANNOUNCEMENTS` dans `publicMockData.js`.
 */

const MANAGEMENT_EVENTS_STORAGE_KEY = 'clubmanager_management_events';
const MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY =
  'clubmanager_management_announcements';
const MANAGEMENT_MEMBERS_STORAGE_KEY = 'clubmanager_management_members';

function readStorageJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

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

function getActivePublishedEventsSource() {
  const stored = readStorageJson(MANAGEMENT_EVENTS_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter(
      (evt) =>
        evt &&
        typeof evt === 'object' &&
        evt.id &&
        evt.publicationStatus === 'Publié'
    );
  }
  return PUBLIC_EVENTS;
}

function getActiveAnnouncementsSource() {
  const stored = readStorageJson(MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((ann) => ann && typeof ann === 'object' && ann.id);
  }
  return PUBLIC_ANNOUNCEMENTS;
}

export function getAssociationStats() {
  const storedMembers = readStorageJson(MANAGEMENT_MEMBERS_STORAGE_KEY, null);
  if (!Array.isArray(storedMembers)) {
    return ASSOCIATION_STATS;
  }

  // Initialement 4 membres ACTIVE sur 5 dans INITIAL_ASSOCIATION_MEMBERS (correspondant à 248 membres)
  const activeCount = storedMembers.filter(
    (m) => m && m.badgeLabel === 'ACTIVE'
  ).length;
  const dynamicMembersTotal = Math.max(0, 248 + (activeCount - 4));

  return ASSOCIATION_STATS.map((stat) =>
    stat.id === 'stat-members'
      ? { ...stat, value: String(dynamicMembersTotal) }
      : stat
  );
}

export function getEventCategories() {
  return EVENT_CATEGORIES;
}

export function getPublicEvents({ category = 'all', search = '' } = {}) {
  const normalizedSearch = search.trim().toLowerCase();
  const sourceEvents = getActivePublishedEventsSource();

  return sourceEvents
    .map((event) => {
      const currentRemainingSeats = getSynchronizedEventSeats(
        event.id,
        event.remainingSeats
      );

      return {
        ...event,
        remainingSeats: currentRemainingSeats,
        remainingSeatsText: formatRemainingSeatsText(currentRemainingSeats),
      };
    })
    .filter((event) => {
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
  return getActiveAnnouncementsSource()
    .filter((item) => item.featuredOnHome !== false)
    .slice(0, 2);
}

export function getPublicAnnouncements() {
  return getActiveAnnouncementsSource();
}
