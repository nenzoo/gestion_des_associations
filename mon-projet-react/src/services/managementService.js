import { MEMBERSHIP_STATUS, MOCK_USERS, ROLES } from '../data/authMockData.js';
import {
  EVENT_CATEGORIES,
  PUBLIC_ANNOUNCEMENTS,
  PUBLIC_EVENTS,
} from '../data/publicMockData.js';
import {
  EVENT_START_DATES_BY_ID,
  INITIAL_REGISTRATIONS_BY_USER,
} from '../data/studentMockData.js';
import {
  ANNOUNCEMENT_PUBLICATION_STATUS,
  DASHBOARD_REFERENCE_METRICS,
  EVENT_CAPACITY_BY_ID,
  EVENT_PUBLICATION_STATUS,
  INITIAL_ASSOCIATION_MEMBERS,
  INITIAL_BOARD_ACTIVITY_FEED,
  INITIAL_DRAFT_EVENTS,
  INITIAL_MANAGEMENT_REQUESTS,
  INITIAL_MEMBERSHIP_DECISIONS,
  INITIAL_PAST_EVENTS,
  MEMBER_BADGE_STATUS,
  PROJECT_REFERENCE_DATE_ISO,
} from '../data/managementMockData.js';
import { getCurrentUser } from './authService.js';

/**
 * Service de l'espace Gestion (Présidence & Secrétariat).
 * Synchronisé en lecture et en écriture avec les données publiques (Jour 1)
 * et l'espace étudiant (Jour 2) sans jamais modifier `publicMockData.js`.
 */

const SESSION_STORAGE_KEY = 'clubmanager_current_user';
const LATEST_REQUEST_STORAGE_KEY = 'clubmanager_latest_membership_request';
const STUDENT_PROFILES_STORAGE_KEY = 'clubmanager_student_profiles';
const STUDENT_REGISTRATIONS_STORAGE_KEY = 'clubmanager_student_registrations';
const EVENT_SEATS_STORAGE_KEY = 'clubmanager_event_seats';

const MANAGEMENT_REQUESTS_STORAGE_KEY = 'clubmanager_management_requests';
const MANAGEMENT_DECISIONS_STORAGE_KEY = 'clubmanager_management_decisions';
const MANAGEMENT_MEMBERS_STORAGE_KEY = 'clubmanager_management_members';
const MANAGEMENT_EVENTS_STORAGE_KEY = 'clubmanager_management_events';
const MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY =
  'clubmanager_management_announcements';
const MANAGEMENT_ACTIVITY_FEED_STORAGE_KEY =
  'clubmanager_management_activity_feed';
const USER_STATUS_OVERRIDES_STORAGE_KEY = 'clubmanager_user_status_overrides';

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
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors in headless environments
  }
}

function notifyManagementUpdated() {
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window.dispatchEvent === 'function'
    ) {
      window.dispatchEvent(new Event('clubmanager:management-updated'));
      window.dispatchEvent(new Event('clubmanager:user-updated'));
    }
  } catch {
    // Ignore event dispatch errors
  }
}

function computeInitials(firstName = '', lastName = '') {
  const f = (String(firstName).trim()[0] || '').toUpperCase();
  const l = (String(lastName).trim()[0] || '').toUpperCase();
  return `${f}${l}` || 'AG';
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

function formatShortFrenchDate(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) {
    return '8 nov. 2026';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function getActorFullName() {
  const user = getCurrentUser();
  if (user && user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return 'Emma Martin';
}

function getActorFirstName() {
  const user = getCurrentUser();
  if (user && user.firstName) {
    return user.firstName;
  }
  return 'Emma';
}

function requireBoardManagerAccess() {
  const user = getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: 'Session expirée. Connecte-toi pour effectuer cette action.',
    };
  }
  if (
    user.role !== ROLES.PRESIDENT &&
    user.role !== ROLES.SECRETARY &&
    user.role !== ROLES.ADMIN
  ) {
    return {
      ok: false,
      error:
        'Action réservée à la présidence ou au secrétariat de l’association.',
    };
  }
  return { ok: true, user };
}

/* ==========================================================================
   1. Stores persistants et validation des données localStorage (Condition n°7)
   ========================================================================== */

export function getUserStatusOverridesStore() {
  const stored = readStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored)
    ? stored
    : {};
}

function saveUserStatusOverridesStore(store) {
  writeStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, store);
}

function setUserStatusOverride(email, patch) {
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!cleanEmail) {
    return;
  }
  const store = getUserStatusOverridesStore();
  store[cleanEmail] = {
    ...(store[cleanEmail] || {}),
    ...patch,
    email: cleanEmail,
  };
  saveUserStatusOverridesStore(store);

  // Si l'utilisateur modifié est actuellement en session, synchroniser sa session
  const currentUser = readStorageJson(SESSION_STORAGE_KEY, null);
  if (
    currentUser &&
    String(currentUser.email || '').toLowerCase() === cleanEmail
  ) {
    const updatedSession = {
      ...currentUser,
      ...patch,
    };
    writeStorageJson(SESSION_STORAGE_KEY, updatedSession);
  }
}

function getManagementRequestsStore() {
  const stored = readStorageJson(MANAGEMENT_REQUESTS_STORAGE_KEY, null);
  let list = Array.isArray(stored)
    ? stored.filter((item) => item && typeof item === 'object' && item.id)
    : [...INITIAL_MANAGEMENT_REQUESTS];

  // Intégrer également toute demande soumise depuis `/adhesion` si elle n'est pas déjà présente
  const latestSubmitted = readStorageJson(LATEST_REQUEST_STORAGE_KEY, null);
  if (
    latestSubmitted &&
    typeof latestSubmitted === 'object' &&
    latestSubmitted.email
  ) {
    const cleanEmail = String(latestSubmitted.email).trim().toLowerCase();
    const existsInRequests = list.some(
      (req) => String(req.email || '').toLowerCase() === cleanEmail
    );
    const existsInMembers = INITIAL_ASSOCIATION_MEMBERS.some(
      (m) => String(m.email || '').toLowerCase() === cleanEmail
    );
    if (
      !existsInRequests &&
      !existsInMembers &&
      latestSubmitted.status === MEMBERSHIP_STATUS.EN_ATTENTE
    ) {
      const dynamicReq = {
        id: latestSubmitted.id || `req-${cleanEmail}`,
        userId: `usr-${latestSubmitted.id || cleanEmail}`,
        firstName: latestSubmitted.firstName || 'Étudiant',
        lastName: latestSubmitted.lastName || 'test',
        initials: computeInitials(
          latestSubmitted.firstName,
          latestSubmitted.lastName
        ),
        email: latestSubmitted.email,
        studentNumber: latestSubmitted.studentNumber || '22610890',
        submittedAt: latestSubmitted.submittedAt || '2026-11-10',
        submittedAtLabel: formatShortFrenchDate(
          latestSubmitted.submittedAt || '2026-11-10'
        ),
        dashboardSubmittedLabel: `Reçue le ${formatShortFrenchDate(
          latestSubmitted.submittedAt || '2026-11-10'
        )}`,
        status: MEMBERSHIP_STATUS.EN_ATTENTE,
      };
      list = [dynamicReq, ...list];
    }
  }

  return list;
}

