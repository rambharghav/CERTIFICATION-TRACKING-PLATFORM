import { useState, useEffect, useCallback, useMemo } from "react";
import { FileText, Download } from "lucide-react";
import { useAuth } from "../../context";
import { reportApi } from "../../api/reportApi";

const Reports = () => {

  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState("All");
  const [certifications, setCertifications] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ FORMAT DATE (GLOBAL FIX)
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "-";
    }
  };

  // ✅ LOAD DATA
  const loadReports = useCallback(async () => {
    try {
      if (!user?.id) return;

      const data = await reportApi.getUserReports(user.id);
      const today = new Date();

      const formatted = data.map((c) => {
        const expiry = new Date(c.expiryDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let status = "Active";
        if (diff <= 0) status = "Expired";
        else if (diff <= 30) status = "Expiring";

        return {
          id: c.id,
          name: c.title,
          issued: c.issueDate,
          expires: c.expiryDate,
          status,
          daysLeft: diff,
          renewalStatus: (c.renewalStatus || "NONE").toUpperCase()
        };
      });

      setCertifications(formatted);

    } catch (err) {
      console.error("Error loading reports", err);
      // Let the axios interceptor handle 401s, but we can catch other issues here
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status !== 401) {
        alert("Failed to load reports: " + msg);
      }
    }
  }, [user]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ✅ FILTER LOGIC (ADVANCED)
  const filteredData = useMemo(() => {
    return certifications.filter((c) => {

      // Status filter
      const statusMatch =
        statusFilter === "All" || c.status === statusFilter;

      // Date filter
      let dateMatch = true;

      if (fromDate) {
        dateMatch = new Date(c.expires) >= new Date(fromDate);
      }

      if (toDate) {
        dateMatch =
          dateMatch && new Date(c.expires) <= new Date(toDate);
      }

      return statusMatch && dateMatch;

    });
  }, [certifications, statusFilter, fromDate, toDate]);

  // ✅ EXPORT TO EXCEL
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("No data to export ❌");
      return;
    }

    const headers = [
      "Certificate",
      "Status",
      "Issued Date",
      "Expiry Date",
      "Days Left",
      "Renewal Status"
    ];

    const rows = filteredData.map((c) => [
      c.name,
      c.status,
      formatDate(c.issued),
      formatDate(c.expires),
      c.daysLeft <= 0 ? "Expired" : c.daysLeft,
      c.renewalStatus
    ]);

    let csvContent =
      "data:application/vnd.ms-excel;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "certification_reports.xls";
    link.click();
  };

  // ✅ SUMMARY
  const summary = {
    total: certifications.length,
    active: certifications.filter((c) => c.status === "Active").length,
    expired: certifications.filter((c) => c.status === "Expired").length,
    expiring: certifications.filter((c) => c.status === "Expiring").length,
    pending: certifications.filter((c) => c.renewalStatus === "PENDING").length,
    approved: certifications.filter((c) => c.renewalStatus === "APPROVED").length,
  };

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <h1>Reports</h1>
        <p>Track certification analytics and generate downloadable reports</p>
      </div>

      {/* Summary */}
      <div className="reports-summary-grid">

        <div className="report-card">
          <FileText size={22} />
          <h2>{summary.total}</h2>
          <p>Total Certifications</p>
        </div>

        <div className="report-card">
          <h2>{summary.active}</h2>
          <p>Active</p>
        </div>

        <div className="report-card">
          <h2>{summary.expired}</h2>
          <p>Expired</p>
        </div>

        <div className="report-card">
          <h2>{summary.expiring}</h2>
          <p>Expiring Soon</p>
        </div>

        <div className="report-card">
          <h2>{summary.pending}</h2>
          <p>Pending Renewals</p>
        </div>

        <div className="report-card">
          <h2>{summary.approved}</h2>
          <p>Approved Renewals</p>
        </div>

      </div>

      {/* Filters */}
      <div className="reports-filters">

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Expiring">Expiring</option>
          <option value="Expired">Expired</option>
        </select>

        <button className="export-btn" onClick={handleExport}>
          <Download size={16} />
          Export
        </button>

      </div>

      {/* Table */}
      <div className="reports-table">
        <table>
          <thead>
            <tr>
              <th>Certificate</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Expires</th>
              <th>Days Left</th>
              <th>Renewal</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((cert) => (
                <tr key={cert.id}>
                  <td>{cert.name}</td>

                  <td>
                    <span className={`status-badge ${cert.status.toLowerCase()}`}>
                      {cert.status}
                    </span>
                  </td>

                  <td>{formatDate(cert.issued)}</td>

                  <td>{formatDate(cert.expires)}</td>

                  <td>
                    {cert.daysLeft <= 0
                      ? "Expired"
                      : `${cert.daysLeft} days`}
                  </td>

                  <td>
                    <span className={`status-badge ${cert.renewalStatus.toLowerCase()}`}>
                      {cert.renewalStatus}
                    </span>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No certifications found for selected filters.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default Reports;