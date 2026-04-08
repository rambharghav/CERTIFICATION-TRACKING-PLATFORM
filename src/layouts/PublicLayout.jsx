import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Calendar,
  Bell,
  ChartBar,
  Globe,
  Search,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import "./PublicLayout.css";

function PublicLayout() {
  const navigate = useNavigate();
  const languages = ["EN", "HI", "TE", "JA", "ES", "DE"];

  const langMap = {
    EN: "en",
    HI: "hi",
    TE: "te",
    JA: "ja",
    ES: "es",
    DE: "de"
  };

  const [langIndex, setLangIndex] = useState(0);
  const currentLang = languages[langIndex];
  
 const handleLangToggle = () => {
    const nextIndex = (langIndex + 1) % languages.length;
    setLangIndex(nextIndex);

    const langCode = langMap[languages[nextIndex]];

    // Internal function to attempt the click/change
    const triggerTranslation = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
      } else {
        // If the script isn't ready, wait 100ms and try once more
        setTimeout(triggerTranslation, 100);
      }
    };

    triggerTranslation();
  };

  useEffect(() => {
    // 1. Define the initialization function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,te,ja,es,de",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // 2. Add the script only if it doesn't exist
    const existingScript = document.querySelector('script[src*="translate_a/element.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [showSearch, setShowSearch] = useState(false);
  const searchItems = [
    { label: "Track Certifications", id: "track" },
    { label: "Services", id: "services" },
    { label: "FAQ / Questions", id: "faq" },
    { label: "Contact", id: "footer" },
  ];
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFAQ, setActiveFAQ] = useState(null);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="public-container">
      {/* Hidden element required by Google Translate script */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <div className="top-strip">
        <div className="top-strip-inner">

          {/* LEFT SIDE */}
          <div className="top-left">
            <span className="top-link" onClick={() => scrollToSection("footer")}>
              Help
            </span>

            <span className="top-link" onClick={() => scrollToSection("footer")}>
              Support
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="top-right">

            <div
              className="lang-switch"
              onClick={handleLangToggle}
            >
              <Globe size={16} />
              <span>{currentLang}</span>
            </div>

            <span className="search-icon">
              <div className="search-wrapper">

                {!showSearch ? (
                  <span onClick={() => setShowSearch(true)} className="search-icon">
                    <Search size={16} />
                  </span>
                ) : (
                  <div className="search-box">

                    <input
                      autoFocus
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {searchTerm && (
                      <div className="search-dropdown">
                        {searchItems
                          .filter(item =>
                            item.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((item, index) => (
                            <div
                              key={index}
                              className="search-item"
                              onClick={() => {
                                scrollToSection(item.id);
                                setShowSearch(false);
                                setSearchTerm("");
                              }}
                            >
                              {item.label}
                            </div>
                          ))}
                      </div>
                    )}

                  </div>
                )}

              </div>
            </span>

            <span className="top-email">
              2400031810cse4@gmail.com
            </span>

          </div>

        </div>
      </div>

      {/* ===== NEW HEADER ===== */}
      <header className="new-header">
        <div className="new-header-inner">

          <div className="new-logo">
            <BadgeCheck size={22} />
            <span>CertifyMe</span>
          </div>

          <nav className="new-nav">

            <span
              onClick={() => {
                if (window.scrollY === 0) {
                  window.location.reload(); // reload if already at top
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              Home
            </span>
            <span onClick={() => scrollToSection("services")}>
              About
            </span>

            <span onClick={() => scrollToSection("faq")}>
              Resources and FAQs
            </span>

            <span onClick={() => scrollToSection("track")}>
              Global Certifications
            </span>
            <span
              onClick={() => {
                if (window.location.pathname === "/") {
                  document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/");
                  setTimeout(() => {
                    document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
                  }, 300);
                }
              }}
            >
              Contact Us
            </span>
          </nav>
          <div className="new-auth">
            <Link to="/signup">Sign up</Link>
            <span className="divider">|</span>
            <Link to="/login">Log in</Link>
          </div>

        </div>
      </header>

      {/* ===== HERO SECTION (FIXED) ===== */}

      <section className="new-hero-bg" id="hero">

        <div className="hero-overlay">

          <div className="hero-content">

            <h1 className="hero-title">
              {currentLang === "EN"
                ? "Manage your certifications smarter & faster"
                : "Gestiona tus certificaciones más rápido y mejor"}
            </h1>

            <p className="hero-desc">
              Track renewals, monitor expiry dates and stay compliant with CertifyMe. One dashboard to manage everything in one place. Never miss a deadline again.
            </p>

            <div className="hero-buttons">
              <button
                className="hero-btn primary"
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
              <button
                className="hero-btn-secondary"
                onClick={() => {
                  document.querySelector(".why-section").scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              >
                Learn More
              </button>
            </div>

          </div>

        </div>

      </section>


      {/* ===== STATS (UNCHANGED) ===== */}
      <section className="stats-final" id="stats">
        <div className="stats-inner">

          <h2 className="stats-heading">
            Trusted by Students & Professionals across the globe.
          </h2>

          <div className="stats-row">

            <div className="stat-box">
              <h2 className="stat-number">1000+</h2>
              <p>Certified Students</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-number">800+</h2>
              <p>Global Certifications</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-number">120+</h2>
              <p>Certification Providers</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-number">5k+</h2>
              <p>Renewal Alerts Sent</p>
            </div>

          </div>

          <div className="stats-highlight">
            <p>
              "CertifyMe is built for the Future of professionals, where Certifications Stay Active, Not Forgotten Helping Professionals Stay Certified & Compliant"
            </p>
          </div>

        </div>
      </section>


      <section className="why-section" id="why">

        <div className="why-overlay">

          <div className="why-container">

            <div className="why-content">

              <h2>Why Choose CertifyMe?</h2>

              <p className="why-desc">
                Our platform helps professionals stay up-to-date with certification renewals,
                track expiry deadlines, and securely store certificates for easy access and verification.
              </p>

              <div className="why-list">

                <div className="why-item">
                  <span>01</span>
                  <div>
                    <h4>Expiry Tracking</h4>
                    <p>Automatically track certification deadlines.</p>
                  </div>
                </div>

                <div className="why-item">
                  <span>02</span>
                  <div>
                    <h4>Smart Reminders</h4>
                    <p>Get notified before certifications expire.</p>
                  </div>
                </div>

                <div className="why-item">
                  <span>03</span>
                  <div>
                    <h4>Secure Storage</h4>
                    <p>Manage all certificates in one place safely.</p>
                  </div>
                </div>

                <div className="why-item">
                  <span>04</span>
                  <div>
                    <h4>Reports & Insights</h4>
                    <p>Track progress with smart dashboards.</p>
                  </div>
                </div>

              </div>

              <p className="why-highlight">
                Stay Certified. Stay Ahead. Never Miss a Renewal Again
              </p>

            </div>

          </div>

        </div>

      </section>



      <section id="faq" className="faq-section">
        <h2>Got questions?</h2>

        <div className="faq-container">

          {/* ITEM 1 */}
          <div
            className={`faq-item ${activeFAQ === 0 ? "active" : ""}`}
            onClick={() => setActiveFAQ(activeFAQ === 0 ? null : 0)}
          >
            <div className="faq-question">
              <span>How do I create a certification record?</span>
              <FiChevronDown className="faq-icon" />
            </div>

            <div className="faq-answer">
              Go to dashboard → click "Add Certification" → fill details → save.
            </div>
          </div>

          {/* ITEM 2 */}
          <div
            className={`faq-item ${activeFAQ === 1 ? "active" : ""}`}
            onClick={() => setActiveFAQ(activeFAQ === 1 ? null : 1)}
          >
            <div className="faq-question">
              <span>How do reminders work?</span>
              <FiChevronDown className="faq-icon" />
            </div>

            <div className="faq-answer">
              You’ll get alerts before expiry based on your settings.
            </div>
          </div>

          {/* ITEM 3 */}
          <div
            className={`faq-item ${activeFAQ === 2 ? "active" : ""}`}
            onClick={() => setActiveFAQ(activeFAQ === 2 ? null : 2)}
          >
            <div className="faq-question">
              <span>Can I track multiple certifications?</span>
              <FiChevronDown className="faq-icon" />
            </div>

            <div className="faq-answer">
              Yes, manage unlimited certifications in one dashboard.
            </div>
          </div>

        </div>
      </section>

      <section className="track-section" id="track">

        <div className="track-container">

          {/* LEFT TEXT */}
          <div className="track-content">

            <h2>
              Track, Monitor and <br />
              <span>Renew Certs!!!</span>
            </h2>

            <p>
              Stay on top of your certifications with real-time tracking,
              smart reminders, and centralized management. Never miss an expiry again.
            </p>


          </div>

          {/* RIGHT IMAGE */}
          <div className="track-image">
            <img src="/CertifyTrackRenewillustration.png" alt="Track Certifications" />
          </div>

        </div>

      </section>

      {/* ===== Services ===== */}

      <section className="services-section" id="services">

        <div className="services-container">

          <p className="services-subtitle">WHAT WE OFFER</p>
          <h2 className="services-title">Services on CertifyMe</h2>

          <div className="services-grid">

            {/* CARD 1 */}
            <div className="service-card">
              <div className="service-icon">
                <Calendar size={24} />
              </div>
              <h3>Expiry Tracking</h3>
              <p>
                Automatically track certification expiry dates and never miss deadlines.
                Stay compliant with real-time monitoring.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="service-card">
              <div className="service-icon">
                <Bell size={24} />
              </div>
              <h3>Smart Reminders</h3>
              <p>
                Get timely alerts before your certifications expire and plan renewals
                without last-minute stress.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="service-card">
              <div className="service-icon">
                <ChartBar size={24} />
              </div>
              <h3>Reports & Insights</h3>
              <p>
                Analyze your certification progress with dashboards and track your
                professional growth effectively.
              </p>
            </div>

          </div>

        </div>

      </section>
      <section className="cta-section">

        <div className="cta-overlay">

          <h2>Ready? Let’s get Certified.</h2>

          <button
            onClick={() => navigate("/signup")}
            className="cta-btn"
          >
            Sign up free
          </button>

        </div>

      </section>
      {/* ===== FOOTER (UNCHANGED) ===== */}
      <footer className="footer" id="footer">
        <div className="footer-inner">

          <div className="footer-grid">
            <div className="footer-brand">
              <h3 className="footer-logo">
                <BadgeCheck size={26} />
                CertifyMe
              </h3>

              <p>
                Track, manage and renew your certifications effortlessly.
                Stay future-ready with structured credential monitoring.
              </p>

              <div className="footer-social">
                <p className="social-label">Learn more on</p>
                <div className="social-box"><Instagram size={14} /></div>
                <div className="social-box"><Facebook size={14} /></div>
                <div className="social-box"><Youtube size={14} /></div>
                <div className="social-box"><Linkedin size={14} /></div>
              </div>
            </div>

            <div className="footer-column">
              <h4>Platform</h4>
              <a>Features</a>
              <a>Integrations</a>
              <a>Pricing</a>
              <a>Roadmap</a>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <a>Documentation</a>
              <a>Help Center</a>
              <a>Community</a>
              <a>Tutorials</a>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <div className="footer-contact-item">
                <Phone size={16} /> +91 8341647137
              </div>
              <div className="footer-contact-item">
                <Mail size={16} /> 2400031810cse4@gmail.com
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} /> India
              </div>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <a>Privacy</a>
              <a>Terms</a>
              <a>Security</a>
              <a>Cookies</a>
            </div>

          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            © 2026 CertifyMe — All Rights Reserved
          </div>

        </div>
      </footer>

    </div>
  );
}

export default PublicLayout;