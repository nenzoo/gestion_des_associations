import {
  INITIAL_LOGIN_FORM,
  INITIAL_MEMBERSHIP_FORM,
  INITIAL_MEMBERSHIP_REQUESTS,
  MEMBERSHIP_STATUS,
  MOCK_USERS,
  ROLES,
  TRUST_AVATARS,
} from '../data/authMockData.js';
import {
  INITIAL_ASSOCIATION_MEMBERS,
  INITIAL_MANAGEMENT_REQUESTS,
  INITIAL_MEMBERSHIP_DECISIONS,
  MEMBER_BADGE_STATUS,
} from '../data/managementMockData.js';

/**
 * Service d'authentification et d'adhésion (simulation Frontend).
 * Préparé pour le futur remplacement par des appels API Laravel :
 * - POST /api/membership-requests
 * - GET  /api/membership-requests/status
 * - POST /api/login
 * - POST /api/logout
 *
 * Aucune variable d'état métier ou de session n'est conservée en mémoire au niveau
 * du module : toutes les lectures et écritures s'appuient sur les stores persistants
 * localStorage partagés avec `managementService.js`.
 */

const SESSION_STORAGE_KEY = 'clubmanager_current_user';
const LATEST_REQUEST_STORAGE_KEY = 'clubmanager_latest_membership_request';
const USER_STATUS_OVERRIDES_STORAGE_KEY = 'clubmanager_user_status_overrides';
const MANAGEMENT_REQUESTS_STORAGE_KEY = 'clubmanager_management_requests';
const MANAGEMENT_DECISIONS_STORAGE_KEY = 'clubmanager_management_decisions';
const MANAGEMENT_MEMBERS_STORAGE_KEY = 'clubmanager_management_members';

let requestSequenceCounter = 0;

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
    // Ignore storage errors in restricted environments
  }
}

function notifyAuthAndManagementUpdated() {
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

function formatShortFrenchDate(dateInput) {
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

function readUserStatusOverride(email) {
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!cleanEmail) {
    return null;
  }
  const overrides = readStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, null);
  if (
    overrides &&
    typeof overrides === 'object' &&
    !Array.isArray(overrides) &&
    overrides[cleanEmail]
  ) {
    return overrides[cleanEmail];
  }
  return null;
}

function writeUserStatusOverride(email, patch) {
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!cleanEmail) {
    return;
  }
  const stored = readStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, {});
  const safeStore =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? { ...stored }
      : {};
  safeStore[cleanEmail] = {
    ...(safeStore[cleanEmail] || {}),
    ...patch,
    email: cleanEmail,
  };
  writeStorageJson(USER_STATUS_OVERRIDES_STORAGE_KEY, safeStore);
}

function readPersistedRequestsList() {
  const stored = readStorageJson(MANAGEMENT_REQUESTS_STORAGE_KEY, null);
  if (Array.isArray(stored)) {
    return stored.filter((item) => item && typeof item === 'object' && item.id);
  }
  return [...INITIAL_MANAGEMENT_REQUESTS];
}

function readPersistedDecisionsList() {
  const stored = readStorageJson(MANAGEMENT_DECISIONS_STORAGE_KEY, null);
  if (Array.isArray(stored)) {
    return stored.filter((item) => item && typeof item === 'object' && item.id);
  }
  return [...INITIAL_MEMBERSHIP_DECISIONS];
}

function readPersistedMembersList() {
  const stored = readStorageJson(MANAGEMENT_MEMBERS_STORAGE_KEY, null);
  if (Array.isArray(stored)) {
    return stored.filter((item) => item && typeof item === 'object' && item.id);
  }
  return [...INITIAL_ASSOCIATION_MEMBERS];
}

