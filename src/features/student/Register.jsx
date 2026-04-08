import { useState } from "react";
import "./Register.css";
import { certificationApi } from "../../api/certificationApi";

function Register() {

  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    url: "",
  });

  // 🔥 Loading state
  const [loading, setLoading] = useState(false);

  // 🔥 Toast state
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!formData.title || !formData.issuer || !formData.issueDate || !formData.expiryDate) {
      showToast("Please fill all required fields ❌");
      return;
    }

    // ✅ DATE VALIDATION
    if (new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
      showToast("Expiry date must be after issue date ❌");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      showToast("Please login first ❌");
      return;
    }

    const userId = user.id;

    // ✅ FORMAT DATA (VERY IMPORTANT FIX)
    const newCert = {
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      issueDate: formData.issueDate + "T00:00:00",
      expiryDate: formData.expiryDate + "T00:00:00",
      credentialId: formData.credentialId?.trim() || "",
      url: formData.url?.trim() || "",
    };

    try {
      setLoading(true);

      console.log("🚀 Sending Data →", newCert);
      console.log("👤 User ID →", userId);

      const res = await certificationApi.create(userId, newCert);

      console.log("✅ API Response →", res);

      showToast("Certification added successfully ✅");

      // 🔥 RESET FORM
      setFormData({
        title: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        url: "",
      });

    } catch (error) {
      console.error("❌ FULL ERROR →", error);

      // ✅ SMART ERROR MESSAGE
      if (error?.message) {
        showToast(error.message);
      } else {
        showToast("Failed to add certification ❌");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="register-page">

      {/* 🔥 TOAST */}
      {toast && <div className="toast">{toast}</div>}

      <div className="register-header">
        <h2>Register New Certification</h2>
        <p>Add and track your new certification journey.</p>
      </div>

      <div className="register-card">

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Certification Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. AWS Solutions Architect"
              />
            </div>

            <div className="form-group">
              <label>Provider</label>
              <input
                type="text"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                placeholder="e.g. Amazon Web Services"
              />
            </div>

            <div className="form-group">
              <label>Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Credential ID</label>
              <input
                type="text"
                name="credentialId"
                value={formData.credentialId}
                onChange={handleChange}
                placeholder="e.g. ABC123456"
              />
            </div>

            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn">
              Cancel
            </button>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Adding..." : "Register Certification"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

export default Register;