import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { toast } from 'react-toastify';
import { BsKanbanFill, BsBoxArrowInRight, BsPersonPlus, BsEnvelope, BsLock, BsPerson, BsEye, BsEyeSlash, BsCheckCircleFill, BsKanban, BsLightningCharge, BsPeopleFill } from 'react-icons/bs';

/**
 * LoginPage — Modern split-screen Login & Register.
 * Left: Branding panel with gradient, features, and decorative shapes.
 * Right: Login/Register form with password toggle and smooth transitions.
 * On login success, stores JWT + user info via AuthContext and redirects to dashboard.
 */
export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login: authLogin, token } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (token) { navigate('/dashboard', { replace: true }); return null; }

  // ── Login ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email: loginEmail, password: loginPass });
      authLogin(data);
      toast.success(`Welcome back, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  // ── Register ──
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPass.length < 6) { toast.warning('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authApi.register({ name: regName, email: regEmail, password: regPass });
      toast.success('Account created! You can now log in.');
      setTab('login');
      setRegName(''); setRegEmail(''); setRegPass('');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: <BsKanban className="fs-4" />, title: 'Kanban Boards', desc: 'Visualize and manage work with drag-and-drop boards' },
    { icon: <BsLightningCharge className="fs-4" />, title: 'Sprint Tracking', desc: 'Plan and track agile sprints with real-time progress' },
    { icon: <BsPeopleFill className="fs-4" />, title: 'Team Collaboration', desc: 'Comments, assignments, and notifications in one place' },
  ];

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand">
            <BsKanbanFill className="login-brand-icon" />
            <h1 className="login-brand-title">TaskFlow</h1>
          </div>
          <p className="login-brand-subtitle">
            The modern project management platform built for agile teams.
          </p>

          <div className="login-features">
            {features.map((f, i) => (
              <div key={i} className="login-feature-item" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                <div className="login-feature-icon">{f.icon}</div>
                <div>
                  <div className="login-feature-title">{f.title}</div>
                  <div className="login-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative floating shapes */}
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-form-wrapper">
          {/* Mobile-only brand */}
          <div className="d-lg-none text-center mb-4">
            <BsKanbanFill className="text-primary mb-2" style={{ fontSize: '2rem' }} />
            <h3 className="fw-bold text-dark mb-1">TaskFlow</h3>
          </div>

          <h2 className="login-form-title">{tab === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="login-form-subtitle">
            {tab === 'login' ? 'Sign in to continue to your dashboard' : 'Get started with TaskFlow today'}
          </p>

          {/* Tab pills */}
          <div className="login-tabs">
            <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
              <BsBoxArrowInRight className="me-2" />Sign In
            </button>
            <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
              <BsPersonPlus className="me-2" />Register
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="login-form-animate">
              <div className="login-input-group">
                <label className="login-label">Email address</label>
                <div className="login-input-wrapper">
                  <BsEnvelope className="login-input-icon" />
                  <input type="email" className="login-input" placeholder="you@example.com"
                         value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </div>
              </div>
              <div className="login-input-group">
                <label className="login-label">Password</label>
                <div className="login-input-wrapper">
                  <BsLock className="login-input-icon" />
                  <input type={showLoginPass ? 'text' : 'password'} className="login-input" placeholder="Enter your password"
                         value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowLoginPass(!showLoginPass)} tabIndex={-1}>
                    {showLoginPass ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
              </div>
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <BsCheckCircleFill className="me-2" />}
                Sign In
              </button>
              <p className="login-switch-text">
                Don't have an account?{' '}
                <button type="button" className="login-switch-link" onClick={() => setTab('register')}>Create one</button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="login-form-animate">
              <div className="login-input-group">
                <label className="login-label">Full Name</label>
                <div className="login-input-wrapper">
                  <BsPerson className="login-input-icon" />
                  <input type="text" className="login-input" placeholder="John Doe"
                         value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
              </div>
              <div className="login-input-group">
                <label className="login-label">Email address</label>
                <div className="login-input-wrapper">
                  <BsEnvelope className="login-input-icon" />
                  <input type="email" className="login-input" placeholder="you@example.com"
                         value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div className="login-input-group">
                <label className="login-label">Password <span className="text-muted" style={{ fontWeight: 400 }}>(min 6 chars)</span></label>
                <div className="login-input-wrapper">
                  <BsLock className="login-input-icon" />
                  <input type={showRegPass ? 'text' : 'password'} className="login-input" placeholder="Choose a strong password"
                         value={regPass} onChange={e => setRegPass(e.target.value)} required />
                  <button type="button" className="password-toggle" onClick={() => setShowRegPass(!showRegPass)} tabIndex={-1}>
                    {showRegPass ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
              </div>
              <button type="submit" className="login-submit-btn register" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <BsCheckCircleFill className="me-2" />}
                Create Account
              </button>
              <p className="login-switch-text">
                Already registered?{' '}
                <button type="button" className="login-switch-link" onClick={() => setTab('login')}>Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
