import { AlertTriangle, Calendar, Bell, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context";
import { certificationApi } from "../../api/certificationApi";

const Alerts = () => {

  const { user } = useAuth();

  const [expired, setExpired] = useState([]);
  const [thirtyDays, setThirtyDays] = useState([]);
  const [ninetyDays, setNinetyDays] = useState([]);

  // ✅ FORMAT DATE (SAFE ADDITION)
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  // ✅ FETCH + PROCESS DATA
  const loadAlerts = useCallback(async () => {
    try {
      if (!user?.id) return;

      const data = await certificationApi.getAll(user.id);

      const today = new Date();

      const expiredList = [];
      const thirtyList = [];
      const ninetyList = [];

      data.forEach((c) => {

        if (!c.expiryDate) return;

        const expiry = new Date(c.expiryDate);
        if (isNaN(expiry)) return;

        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        const formatted = {
          id: c.id,
          title: c.title,
          issuer: c.issuer,
          expiry: c.expiryDate,
          daysLeft: diff
        };

        if (diff <= 0) {
          expiredList.push(formatted);
        } else if (diff <= 30) {
          thirtyList.push(formatted);
        } else if (diff <= 90) {
          ninetyList.push(formatted);
        }
      });

      setExpired(expiredList);
      setThirtyDays(thirtyList);
      setNinetyDays(ninetyList);

    } catch (err) {
      console.error("Error loading alerts", err);
    }
  }, [user]);

  useEffect(() => {
    loadAlerts(); // ✅ FIXED
  }, [loadAlerts]);

  return (
    <div className="alerts-page">

      {/* Header */}
      <div className="alerts-header">
        <h1>Expiration Alerts</h1>
        <p>Monitor renewal deadlines and take action</p>
      </div>

      {/* Summary */}
      <div className="alerts-summary-grid">

        <div className="alert-card expired">
          <div className="alert-icon red">
            <AlertTriangle size={22} />
          </div>
          <h2>{expired.length}</h2>
          <p>Expired</p>
        </div>

        <div className="alert-card thirty">
          <div className="alert-icon yellow">
            <Calendar size={22} />
          </div>
          <h2>{thirtyDays.length}</h2>
          <p>Expiring in 30 Days</p>
        </div>

        <div className="alert-card ninety">
          <div className="alert-icon blue">
            <Bell size={22} />
          </div>
          <h2>{ninetyDays.length}</h2>
          <p>Expiring in 90 Days</p>
        </div>

      </div>

      {/* 🔴 EXPIRED */}
      <div className="alert-section red-bg">
        <div className="alert-section-header">
          <AlertTriangle size={20} />
          <div>
            <h3>Expired Certifications</h3>
            <p>These certifications have already expired</p>
          </div>
        </div>

        {expired.length === 0 ? (
          <div className="alert-empty">
            <CheckCircle size={18} />
            <span>No certifications in this category</span>
          </div>
        ) : (
          expired.map((c) => (
            <div key={c.id} className="alert-item">
              <strong>{c.title}</strong>
              <p>{c.issuer} | Expired on {formatDate(c.expiry)}</p>
            </div>
          ))
        )}
      </div>

      {/* 🟡 30 DAYS */}
      <div className="alert-section yellow-bg">
        <div className="alert-section-header">
          <Calendar size={20} />
          <div>
            <h3>Expiring Within 30 Days</h3>
            <p>Take action soon</p>
          </div>
        </div>

        {thirtyDays.length === 0 ? (
          <div className="alert-empty">
            <CheckCircle size={18} />
            <span>No certifications in this category</span>
          </div>
        ) : (
          thirtyDays.map((c) => (
            <div key={c.id} className="alert-item">
              <strong>{c.title}</strong>
              <p>{c.issuer} | Expires in {c.daysLeft} days ({formatDate(c.expiry)})</p>
            </div>
          ))
        )}
      </div>

      {/* 🔵 90 DAYS */}
      <div className="alert-section blue-bg">
        <div className="alert-section-header">
          <Bell size={20} />
          <div>
            <h3>Expiring Within 90 Days</h3>
            <p>Plan ahead</p>
          </div>
        </div>

        {ninetyDays.length === 0 ? (
          <div className="alert-empty">
            <CheckCircle size={18} />
            <span>No certifications in this category</span>
          </div>
        ) : (
          ninetyDays.map((c) => (
            <div key={c.id} className="alert-item">
              <strong>{c.title}</strong>
              <p>{c.issuer} | Expires in {c.daysLeft} days ({formatDate(c.expiry)})</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Alerts;