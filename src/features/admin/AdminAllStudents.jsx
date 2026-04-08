import { useEffect, useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import "./AdminAllStudents.css";
import { adminApi } from "../../api/adminApi";
import { reportApi } from "../../api/reportApi";

function AdminAllStudents() {

  const [selectedUser, setSelectedUser] = useState(null);
  const [userCerts, setUserCerts] = useState([]);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      console.log("Admin All Students - Raw Data:", data);

      const usersList = Array.isArray(data) ? data : (data?.content || []);

      const formatted = usersList
        .filter((u) => u.role === "STUDENT")
        .map((u) => ({
          id: u.id,
          name: u.firstName
            ? `${u.firstName}${u.middleName ? ' ' + u.middleName : ''} ${u.lastName}`
            : (u.name || "Unknown"),
          email: u.email,
          studentId: u.studentId,
          certCount: u.certificationCount || 0,
        }));

      setUsers(formatted);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  // ✅ EFFECT
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ SEARCH FILTER
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleRemove = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast("Student removed");
  };

  const handleViewProfile = async (user) => {
    try {
      const data = await reportApi.getUserReports(user.id);

      setUserCerts(data);
      setSelectedUser(user);
    } catch (err) {
      console.error("Error fetching user certifications", err);
      if (err.response?.status !== 401) {
        showToast("Could not load user profile");
      }
    }
  };

  return (
    <>
      <div className="admin-students-page">

        {toast && <div className="admin-toast">{toast}</div>}

        <h2>All Students</h2>
        <p className="sub-text">
          Manage and monitor all registered students.
        </p>

        {/* SEARCH */}
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* GRID */}
        <div className="students-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="student-card">

              <div className="card-top">
                <div>
                  <h3>{user.name}</h3>
                  <p className="email">{user.email}</p>
                  <p className="student-id">
                    Student ID: <strong>{user.studentId || "N/A"}</strong>
                  </p>
                </div>

                <span className="status active">Student</span>
              </div>

              <div className="card-details">
                <strong>Certifications:</strong> {user.certCount}
              </div>

              <div className="card-actions">
                <button
                  className="view-btn"
                  onClick={() => handleViewProfile(user)}
                >
                  View Profile
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleRemove(user.id)}
                >
                  Remove
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            No students found.
          </div>
        )}
      </div>

      {/* ✅ MODAL INSIDE SAME RETURN */}
      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <h3>{selectedUser.name}</h3>

            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Student ID:</strong> {selectedUser.studentId}</p>

            <hr style={{ margin: "15px 0" }} />

            <h4>Certifications</h4>

            {userCerts.length === 0 ? (
              <p>No certifications found</p>
            ) : (
              userCerts.map((cert) => (
                <div key={cert.id} style={{ marginBottom: "10px" }}>
                  <strong>{cert.title}</strong>
                  <p style={{ fontSize: "13px", color: "#6b7280" }}>
                    {cert.issuer} | Expires: {cert.expiryDate}
                  </p>
                </div>
              ))
            )}

            <div className="modal-actions">
              <button
                className="close-btn"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default AdminAllStudents;