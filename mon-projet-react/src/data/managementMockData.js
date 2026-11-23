import { MEMBERSHIP_STATUS, ROLES } from './authMockData.js';

/**
 * Données de référence pour l'espace Présidence & Secrétariat extraites des maquettes Figma :
 * - Tableau de bord · Bureau (2:59170) & Mobile (2:59333)
 * - Demandes d’adhésion · Bureau (2:59784) & Mobile (2:59934)
 * - Membres de l’association · Bureau (2:60049) & Mobile (2:60188)
 * - Gestion des événements · Bureau (2:60289) & Mobile (2:60443)
 * - Gestion des annonces · Bureau (2:60559) & Mobile (2:60678)
 *
 * Distinction stricte des statuts (Condition n°1) :
 * - Statuts métier d'adhésion : EN_ATTENTE, ACCEPTEE, REFUSEE
 * - Statut de révocation d'un membre dans l'annuaire : REVOQUEE
 * - Badge visuel de présentation d'un membre actif : ACTIVE
 */

/**
 * Date actuelle du projet (23 novembre 2026) utilisée pour qualifier la chronologie
 * des événements :
 * - "La Nuit des Lumières" (19 novembre 2026) est désormais un événement passé
 * - "Atelier CV & café" (24 novembre 2026) et "Campus solidaire" (28 novembre 2026)
 *   sont les 2 événements publiés à venir.
 */
export const PROJECT_REFERENCE_DATE_ISO = '2026-11-23T10:00:00';

export const MEMBER_BADGE_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOQUEE: 'REVOQUEE',
};

export const EVENT_PUBLICATION_STATUS = {
  PUBLISHED: 'Publié',
  DRAFT: 'Brouillon',
  PAST: 'Passé',
  CANCELLED: 'ANNULE',
};

export const ANNOUNCEMENT_PUBLICATION_STATUS = {
  PUBLISHED: 'Publiée',
};

export const DASHBOARD_REFERENCE_METRICS = {
  baseActiveMembersCount: 248,
  activeMembersDeltaText: '+18 depuis septembre',
  annualMembersGoal: 300,
  baseRefusedRequestsCount: 2,
  basePastEventsCount: 15,
  treasuryBalanceText: '1 840 €',
  treasuryNoteText: 'Trésorerie · Lecture seule',
  academicYearLabel: 'Année universitaire 2026–2027',
  dashboardDateLabel:
    'Dimanche 8 novembre 2026 · Une belle semaine se prépare chez Agora.',
};

/**
 * Demandes d'adhésion en attente initiales (Figma 2:59784 & 2:59284) :
 * - Chloé Bernard (6 nov. 2026)
 * - Hugo Petit (7 nov. 2026)
 * - Inès Robert (8 nov. 2026)
 */
export const INITIAL_MANAGEMENT_REQUESTS = [
  {
    id: 'req-chloe-bernard',
    userId: 'usr-chloe-bernard',
    firstName: 'Chloé',
    lastName: 'Bernard',
    initials: 'CB',
    email: 'chloe.bernard@univ-lyon2.fr',
    studentNumber: '22610517',
    submittedAt: '2026-11-06',
    submittedAtLabel: '6 nov. 2026',
    dashboardSubmittedLabel: 'Reçue le 6 novembre',
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
  },
  {
    id: 'req-hugo-petit',
    userId: 'usr-hugo-petit',
    firstName: 'Hugo',
    lastName: 'Petit',
    initials: 'HP',
    email: 'hugo.petit@univ-lyon2.fr',
    studentNumber: '22610893',
    submittedAt: '2026-11-07',
    submittedAtLabel: '7 nov. 2026',
    dashboardSubmittedLabel: 'Reçue le 7 novembre',
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
  },
  {
    id: 'req-ines-robert',
    userId: 'usr-ines-robert',
    firstName: 'Inès',
    lastName: 'Robert',
    initials: 'IR',
    email: 'ines.robert@univ-lyon2.fr',
    studentNumber: '22610641',
    submittedAt: '2026-11-08',
    submittedAtLabel: '8 nov. 2026',
    dashboardSubmittedLabel: 'Reçue le 8 novembre',
    status: MEMBERSHIP_STATUS.EN_ATTENTE,
  },
];

/**
 * Historique initial des dernières décisions (Figma 2:59913) :
 * - Noah Diallo : ACCEPTEE par Emma Martin (6 nov. 2026)
 * - Lucas Roux : REFUSEE par Léa Moreau (4 nov. 2026)
 */