function generateUniqueRequestId(existingRequests = [], existingDecisions = []) {
  const existingIds = new Set([
    ...existingRequests.map((item) => item?.id).filter(Boolean),
    ...existingDecisions.map((item) => item?.requestId).filter(Boolean),
  ]);

  let candidateId;
  do {
    requestSequenceCounter += 1;
    const uuidPart =
      typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${requestSequenceCounter}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;
    candidateId = `req-${uuidPart}`;
  } while (existingIds.has(candidateId));

  return candidateId;
}

export function getInitialMembershipForm() {
  return { ...INITIAL_MEMBERSHIP_FORM };
}

export function getInitialLoginForm() {
  return { ...INITIAL_LOGIN_FORM };
}

export function getTrustAvatars() {
  return TRUST_AVATARS;
}

/**
 * Soumet une demande d'adhésion depuis le formulaire public `/adhesion` :
 * - Vérifie que tous les champs obligatoires sont renseignés (sans valeurs de repli vers Manon Laurent)
 * - Applique les règles de déduplication :
 *   1. Compte révoqué (`REVOQUEE`) -> interdit de nouvelle demande
 *   2. Membre déjà `ACCEPTEE` et `ACTIVE` -> interdit de nouvelle demande
 *   3. Demande déjà `EN_ATTENTE` -> interdit de doublon
 *   4. Nouveau candidat ou candidat avec demande précédente `REFUSEE` (Option B) ->
 *      crée une nouvelle demande `EN_ATTENTE` avec un identifiant unique dans
 *      `clubmanager_management_requests` sans écraser ni supprimer l'historique `REFUSEE`.
 */
