import { Link } from 'react-router-dom';
import mapPinIcon from '../assets/icons/map-pin.svg';
import './EventCard.css';

function EventCard({ event, actionLabel = 'Découvrir', actionTo = '/evenements' }) {
  return (
    <article className="event-card">
      <div className="event-card__media">
        <img
          src={event.image}
          alt={event.title}
          className="event-card__image"
        />
      </div>

      <div className="event-card__body">
        <div className="event-card__meta">
          <span className="event-card__badge">{event.category}</span>
          <span className="event-card__date">{event.dateBadge}</span>
        </div>

        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__schedule">{event.schedule}</p>

        <div className="event-card__location">
          <img
            src={mapPinIcon}
            alt=""
            className="event-card__location-icon"
          />
          <p className="event-card__location-text">{event.location}</p>
        </div>

        <div className="event-card__footer">
          <span className="event-card__seats">{event.remainingSeatsText}</span>
          <span className="event-card__price">{event.priceText}</span>
        </div>

        <Link to={actionTo} className="event-card__cta">
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

export default EventCard;
