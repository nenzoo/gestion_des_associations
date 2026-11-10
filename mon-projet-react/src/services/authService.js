import {
  INITIAL_LOGIN_FORM,
  INITIAL_MEMBERSHIP_FORM,
  INITIAL_MEMBERSHIP_REQUESTS,
  MEMBERSHIP_STATUS,
  MOCK_USERS,
  TRUST_AVATARS,
} from '../data/authMockData.js';

/**
 * Service d'authentification et d'adhésion (simulation Frontend).
 * Préparé pour le futur remplacement par des appels API Laravel :
 * - POST /api/membership-requests
 * - GET  /api/membership-requests/status
 * - POST /api/login
 * - POST /api/logout
 */

const SESSION_STORAGE_KEY = 'clubmanager_current_user';
const LATEST_REQUEST_STORAGE_KEY = 'clubmanager_latest_membership_request';

let membershipRequestsStore = [...INITIAL_MEMBERSHIP_REQUESTS];
let latestSubmittedRequest = readStorageJson(
  LATEST_REQUEST_STORAGE_KEY,
  INITIAL_MEMBERSHIP_REQUESTS[0]
);
let currentSessionUser = readStorageJson(SESSION_STORAGE_KEY, null);

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

export function getInitialMembershipForm() {
  return { ...INITIAL_MEMBERSHIP_FORM };
}

export function getInitialLoginForm() {
  return { ...INITIAL_LOGIN_FORM };
}

export function getTrustAvatars() {
  return TRUST_AVATARS;
}

export function submitMembershipRequest(formData) {
  const cleanFirstName = formData.firstName.trim() || 'Manon';
  const cleanLastName = formData.lastName.trim() || 'Laurent';
  const cleanEmail = formData.email.trim() || 'manon.laurent@univ-lyon2.fr';
  const cleanStudentNumber = formData.studentNumber.trim() || '22610482';

  const newRequest = {
    id: `req-${Date.now()}`,
    lastName: cleanLastName,
    firstName: cleanFirstName,
    email: cleanEmail,
    studentNumber: cleanStudentNumber,
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
    submittedAt: new Date().toISOString().slice(0, 10),
  };

  membershipRequestsStore = [newRequest, ...membershipRequestsStore];
  latestSubmittedRequest = newRequest;
  writeStorageJson(LATEST_REQUEST_STORAGE_KEY, latestSubmittedRequest);

  return newRequest;
}

export function getLatestMembershipRequest() {
  const user = getCurrentUser();
  if (
    user &&
    (user.membershipStatus === MEMBERSHIP_STATUS.EN_ATTENTE ||
      user.membershipStatus === MEMBERSHIP_STATUS.REFUSEE)
  ) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      studentNumber: user.studentNumber || '22610890',
      status: user.membershipStatus,
    };
  }
  return latestSubmittedRequest;
}

export function loginWithCredentials({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return {
      ok: false,
      error: 'Saisis ton adresse e-mail universitaire et ton mot de passe.',
    };
  }

  // Rechercher d'abord un utilisateur connu parmi les profils fictifs
  const matchedUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  // Vérifier si une demande d'adhésion soumise dynamiquement existe pour cet e-mail
  const matchedRequest = membershipRequestsStore.find(
    (req) => req.email.toLowerCase() === cleanEmail
  );

  if (matchedUser) {
    currentSessionUser = { ...matchedUser };
  } else if (matchedRequest) {
    currentSessionUser = {
      id: `usr-${matchedRequest.id}`,
      firstName: matchedRequest.firstName,
      lastName: matchedRequest.lastName,
      email: cleanEmail,
      studentNumber: matchedRequest.studentNumber,
      role: 'Membre',
      membershipStatus: matchedRequest.status,
    };
  } else {
    currentSessionUser = {
      ...MOCK_USERS[0],
      email: cleanEmail,
    };
  }

  writeStorageJson(SESSION_STORAGE_KEY, currentSessionUser);

  if (
    currentSessionUser.membershipStatus === MEMBERSHIP_STATUS.EN_ATTENTE ||
    currentSessionUser.membershipStatus === MEMBERSHIP_STATUS.REFUSEE
  ) {
    latestSubmittedRequest = {
      firstName: currentSessionUser.firstName,
      lastName: currentSessionUser.lastName,
      email: currentSessionUser.email,
      studentNumber: currentSessionUser.studentNumber || '22610890',
      status: currentSessionUser.membershipStatus,
    };
    writeStorageJson(LATEST_REQUEST_STORAGE_KEY, latestSubmittedRequest);
  }

  return {
    ok: true,
    user: currentSessionUser,
    pendingRequest:
      currentSessionUser.membershipStatus === MEMBERSHIP_STATUS.EN_ATTENTE
        ? latestSubmittedRequest
        : null,
  };
}

/**
 * Source de vérité unique pour la session utilisateur courante.
 */
export function getCurrentUser() {
  if (!currentSessionUser) {
    currentSessionUser = readStorageJson(SESSION_STORAGE_KEY, null);
  }
  return currentSessionUser;
}

export function getCurrentSessionUser() {
  return getCurrentUser();
}

/**
 * Supprime la session locale de l'utilisateur.
 */
export function logout() {
  currentSessionUser = null;
  writeStorageJson(SESSION_STORAGE_KEY, null);
}
