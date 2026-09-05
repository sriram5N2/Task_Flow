import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { taskApi, projectApi, userApi, commentApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { BsPlusLg, BsPencil, BsTrash, BsThreeDotsVertical, BsHandIndex, BsInbox, BsFolder, BsPerson, BsBook, BsBug, BsClipboardCheck, BsSend, BsDiagram3, BsArrowLeft, BsChevronRight } from 'react-icons/bs';

const COLUMNS = [
  { status: 'TODO',        label: 'To Do',        dotClass: 'dot-secondary', badgeBg: 'bg-secondary' },
  { status: 'IN_PROGRESS', label: 'In Progress',  dotClass: 'dot-primary',   badgeBg: 'bg-primary'   },
  { status: 'IN_REVIEW',   label: 'In Review',    dotClass: 'dot-warning',   badgeBg: 'bg-warning'   },
  { status: 'DONE',        label: 'Done',          dotClass: 'dot-success',   badgeBg: 'bg-success'   },
];

const PRIORITY_COLORS = {
  HIGH:   { badge: 'danger',  emoji: '🔴' },
  MEDIUM: { badge: 'warning', emoji: '🟡' },
  LOW:    { badge: 'success', emoji: '🟢' },
};

const TYPE_ICONS = {
  STORY: <BsBook className="text-primary me-1" title="User Story" />,
  BUG:   <BsBug className="text-danger me-1" title="Bug" />,
  TASK:  <BsClipboardCheck className="text-secondary me-1" title="Task" />,
  SUBTASK: <BsDiagram3 className="text-info me-1" title="Subtask" />
};

export default function TaskBoardPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterProject, setFilterProject] = useState(preselectedProject);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    title: '', description: '', projectId: '', priority: 'MEDIUM', 
    status: 'TODO', assignedToId: '', reporterId: '', type: 'TASK', sprint: '' 
  });
  const [rightTab, setRightTab] = useState('comments'); // 'comments' | 'subtasks'
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // Subtasks state
  const [subtasks, setSubtasks] = useState([]);
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [subtaskForm, setSubtaskForm] = useState({
    title: '', description: '', priority: 'MEDIUM', reporterId: '', assignedToId: ''
  });

  const draggedId = useRef(null);
  const commentsEndRef = useRef(null);

  const [selectedAssignee, setSelectedAssignee] = useState('');

  // ── Load Data ──
  useEffect(() => {
    projectApi.getAll().then(setProjects).catch(console.error);
    userApi.getAll().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    loadTasks(filterProject);
  }, [filterProject]);

  const loadTasks = (projId) => {
    taskApi.getAll(projId || null).then(setTasks).catch(console.error);
  };

  const loadComments = (taskId) => {
    commentApi.getAll(taskId).then(res => {
      setComments(res);
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }).catch(console.error);
  };

  const loadSubtasks = (taskId) => {
    taskApi.getSubtasks(taskId).then(setSubtasks).catch(console.error);
  };

  // ── Drag & Drop ──
  const onDragStart = (e, taskId) => {
    draggedId.current = taskId;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`tc-${taskId}`);
      if (el) el.classList.add('dragging');
    }, 10);
  };

  const onDragEnd = () => {
    document.querySelectorAll('.task-card.dragging').forEach(el => el.classList.remove('dragging'));
    document.querySelectorAll('.kanban-col.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const onDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
  const onDragLeave = (e) => { e.currentTarget.classList.remove('drag-over'); };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = draggedId.current;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      try {
        await taskApi.updateStatus(taskId, newStatus);
        toast.success(`Ticket moved to ${newStatus.replace('_', ' ')}`);
      } catch (err) {
        toast.error(err.message || 'Failed to update status');
        loadTasks(filterProject);
      }
    }
    draggedId.current = null;
  };

  // ── Create / Edit Ticket Modal ──
  const openCreate = () => {
    setEditing(null);
    setForm({ 
      title: '', description: '', projectId: filterProject || '', priority: 'MEDIUM', 
      status: 'TODO', assignedToId: '', reporterId: user?.id || '', type: 'TASK', sprint: '' 
    });
    setComments([]);
    setSubtasks([]);
    setRightTab('comments');
    setCreatingSubtask(false);
    setShowModal(true);
  };

  const openDetails = (t) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '',
      projectId: t.projectId || '', priority: t.priority || 'MEDIUM',
      status: t.status || 'TODO', assignedToId: t.assignedToId || '',
      reporterId: t.reporterId || '', type: t.type || 'TASK', sprint: t.sprint || '',
      version: t.version, parentTaskId: t.parentTaskId, parentTaskTitle: t.parentTaskTitle
    });
    setComments([]);
    setSubtasks([]);
    setRightTab('comments');
    setCreatingSubtask(false);
    setShowModal(true);
    loadComments(t.id);
    loadSubtasks(t.id);
  };

  const handleReturnToParent = async (parentId) => {
    try {
      const parentTask = await taskApi.getById(parentId);
      openDetails(parentTask);
    } catch (err) {
      toast.error('Failed to load parent task');
    }
  };

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!subtaskForm.title.trim()) return;
    try {
      const dto = {
        ...subtaskForm,
        reporterId: subtaskForm.reporterId ? Number(subtaskForm.reporterId) : null,
        assignedToId: subtaskForm.assignedToId ? Number(subtaskForm.assignedToId) : null
      };
      await taskApi.createSubtask(editing.id, dto);
      toast.success('Subtask created!');
      setCreatingSubtask(false);
      setSubtaskForm({ title: '', description: '', priority: 'MEDIUM', reporterId: '', assignedToId: '' });
      loadSubtasks(editing.id);
      loadTasks(filterProject); // optional: refresh board tasks if showing progress
    } catch (err) {
      toast.error(err.message || 'Failed to create subtask');
    }
  };

  const handleSaveTicket = async () => {
    if (!isAdmin) { setShowModal(false); return; } // Users can't edit ticket details directly
    if (!form.title.trim() || !form.projectId) { toast.warning('Title and Project are required'); return; }
    
    const dto = { ...form, projectId: Number(form.projectId), 
                  assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
                  reporterId: form.reporterId ? Number(form.reporterId) : null };
    try {
      if (editing) {
        await taskApi.update(editing.id, dto);
        toast.success('Ticket updated!');
      } else {
        await taskApi.create(dto);
        toast.success('Ticket created!');
      }
      setShowModal(false);
      loadTasks(filterProject);
    } catch (err) { 
      if (err.message.includes('modified by another user') || err.message.includes('409')) {
        toast.error('Someone else just updated this ticket. Refreshing data...');
        loadTasks(filterProject);
        setShowModal(false);
      } else {
        toast.error(err.message); 
      }
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this ticket?')) return;
    try { await taskApi.delete(id); setTasks(prev => prev.filter(t => t.id !== id)); toast.info('Ticket deleted'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Comments Logic ──
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentApi.create(editing.id, { text: newComment });
      setNewComment('');
      loadComments(editing.id);
    } catch (err) { toast.error('Failed to post comment'); }
  };

  const handleUpdateComment = async (comment) => {
    try {
      await commentApi.update(editing.id, comment.id, { text: editCommentText, version: comment.version });
      setEditingCommentId(null);
      loadComments(editing.id);
      toast.success('Comment updated');
    } catch (err) {
      if (err.message.includes('modified') || err.message.includes('409')) {
        toast.error('Conflict: comment modified by another user. Refreshing...');
        loadComments(editing.id);
      } else {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-content">

        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-1">Board</h4>
            <small className="text-muted"><BsHandIndex className="me-1" />Drag tickets between columns</small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Form.Select size="sm" style={{ minWidth: 180 }} value={filterProject}
                         onChange={e => setFilterProject(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Form.Select>
            {isAdmin && (
              <button className="btn btn-primary btn-sm fw-semibold" onClick={openCreate}>
                <BsPlusLg className="me-1" />New Ticket
              </button>
            )}
          </div>
        </div>

        {/* Team Members Horizontal Filter */}
        <div className="mb-4 d-flex gap-2 overflow-auto py-1">
          <button 
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${selectedAssignee === '' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedAssignee('')}
          >
            All Team Members
          </button>
          {users.map(u => (
            <button 
              key={u.id}
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${selectedAssignee === u.id ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedAssignee(u.id)}
            >
              {u.name}
            </button>
          ))}
        </div>

        {/* ── 4-Column Kanban Board ── */}
        <div className="row g-3">
          {COLUMNS.map(col => {
            let colTasks = tasks.filter(t => t.status === col.status);
            if (selectedAssignee) {
              colTasks = colTasks.filter(t => t.assignedToId === selectedAssignee);
            }
            return (
              <div className="col-md-3" key={col.status}>
                <div className="kanban-col"
                     onDragOver={onDragOver} onDragLeave={onDragLeave}
                     onDrop={e => onDrop(e, col.status)}>
                  <div className="kanban-col-header">
                    <span className={`dot ${col.dotClass}`} />
                    <span>{col.label}</span>
                    <span className={`badge ${col.badgeBg} ms-auto rounded-pill`}>{colTasks.length}</span>
                  </div>
                  <div className="task-container">
                    {colTasks.length === 0 && (
                      <div className="text-center text-muted small py-4 opacity-50">
                        <BsInbox className="fs-4 d-block mb-1 mx-auto" />Empty
                      </div>
                    )}
                    {colTasks.map(t => {
                      const pc = PRIORITY_COLORS[t.priority] || { badge: 'secondary', emoji: '' };
                      const isDone = t.status === 'DONE';
                      const canDrag = isAdmin || t.assignedToId === user.id;

                      return (
                        <div className={`task-card priority-${t.priority} ${isDone ? 'opacity-50' : ''}`} key={t.id} id={`tc-${t.id}`}
                             draggable={canDrag} onDragStart={e => onDragStart(e, t.id)} onDragEnd={onDragEnd}
                             onClick={() => openDetails(t)}
                             style={{ cursor: canDrag ? 'grab' : 'pointer' }}>

                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className={`fw-semibold small text-dark me-2 ${isDone ? 'text-decoration-line-through' : ''}`} style={{ lineHeight: 1.3 }}>
                              {TYPE_ICONS[t.type] || TYPE_ICONS.TASK} {t.title}
                            </span>
                            {isAdmin && (
                              <div className="dropdown flex-shrink-0" onClick={e => e.stopPropagation()}>
                                <button className="btn btn-sm p-0 border-0 text-muted lh-1" data-bs-toggle="dropdown">
                                  <BsThreeDotsVertical />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{ minWidth: 120 }}>
                                  <li><button className="dropdown-item small text-danger" onClick={(e) => handleDelete(t.id, e)}>
                                    <BsTrash className="me-2" />Delete
                                  </button></li>
                                </ul>
                              </div>
                            )}
                          </div>

                          {t.sprint && (
                            <span className="badge bg-light border text-dark mb-2" style={{ fontSize: '0.65rem' }}>
                              🔄 {t.sprint}
                            </span>
                          )}

                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mt-1">
                            <span className={`badge bg-${pc.badge} text-white`} style={{ fontSize: '0.68rem' }}>
                              {pc.emoji} {t.priority}
                            </span>
                            {t.projectName && (
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                <BsFolder className="me-1" />{t.projectName}
                              </small>
                            )}
                          </div>
                          
                          <div className="mt-2 pt-2 border-top d-flex justify-content-between">
                            <small className="text-muted" style={{ fontSize: '0.65rem' }} title="Reporter">
                              📝 {t.reporterName || 'Unknown'}
                            </small>
                            {t.assignedToName && (
                              <small className="text-muted" style={{ fontSize: '0.65rem' }} title="Assignee">
                                <BsPerson className="me-1" />{t.assignedToName}
                              </small>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Ticket Details / Edit Modal ── */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size={editing ? "xl" : "lg"} centered>
          <Modal.Header closeButton className="border-bottom-0 pb-0 bg-light">
            <div className="d-flex flex-column w-100">
              {/* Breadcrumb: Only visible when viewing a subtask */}
              {editing && form.parentTaskId && (
                <nav className="d-flex align-items-center mb-2" style={{ fontSize: '0.82rem' }}>
                  <button className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold"
                          onClick={() => handleReturnToParent(form.parentTaskId)}
                          style={{ fontSize: '0.82rem' }}>
                    {form.parentTaskTitle || `Task-${form.parentTaskId}`}
                  </button>
                  <BsChevronRight className="mx-2 text-muted" style={{ fontSize: '0.65rem' }} />
                  <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: 280 }} title={form.title}>
                    {form.title || `Subtask-${editing.id}`}
                  </span>
                </nav>
              )}
              <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                {editing ? (
                  <>
                    {TYPE_ICONS[form.type]}
                    {form.title}
                  </>
                ) : 'Create New Ticket'}
              </Modal.Title>
              {/* Return to Parent link */}
              {editing && form.parentTaskId && (
                <button className="btn btn-link btn-sm p-0 text-decoration-none text-primary d-flex align-items-center mt-1 mb-1"
                        onClick={() => handleReturnToParent(form.parentTaskId)}
                        style={{ fontSize: '0.8rem', width: 'fit-content' }}>
                  <BsArrowLeft className="me-1" /> Return to Parent Task
                </button>
              )}
            </div>
          </Modal.Header>
          <Modal.Body className="p-0 bg-light">
            <div className="row g-0">
              
              {/* Left Side: Ticket Details */}
              <div className={editing ? "col-lg-7 p-4 bg-white border-end" : "col-12 p-4 bg-white"}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Title <span className="text-danger">*</span></Form.Label>
                    <Form.Control placeholder="Ticket title" value={form.title} disabled={!isAdmin}
                                  onChange={e => setForm({ ...form, title: e.target.value })} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Description</Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="Add details, acceptance criteria..." 
                                  value={form.description} disabled={!isAdmin}
                                  onChange={e => setForm({ ...form, description: e.target.value })} />
                  </Form.Group>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Project <span className="text-danger">*</span></Form.Label>
                        <Form.Select value={form.projectId} disabled={!isAdmin} onChange={e => setForm({ ...form, projectId: e.target.value })}>
                          <option value="">Select project...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Sprint</Form.Label>
                        <Form.Control placeholder="e.g. Sprint 24" value={form.sprint} disabled={!isAdmin}
                                      onChange={e => setForm({ ...form, sprint: e.target.value })} />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Type</Form.Label>
                        <Form.Select value={form.type} disabled={!isAdmin} onChange={e => setForm({ ...form, type: e.target.value })}>
                          <option value="STORY">📖 User Story</option>
                          <option value="TASK">📋 Task</option>
                          <option value="BUG">🐞 Bug</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Priority</Form.Label>
                        <Form.Select value={form.priority} disabled={!isAdmin} onChange={e => setForm({ ...form, priority: e.target.value })}>
                          <option value="LOW">🟢 Low</option>
                          <option value="MEDIUM">🟡 Medium</option>
                          <option value="HIGH">🔴 High</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Status</Form.Label>
                        <Form.Select value={form.status} disabled={!isAdmin} onChange={e => setForm({ ...form, status: e.target.value })}>
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    {isAdmin && (
                      <>
                        <div className="col-md-6">
                          <Form.Group>
                            <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Reporter</Form.Label>
                            <Form.Select value={form.reporterId} onChange={e => setForm({ ...form, reporterId: e.target.value })}>
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </Form.Select>
                          </Form.Group>
                        </div>
                        <div className="col-md-6">
                          <Form.Group>
                            <Form.Label className="fw-semibold small text-muted text-uppercase mb-1">Assignee</Form.Label>
                            <Form.Select value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })}>
                              <option value="">Unassigned</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </Form.Select>
                          </Form.Group>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <Button variant="light" onClick={() => setShowModal(false)}>Close</Button>
                      <Button variant="primary" onClick={handleSaveTicket}>Save Changes</Button>
                    </div>
                  )}
                  {!isAdmin && (
                    <div className="mt-4 d-flex justify-content-end">
                      <Button variant="light" onClick={() => setShowModal(false)}>Close</Button>
                    </div>
                  )}
                </Form>
              </div>

              {/* Right Side: Activity & Subtasks */}
              {editing && (
                <div className="col-lg-5 d-flex flex-column bg-light" style={{ maxHeight: '75vh' }}>
                  <div className="p-0 border-bottom bg-white d-flex">
                    <button type="button" className={`btn rounded-0 flex-fill py-3 fw-bold border-bottom ${rightTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}
                            style={{ borderBottomWidth: '3px !important' }}
                            onClick={() => setRightTab('comments')}>
                      Comments <span className="badge bg-secondary ms-1 rounded-pill">{comments.length}</span>
                    </button>
                    <button type="button" className={`btn rounded-0 flex-fill py-3 fw-bold border-bottom ${rightTab === 'subtasks' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}
                            style={{ borderBottomWidth: '3px !important' }}
                            onClick={() => setRightTab('subtasks')}>
                      Subtasks <span className="badge bg-secondary ms-1 rounded-pill">{subtasks.length}</span>
                    </button>
                  </div>
                  
                  {rightTab === 'comments' && (
                    <>
                      <div className="flex-fill p-3 overflow-auto">
                        {comments.length === 0 ? (
                          <div className="text-center text-muted small mt-4 opacity-50">
                            No comments yet. Start the conversation!
                          </div>
                        ) : (
                          comments.map(c => (
                            <div key={c.id} className="card border-0 shadow-sm mb-3">
                              <div className="card-header bg-white border-bottom-0 py-2 d-flex justify-content-between align-items-center">
                                <strong className="small">{c.authorName}</strong>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {new Date(c.createdAt).toLocaleString('en-US', { 
                                    year: 'numeric', month: 'short', day: 'numeric', 
                                    hour: 'numeric', minute: '2-digit' 
                                  })}
                                </small>
                              </div>
                              <div className="card-body py-2 pt-0">
                                {editingCommentId === c.id ? (
                                  <div>
                                    <textarea className="form-control form-control-sm mb-2" rows={2} 
                                              value={editCommentText} onChange={e => setEditCommentText(e.target.value)} />
                                    <div className="d-flex gap-1 justify-content-end">
                                      <button type="button" className="btn btn-sm btn-light py-0 px-2" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                      <button type="button" className="btn btn-sm btn-primary py-0 px-2" onClick={() => handleUpdateComment(c)}>Save</button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{c.text}</p>
                                )}
                              </div>
                              {c.authorId === user.id && editingCommentId !== c.id && (
                                <div className="card-footer bg-white border-top-0 pt-0 text-end">
                                  <button type="button" className="btn btn-link btn-sm p-0 text-muted small text-decoration-none" 
                                          onClick={() => { setEditingCommentId(c.id); setEditCommentText(c.text); }}>
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        <div ref={commentsEndRef} />
                      </div>
    
                      <div className="p-3 bg-white border-top">
                        <form onSubmit={handlePostComment} className="d-flex gap-2">
                          <input type="text" className="form-control" placeholder="Add a comment..."
                                 value={newComment} onChange={e => setNewComment(e.target.value)} />
                          <button type="submit" className="btn btn-primary px-3" disabled={!newComment.trim()}>
                            <BsSend />
                          </button>
                        </form>
                      </div>
                    </>
                  )}

                  {rightTab === 'subtasks' && (
                    <div className="flex-fill p-3 overflow-auto d-flex flex-column gap-3">
                      {subtasks.length === 0 && !creatingSubtask && (
                        <div className="text-center text-muted small mt-4 opacity-50">
                          No subtasks yet. Break down your work!
                        </div>
                      )}
                      
                      {subtasks.map(st => (
                        <div key={st.id} className="card border-0 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => openDetails(st)}>
                          <div className="card-body p-2 d-flex align-items-center gap-2">
                            <span className={`badge bg-${PRIORITY_COLORS[st.priority]?.badge || 'secondary'}`} style={{ fontSize: '0.6rem' }}>
                              {st.status}
                            </span>
                            <span className={`fw-semibold small flex-fill text-truncate ${st.status === 'DONE' ? 'text-decoration-line-through text-muted' : ''}`}>
                              {st.title}
                            </span>
                            {st.assignedToName && (
                              <small className="text-muted text-nowrap" style={{ fontSize: '0.7rem' }} title="Assignee">
                                <BsPerson className="me-1" />{st.assignedToName.split(' ')[0]}
                              </small>
                            )}
                          </div>
                        </div>
                      ))}

                      {creatingSubtask ? (
                        <div className="card border shadow-sm">
                          <div className="card-body p-3">
                            <form onSubmit={handleCreateSubtask}>
                              <div className="mb-2">
                                <input type="text" className="form-control form-control-sm" placeholder="Subtask title *" 
                                       value={subtaskForm.title} onChange={e => setSubtaskForm({...subtaskForm, title: e.target.value})} autoFocus required />
                              </div>
                              <div className="mb-2">
                                <textarea className="form-control form-control-sm" placeholder="Description (optional)" rows={2}
                                          value={subtaskForm.description} onChange={e => setSubtaskForm({...subtaskForm, description: e.target.value})} />
                              </div>
                              <div className="row g-2 mb-3">
                                <div className="col-4">
                                  <select className="form-select form-select-sm" value={subtaskForm.priority} onChange={e => setSubtaskForm({...subtaskForm, priority: e.target.value})}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                  </select>
                                </div>
                                <div className="col-4">
                                  <select className="form-select form-select-sm" value={subtaskForm.reporterId} onChange={e => setSubtaskForm({...subtaskForm, reporterId: e.target.value})}>
                                    <option value="">Reporter</option>
                                    <option value={user?.id}>{user?.name} (Me)</option>
                                    {users.filter(u => u.id !== user?.id).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                  </select>
                                </div>
                                <div className="col-4">
                                  <select className="form-select form-select-sm" value={subtaskForm.assignedToId} onChange={e => setSubtaskForm({...subtaskForm, assignedToId: e.target.value})}>
                                    <option value="">Assignee</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="btn btn-sm btn-light" onClick={() => setCreatingSubtask(false)}>Cancel</button>
                                <button type="submit" className="btn btn-sm btn-primary">Create</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <button type="button" className="btn btn-outline-primary btn-sm mt-2 align-self-start" onClick={() => setCreatingSubtask(true)}>
                          <BsPlusLg className="me-1" /> Create Subtask
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </Modal.Body>
        </Modal>

      </div>
    </div>
  );
}