export function submitMembershipRequest(
  formData = {},
  { submittedAtIso } = {}
) {
  const cleanFirstName = String(formData.firstName || '').trim();
  const cleanLastName = String(formData.lastName || '').trim();
  const cleanEmail = String(formData.email || '')
    .trim()
    .toLowerCase();
  const cleanStudentNumber = String(formData.studentNumber || '').trim();

  if (
    !cleanFirstName ||
    !cleanLastName ||
    !cleanEmail ||
    !cleanStudentNumber
  ) {
    return {
      ok: false,
      code: 'MISSING_FIELDS',
      error: 'Merci de renseigner tous les champs obligatoires (*).',
    };
  }

  const members = readPersistedMembersList();
  const requests = readPersistedRequestsList();
  const decisions = readPersistedDecisionsList();
  const statusOverride = readUserStatusOverride(cleanEmail);

  // 1. Vérifier dans l'annuaire des membres (par e-mail ou numéro étudiant)
  const matchedMember = members.find(
    (m) =>
      String(m.email || '').toLowerCase() === cleanEmail ||
      String(m.studentNumber || '').trim() === cleanStudentNumber
  );

  if (matchedMember) {
    if (
      matchedMember.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE ||
      matchedMember.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE
    ) {
      return {
        ok: false,
        code: 'REVOKED_MEMBER',
        error:
          'Ton accès membre a été révoqué par le bureau. Tu ne peux pas déposer une nouvelle demande d’adhésion.',
      };
    }

    if (matchedMember.membershipStatus === MEMBERSHIP_STATUS.ACCEPTEE) {
      return {
        ok: false,
        code: 'ALREADY_ACTIVE_MEMBER',
        error:
          'Un compte membre actif existe déjà avec cette adresse e-mail ou ce numéro étudiant. Connecte-toi depuis la page de connexion.',
      };
    }
  }

  // 2. Vérifier dans les surcharges de statut ou les utilisateurs fictifs connus
  if (statusOverride) {
    if (statusOverride.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE) {
      return {
        ok: false,
        code: 'REVOKED_MEMBER',
        error:
          'Ton accès membre a été révoqué par le bureau. Tu ne peux pas déposer une nouvelle demande d’adhésion.',
      };
    }

    if (
      statusOverride.membershipStatus === MEMBERSHIP_STATUS.ACCEPTEE &&
      statusOverride.membershipAccessStatus !== MEMBER_BADGE_STATUS.REVOQUEE
    ) {
      return {
        ok: false,
        code: 'ALREADY_ACTIVE_MEMBER',
        error:
          'Un compte membre actif existe déjà avec cette adresse e-mail ou ce numéro étudiant. Connecte-toi depuis la page de connexion.',
      };
    }
  } else {
    const matchedMockUser = MOCK_USERS.find(
      (u) =>
        String(u.email || '').toLowerCase() === cleanEmail ||
        (u.studentNumber &&
          String(u.studentNumber).trim() === cleanStudentNumber)
    );
    if (
      matchedMockUser &&
      matchedMockUser.membershipStatus === MEMBERSHIP_STATUS.ACCEPTEE
    ) {
      return {
        ok: false,
        code: 'ALREADY_ACTIVE_MEMBER',
        error:
          'Un compte membre actif existe déjà avec cette adresse e-mail ou ce numéro étudiant. Connecte-toi depuis la page de connexion.',
      };
    }
  }

  // 3. Vérifier s'il existe déjà une demande EN_ATTENTE pour cet e-mail ou ce numéro étudiant
  const existingPendingRequest = requests.find(
    (req) =>
      req.status === MEMBERSHIP_STATUS.EN_ATTENTE &&
      (String(req.email || '').toLowerCase() === cleanEmail ||
        String(req.studentNumber || '').trim() === cleanStudentNumber)
  );

  if (existingPendingRequest) {
    return {
      ok: false,
      code: 'ALREADY_PENDING',
      error:
        'Une demande d’adhésion est déjà en cours d’examen pour cette adresse e-mail ou ce numéro étudiant.',
      request: existingPendingRequest,
    };
  }

  // 4. Créer une nouvelle demande EN_ATTENTE (nouveau candidat ou candidat après REFUSEE — Option B)
  const effectiveSubmittedAt =
    submittedAtIso && String(submittedAtIso).trim()
      ? String(submittedAtIso).trim().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  const submittedAtLabel = formatShortFrenchDate(effectiveSubmittedAt);
  const uniqueId = generateUniqueRequestId(requests, decisions);

  const newRequest = {
    id: uniqueId,
    userId: `usr-${uniqueId}`,
    lastName: cleanLastName,
    firstName: cleanFirstName,
    initials: computeInitials(cleanFirstName, cleanLastName),
    email: cleanEmail,
    studentNumber: cleanStudentNumber,
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
    submittedAt: effectiveSubmittedAt,
    submittedAtLabel,
    dashboardSubmittedLabel: `Reçue le ${submittedAtLabel}`,
  };

  // Enregistrer dans la source unique de vérité `clubmanager_management_requests`
  // sans supprimer ni modifier les demandes ou décisions REFUSEE antérieures
  const updatedRequests = [newRequest, ...requests];
  writeStorageJson(MANAGEMENT_REQUESTS_STORAGE_KEY, updatedRequests);

  // Mettre à jour le statut courant du compte associé vers EN_ATTENTE
  writeUserStatusOverride(cleanEmail, {
    firstName: cleanFirstName,
    lastName: cleanLastName,
    studentNumber: cleanStudentNumber,
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.EN_ATTENTE,
    membershipAccessStatus: null,
    refusalReason: null,
  });

  // Stocker un instantané temporaire pour l'affichage immédiat si besoin
  writeStorageJson(LATEST_REQUEST_STORAGE_KEY, newRequest);
  notifyAuthAndManagementUpdated();

  return {
    ok: true,
    request: newRequest,
  };
}

