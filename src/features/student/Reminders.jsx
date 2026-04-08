import { Bell, CheckCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context";
import { notificationApi } from "../../api/notificationApi";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateFormatter";
import "./Reminders.css";

const Reminders = () => {

  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const prevCountRef = useRef(0);

  // ✅ SAFE DATE FORMAT
  const formatSafeDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "-";
    }
  };

  // ✅ REAL-TIME POLLING FOR ADMIN REMINDERS
  useEffect(() => {
    if (!user?.id) return;

    const loadRemindersAndSync = async () => {
      try {
        const response = await notificationApi.getNotifications(0, 50); // Get recent 50
        const data = response.content || [];
        
        // Map backend notifications to UI reminder format
        const reminderList = data.map(n => ({
          id: n.id,
          title: n.title,
          issuer: n.certificationTitle || "Admin System",
          reminderDate: n.createdAt,
          message: n.message,
          type: n.type
        }));

        // ✅ TOAST COMPARISON LOGIC
        // Only trigger if count increases AND it's not the initial load
        if (reminderList.length > prevCountRef.current && prevCountRef.current !== 0) {
          toast.success("New Reminder Received!", {
            description: "You have a new message from the administrator.",
            duration: 5000,
            style: {
              background: "#6366f1", // INDIGO THEME
              color: "#ffffff",
              border: "none",
              borderRadius: "12px"
            },
            icon: <Bell size={18} color="#fff" />,
          });
        }

        // Only update state if data actually changed to prevent flicker
        setReminders(reminderList);
        prevCountRef.current = reminderList.length;

      } catch (err) {
        console.error("Error loading reminders from polling", err);
      }
    };

    // Initial Load
    loadRemindersAndSync();

    // Heartbeat: 10 Seconds
    const intervalId = setInterval(loadRemindersAndSync, 10000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
      console.log("Reminders polling cleared");
    };
  }, [user?.id]);

  return (
    <div className="reminders-page">

      {/* HEADER */}
      <div className="reminders-header">
        <h1>Reminders</h1>
        <p>Notifications and alerts sent by the administrator</p>
      </div>

      {/* LIST */}
      <div className="reminder-list">

        {reminders.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={20} />
            <span>No reminders from admin</span>
          </div>
        ) : (
          reminders.map((r) => (
            <div key={r.id} className={`reminder-card ${r.type === 'REMINDER' ? 'priority-card' : ''}`}>

              <div className="reminder-header-row">
                <Bell size={18} />
                <h3>{r.title}</h3>
              </div>

              <div className="reminder-body">
                <p className="issuer">Source: {r.issuer}</p>
                <p className="reminder-message">{r.message}</p>
              </div>

              <div className="reminder-footer">
                <p className="reminder-date">
                  Received: {formatSafeDate(r.reminderDate)}
                </p>
                {r.type === 'REMINDER' && (
                  <p className="reminder-action">
                    ⚡ Action required: Check your certification details
                  </p>
                )}
              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Reminders;