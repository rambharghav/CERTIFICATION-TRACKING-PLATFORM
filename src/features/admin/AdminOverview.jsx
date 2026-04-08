import { useState, useEffect, useMemo, useCallback } from "react";
import { Users, Award, CheckCircle, Clock, Eye, Search } from "lucide-react";
import "./AdminOverview.css";
import { adminApi } from "../../api/adminApi";
import { toast } from "sonner";
import { getUserName } from "../../utils/userUtils";

function AdminOverview() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCert, setSelectedCert] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const [users, setUsers] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // ✅ LOAD USERS
  const loadUsers = useCallback(async () => {
    try {
      const data = await adminApi.getAllUsers();
      console.log("RAW JSON RESPONSE (USERS):", data);

      const usersList = Array.isArray(data) ? data : (data?.content || []);
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch users");
      }
    }
  }, []);

  // ✅ LOAD CERTIFICATIONS
  const loadCerts = useCallback(async () => {
    try {
      const data = await adminApi.getAllCertifications();
      console.log("RAW JSON RESPONSE (CERTIFICATIONS):", data);

      const today = new Date();

      const certsList = Array.isArray(data) ? data : (data?.content || []);

      const formatted = certsList.map((c) => {
        const expiry = new Date(c.expiryDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return {
          id: c.id,
          user: getUserName(c),
          name: c.title,
          issuer: c.issuer,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          daysLeft: diff,
          status:
            diff <= 0
              ? "Expired"
              : diff <= 30
                ? "Expiring"
                : "Active",
        };
      });

      setCertifications(formatted);

    } catch (err) {
      console.error("Error fetching certs", err);
      if (err.response?.status !== 401) {
        toast.error("Failed to fetch certifications");
      }
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadCerts();
  }, [loadUsers, loadCerts]);

  // ✅ STATS
  const stats = {
    totalUsers: users.length,
    totalCerts: certifications.length,
    active: certifications.filter(c => c.status === "Active").length,
    expiring: certifications.filter(c => c.status === "Expiring").length,
  };

  // ✅ FILTER
  const filteredCerts = useMemo(() => {
    return certifications.filter((cert) => {
      const matchesSearch =
        cert.user.toLowerCase().includes(search.toLowerCase()) ||
        cert.name.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || cert.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter, certifications]);

  // ✅ EXPIRING LIST
  const expiringSoon = certifications.filter(c => c.daysLeft > 0 && c.daysLeft <= 30);

  // ✅ RECENT (latest 3)
  const recentCerts = [...certifications]
    .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    .slice(0, 3);

  const handleAddStudent = async () => {
    try {
      const studentData = {
        ...newUser,
        role: "STUDENT"
      };

      await adminApi.addStudent(studentData);

      setShowModal(false);
      loadUsers();
      alert("Student added successfully");
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };


  return (
    <div className="admin-overview">

      {/* Header */}
      <div className="overview-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage and monitor all certifications professionally.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Student
        </button>
      </div>

      {/* STATS */}
      <div className="stats-row">

        <div className="stat-card">
          <div>
            <p>Total Users</p>
            <h2>{stats.totalUsers}</h2>
          </div>
          <div className="stat-icon blue"><Users size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <p>Total Certifications</p>
            <h2>{stats.totalCerts}</h2>
          </div>
          <div className="stat-icon green"><Award size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <p>Active Certifications</p>
            <h2>{stats.active}</h2>
          </div>
          <div className="stat-icon emerald"><CheckCircle size={22} /></div>
        </div>

        <div className="stat-card">
          <div>
            <p>Expiring Soon</p>
            <h2>{stats.expiring}</h2>
          </div>
          <div className="stat-icon yellow"><Clock size={22} /></div>
        </div>

      </div>

      {/* EXPIRING + RECENT */}
      <div className="overview-grid">

        {/* Expiring */}
        <div className="overview-card">
          <h3>Expiring Certifications (Next 30 Days)</h3>

          {expiringSoon.length === 0 ? (
            <p>No expiring certifications</p>
          ) : (
            expiringSoon.map((cert) => (
              <div key={cert.id} className="list-row">
                <div>
                  <strong>{cert.name}</strong>
                  <p>{cert.user} — Expires: {cert.expiryDate}</p>
                </div>
                <span className="badge warning">Expiring</span>
              </div>
            ))
          )}
        </div>

        {/* Recent */}
        <div className="overview-card">
          <h3>Recent Certifications</h3>

          {recentCerts.length === 0 ? (
            <p>No recent certifications</p>
          ) : (
            recentCerts.map((cert) => (
              <div key={cert.id} className="list-row">
                <div>
                  <strong>{cert.name}</strong>
                  <p>{cert.user} — Registered Recently</p>
                </div>
                <span className="badge success">New</span>
              </div>
            ))
          )}
        </div>

      </div>

      {/* SEARCH + FILTER */}
      <div className="table-top-bar">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by user or certification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Expiring">Expiring</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overview-card">
        <h3>Recent Activity</h3>

        <table className="clean-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Certification</th>
              <th>Issuer</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Days Left</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCerts.map((cert) => (
              <tr key={cert.id}>
                <td>{cert.user}</td>
                <td>{cert.name}</td>
                <td>{cert.issuer}</td>
                <td>{cert.issueDate}</td>
                <td>{cert.expiryDate}</td>
                <td className={cert.status === "Expiring" ? "orange-text" : ""}>
                  {cert.daysLeft}
                </td>
                <td>
                  <span className={`badge ${cert.status === "Active" ? "success" : "warning"}`}>
                    {cert.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">

            <h3>Add New Student</h3>

            <input
              type="text"
              placeholder="First Name"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Middle Name (Optional)"
              value={newUser.middleName}
              onChange={(e) =>
                setNewUser({ ...newUser, middleName: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Last Name"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={handleAddStudent} className="primary-btn">
                Add Student
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="secondary-btn"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOverview;