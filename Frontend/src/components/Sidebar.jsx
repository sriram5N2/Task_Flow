import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BsGrid1X2Fill, BsFolderFill, BsCheck2Square, BsBoxArrowRight, BsKanbanFill } from 'react-icons/bs';

/**
 * Sidebar — shared navigation component across all authenticated pages.
 * Shows user avatar, name, role, and nav links.
 */
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h5 className="mb-0"><BsKanbanFill className="me-2" />TaskFlow</h5>
      </div>

      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <BsGrid1X2Fill className="me-2" /><span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
            <BsFolderFill className="me-2" /><span>Projects</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
            <BsCheck2Square className="me-2" /><span>Task Board</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="avatar">{initials}</div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-white text-truncate">{user?.name || 'User'}</div>
            <small className="text-light opacity-75">{user?.role || ''}</small>
          </div>
        </div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          <BsBoxArrowRight className="me-1" />Logout
        </button>
      </div>
    </nav>
  );
}