function saveManagementRequestsStore(list) {
  writeStorageJson(MANAGEMENT_REQUESTS_STORAGE_KEY, list);
}

function getManagementDecisionsStore() {
  const stored = readStorageJson(MANAGEMENT_DECISIONS_STORAGE_KEY, null);
  if (Array.isArray(stored)) {
    return stored.filter((item) => item && typeof item === 'object' && item.id);
  }
  return [...INITIAL_MEMBERSHIP_DECISIONS];
}

function saveManagementDecisionsStore(list) {
  writeStorageJson(MANAGEMENT_DECISIONS_STORAGE_KEY, list);
}

function getAssociationMembersStore() {
  const stored = readStorageJson(MANAGEMENT_MEMBERS_STORAGE_KEY, null);
  const baseList = Array.isArray(stored)
    ? stored.filter((item) => item && typeof item === 'object' && item.id)
    : [...INITIAL_ASSOCIATION_MEMBERS];

  // Synchroniser avec les éventuelles modifications de profil étudiant (Jour 2)
  const studentProfiles = readStorageJson(STUDENT_PROFILES_STORAGE_KEY, {});
  return baseList.map((member) => {
    const updatedProfile =
      studentProfiles && typeof studentProfiles === 'object'
        ? studentProfiles[member.id]
        : null;
    if (!updatedProfile) {
      return member;
    }
    return {
      ...member,
      firstName: updatedProfile.firstName || member.firstName,
      lastName: updatedProfile.lastName || member.lastName,
      email: updatedProfile.email || member.email,
    };
  });
}

function saveAssociationMembersStore(list) {
  writeStorageJson(MANAGEMENT_MEMBERS_STORAGE_KEY, list);
}

function getBoardActivityFeedStore() {
  const stored = readStorageJson(MANAGEMENT_ACTIVITY_FEED_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((item) => item && typeof item === 'object' && item.id);
  }
  return [...INITIAL_BOARD_ACTIVITY_FEED];
}

function saveBoardActivityFeedStore(list) {
  writeStorageJson(MANAGEMENT_ACTIVITY_FEED_STORAGE_KEY, list);
}

function prependBoardActivity(text, timeLabel = 'À l’instant') {
  const currentFeed = getBoardActivityFeedStore();
  const nextEntry = {
    id: `feed-${Date.now()}`,
    timeLabel,
    text,
  };
  const updated = [nextEntry, ...currentFeed];
  saveBoardActivityFeedStore(updated);
  return nextEntry;
}

/* ==========================================================================
   2. Événements et synchronisation des places (Conditions n°2, n°3, n°6, n°7)
   ========================================================================== */

function getInitialManagedEventsList() {
  const publishedFromPublic = PUBLIC_EVENTS.map((evt) => {
    const meta = EVENT_CAPACITY_BY_ID[evt.id] || {
      totalCapacity: Math.max(evt.remainingSeats, 30),
      dayNumber: '19',
      monthShort: 'NOV.',
      startIso: EVENT_START_DATES_BY_ID[evt.id] || '2026-11-19T19:00:00',
      description: '',
    };
    return {
      ...evt,
      totalCapacity: meta.totalCapacity,
      dayNumber: meta.dayNumber,
      monthShort: meta.monthShort,
      startIso: meta.startIso,
      description: meta.description,
      publicationStatus: EVENT_PUBLICATION_STATUS.PUBLISHED,
    };
  });

  return [
    ...publishedFromPublic,
    ...INITIAL_DRAFT_EVENTS,
    ...INITIAL_PAST_EVENTS,
  ];
}

function getManagedEventsStore() {
  const stored = readStorageJson(MANAGEMENT_EVENTS_STORAGE_KEY, null);
  if (!Array.isArray(stored) || stored.length === 0) {
    return getInitialManagedEventsList();
  }
  return stored.filter((item) => item && typeof item === 'object' && item.id);
}

function saveManagedEventsStore(list) {
  writeStorageJson(MANAGEMENT_EVENTS_STORAGE_KEY, list);
}

function getMaxSeatsForManagedEvent(event) {
  if (!event) {
    return 0;
  }
  if (
    Number.isFinite(Number(event.totalCapacity)) &&
    Number(event.totalCapacity) > 0
  ) {
    return Math.trunc(Number(event.totalCapacity));
  }
  const initialRegisteredCount = Object.values(
    INITIAL_REGISTRATIONS_BY_USER
  ).reduce(
    (acc, list) =>
      acc + (Array.isArray(list) && list.includes(event.id) ? 1 : 0),
    0
  );
  return Math.max(
    0,
    (Number(event.remainingSeats) || 0) + initialRegisteredCount
  );
}

function getSynchronizedSeatsMap(eventsList) {
  const storedSeats = readStorageJson(EVENT_SEATS_STORAGE_KEY, null);
  const safeStored =
    storedSeats && typeof storedSeats === 'object' && !Array.isArray(storedSeats)
      ? storedSeats
      : {};

  const map = {};
  eventsList.forEach((evt) => {
    const maxCapacity = getMaxSeatsForManagedEvent(evt);
    const fallbackSeats =
      evt.remainingSeats !== undefined ? evt.remainingSeats : maxCapacity;
    const rawValue =
      safeStored[evt.id] !== undefined ? safeStored[evt.id] : fallbackSeats;
    const parsed = Number(rawValue);
    const clamped = Number.isFinite(parsed)
      ? Math.max(0, Math.min(maxCapacity, Math.trunc(parsed)))
      : Math.max(0, Math.min(maxCapacity, Number(fallbackSeats) || 0));
    map[evt.id] = clamped;
  });

  return map;
}

function isEventInPast(event, referenceNowMs) {
  if (event.publicationStatus === EVENT_PUBLICATION_STATUS.PAST) {
    return true;
  }
  if (!event.startIso) {
    return false;
  }
  const startMs = new Date(event.startIso).getTime();
  if (Number.isNaN(startMs)) {
    return false;
  }
  return startMs < referenceNowMs;
}

/**
 * Retourne tous les événements publiés et actifs (pour synchronisation avec
 * `publicService.js` et `studentService.js`).
 */
export function getSynchronizedPublishedEvents({
  referenceDateIso = PROJECT_REFERENCE_DATE_ISO,
} = {}) {
  const referenceNowMs = new Date(referenceDateIso).getTime();
  const rawEvents = getManagedEventsStore();
  const seatsMap = getSynchronizedSeatsMap(rawEvents);

  return rawEvents
    .filter(
      (evt) =>
        evt.publicationStatus === EVENT_PUBLICATION_STATUS.PUBLISHED &&
        !isEventInPast(evt, referenceNowMs)
    )
    .map((evt) => {
      const totalCapacity = getMaxSeatsForManagedEvent(evt);
      const remainingSeats =
        seatsMap[evt.id] !== undefined ? seatsMap[evt.id] : evt.remainingSeats;
      const registeredCount = Math.max(0, totalCapacity - remainingSeats);

      return {
        ...evt,
        totalCapacity,
        remainingSeats,
        remainingSeatsText: formatRemainingSeatsText(remainingSeats),
        registeredCount,
        registrationGaugeText: `${registeredCount} / ${totalCapacity}`,
      };
    });
}

