import { Search } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import "./AdminAllCertifications.css";
import { certificationApi } from "../../api/certificationApi";
import { adminApi } from "../../api/adminApi";
import { getUserName } from "../../utils/userUtils";
import { toast } from "sonner";

function AdminAllCertifications() {
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);
  const [certifications, setCertifications] = useState([]);

  // ✅ NEW STATES (FIXED LOCATION)
  const [editingId, setEditingId] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");

  // ✅ LOAD DATA
  const loadCertifications = useCallback(async () => {
    try {
      const data = await adminApi.getAllCertifications();
      console.log("RAW JSON RESPONSE (ADMIN ALL CERTS):", data);

      const today = new Date();

      const certsList = Array.isArray(data) ? data : (data?.content || []);

      const formatted = certsList.map((c) => {
        const expiry = new Date(c.expiryDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let status = "Active";
        if (diff <= 0) status = "Expired";
        else if (diff <= 30) status = "Expiring";

        return {
          id: c.id,
          student: getUserName(c),
          title: c.title,
          issuer: c.issuer,
          issued: c.issueDate,
          expires: c.expiryDate,
          credential: c.credentialId,
          status,
          remarks: c.remarks
        };
      });

      setCertifications(formatted);
    } catch (err) {
      console.error("Error fetching admin certifications", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to load certifications");
      }
    }
  }, []);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  // ✅ SAVE REMARKS
  const handleSaveRemarks = async (cert) => {
    try {
      const updated = {
        ...cert,
        remarks: remarksInput
      };

      await certificationApi.update(cert.id, updated);

      toast.success("Remarks saved successfully");

      setEditingId(null);
      loadCertifications(); // refresh
    } catch (err) {
      console.error(err);
      toast.error("Failed to save remarks");
    }
  };

  // ✅ SEARCH
  const filteredCerts = useMemo(() => {
    return certifications.filter(
      (cert) =>
        cert.student.toLowerCase().includes(search.toLowerCase()) ||
        cert.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, certifications]);

  const handleView = (cert) => setSelectedCert(cert);

  const handleRenew = (id) => {
    setCertifications((prev) =>
      prev.map((cert) =>
        cert.id === id ? { ...cert, status: "Active" } : cert
      )
    );
    toast.success("Renewal requested successfully!");
  };

  const handleRemove = (id) => {
    setCertifications((prev) => prev.filter((cert) => cert.id !== id));
    if (selectedCert?.id === id) setSelectedCert(null);
    toast.success("Certification removed");
  };

  return (
    <div className="admin-certifications-page">
      <h2>All Certifications</h2>
      <p className="sub-text">
        Manage and monitor all student certifications.
      </p>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by student or certification..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="cert-grid">
        {filteredCerts.map((cert) => (
          <div key={cert.id} className="cert-card">

            <div className="card-top">
              <div>
                <h3>{cert.title}</h3>
                <p className="issuer">{cert.issuer}</p>
                <p className="student-name">
                  Student: <strong>{cert.student}</strong>
                </p>
              </div>

              <span className={`status ${cert.status.toLowerCase()}`}>
                {cert.status}
              </span>
            </div>

            <div className="card-details">
              <div><strong>Issued:</strong> {cert.issued}</div>
              <div><strong>Expires:</strong> {cert.expires}</div>
              <div><strong>Credential ID:</strong> {cert.credential}</div>
            </div>

            {/* ✅ REMARKS UI */}
            {editingId === cert.id ? (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="Enter remarks..."
                  style={{ width: "100%", padding: "8px" }}
                />

                <button
                  className="admin-renew-btn"
                  onClick={() => handleSaveRemarks(cert)}
                  style={{ marginTop: "5px" }}
                >
                  Save Remarks
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "10px" }}>
                <strong>Remarks:</strong>{" "}
                {cert.remarks || "No remarks"}

                <button
                  className="admin-view-btn"
                  onClick={() => {
                    setEditingId(cert.id);
                    setRemarksInput(cert.remarks || "");
                  }}
                  style={{ marginLeft: "10px" }}
                >
                  Edit
                </button>
              </div>
            )}

            <div className="card-actions-admin">
              <button
                className="admin-view-btn"
                onClick={() => handleView(cert)}
              >
                View Details
              </button>

              <button
                className="admin-renew-btn"
                onClick={() => handleRenew(cert.id)}
              >
                Mark for Renewal
              </button>

              <button
                className="admin-delete-btn"
                onClick={() => handleRemove(cert.id)}
              >
                Remove
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAllCertifications;