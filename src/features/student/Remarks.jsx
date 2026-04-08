import "./Remarks.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContextValue";
import { certificationApi } from "../../api/certificationApi";

function Remarks() {

  // ✅ USER
  const { user } = useAuth();

  // ✅ STATE (replacing dummy data)
  const [remarks, setRemarks] = useState([]);

  // ✅ FETCH FROM BACKEND
  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        if (user?.id) {
          const data = await certificationApi.getAll(user.id);

          // 🔥 Transform backend → UI format
          const formatted = data.map((cert) => ({
            certification: cert.title,
            reviewer: "Admin", // backend not storing reviewer yet
            rating: 4, // placeholder (can improve later)
            status: cert.remarks
              ? "Improving"
              : "Needs Attention",
            comment: cert.remarks || "No remarks available",
            date: cert.issueDate || "N/A"
          }));

          setRemarks(formatted);
        }
      } catch (err) {
        console.error("Error fetching remarks", err);
      }
    };

    fetchRemarks();
  }, [user]);

  // ✅ STATS (dynamic)
  const totalReviews = remarks.length;

  const avgRating =
    remarks.length > 0
      ? (
          remarks.reduce((sum, r) => sum + r.rating, 0) /
          remarks.length
        ).toFixed(1)
      : 0;

  const needsAttention = remarks.filter(
    (r) => r.status === "Needs Attention"
  ).length;

  return (
    <div className="remarks-page">

      <div className="remarks-header">
        <h2>Performance Remarks</h2>
        <p>Track feedback and performance insights for your certifications.</p>
      </div>

      <div className="remarks-stats">

        <div className="stat-card">
          <h3>{totalReviews}</h3>
          <span>Total Reviews</span>
        </div>

        <div className="stat-card success">
          <h3>{avgRating}</h3>
          <span>Average Rating</span>
        </div>

        <div className="stat-card warning">
          <h3>{needsAttention}</h3>
          <span>Needs Attention</span>
        </div>

      </div>

      <div className="remarks-list">

        {remarks.map((item, index) => (
          <div className="remark-card" key={index}>

            <div className="remark-top">
              <div>
                <h4>{item.certification}</h4>
                <span className="reviewer">{item.reviewer}</span>
              </div>

              <div className={`status-badge ${
                item.status === "Excellent"
                  ? "excellent"
                  : item.status === "Improving"
                  ? "improving"
                  : "attention"
              }`}>
                {item.status}
              </div>
            </div>

            <div className="remark-body">
              <p>{item.comment}</p>
            </div>

            <div className="remark-footer">
              <div className="rating">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </div>
              <span className="date">{item.date}</span>
            </div>

          </div>
        ))}

        {/* ✅ EMPTY STATE */}
        {remarks.length === 0 && (
          <div className="empty-state">
            No remarks available yet.
          </div>
        )}

      </div>

    </div>
  );
}

export default Remarks;