/* ==========================================================================
   3. Annonces synchronisées (Condition n°2 & n°3)
   ========================================================================== */

function getManagedAnnouncementsStore() {
  const stored = readStorageJson(MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored
      .filter((item) => item && typeof item === 'object' && item.id)
      .map((ann) => {
        const bodyText = String(ann.content ?? ann.excerpt ?? '');
        return {
          ...ann,
          content: bodyText,
          excerpt: bodyText,
        };
      });
  }
  return PUBLIC_ANNOUNCEMENTS.map((ann) => ({
    ...ann,
    content: ann.excerpt,
    excerpt: ann.excerpt,
    authorName: 'Léa Moreau',
    publicationStatus: ANNOUNCEMENT_PUBLICATION_STATUS.PUBLISHED,
    visibilityNote: 'Visible sur le site public et dans l’espace membre',
  }));
}

function saveManagedAnnouncementsStore(list) {
  writeStorageJson(MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY, list);
}

export function getSynchronizedAnnouncements() {
  return getManagedAnnouncementsStore();
}

/* ==========================================================================
   4. Demandes d'adhésion : Consultation, Acceptation, Refus (Condition n°1, n°4, n°7)
   ========================================================================== */

function computeActiveMembersTotalCount() {
  const members = getAssociationMembersStore();
  const initialActiveNonBoard = INITIAL_ASSOCIATION_MEMBERS.filter(
    (m) => m.badgeLabel === MEMBER_BADGE_STATUS.ACTIVE
  ).length;
  const currentActive = members.filter(
    (m) => m.badgeLabel === MEMBER_BADGE_STATUS.ACTIVE
  ).length;
  const delta = currentActive - initialActiveNonBoard;
  return Math.max(
    0,
    DASHBOARD_REFERENCE_METRICS.baseActiveMembersCount + delta
  );
}

function computeAcceptedRequestsTotalCount() {
  const decisions = getManagementDecisionsStore();
  const initialAcceptedCount = INITIAL_MEMBERSHIP_DECISIONS.filter(
    (d) => d.status === MEMBERSHIP_STATUS.ACCEPTEE
  ).length;
  const currentAcceptedCount = decisions.filter(
    (d) => d.status === MEMBERSHIP_STATUS.ACCEPTEE
  ).length;
  const delta = currentAcceptedCount - initialAcceptedCount;
  return Math.max(
    0,
    DASHBOARD_REFERENCE_METRICS.baseActiveMembersCount + delta
  );
}

function computeRefusedRequestsTotalCount() {
  const decisions = getManagementDecisionsStore();
  const initialRefusedCount = INITIAL_MEMBERSHIP_DECISIONS.filter(
    (d) => d.status === MEMBERSHIP_STATUS.REFUSEE
  ).length;
  const currentRefusedCount = decisions.filter(
    (d) => d.status === MEMBERSHIP_STATUS.REFUSEE
  ).length;
  const delta = currentRefusedCount - initialRefusedCount;
  return Math.max(
    0,
    DASHBOARD_REFERENCE_METRICS.baseRefusedRequestsCount + delta
  );
}

export function getMembershipRequestsView({
  tab = MEMBERSHIP_STATUS.EN_ATTENTE,
  search = '',
  sortOrder = 'oldest',
} = {}) {
  const requests = getManagementRequestsStore();
  const decisions = getManagementDecisionsStore();
  const normalizedSearch = String(search || '')
    .trim()
    .toLowerCase();

  const pendingRequests = requests.filter(
    (req) => req.status === MEMBERSHIP_STATUS.EN_ATTENTE
  );
  const acceptedDecisions = decisions.filter(
    (d) => d.status === MEMBERSHIP_STATUS.ACCEPTEE
  );
  const refusedDecisions = decisions.filter(
    (d) => d.status === MEMBERSHIP_STATUS.REFUSEE
  );

  let sourceItems = pendingRequests;
  if (tab === MEMBERSHIP_STATUS.ACCEPTEE) {
    sourceItems = acceptedDecisions;
  } else if (tab === MEMBERSHIP_STATUS.REFUSEE) {
    sourceItems = refusedDecisions;
  }

  const filteredItems = sourceItems
    .filter((item) => {
      if (!normalizedSearch) {
        return true;
      }
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      const email = String(item.email || '').toLowerCase();
      const number = String(item.studentNumber || '').toLowerCase();
      return (
        fullName.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        number.includes(normalizedSearch)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.processedAt || '2026-11-06').getTime();
      const dateB = new Date(b.submittedAt || b.processedAt || '2026-11-06').getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return {
    tab,
    items: filteredItems,
    pendingRequests,
    recentDecisions: decisions,
    counts: {
      pending: pendingRequests.length,
      accepted: computeAcceptedRequestsTotalCount(),
      refused: computeRefusedRequestsTotalCount(),
    },
  };
}

/**
 * Accepte une demande d'adhésion EN_ATTENTE :
 * - Vérifie que la demande existe et est toujours EN_ATTENTE (empêche les opérations répétées)
 * - Passe le statut métier à ACCEPTEE
 * - Synchronise le compte étudiant existant (sans créer de doublon)
 * - Met à jour l'annuaire des membres avec le badge visuel ACTIVE
 * - Ajoute l'entrée dans "Dernières décisions" et "Le fil du bureau"
 */
export function acceptMembershipRequest(requestId) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!requestId) {
    return {
      ok: false,
      error: 'Identifiant de demande manquant.',
    };
  }

  const requests = getManagementRequestsStore();
  const targetIndex = requests.findIndex((req) => req.id === requestId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: 'Demande d’adhésion introuvable.',
    };
  }

  const targetRequest = requests[targetIndex];
  if (targetRequest.status !== MEMBERSHIP_STATUS.EN_ATTENTE) {
    return {
      ok: false,
      error: 'Cette demande a déjà été traitée.',
    };
  }

  const actorFullName = getActorFullName();
  const actorFirstName = getActorFirstName();
  const processedAtIso = '2026-11-08';
  const processedAtLabel = '8 nov. 2026';

  // 1. Retirer des demandes en attente / marquer comme ACCEPTEE
  const updatedRequests = requests.map((req, idx) =>
    idx === targetIndex
      ? {
          ...req,
          status: MEMBERSHIP_STATUS.ACCEPTEE,
          processedBy: actorFullName,
          processedAt: processedAtIso,
          processedAtLabel,
        }
      : req
  );
  saveManagementRequestsStore(updatedRequests);

  // 2. Ajouter dans l'historique des dernières décisions
  const decisions = getManagementDecisionsStore();
  const newDecision = {
    id: `dec-${targetRequest.id}`,
    requestId: targetRequest.id,
    userId: targetRequest.userId || `usr-${targetRequest.id}`,
    firstName: targetRequest.firstName,
    lastName: targetRequest.lastName,
    email: targetRequest.email,
    studentNumber: targetRequest.studentNumber,
    status: MEMBERSHIP_STATUS.ACCEPTEE,
    processedBy: actorFullName,
    processedAt: processedAtIso,
    processedAtLabel,
    reason: '',
  };
  saveManagementDecisionsStore([
    newDecision,
    ...decisions.filter((d) => d.requestId !== targetRequest.id),
  ]);

  // 3. Synchroniser le compte étudiant existant et l'annuaire sans créer de doublon (Condition n°4)
  const cleanEmail = String(targetRequest.email || '')
    .trim()
    .toLowerCase();
  const existingMockUser = MOCK_USERS.find(
    (u) => String(u.email || '').toLowerCase() === cleanEmail
  );
  const resolvedUserId =
    existingMockUser?.id || targetRequest.userId || `usr-${targetRequest.id}`;

  const members = getAssociationMembersStore();
  const existingMemberIndex = members.findIndex(
    (m) =>
      m.id === resolvedUserId ||
      String(m.email || '').toLowerCase() === cleanEmail ||
      String(m.studentNumber || '') === String(targetRequest.studentNumber || '')
  );

  const synchronizedMember = {
    id:
      existingMemberIndex !== -1
        ? members[existingMemberIndex].id
        : resolvedUserId,
    firstName: targetRequest.firstName,
    lastName: targetRequest.lastName,
    email: targetRequest.email,
    studentNumber: targetRequest.studentNumber,
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
    badgeLabel: MEMBER_BADGE_STATUS.ACTIVE,
    isBoardAccount: false,
    revokedAtLabel: '',
    revocationReason: '',
  };

  let updatedMembers;
  if (existingMemberIndex !== -1) {
    updatedMembers = members.map((m, idx) =>
      idx === existingMemberIndex ? { ...m, ...synchronizedMember } : m
    );
  } else {
    updatedMembers = [synchronizedMember, ...members];
  }
  saveAssociationMembersStore(updatedMembers);

  // Synchroniser l'état d'authentification du compte étudiant
  setUserStatusOverride(cleanEmail, {
    id: synchronizedMember.id,
    firstName: synchronizedMember.firstName,
    lastName: synchronizedMember.lastName,
    studentNumber: synchronizedMember.studentNumber,
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
  });

  const latestReq = readStorageJson(LATEST_REQUEST_STORAGE_KEY, null);
  if (
    latestReq &&
    String(latestReq.email || '').toLowerCase() === cleanEmail
  ) {
    writeStorageJson(LATEST_REQUEST_STORAGE_KEY, {
      ...latestReq,
      status: MEMBERSHIP_STATUS.ACCEPTEE,
    });
  }

  // 4. Ajouter dans le fil du bureau
  prependBoardActivity(
    `${actorFirstName} a accepté l’adhésion de ${targetRequest.firstName}.`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    decision: newDecision,
    member: synchronizedMember,
    message: `L’adhésion de ${targetRequest.firstName} ${targetRequest.lastName} a été acceptée.`,
  };
}

