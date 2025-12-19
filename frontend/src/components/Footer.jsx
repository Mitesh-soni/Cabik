import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Left Section */}
        <div className="footer-section">
          <h2 className="footer-logo">CABIK</h2>
          <p className="footer-text">
            A complete vehicle management system for Cars, Bikes & Scooties.
          </p>
        </div>

        {/* Middle Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Cars</li>
            <li>Bikes</li>
            <li>Scooties</li>
          </ul>
        </div>

        {/* Right Contact Info */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@cabik.com</p>
          <p>Phone: +91 9588030800</p>

          <div className="footer-social">
            <span>🌐</span>
            <span>📘</span>
            <span>📸</span>
            <span>🐦</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} CABIK — All Rights Reserved.
      </div>
    </footer>
  );
}
