import "./Login.css";
import { BadgeCheck, Eye, EyeOff, User, Shield, Mail, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context";
import { toast } from "sonner";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);

  // Captcha State
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

  const { login, resendOtp } = useAuth();

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (otpRequired && (expiryTimer > 0 || resendTimer > 0)) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpRequired, expiryTimer, resendTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const result = await resendOtp(email);
      if (result.success) {
        toast.success("New verification code sent! ✅");
        setExpiryTimer(result.remainingValiditySeconds || 120);
        setResendTimer(result.resendCooldownSeconds || 30);
        setOtpValue("");
      } else {
        toast.error(result.message || "Resend failed ❌");
      }
    } catch (error) {
      toast.error("An error occurred during resend");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      if (userCaptchaInput !== captchaCode) {
        toast.error("Invalid captcha ❌");
        return;
      }

      if (otpRequired && !otpValue) {
        toast.error("Please enter the verification code ❌");
        return;
      }

      const payload = {
        email,
        password,
        ...(otpRequired && { otp: otpValue })
      };

      const result = await login(payload);

      if (result.otpRequired) {
        setOtpRequired(true);
        setExpiryTimer(result.remainingValiditySeconds || 120);
        setResendTimer(result.resendCooldownSeconds || 30);
        toast.success("Verification code sent! ✅");
        return;
      }

      if (!result.success) {
        throw new Error(result.message || "Login Failed ❌");
      }

      const userData = result.user;
      const backendRole = userData.role?.toLowerCase().trim();

      toast.success("Login Successful ✅");

      if (backendRole === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (error) {
      console.error("Login error", error);
      toast.error(error.message || "Login Failed ❌");
    }
  };


  return (
    <div className="login-wrapper">
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

      <div className="login-left">
        <div className="login-hero-content">
          <h1>Certification Tracking Platform.</h1>
          <p>
            The leading destination for professionals to track, manage,
            and renew global certifications with automated compliance alerts.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className={`login-auth-card ${otpRequired ? "otp-active" : ""}`}>
          <h2 className="login-main-title">Welcome Back!</h2>
          <p className="login-main-subtitle">Log in to start tracking your certifications</p>

          <form onSubmit={handleLogin} className="login-form">
            <label>Email</label>
            <div className="input-field-wrapper">
              <Mail size={18} className="field-icon-left" />
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpRequired} required />
            </div>

            <label>Password</label>
            <div className="input-field-wrapper">
              <Lock size={18} className="field-icon-left" />
              <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={otpRequired} required />
              <div className="eye-btn-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            <div className="security-gate">
              <label>captcha</label>
              <div className="captcha-wrapper">
                <div className="captcha-display-box">
                  <span className="captcha-text-visual">{captchaCode}</span>
                  <div className="captcha-refresh-btn" onClick={generateCaptcha} title="Refresh Code">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                  </div>
                </div>

                <input
                  type="text"
                  className="captcha-input-field"
                  placeholder="Enter the captcha"
                  value={userCaptchaInput}
                  onChange={(e) => setUserCaptchaInput(e.target.value)}
                  disabled={otpRequired}
                  required
                />
              </div>
              <p className="security-note">Cloudflare Protected -  Captcha is case sentive</p>
            </div>

            <div className={`otp-slot ${otpRequired ? "visible" : "hidden"}`}>
              <div className="admin-verification-area">
                <div className="verification-header">
                  <label>Verification Code</label>
                  {expiryTimer > 0 ? (
                    <span className="otp-expiry-timer">Expires in {formatTime(expiryTimer)}</span>
                  ) : (
                    <span className="otp-expired-text">Code Expired</span>
                  )}
                </div>
                <div className="input-field-wrapper">
                  <Shield size={18} className="field-icon-left" />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otpValue} 
                    onChange={(e) => setOtpValue(e.target.value)} 
                    disabled={expiryTimer === 0 || !otpRequired}
                    required={otpRequired}
                  />
                </div>
                <div className="otp-action-row">
                  <button 
                    type="button" 
                    className="resend-otp-btn" 
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || !otpRequired}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </div>
            </div>

          </form>

          <div className="login-options">
            <label className="remember"><input type="checkbox" disabled={otpRequired} /> Remember Me</label>
            <span className="forgot">Forgot Password?</span>
          </div>
          <button
            type="button"
            className="primary-login-btn"
            onClick={handleLogin}
            disabled={otpRequired && expiryTimer === 0}
          >
            {otpRequired ? "Verify & Login" : "Login"}
          </button>
          <div className="login-footer">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;