/**
 * Refuse une demande d'adhésion EN_ATTENTE :
 * - Exige un motif de refus obligatoire (Figma 2:62004 : "Motif du refus *")
 * - Passe le statut métier à REFUSEE
 * - Synchronise le compte étudiant existant
 */
export function refuseMembershipRequest(requestId, reason = '') {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!requestId) {
    return {
      ok: false,
      error: 'Identifiant de demande manquant.',
    };
  }

  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    return {
      ok: false,
      field: 'reason',
      error: 'Le motif du refus est obligatoire.',
    };
  }

  const requests = getManagementRequestsStore();
  const targetIndex = requests.findIndex((req) => req.id === requestId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: 'Demande d’adhésion introuvable.',
    };
  }

  const targetRequest = requests[targetIndex];
  if (targetRequest.status !== MEMBERSHIP_STATUS.EN_ATTENTE) {
    return {
      ok: false,
      error: 'Cette demande a déjà été traitée.',
    };
  }

  const actorFullName = getActorFullName();
  const actorFirstName = getActorFirstName();
  const processedAtIso = '2026-11-08';
  const processedAtLabel = '8 nov. 2026';

  const updatedRequests = requests.map((req, idx) =>
    idx === targetIndex
      ? {
          ...req,
          status: MEMBERSHIP_STATUS.REFUSEE,
          processedBy: actorFullName,
          processedAt: processedAtIso,
          processedAtLabel,
          reason: cleanReason,
        }
      : req
  );
  saveManagementRequestsStore(updatedRequests);

  const decisions = getManagementDecisionsStore();
  const newDecision = {
    id: `dec-${targetRequest.id}`,
    requestId: targetRequest.id,
    userId: targetRequest.userId || `usr-${targetRequest.id}`,
    firstName: targetRequest.firstName,
    lastName: targetRequest.lastName,
    email: targetRequest.email,
    studentNumber: targetRequest.studentNumber,
    status: MEMBERSHIP_STATUS.REFUSEE,
    processedBy: actorFullName,
    processedAt: processedAtIso,
    processedAtLabel,
    reason: cleanReason,
  };
  saveManagementDecisionsStore([
    newDecision,
    ...decisions.filter((d) => d.requestId !== targetRequest.id),
  ]);

  const cleanEmail = String(targetRequest.email || '')
    .trim()
    .toLowerCase();
  setUserStatusOverride(cleanEmail, {
    firstName: targetRequest.firstName,
    lastName: targetRequest.lastName,
    studentNumber: targetRequest.studentNumber,
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.REFUSEE,
    membershipAccessStatus: null,
    refusalReason: cleanReason,
  });

  const latestReq = readStorageJson(LATEST_REQUEST_STORAGE_KEY, null);
  if (
    latestReq &&
    String(latestReq.email || '').toLowerCase() === cleanEmail
  ) {
    writeStorageJson(LATEST_REQUEST_STORAGE_KEY, {
      ...latestReq,
      status: MEMBERSHIP_STATUS.REFUSEE,
      reason: cleanReason,
    });
  }

  prependBoardActivity(
    `${actorFirstName} a refusé la demande de ${targetRequest.firstName}.`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    decision: newDecision,
    message: `La demande de ${targetRequest.firstName} ${targetRequest.lastName} a été refusée.`,
  };
}

/* ==========================================================================
   5. Annuaire des membres et révocation (Conditions n°1, n°5, n°7)
   ========================================================================== */

export function getAssociationMembersView({
  search = '',
  statusFilter = 'ALL',
} = {}) {
  const members = getAssociationMembersStore();
  const normalizedSearch = String(search || '')
    .trim()
    .toLowerCase();

  const filteredMembers = members.filter((member) => {
    const matchesStatus =
      statusFilter === 'ALL' || member.badgeLabel === statusFilter;
    if (!matchesStatus) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = String(member.email || '').toLowerCase();
    const studentNum = String(member.studentNumber || '').toLowerCase();
    return (
      fullName.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      studentNum.includes(normalizedSearch)
    );
  });

  const activeCount = computeActiveMembersTotalCount();
  const revokedCount = members.filter(
    (m) => m.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE
  ).length;

  return {
    members: filteredMembers,
    activeCount,
    revokedCount,
    totalDirectoryCount: activeCount + revokedCount,
    academicYearLabel: DASHBOARD_REFERENCE_METRICS.academicYearLabel,
  };
}

