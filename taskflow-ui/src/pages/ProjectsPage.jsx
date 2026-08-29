import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { projectApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { BsPlusLg, BsPencil, BsTrash, BsKanban, BsFolderX } from 'react-icons/bs';

/**
 * ProjectsPage — Lists project cards with progress bars.
 * ADMIN: full CRUD via modal.  USER: read-only view.
 */
export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);   // null = create, object = edit
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE', deadline: '' });

  const load = () => projectApi.getAll().then(setProjects).catch(console.error);
  useEffect(() => { load(); }, []);

  // ── Modal ──
  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', status: 'ACTIVE', deadline: '' }); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', status: p.status, deadline: p.deadline || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.warning('Project name is required'); return; }
    try {
      if (editing) {
        await projectApi.update(editing.id, form);
        toast.success('Project updated!');
      } else {
        await projectApi.create(form);
        toast.success('Project created!');
      }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and all its tasks?`)) return;
    try { await projectApi.delete(p.id); toast.info(`"${p.name}" deleted`); load(); }
    catch (err) { toast.error(err.message); }
  };

  const statusConfig = {
    ACTIVE:    { color: 'success', label: '🟢 Active' },
    ON_HOLD:   { color: 'warning', label: '🟡 On Hold' },
    COMPLETED: { color: 'primary', label: '🔵 Completed' },
  };

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-content">

        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h4 className="fw-bold mb-1">Projects</h4>
            <small className="text-muted">
              {isAdmin ? 'Create and manage your projects' : 'View projects you are part of'}
            </small>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={openCreate}>
              <BsPlusLg className="me-1" />New Project
            </button>
          )}
        </div>

        {/* Project Cards Grid */}
        <div className="row g-4">
          {projects.length === 0 && (
            <div className="col-12 text-center py-5">
              <BsFolderX className="text-muted" style={{ fontSize: '3rem' }} />
              <h5 className="text-muted mt-3">No projects yet</h5>
              {isAdmin && <p className="text-muted small">Click "New Project" to get started</p>}
            </div>
          )}

          {projects.map(p => {
            const progress = p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0;
            const { color, label } = statusConfig[p.status] || { color: 'secondary', label: p.status };

            return (
              <div className="col-sm-6 col-xl-4" key={p.id}>
                <div className="card shadow-sm project-card h-100">
                  <div className="card-body pb-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0 me-2 text-dark">{p.name}</h6>
                      <span className={`badge bg-${color} text-white text-nowrap`}>{label}</span>
                    </div>
                    <p className="text-muted small mb-3" style={{ minHeight: '2.5rem' }}>
                      {p.description || <em>No description</em>}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted fw-semibold">Progress</small>
                      <small className={`fw-semibold text-${color}`}>{progress}%</small>
                    </div>
                    <div className="progress mb-2" style={{ height: 6, borderRadius: 4 }}>
                      <div className={`progress-bar bg-${color}`} style={{ width: `${progress}%`, borderRadius: 4 }} />
                    </div>
                    <small className="text-muted">{p.completedTasks} of {p.totalTasks} task{p.totalTasks !== 1 ? 's' : ''} done</small>
                    {p.deadline && <small className="text-muted d-block mt-1">📅 {new Date(p.deadline + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>}
                    {p.createdBy && <small className="text-muted d-block mt-1">👤 {p.createdBy}</small>}
                  </div>
                  <div className="card-footer bg-white border-0 pt-0 d-flex gap-2">
                    <Link to={`/tasks?project=${p.id}`} className="btn btn-outline-primary btn-sm flex-fill">
                      <BsKanban className="me-1" />Board
                    </Link>
                    {isAdmin && (
                      <>
                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => openEdit(p)} title="Edit">
                          <BsPencil />
                        </button>
                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => handleDelete(p)} title="Delete">
                          <BsTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Create / Edit Modal ── */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">{editing ? 'Edit Project' : 'New Project'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Project Name <span className="text-danger">*</span></Form.Label>
                <Form.Control placeholder="e.g. E-Commerce Website"
                              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Brief project description..."
                              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Form.Group>
              <div className="row g-3">
                <div className="col-6">
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="ON_HOLD">🟡 On Hold</option>
                    <option value="COMPLETED">🔵 Completed</option>
                  </Form.Select>
                </div>
                <div className="col-6">
                  <Form.Label className="fw-semibold">Deadline</Form.Label>
                  <Form.Control type="date" value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" className="fw-semibold" onClick={handleSave}>
              Save Project
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
}
