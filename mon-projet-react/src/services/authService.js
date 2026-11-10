import {
  INITIAL_LOGIN_FORM,
  INITIAL_MEMBERSHIP_FORM,
  INITIAL_MEMBERSHIP_REQUESTS,
  MEMBERSHIP_STATUS,
  MOCK_USERS,
  TRUST_AVATARS,
} from '../data/authMockData';

/**
 * Service d'authentification et d'adhésion (simulation Frontend).
 * Préparé pour le futur remplacement par des appels API Laravel :
 * - POST /api/membership-requests
 * - GET  /api/membership-requests/status
 * - POST /api/login
 */

let membershipRequestsStore = [...INITIAL_MEMBERSHIP_REQUESTS];
let latestSubmittedRequest = INITIAL_MEMBERSHIP_REQUESTS[0];
let currentSessionUser = null;

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

  return newRequest;
}

export function getLatestMembershipRequest() {
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

  // Vérifier si une demande d'adhésion est encore EN_ATTENTE pour cet e-mail
  const pendingRequest = membershipRequestsStore.find(
    (req) =>
      req.email.toLowerCase() === cleanEmail &&
      req.status === MEMBERSHIP_STATUS.EN_ATTENTE
  );

  const matchedUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === cleanEmail
  );

  currentSessionUser = matchedUser || {
    id: 'usr-session',
    firstName: pendingRequest ? pendingRequest.firstName : 'Manon',
    lastName: pendingRequest ? pendingRequest.lastName : 'Laurent',
    email: cleanEmail,
    role: 'Membre',
    membershipStatus: pendingRequest
      ? MEMBERSHIP_STATUS.EN_ATTENTE
      : MEMBERSHIP_STATUS.ACCEPTEE,
  };

  return {
    ok: true,
    user: currentSessionUser,
    pendingRequest: pendingRequest || null,
  };
}

export function getCurrentSessionUser() {
  return currentSessionUser;
}
