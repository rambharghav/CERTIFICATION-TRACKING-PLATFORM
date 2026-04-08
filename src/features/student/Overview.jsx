import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import "./Overview.css";
import { BadgeCheck, Globe, Search, Users, GraduationCap, ClipboardList, Compass, Plus, TriangleAlert} from "lucide-react";
import StatCard from "./components/StatCard";
import CertificationCard from "./components/CertificationCard";
import { certificationApi } from "../../api/certificationApi";
import { formatDate } from "../../utils/dateformatter";
import { useAuth } from "../../context";

const Overview = () => {

  const navigate = useNavigate(); // ✅ added
  const { user } = useAuth(); // 🔥 get logged-in user

  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [certifications, setCertifications] = useState([]);

  const fetchCerts = useCallback(async () => {
    try {
      const data = await certificationApi.getAll(user.id);

      const formatted = data.map((c) => {
        const today = new Date();
        const expiry = new Date(c.expiryDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return {
          id: c.id,
          title: c.title,
          holder: `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`,
          issuer: c.issuer,
          issued: formatDate(c.issueDate),
        expires: formatDate(c.expiryDate),
          credentialId: c.credentialId || "N/A",
          description: "Certification from " + c.issuer,
          status:
            diff <= 0
              ? "Expired"
              : diff <= 30
              ? "Expiring Soon"
              : "Active",
        };
      });

      setCertifications(formatted);

    } catch (error) {
      console.error("Error fetching certifications", error);
    }
  }, [user]);
  useEffect(() => {
    if (!user?.id) return;

    const loadCerts = async () => {
      await fetchCerts();
    };

    loadCerts();
  }, [fetchCerts, user?.id]);

  // 🔥 STATS (DYNAMIC)
  const stats = {
    total: certifications.length,
    active: certifications.filter(c => c.status === "Active").length,
    expiring: certifications.filter(c => c.status === "Expiring Soon").length,
    expired: certifications.filter(c => c.status === "Expired").length,
  };

  const filtered = certifications.filter(
    (cert) =>
      cert.title.toLowerCase().includes(search.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(search.toLowerCase())
  );

  const calculateDaysRemaining = (dateString) => {
    const expiry = new Date(dateString);
    const today = new Date();
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleDelete = async (id) => {
    try {
      await certificationApi.delete(id);
      setCertifications((prev) => prev.filter((cert) => cert.id !== id));
      alert("Deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Unable to delete certification.");
    }
  };

  const handleEdit = async (cert) => {
    const newTitle = prompt("Enter new title", cert.title);
    if (!newTitle) return;

    const updatedCert = {
      title: newTitle,
      issuer: cert.issuer,
      issueDate: cert.issued,
      expiryDate: cert.expires,
      credentialId: cert.credentialId,
      url: null,
    };

    try {
      await certificationApi.update(cert.id, updatedCert);

      setCertifications((prev) =>
        prev.map((item) =>
          item.id === cert.id ? { ...item, title: newTitle } : item
        )
      );

      alert("Updated successfully");
    } catch (error) {
      console.error(error);
      alert("Unable to update certification.");
    }
  };
  
  const handleRenewal = async (cert) => {
    try {
      const updated = {
        ...cert,
        renewalStatus: "PENDING"
      };

      await certificationApi.update(cert.id, updated);

      alert("Renewal request sent ✅");

      // refresh data
      fetchCerts();

    } catch (err) {
      console.error(err);
      alert("Failed ❌");
    }
  };

  return (
    <div className="dashboard-page">

      {/* Toast */}
      {showToast && (
        <div className="toast-success">
          Renewal requested successfully!
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Manage and track your certifications professionally.
          </p>
        </div>

        <button className="add-btn" onClick={() => navigate("/student/register")}> {/* ✅ added */}
          <Plus size={18} />
          <span>Add Certification</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total" value={stats.total} color="blue" />
        <StatCard label="Active" value={stats.active} color="green" />
        <StatCard label="Expiring Soon" value={stats.expiring} color="yellow" />
        <StatCard label="Expired" value={stats.expired} color="red" />
      </div>

      {/* Search */}
      <div className="overview-search-wrapper">
        <div className="overview-search-container">
          <Search size={18} className="overview-search-icon" />
          <input
            type="text"
            placeholder="Search certifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="cards-grid">
        {filtered.map((cert) => (
          <CertificationCard
            key={cert.id}
            cert={cert}
            onView={() => setSelectedCert(cert)}
            onRenew={() => handleRenewal(cert)}  // ✅ CORRECT
            onEdit={() => handleEdit(cert)}
            onDelete={() => handleDelete(cert.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-top">
              <div className="modal-icon">🏅</div>

              <div>
                <h2 className="modal-title">{selectedCert.title}</h2>
                <span className="badge-active">{selectedCert.status}</span>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedCert(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-grid">
              <div>
                <p className="modal-label">Holder</p>
                <strong>{selectedCert.holder}</strong>
              </div>

              <div>
                <p className="modal-label">Issuing Organization</p>
                <strong>{selectedCert.issuer}</strong>
              </div>
            </div>

            <hr className="modal-divider" />

            <div className="modal-grid">
              <div>
                <p className="modal-label">Issue Date</p>
                <strong>{selectedCert.issued}</strong>
              </div>

              <div>
                <p className="modal-label">Expiration Date</p>
                <strong>{selectedCert.expires}</strong>
              </div>
            </div>

            <div className="time-remaining-box">
              Time Remaining: {calculateDaysRemaining(selectedCert.expires)} days
            </div>

            <hr className="modal-divider" />

            <div style={{ marginBottom: "18px" }}>
              <p className="modal-label">Credential ID</p>
              <strong>{selectedCert.credentialId}</strong>
            </div>

            <div>
              <p className="modal-label">Description</p>
              <p>{selectedCert.description}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Overview;