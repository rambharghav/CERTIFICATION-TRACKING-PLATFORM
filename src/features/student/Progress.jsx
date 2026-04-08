import "./Progress.css";
import { useEffect, useState, useCallback } from "react";
import { certificationApi } from "../../api/certificationApi";
import { useAuth } from "../../context";

function Progress() {

  const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      if (!user?.id) return;

      setLoading(true);

      const data = await certificationApi.getAll(user.id);

      const today = new Date();

      const formatted = data.map((c) => {
        const issue = new Date(c.issueDate);
        const expiry = new Date(c.expiryDate);

        const totalDuration = expiry - issue;
        const elapsed = today - issue;

        let progress = Math.floor((elapsed / totalDuration) * 100);

        // ✅ EDGE CASE FIXES
        if (isNaN(progress)) progress = 0;
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;

        // ✅ STATUS
        let status = "active";
        if (today > expiry) status = "expired";
        else if ((expiry - today) / (1000 * 60 * 60 * 24) <= 30) status = "expiring";

        return {
          id: c.id,
          name: c.title,
          issuer: c.issuer,
          progress,
          status,
          daysLeft: Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)),
        };
      });

      setCertifications(formatted);

    } catch (error) {
      console.error("Error fetching progress", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();

    // ✅ AUTO REFRESH LISTENER
    const refresh = () => fetchProgress();
    window.addEventListener("certificationUpdated", refresh);

    return () => window.removeEventListener("certificationUpdated", refresh);

  }, [fetchProgress]);

  return (
    <div className="progress-container">

      <div className="progress-header">
        <h2>Certification Progress</h2>
        <p>Track how close you are to expiry & renewal readiness</p>
      </div>

      {loading ? (
        <div className="progress-empty">Loading progress...</div>
      ) : certifications.length === 0 ? (
        <div className="progress-empty">No certifications found</div>
      ) : (
        <div className="progress-cards">

          {certifications.map((cert) => (
            <div className="progress-card" key={cert.id}>

              {/* TOP */}
              <div className="progress-info">
                <div>
                  <span className="cert-name">{cert.name}</span>
                  <p className="cert-issuer">{cert.issuer}</p>
                </div>

                <strong>{cert.progress}%</strong>
              </div>

              {/* BAR */}
              <div className="progress-bar">
                <div
                  className={`progress-fill ${cert.status}`}
                  style={{ width: `${cert.progress}%` }}
                />
              </div>

              {/* STATUS */}
              <div className="progress-meta">

                <span className={`progress-status ${cert.status}`}>
                  {cert.status === "expired"
                    ? "Expired"
                    : cert.status === "expiring"
                    ? "Expiring Soon"
                    : "Active"}
                </span>

                {cert.status !== "expired" && (
                  <span className="days-left">
                    {cert.daysLeft} days left
                  </span>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Progress;