export const INITIAL_MEMBERSHIP_DECISIONS = [
  {
    id: 'dec-noah-diallo',
    requestId: 'req-noah-diallo',
    userId: 'usr-noah-diallo',
    firstName: 'Noah',
    lastName: 'Diallo',
    email: 'noah.diallo@univ-lyon2.fr',
    studentNumber: '22610366',
    status: MEMBERSHIP_STATUS.ACCEPTEE,
    processedBy: 'Emma Martin',
    processedAt: '2026-11-06',
    processedAtLabel: '6 nov. 2026',
    reason: '',
  },
  {
    id: 'dec-lucas-roux',
    requestId: 'req-lucas-roux',
    userId: 'usr-lucas-roux',
    firstName: 'Lucas',
    lastName: 'Roux',
    email: 'lucas.roux@univ-lyon2.fr',
    studentNumber: '22610714',
    status: MEMBERSHIP_STATUS.REFUSEE,
    processedBy: 'Léa Moreau',
    processedAt: '2026-11-04',
    processedAtLabel: '4 nov. 2026',
    reason: 'Certificat de scolarité Lyon 2 non conforme.',
  },
];

/**
 * Annuaire initial des membres de l'association (Figma 2:60049 & 2:60188).
 * Séparation stricte des propriétés :
 * - `membershipStatus: 'ACCEPTEE'` : décision historique d'acceptation de la demande
 * - `membershipAccessStatus` : `'ACTIVE'` (accès membre actif) ou `'REVOQUEE'` (accès retiré)
 * - `badgeLabel` : badge visuel affiché dans l'annuaire (`'ACTIVE'` ou `'REVOQUEE'`)
 * - `isBoardAccount: true` : compte du bureau non révocable ("Compte du bureau")
 */
export const INITIAL_ASSOCIATION_MEMBERS = [
  {
    id: 'usr-manon',
    firstName: 'Manon',
    lastName: 'Laurent',
    email: 'manon.laurent@univ-lyon2.fr',
    studentNumber: '22610482',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
    badgeLabel: MEMBER_BADGE_STATUS.ACTIVE,
    isBoardAccount: false,
    revokedAtLabel: '',
    revocationReason: '',
  },
  {
    id: 'usr-noah-diallo',
    firstName: 'Noah',
    lastName: 'Diallo',
    email: 'noah.diallo@univ-lyon2.fr',
    studentNumber: '22610366',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
    badgeLabel: MEMBER_BADGE_STATUS.ACTIVE,
    isBoardAccount: false,
    revokedAtLabel: '',
    revocationReason: '',
  },
  {
    id: 'usr-lea',
    firstName: 'Léa',
    lastName: 'Moreau',
    email: 'lea.moreau@univ-lyon2.fr',
    studentNumber: '22510240',
    role: ROLES.SECRETARY,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
    badgeLabel: MEMBER_BADGE_STATUS.ACTIVE,
    isBoardAccount: true,
    revokedAtLabel: '',
    revocationReason: '',
  },
  {
    id: 'usr-adam',
    firstName: 'Adam',
    lastName: 'Benali',
    email: 'adam.benali@univ-lyon2.fr',
    studentNumber: '22510851',
    role: ROLES.TREASURER,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.ACTIVE,
    badgeLabel: MEMBER_BADGE_STATUS.ACTIVE,
    isBoardAccount: true,
    revokedAtLabel: '',
    revocationReason: '',
  },
  {
    id: 'usr-sarah-lefevre',
    firstName: 'Sarah',
    lastName: 'Lefèvre',
    email: 'sarah.lefevre@univ-lyon2.fr',
    studentNumber: '22410127',
    role: ROLES.STUDENT,
    membershipStatus: MEMBERSHIP_STATUS.ACCEPTEE,
    membershipAccessStatus: MEMBER_BADGE_STATUS.REVOQUEE,
    badgeLabel: MEMBER_BADGE_STATUS.REVOQUEE,
    isBoardAccount: false,
    revokedAtLabel: 'Révoquée le 2 nov.',
    revocationReason: 'Non-respect de la charte associative.',
  },
];

/**
 * Capacités totales et métadonnées de gestion des 3 événements publiés de `publicMockData.js`
 * (Figma 2:59258 & 2:60353 :
 * - La Nuit des Lumières : 96 / 120 inscrits · 24 places restantes
 * - Atelier CV & café : 22 / 30 inscrits · 8 places restantes
 * - Campus solidaire : 42 / 60 inscrits · 18 places restantes)
 */
