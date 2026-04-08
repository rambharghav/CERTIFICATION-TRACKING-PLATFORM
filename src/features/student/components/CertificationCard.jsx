import { Award, Eye, RefreshCw } from "lucide-react";

const CertificationCard = ({ cert, onView, onRenew, onEdit, onDelete }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        transition: "0.3s",
      }}
    >
      {/* Top Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <Award size={34} color="#2563eb" />

        <span
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "6px 14px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {cert.status}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "6px" }}>
        {cert.title}
      </h3>

      <p style={{ color: "#6b7280", marginBottom: "18px", fontSize: "14px" }}>
        {cert.issuer}
      </p>

      {/* Dates */}
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#374151" }}>
        <div style={{ marginBottom: "6px" }}>
          <strong>Issued:</strong> {cert.issued}
        </div>
        <div>
          <strong>Expires:</strong> {cert.expires}
        </div>
      </div>
      

      

      


      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={onView}
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <Eye size={16} /> View Details
        </button>

        <button
          onClick={() => onRenew(cert)}
          style={{
            flex: 1,
            background: "#374151",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={16} /> Request Renewal
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
        <button
          onClick={() => onEdit(cert)}
          style={{
            flex: 1,
            background: "#2563eb",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(cert.id)}
          style={{
            flex: 1,
            background: "#dc2626",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CertificationCard;