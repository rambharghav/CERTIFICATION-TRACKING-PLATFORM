import { Users, BadgeCheck, Clock, AlertCircle } from "lucide-react";

const StatCard = ({ label, value, color }) => {

  const colorMap = {
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
  };

  const iconMap = {
    blue: <Users size={20} />,
    green: <BadgeCheck size={20} />,
    yellow: <Clock size={20} />,
    red: <AlertCircle size={20} />,
  };

  return (
    <div className="stat-card">
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
      </div>

      <div
        className="stat-icon"
        style={{ backgroundColor: colorMap[color] }}
      >
        {iconMap[color]}
      </div>
    </div>
  );
};

export default StatCard;