function findRequestRecordById(cleanRequestId) {
  const requests = readPersistedRequestsList();
  const matchedReq = requests.find((req) => req.id === cleanRequestId);
  if (matchedReq) {
    return {
      id: matchedReq.id,
      firstName: matchedReq.firstName,
      lastName: matchedReq.lastName,
      email: matchedReq.email,
      studentNumber: matchedReq.studentNumber,
      status: matchedReq.status,
      submittedAt: matchedReq.submittedAt,
      reason: matchedReq.reason || '',
    };
  }

  const decisions = readPersistedDecisionsList();
  const matchedDec = decisions.find(
    (dec) => dec.requestId === cleanRequestId || dec.id === cleanRequestId
  );
  if (matchedDec) {
    return {
      id: matchedDec.requestId || matchedDec.id,
      firstName: matchedDec.firstName,
      lastName: matchedDec.lastName,
      email: matchedDec.email,
      studentNumber: matchedDec.studentNumber,
      status: matchedDec.status,
      submittedAt: matchedDec.processedAt,
      reason: matchedDec.reason || '',
    };
  }

  return null;
}

function findLatestRecordByEmail(cleanEmail) {
  // 1. Vérifier d'abord s'il existe une demande dans `clubmanager_management_requests`
  // (l'ordre du tableau place la demande la plus récente en premier)
  const requests = readPersistedRequestsList();
  const matchedReq = requests.find(
    (req) => String(req.email || '').toLowerCase() === cleanEmail
  );

  // 2. Vérifier si le membre a été révoqué dans l'annuaire ou dans les surcharges
  const statusOverride = readUserStatusOverride(cleanEmail);
  const members = readPersistedMembersList();
  const matchedMember = members.find(
    (m) => String(m.email || '').toLowerCase() === cleanEmail
  );

  if (
    statusOverride?.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE ||
    matchedMember?.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE ||
    matchedMember?.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE
  ) {
    return {
      id: matchedMember?.id || `usr-${cleanEmail}`,
      firstName:
        statusOverride?.firstName || matchedMember?.firstName || 'Membre',
      lastName: statusOverride?.lastName || matchedMember?.lastName || '',
      email: cleanEmail,
      studentNumber:
        statusOverride?.studentNumber ||
        matchedMember?.studentNumber ||
        '22610482',
      status: MEMBER_BADGE_STATUS.REVOQUEE,
      reason:
        statusOverride?.revocationReason ||
        matchedMember?.revocationReason ||
        '',
    };
  }

  if (matchedReq) {
    return {
      id: matchedReq.id,
      firstName: matchedReq.firstName,
      lastName: matchedReq.lastName,
      email: matchedReq.email,
      studentNumber: matchedReq.studentNumber,
      status: statusOverride?.membershipStatus || matchedReq.status,
      submittedAt: matchedReq.submittedAt,
      reason: statusOverride?.refusalReason || matchedReq.reason || '',
    };
  }

  // 3. Vérifier dans l'historique des décisions
  const decisions = readPersistedDecisionsList();
  const matchedDec = decisions.find(
    (dec) => String(dec.email || '').toLowerCase() === cleanEmail
  );
  if (matchedDec) {
    return {
      id: matchedDec.requestId || matchedDec.id,
      firstName: matchedDec.firstName,
      lastName: matchedDec.lastName,
      email: matchedDec.email,
      studentNumber: matchedDec.studentNumber,
      status: statusOverride?.membershipStatus || matchedDec.status,
      submittedAt: matchedDec.processedAt,
      reason: statusOverride?.refusalReason || matchedDec.reason || '',
    };
  }

  // 4. Vérifier dans les demandes fictives initiales ou profils de test
  const initialReq = INITIAL_MEMBERSHIP_REQUESTS.find(
    (req) => String(req.email || '').toLowerCase() === cleanEmail
  );
  if (initialReq) {
    return {
      ...initialReq,
      status: statusOverride?.membershipStatus || initialReq.status,
    };
  }

  const sessionUser = getCurrentUser();
  if (
    sessionUser &&
    String(sessionUser.email || '').toLowerCase() === cleanEmail &&
    (sessionUser.membershipStatus === MEMBERSHIP_STATUS.EN_ATTENTE ||
      sessionUser.membershipStatus === MEMBERSHIP_STATUS.REFUSEE ||
      sessionUser.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE)
  ) {
    return {
      id: sessionUser.id,
      firstName: sessionUser.firstName,
      lastName: sessionUser.lastName,
      email: sessionUser.email,
      studentNumber: sessionUser.studentNumber || '22610890',
      status:
        sessionUser.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE
          ? MEMBER_BADGE_STATUS.REVOQUEE
          : sessionUser.membershipStatus,
    };
  }

  return null;
}

