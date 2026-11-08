import eventLumieresImg from '../assets/images/event-lumieres.png';
import eventAtelierCvImg from '../assets/images/event-atelier-cv.png';
import eventSolidaireImg from '../assets/images/event-solidaire.png';

/**
 * Données de référence extraites exactement des maquettes Figma :
 * - Accueil public · Bureau (2:57716) & Mobile (2:57859)
 * - Événements et annonces · Bureau (2:57963) & Mobile (2:58085)
 *
 * Ces données servent de simulation Frontend en attendant le Backend Laravel.
 */

export const ASSOCIATION_STATS = [
  {
    id: 'stat-members',
    value: '248',
    label: 'membres',
  },
  {
    id: 'stat-events',
    value: '18',
    label: 'événements / an',
  },
  {
    id: 'stat-energy',
    value: '100 %',
    label: 'énergie étudiante',
  },
];

export const EVENT_CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'Soirée', label: 'Soirées' },
  { id: 'Atelier', label: 'Ateliers' },
  { id: 'Solidarité', label: 'Solidarité' },
];

export const PUBLIC_EVENTS = [
  {
    id: 'evt-nuit-des-lumieres',
    category: 'Soirée',
    dateBadge: '19 NOV. 2026',
    title: 'La Nuit des Lumières',
    schedule: 'Jeudi 19 novembre · 19 h 00',
    location: 'La Sucrière, Lyon 2e',
    remainingSeatsText: '24 places restantes',
    remainingSeats: 24,
    priceText: '12 €',
    image: eventLumieresImg,
    monthLabel: 'Novembre 2026',
  },
  {
    id: 'evt-atelier-cv-cafe',
    category: 'Atelier',
    dateBadge: '24 NOV. 2026',
    title: 'Atelier CV & café',
    schedule: 'Mardi 24 novembre · 14 h 00',
    location: 'Campus Berges du Rhône · B204',
    remainingSeatsText: '8 places restantes',
    remainingSeats: 8,
    priceText: 'Gratuit',
    image: eventAtelierCvImg,
    monthLabel: 'Novembre 2026',
  },
  {
    id: 'evt-campus-solidaire',
    category: 'Solidarité',
    dateBadge: '28 NOV. 2026',
    title: 'Campus solidaire',
    schedule: 'Samedi 28 novembre · 10 h 00',
    location: 'Maison des étudiants, Lyon 7e',
    remainingSeatsText: '18 places restantes',
    remainingSeats: 18,
    priceText: 'Gratuit',
    image: eventSolidaireImg,
    monthLabel: 'Novembre 2026',
  },
];

export const PUBLIC_ANNOUNCEMENTS = [
  {
    id: 'ann-programme-novembre',
    category: 'Vie associative',
    date: '8 novembre 2026',
    title: 'Le programme de novembre est là ✨',
    excerpt:
      'Une soirée, un atelier et une action solidaire : trois bonnes raisons de se retrouver ce mois-ci.',
    author: 'Par Léa Moreau · Bureau Agora',
    featuredOnHome: true,
  },
  {
    id: 'ann-permanence-bureau',
    category: 'Permanence',
    date: '6 novembre 2026',
    title: 'Le bureau vous donne rendez-vous',
    excerpt:
      'Retrouvez-nous chaque mardi de 12 h à 14 h, à la Maison des étudiants. On apporte le café !',
    author: 'Par Léa Moreau · Bureau Agora',
    featuredOnHome: true,
  },
  {
    id: 'ann-collecte-solidaire',
    category: 'Solidarité',
    date: '4 novembre 2026',
    title: 'Collecte solidaire : on compte sur vous',
    excerpt:
      'Déposez vos produits non périssables avant le 27 novembre. Chaque petit geste compte.',
    author: 'Par Léa Moreau · Bureau Agora',
    featuredOnHome: false,
  },
];
