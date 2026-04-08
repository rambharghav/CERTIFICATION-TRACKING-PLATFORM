import { Link } from "react-router-dom";

function Landing() {
  return (
    <div style={{ padding: "40px" }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
          Certification Tracker Platform
        </h1>

        <p style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
          Track, manage and monitor your professional certifications with ease.
        </p>

        <Link to="/login">
          <button style={{
            padding: "12px 25px",
            fontSize: "16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}>
            Login
          </button>
        </Link>
      </section>


      {/* STATS SECTION */}
      <section style={{
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        marginBottom: "60px"
      }}>
        <div>
          <h2>1000+</h2>
          <p>Certified Students</p>
        </div>

        <div>
          <h2>800+</h2>
          <p>Global Certifications</p>
        </div>

        <div>
          <h2>120+</h2>
          <p>Certification Providers</p>
        </div>
      </section>


      {/* DESCRIPTION SECTION */}
      <section style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
        <h2>Why Use Our Platform?</h2>
        <p style={{ marginTop: "20px", color: "#555" }}>
          Our platform helps professionals stay up-to-date with certification
          renewals, track expiry deadlines, and securely store certificates
          for easy access and verification.
        </p>
      </section>

    </div>
  );
}

export default Landing;