/**
 * Retourne le dossier de demande d'adhésion du candidat identifié :
 * - Règle 1 : Si `requestId` est fourni, il constitue la référence prioritaire.
 * - Règle 2 : Si le dossier correspondant au `requestId` est introuvable, retourne `null`
 *   sans jamais basculer sur un autre dossier via `email`.
 * - Règle 3 : Si `requestId` et `email` sont tous les deux fournis, ils doivent correspondre
 *   au même dossier ; en cas de discordance, retourne `null`.
 * - Règle 4 : Si aucun `requestId` n'est fourni, utilise `email` explicite ou, à défaut,
 *   l'email de l'utilisateur connecté en session.
 * - Règle 5 : Si aucune identité vérifiable n'est disponible, retourne `null` (ne retourne
 *   jamais `clubmanager_latest_membership_request` comme source d'identité).
 */
export function getLatestMembershipRequest({ requestId, email } = {}) {
  const cleanRequestId = String(requestId || '').trim();
  const cleanExplicitEmail = String(email || '')
    .trim()
    .toLowerCase();

  if (cleanRequestId) {
    const recordById = findRequestRecordById(cleanRequestId);
    if (!recordById) {
      return null;
    }
    if (cleanExplicitEmail) {
      const recordEmail = String(recordById.email || '')
        .trim()
        .toLowerCase();
      if (recordEmail !== cleanExplicitEmail) {
        return null;
      }
    }
    return recordById;
  }

  const effectiveEmail =
    cleanExplicitEmail ||
    String(getCurrentUser()?.email || '')
      .trim()
      .toLowerCase();

  if (!effectiveEmail) {
    return null;
  }

  return findLatestRecordByEmail(effectiveEmail);
}