/**
 * Révoque l'adhésion d'un membre ordinaire (Figma 2:60186 & 2:62015) :
 * - Interdit la révocation des comptes du bureau (`isBoardAccount` ou rôle bureau)
 * - Exige un motif obligatoire ("Motif de la révocation *")
 * - Passe `revocationStatus` et `badgeLabel` à `REVOQUEE`
 * - Bloque l'accès du membre à l'espace étudiant
 * - Annule ses inscriptions aux événements à venir et libère les places correspondantes
 *   dans `clubmanager_event_seats` sans dépasser la capacité totale
 */
export function revokeAssociationMember(
  memberId,
  reason = '',
  { referenceDateIso = PROJECT_REFERENCE_DATE_ISO } = {}
) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!memberId) {
    return {
      ok: false,
      error: 'Identifiant du membre manquant.',
    };
  }

  const members = getAssociationMembersStore();
  const targetIndex = members.findIndex((m) => m.id === memberId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: 'Membre introuvable dans l’annuaire.',
    };
  }

  const targetMember = members[targetIndex];

  // Protection stricte des comptes du bureau (Condition n°5 & Figma 2:60186)
  if (
    targetMember.isBoardAccount ||
    targetMember.role === ROLES.PRESIDENT ||
    targetMember.role === ROLES.SECRETARY ||
    targetMember.role === ROLES.TREASURER ||
    targetMember.role === ROLES.ADMIN
  ) {
    return {
      ok: false,
      error:
        'Les mandats du bureau (Présidence nommée par l’administrateur, Secrétariat et Trésorerie nommés par la présidence) ne peuvent pas être révoqués via cette action.',
    };
  }

  if (
    targetMember.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE ||
    targetMember.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE
  ) {
    return {
      ok: false,
      error: 'Ce membre est déjà révoqué.',
    };
  }

  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    return {
      ok: false,
      field: 'reason',
      error: 'Le motif de la révocation est obligatoire.',
    };
  }

  const revokedAtLabel = 'Révoquée le 8 nov.';
  const updatedMember = {
    ...targetMember,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.REVOQUEE,
    badgeLabel: MEMBER_BADGE_STATUS.REVOQUEE,
    revokedAtLabel,
    revocationReason: cleanReason,
  };

  const updatedMembers = members.map((m, idx) =>
    idx === targetIndex ? updatedMember : m
  );
  saveAssociationMembersStore(updatedMembers);

  // Conserver membershipStatus: ACCEPTEE (décision historique) et passer membershipAccessStatus à REVOQUEE
  const cleanEmail = String(targetMember.email || '')
    .trim()
    .toLowerCase();
  setUserStatusOverride(cleanEmail, {
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.REVOQUEE,
    revocationReason: cleanReason,
  });

  // Annuler les inscriptions aux événements à venir de ce membre et libérer les places (Condition n°5)
  const referenceNowMs = new Date(referenceDateIso).getTime();
  const managedEvents = getManagedEventsStore();
  const seatsMap = getSynchronizedSeatsMap(managedEvents);

  const storedRegistrations = readStorageJson(
    STUDENT_REGISTRATIONS_STORAGE_KEY,
    null
  );
  const registrationsStore =
    storedRegistrations &&
    typeof storedRegistrations === 'object' &&
    !Array.isArray(storedRegistrations)
      ? { ...INITIAL_REGISTRATIONS_BY_USER, ...storedRegistrations }
      : { ...INITIAL_REGISTRATIONS_BY_USER };

  const candidateKeys = [targetMember.id, cleanEmail].filter(Boolean);
  const releasedEventIds = [];

  candidateKeys.forEach((key) => {
    const userEventIds = Array.isArray(registrationsStore[key])
      ? registrationsStore[key]
      : [];
    if (userEventIds.length === 0) {
      return;
    }

    const remainingPastIds = [];
    userEventIds.forEach((evtId) => {
      const evtObj =
        managedEvents.find((e) => e.id === evtId) ||
        PUBLIC_EVENTS.find((e) => e.id === evtId);

      if (!evtObj) {
        return;
      }

      const isUpcoming =
        !isEventInPast(evtObj, referenceNowMs) &&
        evtObj.publicationStatus !== EVENT_PUBLICATION_STATUS.CANCELLED &&
        evtObj.status !== 'ANNULE';

      if (isUpcoming && !releasedEventIds.includes(evtId)) {
        const maxSeats = getMaxSeatsForManagedEvent(evtObj);
        const currentSeats =
          seatsMap[evtId] !== undefined
            ? seatsMap[evtId]
            : evtObj.remainingSeats;
        seatsMap[evtId] = Math.min(maxSeats, currentSeats + 1);
        releasedEventIds.push(evtId);
      } else if (!isUpcoming) {
        remainingPastIds.push(evtId);
      }
    });

    registrationsStore[key] = remainingPastIds;
  });

  writeStorageJson(STUDENT_REGISTRATIONS_STORAGE_KEY, registrationsStore);
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, seatsMap);

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    `${actorFirstName} a révoqué l’adhésion de ${targetMember.firstName}.`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    member: updatedMember,
    releasedEventIds,
    message: `L’adhésion de ${targetMember.firstName} ${targetMember.lastName} a été révoquée.`,
  };
}

export function exportAssociationMembersCsv() {
  const { members } = getAssociationMembersView();
  const header = ['Nom complet', 'E-mail', 'Numéro étudiant', 'Rôle', 'Statut'];
  const rows = members.map((m) => [
    `${m.firstName} ${m.lastName}`,
    m.email,
    m.studentNumber,
    m.role,
    m.badgeLabel,
  ]);
  return [header, ...rows].map((row) => row.join(';')).join('\n');
}

/* ==========================================================================
   6. Gestion des événements : Consultation, Création, Édition, Suppression
   ========================================================================== */

