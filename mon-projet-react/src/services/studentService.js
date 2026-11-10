import {
  EVENT_CATEGORIES,
  PUBLIC_ANNOUNCEMENTS,
  PUBLIC_EVENTS,
} from '../data/publicMockData.js';
import {
  DEFAULT_STUDENT_PROFILE_TEMPLATE,
  INITIAL_REGISTRATIONS_BY_USER,
  INITIAL_STUDENT_PROFILES_BY_ID,
  STUDENT_REGISTRATION_LABELS,
  STUDENT_SECURITY_CONFIG,
} from '../data/studentMockData.js';
import { getCurrentUser } from './authService.js';

/**
 * Service de l'espace étudiant (simulation Frontend persistante).
 * Préparé pour le remplacement futur par les appels API Laravel :
 * - GET  /api/student/profile
 * - PUT  /api/student/profile
 * - PUT  /api/student/password
 * - GET  /api/student/registrations
 * - POST /api/student/events/{id}/register
 * - DELETE /api/student/events/{id}/register
 */

const SESSION_STORAGE_KEY = 'clubmanager_current_user';
const STUDENT_PROFILES_STORAGE_KEY = 'clubmanager_student_profiles';
const STUDENT_REGISTRATIONS_STORAGE_KEY = 'clubmanager_student_registrations';
const EVENT_SEATS_STORAGE_KEY = 'clubmanager_event_seats';
const PASSWORD_HASHES_STORAGE_KEY = 'clubmanager_student_password_hashes';

/**
 * Empreinte déterministe (non réversible / sans texte en clair) permettant de
 * vérifier la correspondance du mot de passe actuel même après un rechargement
 * de la page, sans jamais stocker aucun mot de passe en clair dans localStorage.
 */