export function loginWithCredentials({ email, password }) {
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();

  if (!cleanEmail || !password) {
    return {
      ok: false,
      code: 'MISSING_CREDENTIALS',
      error: 'Saisis ton adresse e-mail universitaire et ton mot de passe.',
    };
  }

  const matchedUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  const members = readPersistedMembersList();
  const matchedMember = members.find(
    (m) => String(m.email || '').toLowerCase() === cleanEmail
  );

  const requests = readPersistedRequestsList();
  const matchedRequest =
    requests.find((req) => String(req.email || '').toLowerCase() === cleanEmail) ||
    INITIAL_MEMBERSHIP_REQUESTS.find(
      (req) => String(req.email || '').toLowerCase() === cleanEmail
    );

  const decisions = readPersistedDecisionsList();
  const matchedDecision = decisions.find(
    (dec) => String(dec.email || '').toLowerCase() === cleanEmail
  );

  const statusOverride = readUserStatusOverride(cleanEmail);

  let sessionUser;

  if (matchedUser) {
    sessionUser = {
      ...matchedUser,
      ...(matchedMember
        ? {
            role: matchedMember.role || matchedUser.role,
            membershipStatus:
              matchedMember.membershipStatus || matchedUser.membershipStatus,
            membershipAccessStatus:
              matchedMember.membershipAccessStatus ||
              matchedMember.badgeLabel ||
              matchedUser.membershipAccessStatus,
          }
        : {}),
    };
  } else if (matchedMember) {
    sessionUser = {
      id: matchedMember.id,
      firstName: matchedMember.firstName,
      lastName: matchedMember.lastName,
      email: cleanEmail,
      studentNumber: matchedMember.studentNumber,
      role: matchedMember.role || ROLES.STUDENT,
      membershipStatus:
        matchedMember.membershipStatus || MEMBERSHIP_STATUS.ACCEPTEE,
      membershipAccessStatus:
        matchedMember.membershipAccessStatus ||
        matchedMember.badgeLabel ||
        MEMBER_BADGE_STATUS.ACTIVE,
    };
  } else if (matchedRequest) {
    sessionUser = {
      id: matchedRequest.userId || `usr-${matchedRequest.id}`,
      firstName: matchedRequest.firstName,
      lastName: matchedRequest.lastName,
      email: cleanEmail,
      studentNumber: matchedRequest.studentNumber,
      role: ROLES.STUDENT,
      membershipStatus: matchedRequest.status,
      membershipAccessStatus: null,
    };
  } else if (matchedDecision) {
    sessionUser = {
      id: matchedDecision.userId || `usr-${matchedDecision.id}`,
      firstName: matchedDecision.firstName,
      lastName: matchedDecision.lastName,
      email: cleanEmail,
      studentNumber: matchedDecision.studentNumber,
      role: ROLES.STUDENT,
      membershipStatus: matchedDecision.status,
      membershipAccessStatus:
        matchedDecision.status === MEMBERSHIP_STATUS.ACCEPTEE
          ? MEMBER_BADGE_STATUS.ACTIVE
          : null,
    };
  } else if (statusOverride && (statusOverride.role || statusOverride.membershipStatus)) {
    sessionUser = {
      id: statusOverride.id || `usr-${cleanEmail}`,
      firstName: statusOverride.firstName || '',
      lastName: statusOverride.lastName || '',
      email: cleanEmail,
      studentNumber: statusOverride.studentNumber || '',
      role: statusOverride.role || ROLES.STUDENT,
      membershipStatus: statusOverride.membershipStatus ?? null,
      membershipAccessStatus: statusOverride.membershipAccessStatus ?? null,
    };
  } else {
    return {
      ok: false,
      code: 'UNKNOWN_USER',
      error: 'Aucun compte n’est associé à cette adresse e-mail universitaire.',
    };
  }

  if (statusOverride) {
    sessionUser = {
      ...sessionUser,
      ...statusOverride,
    };
  }

  writeStorageJson(SESSION_STORAGE_KEY, sessionUser);

  const pendingRequest =
    sessionUser.role !== ROLES.ADMIN &&
    sessionUser.membershipStatus === MEMBERSHIP_STATUS.EN_ATTENTE
      ? findLatestRecordByEmail(cleanEmail)
      : null;

  return {
    ok: true,
    user: sessionUser,
    pendingRequest,
  };
}

/**
 * Source de vérité unique pour la session utilisateur courante.
 */
export function getCurrentUser() {
  const storedUser = readStorageJson(SESSION_STORAGE_KEY, null);
  if (!storedUser || typeof storedUser !== 'object') {
    return null;
  }

  let resolvedUser = { ...storedUser };

  if (resolvedUser.email) {
    const cleanEmail = String(resolvedUser.email).trim().toLowerCase();
    const matchedMember = readPersistedMembersList().find(
      (m) => String(m.email || '').toLowerCase() === cleanEmail
    );
    if (
      matchedMember &&
      (matchedMember.membershipAccessStatus === MEMBER_BADGE_STATUS.REVOQUEE ||
        matchedMember.badgeLabel === MEMBER_BADGE_STATUS.REVOQUEE)
    ) {
      resolvedUser.membershipAccessStatus = MEMBER_BADGE_STATUS.REVOQUEE;
    }

    const statusOverride = readUserStatusOverride(cleanEmail);
    if (statusOverride) {
      resolvedUser = {
        ...resolvedUser,
        ...statusOverride,
      };
    }
  }
  return resolvedUser;
}

export function getCurrentSessionUser() {
  return getCurrentUser();
}

/**
 * Supprime la session locale de l'utilisateur.
 */
export function logout() {
  writeStorageJson(SESSION_STORAGE_KEY, null);
}
