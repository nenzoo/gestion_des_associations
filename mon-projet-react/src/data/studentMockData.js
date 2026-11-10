import { MEMBERSHIP_STATUS, ROLES } from './authMockData.js';

/**
 * Données de référence pour l'espace étudiant extraites des maquettes Figma :
 * - Mon profil · Bureau (2:58659) & Mobile (2:58759)
 * - Sécurité du compte · Bureau (2:58846) & Mobile (2:58917)
 * - Mes inscriptions · Bureau (2:58975) & Mobile (2:59079)
 *
 * Les détails des événements proviennent de `publicMockData.js` (sans duplication).
 */

export const MEMBERSHIP_BADGE_LABELS = {
  ACTIVE: 'ACTIVE',
};

export const INITIAL_STUDENT_PROFILES_BY_ID = {
  'usr-manon': {
    id: 'usr-manon',
    firstName: 'Manon',
    lastName: 'Laurent',
    email: 'manon.laurent@univ-lyon2.fr',
    studentNumber: '22610482',
    studyTrack: 'L2 · Information-communication',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membership: {
      membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
      badgeLabel: MEMBERSHIP_BADGE_LABELS.ACTIVE,
      academicYear: 'Année 2026–2027',
      memberSince: '14 septembre 2026',
      validUntil: '31 août 2027',
      description:
        'Adhérente depuis le 14 septembre 2026. Ton adhésion reste valable jusqu’au 31 août 2027.',
      feeText: '✓ Cotisation de 10 € réglée',
    },
    security: {
      lastPasswordUpdate: '14 septembre 2026',
    },
  },
};

export const DEFAULT_STUDENT_PROFILE_TEMPLATE = {
  studyTrack: 'L2 · Information-communication',
  role: ROLES.STUDENT,
  membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
  membership: {
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    badgeLabel: MEMBERSHIP_BADGE_LABELS.ACTIVE,
    academicYear: 'Année 2026–2027',
    memberSince: '14 septembre 2026',
    validUntil: '31 août 2027',
    description:
      'Adhérente depuis le 14 septembre 2026. Ton adhésion reste valable jusqu’au 31 août 2027.',
    feeText: '✓ Cotisation de 10 € réglée',
  },
  security: {
    lastPasswordUpdate: '14 septembre 2026',
  },
};

export const STUDENT_SECURITY_CONFIG = {
  expectedDemoPassword: '••••••••••••',
  minPasswordLength: 12,
  passwordRequirementHint:
    '12 caractères minimum, une majuscule et un chiffre.',
  sessionDisconnectNote:
    'Les autres sessions seront déconnectées après la modification.',
  forgotPasswordHelpText:
    'Tu ne connais plus ton mot de passe actuel ? Demande un lien de réinitialisation par e-mail.',
  mismatchErrorText: 'Les mots de passe ne correspondent pas.',
  invalidCurrentPasswordErrorText: 'Le mot de passe actuel est incorrect.',
};

/**
 * Inscriptions initiales par identifiant d'utilisateur (conformément à Figma 2:58975 :
 * Manon Laurent a 2 inscriptions confirmées :
 * - 'evt-nuit-des-lumieres' ("La Nuit des Lumières")
 * - 'evt-atelier-cv-cafe' ("Atelier CV & café")
 * tandis que 'evt-campus-solidaire' ("Campus solidaire") est proposé en suggestion).
 */
export const INITIAL_REGISTRATIONS_BY_USER = {
  'usr-manon': ['evt-nuit-des-lumieres', 'evt-atelier-cv-cafe'],
};

export const STUDENT_REGISTRATION_LABELS = {
  confirmedBadge: 'Inscription confirmée',
  cancelNotice:
    'Un imprévu ? Annule ton inscription pour libérer une place. Les annulations ferment 24 h avant l’événement.',
};