function computePasswordDigest(rawPassword = '') {
  let h1 = 0xdeadbeef ^ rawPassword.length;
  let h2 = 0x41c6ce57 ^ rawPassword.length;

  for (let i = 0; i < rawPassword.length; i += 1) {
    const ch = rawPassword.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return `agdigest_${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}

function getPasswordHashesStore() {
  return readStorageJson(PASSWORD_HASHES_STORAGE_KEY, {});
}

function savePasswordHashesStore(store) {
  writeStorageJson(PASSWORD_HASHES_STORAGE_KEY, store);
}

function getExpectedPasswordDigestForUser(userKey) {
  const store = getPasswordHashesStore();
  if (userKey && store[userKey]) {
    return store[userKey];
  }
  return computePasswordDigest(
    STUDENT_SECURITY_CONFIG.expectedDemoPassword || '••••••••••••'
  );
}

function notifyUserUpdated() {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event('clubmanager:user-updated'));
    }
  } catch {
    // Ignore event dispatch errors in headless test environments
  }
}

function readStorageJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorageJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignorer les erreurs en environnement sans localStorage
  }
}

function computeInitials(firstName = '', lastName = '') {
  const firstInitial = (firstName.trim()[0] || '').toUpperCase();
  const lastInitial = (lastName.trim()[0] || '').toUpperCase();
  return `${firstInitial}${lastInitial}` || 'AG';
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

function getProfilesStore() {
  return readStorageJson(STUDENT_PROFILES_STORAGE_KEY, {
    ...INITIAL_STUDENT_PROFILES_BY_ID,
  });
}

function saveProfilesStore(store) {
  writeStorageJson(STUDENT_PROFILES_STORAGE_KEY, store);
}

function getRegistrationsStore() {
  return readStorageJson(STUDENT_REGISTRATIONS_STORAGE_KEY, {
    ...INITIAL_REGISTRATIONS_BY_USER,
  });
}

function saveRegistrationsStore(store) {
  writeStorageJson(STUDENT_REGISTRATIONS_STORAGE_KEY, store);
}

function getInitialEventSeatsMap() {
  const map = {};
  PUBLIC_EVENTS.forEach((evt) => {
    map[evt.id] = evt.remainingSeats;
  });
  return map;
}

function getEventSeatsStore() {
  const initialMap = getInitialEventSeatsMap();
  const stored = readStorageJson(EVENT_SEATS_STORAGE_KEY, null);
  return stored ? { ...initialMap, ...stored } : initialMap;
}

function saveEventSeatsStore(store) {
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, store);
}

function getActiveUserKey(sessionUser) {
  if (!sessionUser) {
    return null;
  }
  return sessionUser.id || sessionUser.email?.toLowerCase() || 'usr-session';
}

function buildProfileForUser(sessionUser, storedProfile) {
  const baseTemplate =
    INITIAL_STUDENT_PROFILES_BY_ID[sessionUser.id] ||
    DEFAULT_STUDENT_PROFILE_TEMPLATE;

  const firstName =
    storedProfile?.firstName || sessionUser.firstName || 'Manon';
  const lastName =
    storedProfile?.lastName || sessionUser.lastName || 'Laurent';
  const email =
    storedProfile?.email || sessionUser.email || 'manon.laurent@univ-lyon2.fr';
  // Le numéro étudiant reste strictement en lecture seule à partir du compte initial
  const studentNumber =
    baseTemplate.studentNumber || sessionUser.studentNumber || '22610482';
  const studyTrack =
    storedProfile?.studyTrack ||
    sessionUser.studyTrack ||
    baseTemplate.studyTrack;
  const role = sessionUser.role || baseTemplate.role;
  const membershipStatus =
    sessionUser.membershipStatus || baseTemplate.membershipStatus;

  return {
    id: sessionUser.id || 'usr-session',
    firstName,
    lastName,
    initials: computeInitials(firstName, lastName),
    email,
    studentNumber,
    studyTrack,
    role,
    membershipStatus,
    membership: {
      ...baseTemplate.membership,
      ...(storedProfile?.membership || {}),
      membershipStatus,
    },
    security: {
      ...baseTemplate.security,
      ...(storedProfile?.security || {}),
    },
  };
}

/**
 * Récupère le profil complet de l'étudiant actuellement connecté.
 * Retourne null si aucun utilisateur n'est connecté.
 */
export function getStudentProfile() {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return null;
  }

  const userKey = getActiveUserKey(sessionUser);
  const profilesStore = getProfilesStore();
  const storedProfile = profilesStore[userKey] || null;

  return buildProfileForUser(sessionUser, storedProfile);
}

/**
 * Met à jour les informations personnelles de l'étudiant connecté
 * (Prénom, Nom, E-mail universitaire, Formation).
 * Le numéro étudiant est protégé en lecture seule.
 * Synchronise également `clubmanager_current_user` pour actualiser `StudentLayout`.
 */
export function updateStudentProfile(formData = {}) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return {
      ok: false,
      error: 'Session expirée. Reconnecte-toi pour modifier ton profil.',
    };
  }

  const cleanFirstName = (formData.firstName || '').trim();
  const cleanLastName = (formData.lastName || '').trim();
  const cleanEmail = (formData.email || '').trim();
  const cleanStudyTrack = (formData.studyTrack || '').trim();

  if (!cleanFirstName || !cleanLastName || !cleanEmail || !cleanStudyTrack) {
    return {
      ok: false,
      error:
        'Tous les champs (Prénom, Nom, E-mail universitaire et Formation) sont obligatoires.',
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleanEmail)) {
    return {
      ok: false,
      error: 'Saisis une adresse e-mail universitaire valide.',
    };
  }

  const currentProfile = getStudentProfile();
  const userKey = getActiveUserKey(sessionUser);
  const profilesStore = getProfilesStore();

  const updatedProfile = {
    ...currentProfile,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    initials: computeInitials(cleanFirstName, cleanLastName),
    email: cleanEmail,
    // Numéro étudiant figé en lecture seule
    studentNumber: currentProfile.studentNumber,
    studyTrack: cleanStudyTrack,
  };

  profilesStore[userKey] = updatedProfile;
  saveProfilesStore(profilesStore);

  // Synchroniser la session utilisateur courante pour que StudentLayout affiche le nouveau nom
  const updatedSessionUser = {
    ...sessionUser,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    email: cleanEmail,
    studyTrack: cleanStudyTrack,
  };
  writeStorageJson(SESSION_STORAGE_KEY, updatedSessionUser);
  if (typeof sessionUser === 'object') {
    sessionUser.firstName = cleanFirstName;
    sessionUser.lastName = cleanLastName;
    sessionUser.email = cleanEmail;
    sessionUser.studyTrack = cleanStudyTrack;
  }
  notifyUserUpdated();

  return {
    ok: true,
    profile: updatedProfile,
    message: 'Tes informations ont été mises à jour.',
  };
}

/**
 * Retourne la configuration et les textes d'aide de la page Sécurité.
 */
export function getStudentSecurityConfig() {
  const sessionUser = getCurrentUser();
  const userKey = getActiveUserKey(sessionUser);
  const store = getPasswordHashesStore();
  const hasCustomPassword = Boolean(userKey && store[userKey]);

  return {
    ...STUDENT_SECURITY_CONFIG,
    hasCustomPassword,
  };
}

/**
 * Valide et simule le changement de mot de passe de l'étudiant connecté.
 * Aucun mot de passe en clair n'est stocké dans localStorage : seule une empreinte
 * hachée (`agdigest_...`) est persistée dans `clubmanager_student_password_hashes`
 * afin que le nouveau mot de passe reste reconnu après rechargement de la page.
 */
export function updateStudentPassword({
  currentPassword = '',
  newPassword = '',
  confirmPassword = '',
} = {}) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return {
      ok: false,
      error:
        'Session expirée. Reconnecte-toi pour modifier ton mot de passe.',
    };
  }

  if (!currentPassword.trim()) {
    return {
      ok: false,
      field: 'currentPassword',
      error: 'Saisis ton mot de passe actuel.',
    };
  }

  const userKey = getActiveUserKey(sessionUser);
  const expectedDigest = getExpectedPasswordDigestForUser(userKey);
  const submittedCurrentDigest = computePasswordDigest(currentPassword);

  if (submittedCurrentDigest !== expectedDigest) {
    return {
      ok: false,
      field: 'currentPassword',
      error:
        STUDENT_SECURITY_CONFIG.invalidCurrentPasswordErrorText ||
        'Le mot de passe actuel est incorrect.',
    };
  }

  // Règle Figma 2:58903 : "12 caractères minimum, une majuscule et un chiffre."
  const hasMinLength =
    newPassword.length >= STUDENT_SECURITY_CONFIG.minPasswordLength;
  const hasUppercase = /[A-ZÀ-ÖØ-Þ]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);

  if (!hasMinLength || !hasUppercase || !hasDigit) {
    return {
      ok: false,
      field: 'newPassword',
      error: STUDENT_SECURITY_CONFIG.passwordRequirementHint,
    };
  }

  // Règle Figma 2:58909 : "Les mots de passe ne correspondent pas."
  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      field: 'confirmPassword',
      error: STUDENT_SECURITY_CONFIG.mismatchErrorText,
    };
  }

  // Persister uniquement l'empreinte hachée (aucun mot de passe en clair dans localStorage)
  const hashesStore = getPasswordHashesStore();
  hashesStore[userKey] = computePasswordDigest(newPassword);
  savePasswordHashesStore(hashesStore);

  // Mettre à jour uniquement la date de dernière modification
  const currentProfile = getStudentProfile();
  const profilesStore = getProfilesStore();

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const updatedProfile = {
    ...currentProfile,
    security: {
      ...currentProfile.security,
      lastPasswordUpdate: formattedDate,
    },
  };

  profilesStore[userKey] = updatedProfile;
  saveProfilesStore(profilesStore);

  return {
    ok: true,
    lastPasswordUpdate: formattedDate,
    message: 'Ton mot de passe a bien été mis à jour.',
  };
}

/**
 * Retourne la liste des identifiants d'événements auxquels l'étudiant connecté est inscrit.
 */
export function getRegisteredEventIdsForCurrentUser() {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return [];
  }
  const userKey = getActiveUserKey(sessionUser);
  const registrationsStore = getRegistrationsStore();

  if (Array.isArray(registrationsStore[userKey])) {
    return [...registrationsStore[userKey]];
  }

  const initialForId = INITIAL_REGISTRATIONS_BY_USER[sessionUser.id] || [];
  return [...initialForId];
}

/**
 * Enrichit chaque événement de `PUBLIC_EVENTS` avec le compteur de places restantes persistant
 * et l'état d'inscription de l'étudiant connecté, sans jamais muter `PUBLIC_EVENTS`.
 */
export function getEventsWithRegistrationState({
  category = 'all',
  search = '',
} = {}) {
  const seatsStore = getEventSeatsStore();
  const registeredIds = new Set(getRegisteredEventIdsForCurrentUser());
  const normalizedSearch = search.trim().toLowerCase();

  return PUBLIC_EVENTS.map((event) => {
    const currentRemainingSeats =
      seatsStore[event.id] !== undefined
        ? seatsStore[event.id]
        : event.remainingSeats;
    const isRegistered = registeredIds.has(event.id);
    const isCancelled = Boolean(event.status === 'ANNULE' || event.isCancelled);
    const isFull = currentRemainingSeats <= 0;

    return {
      ...event,
      remainingSeats: currentRemainingSeats,
      remainingSeatsText: formatRemainingSeatsText(currentRemainingSeats),
      isRegistered,
      isCancelled,
      isFull,
      confirmedBadgeLabel: STUDENT_REGISTRATION_LABELS.confirmedBadge,
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

/**
 * Retourne les inscriptions confirmées et les suggestions d'événements pour la page
 * "Mes inscriptions" (2:58975 & 2:59079).
 */
export function getStudentRegistrationsOverview() {
  const allEvents = getEventsWithRegistrationState();
  const confirmedEvents = allEvents.filter((event) => event.isRegistered);
  const suggestedEvents = allEvents.filter(
    (event) => !event.isRegistered && !event.isCancelled && !event.isFull
  );

  return {
    confirmedCount: confirmedEvents.length,
    confirmedEvents,
    suggestedEvents,
    labels: { ...STUDENT_REGISTRATION_LABELS },
  };
}

/**
 * Inscrit l'étudiant connecté à un événement :
 * - Empêche les inscriptions en double
 * - Empêche l'inscription à un événement complet ou annulé
 * - Décrémente de 1 le compteur de places restantes persistant
 */
export function registerForEvent(eventId) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return {
      ok: false,
      error: 'Connecte-toi pour t’inscrire à un événement.',
    };
  }

  const targetEvent = PUBLIC_EVENTS.find((evt) => evt.id === eventId);
  if (!targetEvent) {
    return {
      ok: false,
      error: 'Événement introuvable.',
    };
  }

  if (targetEvent.status === 'ANNULE' || targetEvent.isCancelled) {
    return {
      ok: false,
      error: 'Cet événement est annulé, les inscriptions sont fermées.',
    };
  }

  const userKey = getActiveUserKey(sessionUser);
  const registrationsStore = getRegistrationsStore();
  const currentUserRegistrations = Array.isArray(registrationsStore[userKey])
    ? [...registrationsStore[userKey]]
    : [...(INITIAL_REGISTRATIONS_BY_USER[sessionUser.id] || [])];

  if (currentUserRegistrations.includes(eventId)) {
    return {
      ok: false,
      error: 'Tu es déjà inscrit(e) à cet événement.',
    };
  }

  const seatsStore = getEventSeatsStore();
  const currentSeats =
    seatsStore[eventId] !== undefined
      ? seatsStore[eventId]
      : targetEvent.remainingSeats;

  if (currentSeats <= 0) {
    return {
      ok: false,
      error: 'Cet événement est complet.',
    };
  }

  const updatedRegistrations = [...currentUserRegistrations, eventId];
  registrationsStore[userKey] = updatedRegistrations;
  saveRegistrationsStore(registrationsStore);

  const updatedSeats = currentSeats - 1;
  seatsStore[eventId] = updatedSeats;
  saveEventSeatsStore(seatsStore);

  return {
    ok: true,
    eventId,
    remainingSeats: updatedSeats,
    remainingSeatsText: formatRemainingSeatsText(updatedSeats),
    message: `Ton inscription à « ${targetEvent.title} » est confirmée.`,
  };
}

/**
 * Annule l'inscription de l'étudiant connecté à un événement :
 * - Empêche la désinscription si aucune inscription n'existe
 * - Incrémente de 1 le compteur de places restantes persistant
 */
export function cancelEventRegistration(eventId) {
  const sessionUser = getCurrentUser();
  if (!sessionUser) {
    return {
      ok: false,
      error: 'Connecte-toi pour gérer tes inscriptions.',
    };
  }

  const targetEvent = PUBLIC_EVENTS.find((evt) => evt.id === eventId);
  if (!targetEvent) {
    return {
      ok: false,
      error: 'Événement introuvable.',
    };
  }

  const userKey = getActiveUserKey(sessionUser);
  const registrationsStore = getRegistrationsStore();
  const currentUserRegistrations = Array.isArray(registrationsStore[userKey])
    ? [...registrationsStore[userKey]]
    : [...(INITIAL_REGISTRATIONS_BY_USER[sessionUser.id] || [])];

  if (!currentUserRegistrations.includes(eventId)) {
    return {
      ok: false,
      error: 'Aucune inscription active trouvée pour cet événement.',
    };
  }

  const updatedRegistrations = currentUserRegistrations.filter(
    (id) => id !== eventId
  );
  registrationsStore[userKey] = updatedRegistrations;
  saveRegistrationsStore(registrationsStore);

  const seatsStore = getEventSeatsStore();
  const currentSeats =
    seatsStore[eventId] !== undefined
      ? seatsStore[eventId]
      : targetEvent.remainingSeats;
  const updatedSeats = currentSeats + 1;
  seatsStore[eventId] = updatedSeats;
  saveEventSeatsStore(seatsStore);

  return {
    ok: true,
    eventId,
    remainingSeats: updatedSeats,
    remainingSeatsText: formatRemainingSeatsText(updatedSeats),
    message: `Ton inscription à « ${targetEvent.title} » a été annulée.`,
  };
}

export function getStudentEventCategories() {
  return EVENT_CATEGORIES;
}

export function getStudentAnnouncements() {
  return PUBLIC_ANNOUNCEMENTS;
}
