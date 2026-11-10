/**
 * Données fictives d'authentification et de demandes d'adhésion
 * basées sur les maquettes Figma :
 * - Demande d'adhésion · Bureau (2:58202) & Mobile (2:58264)
 * - Adhésion envoyée · Bureau (2:58311) & Mobile (2:58362)
 * - Connexion · Bureau (2:58398) & Mobile (2:58450)
 * - Espace étudiant · Bureau (2:58659) & Mobile (2:58759)
 *
 * Statuts métier d'adhésion possibles (Règle fondamentale §4) :
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
    id: 'req-etudiant-attente',
    lastName: 'Test',
    firstName: 'Étudiant',
    email: 'etudiant.attente@univ-lyon2.fr',
    studentNumber: '22610890',
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
    submittedAt: '2026-11-10',
  },
  {
    id: 'req-etudiant-refuse',
    lastName: 'Test',
    firstName: 'Étudiant',
    email: 'etudiant.refuse@univ-lyon2.fr',
    studentNumber: '22610912',
    status: MEMBERSHIP_STATUS.REFUSEE,
    submittedAt: '2026-11-08',
  },
];

/**
 * Trois profils fictifs étudiants pour tester les trois situations d'adhésion :
 * 1. Manon Laurent : ACCEPTEE (accès complet à /etudiant/*, badge visuel ACTIVE dans le profil)
 * 2. Étudiant test : EN_ATTENTE (accès refusé à /etudiant/*, redirigé vers /adhesion/envoyee)
 * 3. Étudiant test : REFUSEE (accès refusé à /etudiant/*, redirigé vers /adhesion/envoyee)
 */
export const MOCK_USERS = [
  {
    id: 'usr-manon',
    firstName: 'Manon',
    lastName: 'Laurent',
    email: 'manon.laurent@univ-lyon2.fr',
    studentNumber: '22610482',
    studyTrack: 'Licence 3 · Information-Communication',
    bio: 'Passionnée de graphisme éditorial et de photographie argentique.',
    memberNumber: 'AG-2026-0148',
    memberSince: '14 septembre 2026',
    memberValidUntil: '31 août 2027',
    feePaid: true,
    feeAmount: '10 €',
    lastPasswordUpdate: '14 septembre 2026',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
  },
  {
    id: 'usr-etudiant-attente',
    firstName: 'Étudiant',
    lastName: 'test',
    email: 'etudiant.attente@univ-lyon2.fr',
    studentNumber: '22610890',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.EN_ATTENTE,
  },
  {
    id: 'usr-etudiant-refuse',
    firstName: 'Étudiant',
    lastName: 'test',
    email: 'etudiant.refuse@univ-lyon2.fr',
    studentNumber: '22610912',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.REFUSEE,
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