export function getManagedEventsView({
  tab = 'UPCOMING',
  search = '',
  category = 'all',
  referenceDateIso = PROJECT_REFERENCE_DATE_ISO,
} = {}) {
  const referenceNowMs = new Date(referenceDateIso).getTime();
  const allEvents = getManagedEventsStore();
  const seatsMap = getSynchronizedSeatsMap(allEvents);
  const normalizedSearch = String(search || '')
    .trim()
    .toLowerCase();

  const enrichedEvents = allEvents.map((evt) => {
    const totalCapacity = getMaxSeatsForManagedEvent(evt);
    const remainingSeats =
      seatsMap[evt.id] !== undefined ? seatsMap[evt.id] : evt.remainingSeats;
    const registeredCount =
      evt.registeredCount !== undefined &&
      evt.publicationStatus === EVENT_PUBLICATION_STATUS.PAST
        ? evt.registeredCount
        : Math.max(0, totalCapacity - remainingSeats);

    const effectivelyPast = isEventInPast(evt, referenceNowMs);
    const effectiveTab =
      evt.publicationStatus === EVENT_PUBLICATION_STATUS.DRAFT
        ? 'DRAFTS'
        : effectivelyPast
        ? 'PAST'
        : 'UPCOMING';

    return {
      ...evt,
      totalCapacity,
      remainingSeats,
      remainingSeatsText: formatRemainingSeatsText(remainingSeats),
      registeredCount,
      registrationGaugeText: `${registeredCount} / ${totalCapacity}`,
      effectiveTab,
    };
  });

  const upcomingEvents = enrichedEvents.filter(
    (e) => e.effectiveTab === 'UPCOMING'
  );
  const draftEvents = enrichedEvents.filter((e) => e.effectiveTab === 'DRAFTS');
  const pastEvents = enrichedEvents.filter((e) => e.effectiveTab === 'PAST');

  let targetList = upcomingEvents;
  if (tab === 'DRAFTS') {
    targetList = draftEvents;
  } else if (tab === 'PAST') {
    targetList = pastEvents;
  }

  const filteredList = targetList.filter((evt) => {
    const matchesCategory = category === 'all' || evt.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return (
      String(evt.title || '')
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(evt.location || '')
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(evt.category || '')
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });

  const totalPastCount = Math.max(
    DASHBOARD_REFERENCE_METRICS.basePastEventsCount,
    pastEvents.length
  );

  return {
    tab,
    events: filteredList,
    upcomingEvents,
    draftEvents,
    pastEvents,
    categories: EVENT_CATEGORIES,
    counts: {
      upcoming: upcomingEvents.length,
      drafts: draftEvents.length,
      past: totalPastCount,
    },
  };
}

export function createManagedEvent(
  formData = {},
  {
    asDraft = false,
    referenceDateIso = PROJECT_REFERENCE_DATE_ISO,
  } = {}
) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  const title = String(formData.title || '').trim();
  const description = String(formData.description || '').trim();
  const dateInput = String(formData.dateInput || '').trim();
  const timeInput = String(formData.timeInput || '').trim();
  const location = String(formData.location || '').trim();
  const category = String(formData.category || 'Soirée').trim();
  const totalCapacity = Math.trunc(Number(formData.totalCapacity));
  const priceAmount = Number(formData.priceAmount || 0);

  if (!title || !description || !dateInput || !timeInput || !location) {
    return {
      ok: false,
      error:
        'Tous les champs obligatoires (Titre, Description, Date, Heure et Lieu) doivent être renseignés.',
    };
  }

  if (!Number.isFinite(totalCapacity) || totalCapacity <= 0) {
    return {
      ok: false,
      error: 'Le nombre de places doit être un entier supérieur à 0.',
    };
  }

  if (!Number.isFinite(priceAmount) || priceAmount < 0) {
    return {
      ok: false,
      error: 'Le tarif doit être supérieur ou égal à 0 €.',
    };
  }

  const startIso = `${dateInput}T${timeInput}:00`;
  const startMs = new Date(startIso).getTime();
  const referenceNowMs = new Date(referenceDateIso).getTime();

  if (Number.isNaN(startMs)) {
    return {
      ok: false,
      error: 'La date ou l’heure saisie est invalide.',
    };
  }

  // Condition n°6 : Ne pas créer un événement passé comme événement à venir
  if (!asDraft && startMs < referenceNowMs) {
    return {
      ok: false,
      error:
        'La date de l’événement doit être postérieure à la date actuelle du projet.',
    };
  }

  const dateObj = new Date(startIso);
  const dayNumber = String(dateObj.getDate());
  const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
    .format(dateObj)
    .toUpperCase();
  const dateBadge = `${dayNumber} ${monthShort} ${dateObj.getFullYear()}`;
  const schedule =
    formData.schedule ||
    `${formatShortFrenchDate(dateObj)} · ${timeInput.replace(':', ' h ')}`;
  const priceText = priceAmount === 0 ? 'Gratuit' : `${priceAmount} €`;

  const newEvent = {
    id: `evt-${Date.now()}`,
    category,
    dateBadge,
    dayNumber,
    monthShort,
    title,
    description,
    schedule,
    dateInput,
    timeInput,
    startIso,
    location,
    totalCapacity,
    remainingSeats: totalCapacity,
    remainingSeatsText: formatRemainingSeatsText(totalCapacity),
    priceText,
    priceAmount,
    image: formData.image || PUBLIC_EVENTS[0].image,
    publicationStatus: asDraft
      ? EVENT_PUBLICATION_STATUS.DRAFT
      : EVENT_PUBLICATION_STATUS.PUBLISHED,
    monthLabel: 'Novembre 2026',
  };

  const allEvents = getManagedEventsStore();
  saveManagedEventsStore([newEvent, ...allEvents]);

  const seatsMap = getSynchronizedSeatsMap([newEvent, ...allEvents]);
  seatsMap[newEvent.id] = totalCapacity;
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, seatsMap);

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    asDraft
      ? `${actorFirstName} a enregistré le brouillon « ${newEvent.title} ».`
      : `${actorFirstName} a publié l’événement « ${newEvent.title} ».`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    event: newEvent,
    message: asDraft
      ? `Le brouillon « ${newEvent.title} » a été enregistré.`
      : `L’événement « ${newEvent.title} » est maintenant publié.`,
  };
}

