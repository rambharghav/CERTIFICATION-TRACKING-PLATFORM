import "./ExpiringCerts.css";
import { AlertCircle, Eye, Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../../api/adminApi";
import { getUserName } from "../../utils/userUtils";
import { toast } from "sonner";

function ExpiringCerts() {
  const [selectedCert, setSelectedCert] = useState(null);
  const [expiringCerts, setExpiringCerts] = useState([]);

  // ✅ LOAD DATA
  const loadExpiringCerts = useCallback(async () => {
    try {
      const data = await adminApi.getAllCertifications();
      console.log("Admin Expiring Certs - Raw Data:", data);

      const today = new Date();

      const certsList = Array.isArray(data) ? data : (data?.content || []);

      const filtered = certsList
        .map((c) => {
          const expiry = new Date(c.expiryDate);
          const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          return {
            id: c.id,
            user: getUserName(c),
            email: c.user?.email || "N/A",
            title: c.title,
            issuer: c.issuer,
            expiry: c.expiryDate,
            daysLeft: diff,
          };
        })
        .filter((c) => c.daysLeft > 0 && c.daysLeft <= 30);

      setExpiringCerts(filtered);
    } catch (err) {
      console.error("Error fetching expiring certs", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to load expiring certifications");
      }
    }
  }, []);

  useEffect(() => {
    loadExpiringCerts();
  }, [loadExpiringCerts]);

  const handleReminder = async (cert) => {
    try {
      await adminApi.sendReminder(cert.id);
      toast.success(`Reminder sent to ${cert.user}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reminder");
    }
  };

  return (
    <div className="expiring-page">

      <h2>Expiring Certifications</h2>
      <p className="sub-text">
        Certifications expiring within 30 days
      </p>

      <div className="alert-banner">
        <AlertCircle size={18} />
        <span>
          {expiringCerts.length} certifications require attention – expiring soon
        </span>
      </div>

      <div className="expiring-table">

        <div className="table-header">
          <span>User</span>
          <span>Certification</span>
          <span>Issuer</span>
          <span>Expiry Date</span>
          <span>Days Left</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {expiringCerts.map((cert) => (
          <div key={cert.id} className="table-row">
            <span>{cert.user}</span>
            <span>{cert.title}</span>
            <span>{cert.issuer}</span>
            <span>{cert.expiry}</span>
            <span className="days-left">{cert.daysLeft} days</span>
            <span className="status-pill">EXPIRING SOON</span>

            <span className="action-buttons">
              <button
                className="view-btn"
                onClick={() => setSelectedCert(cert)}
              >
                <Eye size={16} /> View
              </button>

              <button
                className="remind-btn"
                onClick={() => handleReminder(cert)}
              >
                <Bell size={16} /> Remind
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{selectedCert.title}</h3>
            <p><strong>User:</strong> {selectedCert.user}</p>
            <p><strong>Email:</strong> {selectedCert.email}</p>
            <p><strong>Issuer:</strong> {selectedCert.issuer}</p>
            <p><strong>Expiry Date:</strong> {selectedCert.expiry}</p>
            <p><strong>Days Left:</strong> {selectedCert.daysLeft} days</p>

            <div className="modal-actions">
              <button
                className="remind-btn"
                onClick={() => handleReminder(selectedCert)}
              >
                <Bell size={16} /> Send Reminder
              </button>

              <button
                className="close-btn"
                onClick={() => setSelectedCert(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ExpiringCerts;