import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p className="footer__brand">agora · Lyon 2</p>

      <div className="footer__info">
        <p className="footer__line">
          Association étudiante · Université Lumière Lyon 2
        </p>
        <p className="footer__line">
          86 rue Pasteur, 69007 Lyon · bonjour@agora-lyon2.fr
        </p>
      </div>

      <p className="footer__legal">
        © 2026 · Mentions légales · Confidentialité
      </p>
    </footer>
  );
}

export default Footer;
