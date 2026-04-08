import "./Signup.css"; // 🔥 SAME CSS as login
import { BadgeCheck, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import { Calendar, Transgender, Globe } from "lucide-react";
import { toast } from "sonner";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  middleName: "",
  lastName: "",
  country: "",
  gender: "",
  age: ""
});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔐 CAPTCHA (same as login)
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !form.email ||
      !form.password ||
      !form.gender ||
      !form.age ||
      !form.confirmPassword ||
      !form.firstName ||
      !form.lastName ||
      !form.country
    ) {
      toast.error("Fill all fields ❌");
      return;
    }
    if (form.age < 16) {
      toast.error("Age must be >= 16 ❌");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    if (userCaptchaInput !== captchaCode) {
      toast.error("Invalid captcha ❌");
      return;
    }

    try {
      const result = await signup({
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        country: form.country,
        gender: form.gender,
        age: form.age
      });

      if (result.success) {
        toast.success("Signup Successful ✅");
        navigate("/login");
      } else {
        toast.error(result.message || "Signup failed ❌");
      }

    } catch (err) {
      console.error(err);
      toast.error("Signup failed ❌");
    }
  };

  return (
    <div className="login-wrapper">

      {/* TOP BAR */}
      <div className="login-top-bar">
        <div className="login-brand-flat">
          <BadgeCheck size={24} color="white" />
          <div className="brand-text-stack">
            <span className="brand-name-top">CertifyMe</span>
            <span className="brand-tag-top">Track. Manage. Renew.</span>
          </div>
        </div>
        <div className="back-home-link" onClick={() => navigate("/")}>
          ← Back to Home
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="login-left">
        <div className="login-hero-content">
           <h1>Certification Tracking Platform.</h1>
    <p>
      The leading destination for professionals to track, manage, 
      and renew global certifications with automated compliance alerts.
    </p>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="login-right">
        <div className="login-auth-card">

          <h2 className="login-main-title">Get Started</h2>
          <p className="login-main-subtitle">Create your account in seconds</p>

          <form onSubmit={handleSignup} className="login-form" autoComplete="on">

            {/* NAME */}
            <label>First Name</label>
            <div className="input-field-wrapper">
              <User size={18} className="field-icon-left" />
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <label>Middle Name (Optional)</label>
            <div className="input-field-wrapper">
              <User size={18} className="field-icon-left" />
              <input
                type="text"
                name="middleName"
                autoComplete="additional-name"
                placeholder="Middle name"
                value={form.middleName}
                onChange={handleChange}
              />
            </div>

            <label>Last Name</label>
            <div className="input-field-wrapper">
              <User size={18} className="field-icon-left" />
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* EMAIL */}
            <label>Email</label>
            <div className="input-field-wrapper">
              <Mail size={18} className="field-icon-left" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* PASSWORD */}
            <label>Password</label>
            <div className="input-field-wrapper">
              <Lock size={18} className="field-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <div className="eye-btn-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <label>Confirm Password</label>
            <div className="input-field-wrapper">
              <Lock size={18} className="field-icon-left" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <div className="eye-btn-right" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </div>
            </div>
            <label>Gender</label>
            <div className="input-field-wrapper">
              <Transgender size={18} className="field-icon-left" />
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <label>Age</label>
            <div className="input-field-wrapper">
              <Calendar size={18} className="field-icon-left" />
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={form.age}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </div>
            {/* COUNTRY */}
            <label>Country</label>
            <div className="input-field-wrapper">
              <Globe size={18} className="field-icon-left" />
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              >
                <option value="">Select country</option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
                <option>Germany</option>
                <option>France</option>
                <option>Italy</option>
                <option>Spain</option>
                <option>Netherlands</option>
                <option>Sweden</option>
                <option>Norway</option>
                <option>Denmark</option>
                <option>Singapore</option>
                <option>UAE</option>
                <option>Japan</option>
                <option>South Korea</option>
                <option>China</option>
                <option>Brazil</option>
                <option>South Africa</option>
              </select>
            </div>
            {/* CAPTCHA (same style) */}
            <div className="security-gate">
              <label>captcha</label>
              <div className="captcha-wrapper">
                <div className="captcha-display-box">
                  <span className="captcha-text-visual">{captchaCode}</span>
                  <div className="captcha-refresh-btn" onClick={generateCaptcha}>
                    ↻
                  </div>
                </div>

                <input
                  type="text"
                  className="captcha-input-field"
                  placeholder="Enter captcha"
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
          <button 
  type="button" 
  className="primary-login-btn"
  onClick={handleSignup}
>
  Create Account
</button>
          <div className="login-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
          
        </div>
      </div>

    </div>
  );
}

export default Signup;