export function updateManagedEvent(
  eventId,
  formData = {},
  {
    publishIfDraft = false,
    referenceDateIso = PROJECT_REFERENCE_DATE_ISO,
  } = {}
) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!eventId) {
    return {
      ok: false,
      error: 'Identifiant de l’événement manquant.',
    };
  }

  const allEvents = getManagedEventsStore();
  const targetIndex = allEvents.findIndex((evt) => evt.id === eventId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: 'Événement introuvable.',
    };
  }

  const currentEvent = allEvents[targetIndex];
  const seatsMap = getSynchronizedSeatsMap(allEvents);
  const currentTotalCapacity = getMaxSeatsForManagedEvent(currentEvent);
  const currentRemainingSeats =
    seatsMap[eventId] !== undefined
      ? seatsMap[eventId]
      : currentEvent.remainingSeats;
  const alreadyRegisteredCount = Math.max(
    0,
    currentTotalCapacity - currentRemainingSeats
  );

  const title =
    formData.title !== undefined
      ? String(formData.title).trim()
      : currentEvent.title;
  const description =
    formData.description !== undefined
      ? String(formData.description).trim()
      : currentEvent.description || '';
  const location =
    formData.location !== undefined
      ? String(formData.location).trim()
      : currentEvent.location;
  const category =
    formData.category !== undefined
      ? String(formData.category).trim()
      : currentEvent.category;
  const nextTotalCapacity =
    formData.totalCapacity !== undefined
      ? Math.trunc(Number(formData.totalCapacity))
      : currentTotalCapacity;

  const dateInput =
    formData.dateInput !== undefined
      ? String(formData.dateInput).trim()
      : currentEvent.dateInput ||
        (currentEvent.startIso ? String(currentEvent.startIso).slice(0, 10) : '');
  const timeInput =
    formData.timeInput !== undefined
      ? String(formData.timeInput).trim()
      : currentEvent.timeInput ||
        (currentEvent.startIso ? String(currentEvent.startIso).slice(11, 16) : '');

  if (publishIfDraft) {
    if (
      !title ||
      !description ||
      !dateInput ||
      !timeInput ||
      !location ||
      !category
    ) {
      return {
        ok: false,
        error:
          'Tous les champs obligatoires (Titre, Description, Date, Heure, Lieu et Catégorie) doivent être renseignés pour publier le brouillon.',
      };
    }
  } else if (!title || !location || !category) {
    return {
      ok: false,
      error:
        'Le titre, le lieu et la catégorie de l’événement sont obligatoires.',
    };
  }

  if (
    !Number.isFinite(nextTotalCapacity) ||
    nextTotalCapacity < alreadyRegisteredCount ||
    nextTotalCapacity <= 0
  ) {
    return {
      ok: false,
      error: `La capacité ne peut pas être inférieure au nombre d’inscrits actuels (${alreadyRegisteredCount}).`,
    };
  }

  const nextPriceAmount =
    formData.priceAmount !== undefined
      ? Number(formData.priceAmount)
      : Number(currentEvent.priceAmount ?? 0);

  if (!Number.isFinite(nextPriceAmount) || nextPriceAmount < 0) {
    return {
      ok: false,
      error: 'Le tarif doit être supérieur ou égal à 0 €.',
    };
  }

  const nextStartIso =
    dateInput && timeInput
      ? `${dateInput}T${timeInput}:00`
      : currentEvent.startIso;

  if (nextStartIso) {
    const startMs = new Date(nextStartIso).getTime();
    if (Number.isNaN(startMs)) {
      return {
        ok: false,
        error: 'La date ou l’heure saisie est invalide.',
      };
    }
    const willBePublished =
      publishIfDraft ||
      currentEvent.publicationStatus === EVENT_PUBLICATION_STATUS.PUBLISHED;
    const dateChanged =
      formData.dateInput !== undefined || formData.timeInput !== undefined;

    if (publishIfDraft || (willBePublished && dateChanged)) {
      const referenceNowMs = new Date(referenceDateIso).getTime();
      if (startMs < referenceNowMs) {
        return {
          ok: false,
          error:
            'Impossible de publier ou programmer un événement à venir sur une date déjà passée.',
        };
      }
    }
  }

  const nextRemainingSeats = Math.max(
    0,
    nextTotalCapacity - alreadyRegisteredCount
  );
  const nextPriceText =
    formData.priceText !== undefined
      ? formData.priceText
      : nextPriceAmount <= 0
      ? 'Gratuit'
      : `${nextPriceAmount} €`;

  let derivedDateFields = {};
  if (nextStartIso && !Number.isNaN(new Date(nextStartIso).getTime())) {
    const dateObj = new Date(nextStartIso);
    const dayNumber = String(dateObj.getDate());
    const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' })
      .format(dateObj)
      .toUpperCase();
    const dateBadge = `${dayNumber} ${monthShort} ${dateObj.getFullYear()}`;
    const computedSchedule =
      formData.schedule ||
      (formData.dateInput !== undefined || formData.timeInput !== undefined
        ? `${formatShortFrenchDate(dateObj)} · ${(timeInput || '18:00').replace(
            ':',
            ' h '
          )}`
        : currentEvent.schedule);
    derivedDateFields = {
      dayNumber,
      monthShort,
      dateBadge,
      schedule: computedSchedule,
      dateInput,
      timeInput,
    };
  }

  const updatedEvent = {
    ...currentEvent,
    ...derivedDateFields,
    title,
    description,
    location,
    category,
    startIso: nextStartIso,
    totalCapacity: nextTotalCapacity,
    remainingSeats: nextRemainingSeats,
    remainingSeatsText: formatRemainingSeatsText(nextRemainingSeats),
    priceAmount: nextPriceAmount,
    priceText: nextPriceText,
    image: formData.image || currentEvent.image || PUBLIC_EVENTS[0].image,
    publicationStatus: publishIfDraft
      ? EVENT_PUBLICATION_STATUS.PUBLISHED
      : currentEvent.publicationStatus,
  };

  const updatedEvents = allEvents.map((evt, idx) =>
    idx === targetIndex ? updatedEvent : evt
  );
  saveManagedEventsStore(updatedEvents);

  seatsMap[eventId] = nextRemainingSeats;
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, seatsMap);

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    publishIfDraft
      ? `${actorFirstName} a publié l’événement « ${updatedEvent.title} ».`
      : `${actorFirstName} a mis à jour l’événement « ${updatedEvent.title} ».`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    event: updatedEvent,
    message: publishIfDraft
      ? `L’événement « ${updatedEvent.title} » a été publié.`
      : `Les modifications sur « ${updatedEvent.title} » ont été enregistrées.`,
  };
}

export function deleteManagedEvent(eventId) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!eventId) {
    return {
      ok: false,
      error: 'Identifiant de l’événement manquant.',
    };
  }

  const allEvents = getManagedEventsStore();
  const targetEvent = allEvents.find((evt) => evt.id === eventId);
  if (!targetEvent) {
    return {
      ok: false,
      error: 'Événement introuvable ou déjà supprimé.',
    };
  }

  const updatedEvents = allEvents.filter((evt) => evt.id !== eventId);
  saveManagedEventsStore(updatedEvents);

  // Nettoyer également l'entrée des places synchronisées
  const seatsMap = getSynchronizedSeatsMap(updatedEvents);
  delete seatsMap[eventId];
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, seatsMap);

  // Retirer également cet événement des inscriptions étudiantes actives
  const storedRegistrations = readStorageJson(
    STUDENT_REGISTRATIONS_STORAGE_KEY,
    null
  );
  if (
    storedRegistrations &&
    typeof storedRegistrations === 'object' &&
    !Array.isArray(storedRegistrations)
  ) {
    const cleanedRegistrations = {};
    Object.keys(storedRegistrations).forEach((userKey) => {
      const list = Array.isArray(storedRegistrations[userKey])
        ? storedRegistrations[userKey]
        : [];
      cleanedRegistrations[userKey] = list.filter((id) => id !== eventId);
    });
    writeStorageJson(STUDENT_REGISTRATIONS_STORAGE_KEY, cleanedRegistrations);
  }

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    `${actorFirstName} a supprimé l’événement « ${targetEvent.title} ».`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    deletedId: eventId,
    message: `L’événement « ${targetEvent.title} » a été supprimé.`,
  };
}

/* ==========================================================================
   7. Gestion des annonces : Consultation, Création, Édition, Suppression
   ========================================================================== */

export function getManagedAnnouncementsView({ search = '' } = {}) {
  const allAnnouncements = getManagedAnnouncementsStore();
  const normalizedSearch = String(search || '')
    .trim()
    .toLowerCase();

  const filtered = allAnnouncements.filter((ann) => {
    if (!normalizedSearch) {
      return true;
    }
    return (
      String(ann.title || '')
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(ann.content || ann.excerpt || '')
        .toLowerCase()
        .includes(normalizedSearch) ||
      String(ann.category || '')
        .toLowerCase()
        .includes(normalizedSearch)
    );
  });

  return {
    announcements: filtered,
    totalPublishedCount: allAnnouncements.length,
  };
}

