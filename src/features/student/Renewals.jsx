import { useState, useEffect, useMemo } from "react";
import { RefreshCw, CheckCircle, Clock, XCircle  } from "lucide-react";
import { certificationApi } from "../../api/certificationApi";
import { useAuth } from "../../context";
import "./Renewals.css";
const Renewals = () => {
  const [toast, setToast] = useState("");
  const showToast = (message) => {
  setToast(message);
  setTimeout(() => setToast(""), 3000);
};
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [renewals, setRenewals] = useState([]);

  // ✅ DATE FORMATTER (ADDED — SAFE)
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadRenewals = async () => {
      try {
        const data = await certificationApi.getAll(user.id);

        console.log("API DATA:", data); // 🔍 DEBUG

        const today = new Date();

        const formatted = data.map((c) => {
          const expiry = new Date(c.expiryDate || c.expiry_date);
          const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

          let status = "";

          const isExpired = diff < 0;

          // ✅ ONLY use renewalStatus if expired
          if (isExpired) {
            if (c.renewalStatus) {
              status = c.renewalStatus.toLowerCase(); // pending / approved / rejected
            } else {
              status = "renewal_required";
            }
          } else {
            status = "not_required"; // ALWAYS for active / expiring
          }

          return {
            id: c.id,
            certificate: c.title,

            // ✅ SAFE FIELD MAPPING (FIXED)
            issuedOn: c.issueDate || c.issue_date || null,
            expiry: c.expiryDate || c.expiry_date || null,

            requestedOn: c.requestedOn || null,
            approvedOn: c.approvedOn || null,
            rejectedOn: c.rejectedOn || null,

            status,
          };
        });

        setRenewals(formatted);

      } catch (error) {
        console.error("Error fetching renewals", error);
      }
    };

    loadRenewals();
  }, [user?.id]);

  const filteredRenewals = useMemo(() => {
    return filter === "All"
      ? renewals
      : renewals.filter((r) => r.status === filter.toLowerCase());
  }, [filter, renewals]);

  const summary = {
    total: renewals.length,
    pending: renewals.filter((r) => r.status === "pending").length,
    approved: renewals.filter((r) => r.status === "approved").length,
    rejected: renewals.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="renewals-page">

      <div className="renewals-header">
        <h1>Renewals</h1>
        <p>Manage and track certificate renewal requests</p>
      </div>

      <div className="renewals-summary-grid">

        <div className="renewal-card">
          <RefreshCw size={22} />
          <h2>{summary.total}</h2>
          <p>Total Requests</p>
        </div>

        <div className="renewal-card pending">
          <Clock size={22} />
          <h2>{summary.pending}</h2>
          <p>Pending</p>
        </div>

        <div className="renewal-card approved">
          <CheckCircle size={22} />
          <h2>{summary.approved}</h2>
          <p>Approved</p>
        </div>

        <div className="renewal-card rejected">
          <XCircle size={22} />
          <h2>{summary.rejected}</h2>
          <p>Rejected</p>
        </div>

      </div>

      <div className="renewal-filters">
        {["All", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            className={filter === status ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter(status)}
          >
            {status === "All"
              ? "All"
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="renewal-list">

        {filteredRenewals.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={20} />
            <p>
              {filter === "approved" && "No approved certifications"}
              {filter === "pending" && "No pending requests"}
              {filter === "rejected" && "No rejected certifications"}
              {filter === "All" && "No renewal records found"}
            </p>
          </div>
        ) : (
          filteredRenewals.map((r) => (
            <div key={r.id} className="renewal-item">

              <div>
                <h3>{r.certificate}</h3>

                <p><strong>Issued On:</strong> {formatDate(r.issuedOn)}</p>
                <p><strong>Expiry On:</strong> {formatDate(r.expiry)}</p>

                {r.status === "pending" && (
                  <p><strong>Requested On:</strong> {formatDate(r.requestedOn)}</p>
                )}

                {r.status === "approved" && (
                  <p><strong>Approved On:</strong> {formatDate(r.approvedOn)}</p>
                )}

                {r.status === "rejected" && (
                  <p><strong>Rejected On:</strong> {formatDate(r.rejectedOn)}</p>
                )}
              </div>

              <div className="status-section">

                <span className={`status-badge ${r.status}`}>
                  {r.status === "approved"
                    ? "Approved"
                    : r.status === "rejected"
                    ? "Rejected"
                    : r.status === "pending"
                    ? "Pending"
                    : r.status === "renewal_required"
                    ? "Renewal Required"
                    : "Not Required"}
                </span>

                {r.status === "renewal_required" && (
                  <button
                    className="request-btn"
                    onClick={async () => {
                      await fetch(`http://localhost:8080/api/certifications/${r.id}/renewal?status=PENDING`, {
                        method: "PUT",
                      });

                      showToast("Renewal requested successfully!");
                      window.location.reload();
                    }}
                  >
                    Request Renewal
                  </button>
                )}
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Renewals;