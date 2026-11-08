import './AnnouncementCard.css';

function AnnouncementCard({ announcement }) {
  return (
    <article className="announcement-card">
      <div className="announcement-card__meta">
        <span className="announcement-card__badge">{announcement.category}</span>
        <span className="announcement-card__date">{announcement.date}</span>
      </div>

      <h3 className="announcement-card__title">{announcement.title}</h3>
      <p className="announcement-card__excerpt">{announcement.excerpt}</p>
      <p className="announcement-card__author">{announcement.author}</p>
    </article>
  );
}

export default AnnouncementCard;