export function createManagedAnnouncement(formData = {}) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  const title = String(formData.title || '').trim();
  const category = String(formData.category || 'Vie associative').trim();
  const content = String(formData.content ?? formData.excerpt ?? '').trim();

  if (!title || !category || !content) {
    return {
      ok: false,
      error:
        'Tous les champs obligatoires (Titre, Catégorie et Contenu) doivent être renseignés.',
    };
  }

  const actorFullName = getActorFullName();
  const actorFirstName = getActorFirstName();

  const newAnnouncement = {
    id: `ann-${Date.now()}`,
    category,
    date: '8 novembre 2026',
    title,
    content,
    excerpt: content,
    author: `Par ${actorFullName} · Bureau Agora`,
    authorName: actorFullName,
    featuredOnHome: true,
    publicationStatus: ANNOUNCEMENT_PUBLICATION_STATUS.PUBLISHED,
    visibilityNote: 'Visible sur le site public et dans l’espace membre',
  };

  const currentList = getManagedAnnouncementsStore();
  saveManagedAnnouncementsStore([newAnnouncement, ...currentList]);

  prependBoardActivity(`${actorFirstName} a publié l’annonce « ${title} ».`);
  notifyManagementUpdated();

  return {
    ok: true,
    announcement: newAnnouncement,
    message: `L’annonce « ${title} » a été publiée.`,
  };
}

export function updateManagedAnnouncement(announcementId, formData = {}) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!announcementId) {
    return {
      ok: false,
      error: 'Identifiant de l’annonce manquant.',
    };
  }

  const currentList = getManagedAnnouncementsStore();
  const targetIndex = currentList.findIndex((ann) => ann.id === announcementId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: 'Annonce introuvable.',
    };
  }

  const existing = currentList[targetIndex];
  const title =
    formData.title !== undefined
      ? String(formData.title).trim()
      : existing.title;
  const category =
    formData.category !== undefined
      ? String(formData.category).trim()
      : existing.category;
  const content =
    formData.content !== undefined || formData.excerpt !== undefined
      ? String(formData.content ?? formData.excerpt).trim()
      : String(existing.content ?? existing.excerpt ?? '');

  if (!title || !category || !content) {
    return {
      ok: false,
      error:
        'Tous les champs obligatoires (Titre, Catégorie et Contenu) doivent être renseignés.',
    };
  }

  const updatedAnnouncement = {
    ...existing,
    title,
    category,
    content,
    excerpt: content,
  };

  const updatedList = currentList.map((ann, idx) =>
    idx === targetIndex ? updatedAnnouncement : ann
  );
  saveManagedAnnouncementsStore(updatedList);

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    `${actorFirstName} a modifié l’annonce « ${updatedAnnouncement.title} ».`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    announcement: updatedAnnouncement,
    message: `L’annonce « ${updatedAnnouncement.title} » a été mise à jour.`,
  };
}

export function deleteManagedAnnouncement(announcementId) {
  const access = requireBoardManagerAccess();
  if (!access.ok) {
    return access;
  }

  if (!announcementId) {
    return {
      ok: false,
      error: 'Identifiant de l’annonce manquant.',
    };
  }

  const currentList = getManagedAnnouncementsStore();
  const target = currentList.find((ann) => ann.id === announcementId);
  if (!target) {
    return {
      ok: false,
      error: 'Annonce introuvable ou déjà supprimée.',
    };
  }

  const updatedList = currentList.filter((ann) => ann.id !== announcementId);
  saveManagedAnnouncementsStore(updatedList);

  const actorFirstName = getActorFirstName();
  prependBoardActivity(
    `${actorFirstName} a supprimé l’annonce « ${target.title} ».`
  );
  notifyManagementUpdated();

  return {
    ok: true,
    deletedId: announcementId,
    message: `L’annonce « ${target.title} » a été supprimée.`,
  };
}

/* ==========================================================================
   8. Vue d'ensemble du tableau de bord (Figma 2:59170 & 2:59333)
   ========================================================================== */

export function getManagementDashboardOverview({
  referenceDateIso = PROJECT_REFERENCE_DATE_ISO,
} = {}) {
  const user = getCurrentUser();
  const firstName = user?.firstName || 'Emma';
  const requestsView = getMembershipRequestsView();
  const eventsView = getManagedEventsView({
    tab: 'UPCOMING',
    referenceDateIso,
  });
  const activeMembersCount = computeActiveMembersTotalCount();
  const annualGoal = DASHBOARD_REFERENCE_METRICS.annualMembersGoal;
  const progressPercentage = Math.min(
    100,
    Math.round((activeMembersCount / annualGoal) * 100)
  );
  const remainingToGoal = Math.max(0, annualGoal - activeMembersCount);

  const publishedEvents = [
    ...eventsView.upcomingEvents,
    ...eventsView.pastEvents,
  ].filter(
    (evt) => evt.publicationStatus === EVENT_PUBLICATION_STATUS.PUBLISHED
  );

  const totalRegistrationsCount = publishedEvents.reduce(
    (sum, evt) => sum + (Number(evt.registeredCount) || 0),
    0
  );

  return {
    greetingTitle: `Bonjour ${firstName} ☀`,
    dateSubtitle: DASHBOARD_REFERENCE_METRICS.dashboardDateLabel,
    pendingCount: requestsView.counts.pending,
    kpis: {
      activeMembersCount,
      activeMembersDeltaText:
        DASHBOARD_REFERENCE_METRICS.activeMembersDeltaText,
      pendingRequestsCount: requestsView.counts.pending,
      oldestPendingText:
        requestsView.pendingRequests.length > 0
          ? `La plus ancienne : ${requestsView.pendingRequests[0].submittedAtLabel.replace(' 2026', '')}`
          : 'Toutes les demandes sont traitées',
      upcomingEventsCount: eventsView.counts.upcoming,
      totalRegistrationsText: `${totalRegistrationsCount} inscriptions au total`,
      treasuryBalanceText: DASHBOARD_REFERENCE_METRICS.treasuryBalanceText,
      treasuryNoteText: DASHBOARD_REFERENCE_METRICS.treasuryNoteText,
    },
    upcomingMeetings: eventsView.upcomingEvents.slice(0, 3),
    latestPendingRequests: requestsView.pendingRequests.slice(0, 3),
    goalProgress: {
      current: activeMembersCount,
      target: annualGoal,
      percentage: progressPercentage,
      remainingToGoal,
      summaryText: `${progressPercentage} % de l’objectif annuel. Encore ${remainingToGoal} membres pour atteindre l’objectif annuel.`,
    },
    boardActivityFeed: getBoardActivityFeedStore().slice(0, 3),
  };
}

/**
 * Réinitialise proprement les stores persistants de démonstration (Espace Gestion & Inscriptions).
 */
export function resetManagementDemoData() {
  writeStorageJson(MANAGEMENT_REQUESTS_STORAGE_KEY, null);
  writeStorageJson(MANAGEMENT_DECISIONS_STORAGE_KEY, null);
  writeStorageJson(MANAGEMENT_MEMBERS_STORAGE_KEY, null);
  writeStorageJson(MANAGEMENT_EVENTS_STORAGE_KEY, null);
  writeStorageJson(MANAGEMENT_ANNOUNCEMENTS_STORAGE_KEY, null);
  writeStorageJson(MANAGEMENT_ACTIVITY_FEED_STORAGE_KEY, null);
  writeStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, null);
  writeStorageJson(STUDENT_REGISTRATIONS_STORAGE_KEY, null);
  writeStorageJson(EVENT_SEATS_STORAGE_KEY, null);
  writeStorageJson(LATEST_REQUEST_STORAGE_KEY, null);
  notifyManagementUpdated();
}
