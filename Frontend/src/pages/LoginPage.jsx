import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { toast } from 'react-toastify';
import { BsKanbanFill, BsBoxArrowInRight, BsPersonPlus, BsEnvelope, BsLock, BsPerson } from 'react-icons/bs';

/**
 * LoginPage — Login & Register tabs.
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

  return (
    <div className="auth-bg d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg auth-card border-0">
        <div className="card-body p-5">

          {/* Brand */}
          <div className="text-center mb-4">
            <BsKanbanFill className="text-primary mb-3" style={{ fontSize: '2.5rem' }} />
            <h2 className="fw-bold text-dark mb-1">TaskFlow</h2>
            <p className="text-muted small">Project & Task Management System</p>
          </div>

          {/* Tabs */}
          <ul className="nav nav-pills nav-justified mb-4 bg-light rounded p-1">
            <li className="nav-item">
              <button className={`nav-link rounded ${tab === 'login' ? 'active' : ''}`}
                      onClick={() => setTab('login')}>
                <BsBoxArrowInRight className="me-1" />Login
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded ${tab === 'register' ? 'active' : ''}`}
                      onClick={() => setTab('register')}>
                <BsPersonPlus className="me-1" />Register
              </button>
            </li>
          </ul>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email address</label>
                <div className="input-group">
                  <span className="input-group-text"><BsEnvelope /></span>
                  <input type="email" className="form-control" placeholder="you@example.com"
                         value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text"><BsLock /></span>
                  <input type="password" className="form-control" placeholder="••••••"
                         value={loginPass} onChange={e => setLoginPass(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                Sign In
              </button>
              <p className="text-center text-muted mt-3 small">
                Don't have an account?{' '}
                <button type="button" className="btn btn-link p-0 text-primary small"
                        onClick={() => setTab('register')}>Register here</button>
              </p>
            </form>
          )}
          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text"><BsPerson /></span>
                  <input type="text" className="form-control" placeholder="John Doe"
                         value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email address</label>
                <div className="input-group">
                  <span className="input-group-text"><BsEnvelope /></span>
                  <input type="email" className="form-control" placeholder="you@example.com"
                         value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Password <small className="text-muted">(min 6 chars)</small></label>
                <div className="input-group">
                  <span className="input-group-text"><BsLock /></span>
                  <input type="password" className="form-control" placeholder="Choose a strong password"
                         value={regPass} onChange={e => setRegPass(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100 py-2 fw-semibold" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                Create Account
              </button>
              <p className="text-center text-muted mt-3 small">
                Already registered?{' '}
                <button type="button" className="btn btn-link p-0 text-primary small"
                        onClick={() => setTab('login')}>Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
