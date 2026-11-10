/**
 * Données fictives d'authentification et de demandes d'adhésion
 * basées sur les maquettes Figma :
 * - Demande d'adhésion · Bureau (2:58202) & Mobile (2:58264)
 * - Adhésion envoyée · Bureau (2:58311) & Mobile (2:58362)
 * - Connexion · Bureau (2:58398) & Mobile (2:58450)
 *
 * Statuts d'adhésion possibles (Règle fondamentale §4) :
 * - EN_ATTENTE
 * - ACCEPTEE
 * - REFUSEE
 */

export const MEMBERSHIP_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  ACCEPTEE: 'ACCEPTEE',
  REFUSEE: 'REFUSEE',
};

export const ROLES = {
  STUDENT: 'Membre',
  PRESIDENT: 'Présidente',
  SECRETARY: 'Secrétaire',
  TREASURER: 'Trésorier',
  ADMIN: 'Administrateur',
};

export const INITIAL_MEMBERSHIP_FORM = {
  lastName: 'Laurent',
  firstName: 'Manon',
  email: 'manon.laurent@univ-lyon2.fr',
  studentNumber: '22610482',
  acceptedTerms: true,
};

export const INITIAL_LOGIN_FORM = {
  email: 'manon.laurent@univ-lyon2.fr',
  password: '••••••••••••',
  rememberMe: true,
};

export const TRUST_AVATARS = ['EM', 'LM', 'AB'];

export const INITIAL_MEMBERSHIP_REQUESTS = [
  {
    id: 'req-manon-laurent',
    lastName: 'Laurent',
    firstName: 'Manon',
    email: 'manon.laurent@univ-lyon2.fr',
    studentNumber: '22610482',
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
    submittedAt: '2026-11-10',
  },
];

export const MOCK_USERS = [
  {
    id: 'usr-manon',
    firstName: 'Manon',
    lastName: 'Laurent',
    email: 'manon.laurent@univ-lyon2.fr',
    studentNumber: '22610482',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
  },
  {
    id: 'usr-emma',
    firstName: 'Emma',
    lastName: 'Martin',
    email: 'emma.martin@univ-lyon2.fr',
    role: ROLES.PRESIDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
  },
  {
    id: 'usr-lea',
    firstName: 'Léa',
    lastName: 'Moreau',
    email: 'lea.moreau@univ-lyon2.fr',
    role: ROLES.SECRETARY,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
  },
];