export const EVENT_CAPACITY_BY_ID = {
  'evt-nuit-des-lumieres': {
    totalCapacity: 120,
    dayNumber: '19',
    monthShort: 'NOV.',
    startIso: '2026-11-19T19:00:00',
    description:
      'Grande soirée annuelle d’Agora à La Sucrière : concerts étudiants, scénographie lumineuse et rencontres.',
  },
  'evt-atelier-cv-cafe': {
    totalCapacity: 30,
    dayNumber: '24',
    monthShort: 'NOV.',
    startIso: '2026-11-24T14:00:00',
    description:
      'Relecture personnalisée de ton CV et conseils de recherche de stage autour d’un café convivial.',
  },
  'evt-campus-solidaire': {
    totalCapacity: 60,
    dayNumber: '28',
    monthShort: 'NOV.',
    startIso: '2026-11-28T10:00:00',
    description:
      'Matinée d’entraide et distribution de paniers solidaires pour les étudiants de Lyon 2.',
  },
};

/**
 * Brouillon d'événement en cours (Figma 2:60427) :
 * - "Les retrouvailles de décembre" (10 déc. 2026 · 18 h 00, Brouillon)
 */
export const INITIAL_DRAFT_EVENTS = [
  {
    id: 'evt-retrouvailles-decembre',
    category: 'Soirée',
    dateBadge: '10 DÉC. 2026',
    dayNumber: '10',
    monthShort: 'DÉC.',
    title: 'Les retrouvailles de décembre',
    description:
      'Soirée conviviale de fin de semestre pour célébrer les projets étudiants avant les congés d’hiver.',
    schedule: '10 déc. 2026 · 18 h 00',
    dateInput: '2026-12-10',
    timeInput: '18:00',
    startIso: '2026-12-10T18:00:00',
    location: 'Maison des étudiants, Lyon 7e',
    totalCapacity: 80,
    remainingSeats: 80,
    remainingSeatsText: '80 places restantes',
    priceText: 'Gratuit',
    priceAmount: 0,
    publicationStatus: EVENT_PUBLICATION_STATUS.DRAFT,
    monthLabel: 'Décembre 2026',
  },
];

/**
 * Événements passés de référence (pour l'onglet "Passés · 15" de Figma 2:60345).
 */
export const INITIAL_PAST_EVENTS = [
  {
    id: 'evt-past-rentree-agora',
    category: 'Soirée',
    dateBadge: '18 SEPT. 2026',
    title: 'Soirée de rentrée Agora',
    schedule: 'Vendredi 18 septembre · 19 h 30',
    startIso: '2026-09-18T19:30:00',
    location: 'Campus Berges du Rhône · Cour d’honneur',
    totalCapacity: 150,
    remainingSeats: 0,
    registeredCount: 150,
    priceText: 'Gratuit',
    publicationStatus: EVENT_PUBLICATION_STATUS.PAST,
  },
  {
    id: 'evt-past-forum-campus',
    category: 'Atelier',
    dateBadge: '2 OCT. 2026',
    title: 'Forum des initiatives étudiantes',
    schedule: 'Vendredi 2 octobre · 14 h 00',
    startIso: '2026-10-02T14:00:00',
    location: 'Campus Porte des Alpes · Hall B',
    totalCapacity: 90,
    remainingSeats: 6,
    registeredCount: 84,
    priceText: 'Gratuit',
    publicationStatus: EVENT_PUBLICATION_STATUS.PAST,
  },
  {
    id: 'evt-past-braderie-solidaire',
    category: 'Solidarité',
    dateBadge: '17 OCT. 2026',
    title: 'Braderie solidaire d’automne',
    schedule: 'Samedi 17 octobre · 10 h 00',
    startIso: '2026-10-17T10:00:00',
    location: 'Maison des étudiants, Lyon 7e',
    totalCapacity: 70,
    remainingSeats: 0,
    registeredCount: 70,
    priceText: 'Gratuit',
    publicationStatus: EVENT_PUBLICATION_STATUS.PAST,
  },
];

/**
 * Fil d'activité du bureau initial (Figma 2:59321).
 */
export const INITIAL_BOARD_ACTIVITY_FEED = [
  {
    id: 'feed-programme-novembre',
    timeLabel: 'Aujourd’hui · 09 h 42',
    text: 'Léa a publié le programme de novembre.',
  },
  {
    id: 'feed-depense-adam',
    timeLabel: 'Hier · 16 h 20',
    text: 'Adam a ajouté une dépense de 472 €.',
  },
  {
    id: 'feed-adhesion-noah',
    timeLabel: '6 nov. · 14 h 10',
    text: 'Emma a accepté l’adhésion de Noah.',
  },
];
