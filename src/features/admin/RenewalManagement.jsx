import "./RenewalManagement.css";
import { Check, X, Send, AlertTriangle, Download, Mail, Calendar, User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../../api/adminApi";
import { getUserName } from "../../utils/userUtils";
import { toast } from "sonner";

function RenewalManagement() {
  const [confirmAction, setConfirmAction] = useState(null);
  const [renewals, setRenewals] = useState([]);

  // ✅ LOAD DATA (LOGIC PRESERVED)
  const loadRenewals = useCallback(async () => {
    try {
      const data = await adminApi.getAllCertifications();
      console.log("Admin Renewal Management - Raw Data:", data);

      const today = new Date();

      const certsList = Array.isArray(data) ? data : (data?.content || []);

      const formatted = certsList
        .filter((c) => c.renewalStatus?.toUpperCase() === "PENDING")
        .map((c) => {
          const expiry = new Date(c.expiryDate);
          const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
          return {
            id: c.id,
            user: getUserName(c),
            email: c.user?.email || "N/A",
            certification: c.title,
            expiry: c.expiryDate,
            daysLeft: diff <= 0 ? 0 : diff,
            status: (c.renewalStatus || "PENDING").toLowerCase(),
          };
        });
      setRenewals(formatted);
    } catch (err) {
      console.error("Error fetching renewals", err);
      if (err.response?.status !== 401) {
        toast.error("Error loading renewals");
      }
    }
  }, []);

  useEffect(() => {
    loadRenewals();
  }, [loadRenewals]);

  // ✅ BACKEND UPDATE (LOGIC PRESERVED)
  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateRenewalStatus(id, newStatus);
      toast.success(`Renewal ${newStatus.toLowerCase()} successfully`);
      setConfirmAction(null);
      loadRenewals();
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        toast.error("Error updating status");
      }
    }
  };

  return (
    <div className="renewal-wrapper">

      {/* Header Section */}
      <div className="page-header">
        <div className="header-text">
          <h2>Renewal Management</h2>
          <p>Track, approve, and send notifications for expiring credentials.</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={() => toast.info("Exporting data...")}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Data Container */}
      <div className="premium-card">
        <div className="card-title">
          <h3>Renewal Queue ({renewals.length})</h3>
        </div>

        <div className="table-container">
          <div className="table-head">
            <span>User</span>
            <span>Email</span>
            <span>Certification</span>
            <span>Expiry</span>
            <span>Days Left</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="table-body">
            {renewals.length > 0 ? (
              renewals.map((item) => (
                <div key={item.id} className="table-row">

                  {/* User Column */}
                  <div className="user-cell">
                    <div className="avatar-small"><User size={14} /></div>
                    <span className="user-name">{item.user}</span>
                  </div>

                  {/* Email */}
                  <div className="email-cell">
                    <Mail size={14} className="cell-icon" />
                    <span>{item.email}</span>
                  </div>

                  {/* Certification */}
                  <div className="cert-cell">
                    <span className="cert-tag">{item.certification}</span>
                  </div>

                  {/* Expiry */}
                  <div className="date-cell">
                    <Calendar size={14} className="cell-icon" />
                    <span>{item.expiry}</span>
                  </div>

                  {/* Days */}
                  <div className="days-cell">
                    <span className={`days-pill ${item.daysLeft <= 30 ? "urgent" : "safe"}`}>
                      {item.daysLeft === 0 ? "Expired" : `${item.daysLeft}d left`}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="status-cell">
                    <span className={`status-pill ${item.status}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="actions">

                    {item.status === "pending" && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => setConfirmAction({ id: item.id, type: "APPROVED" })}
                        >
                          <Check size={16} /> Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => setConfirmAction({ id: item.id, type: "REJECTED" })}
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}

                    {/* 🔥 FIXED REMIND BUTTON */}
                    <button
                      className="remind-btn-small"
                      onClick={async () => {
                        try {
                          await adminApi.sendReminder(item.id);

                          toast.success("Reminder sent successfully");
                          loadRenewals();

                        } catch (err) {
                          console.error("Reminder failed", err);
                          if (err.response?.status !== 401) {
                            toast.error("Reminder failed");
                          }
                        }
                      }}
                    >
                      <Send size={14} /> Remind
                    </button>

                  </div>

                </div>
              ))
            ) : (
              <div className="empty-state">
                <Check size={48} className="empty-icon" />
                <p>No pending renewals found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Footer */}
      <div className="bulk-footer">
        <button className="bulk-remind-btn" onClick={() => toast.success("Bulk reminders sent")}>
          <Send size={18} /> <span>Send All Reminders</span>
        </button>
      </div>

      {/* Modal */}
      {confirmAction && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-bg">
              <AlertTriangle size={32} />
            </div>
            <h4>Confirm {confirmAction.type}?</h4>
            <p>
              Are you sure you want to {confirmAction.type.toLowerCase()} this renewal request?
              This update will be reflected in the user's dashboard immediately.
            </p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={() => updateStatus(confirmAction.id, confirmAction.type)}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RenewalManagement;