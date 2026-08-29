import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { dashboardApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BsFolderFill, BsListTask, BsArrowRepeat, BsCheckCircleFill, BsSearch, BsFolderPlus, BsKanban } from 'react-icons/bs';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/**
 * DashboardPage — Shows stats cards, task status doughnut chart, project bar chart.
 * ADMIN sees all data. USER sees only their assigned tasks.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dashboardApi.getStats().then(setStats).catch(console.error);
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-content">

        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h4 className="fw-bold mb-1">Dashboard</h4>
            <small className="text-muted">{greeting}, {user?.name}! 👋</small>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-4">
          <StatCard icon={<BsFolderFill className="fs-3" />} label="Total Projects"
                    value={stats?.totalProjects} bgClass="bg-primary bg-opacity-10 text-primary" />
          <StatCard icon={<BsListTask className="fs-3" />} label="Total Tasks"
                    value={stats?.totalTasks} bgClass="bg-warning bg-opacity-10 text-warning" />
          <StatCard icon={<BsArrowRepeat className="fs-3" />} label="In Progress"
                    value={stats?.inProgressTasks} bgClass="bg-info bg-opacity-10 text-info" />
          <StatCard icon={<BsCheckCircleFill className="fs-3" />} label="Done"
                    value={stats?.doneTasks} bgClass="bg-success bg-opacity-10 text-success" />
        </div>

        {/* Charts Row */}
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom-0 pt-4 pb-0 px-4">
                Task Status Breakdown
              </div>
              <div className="card-body d-flex justify-content-center align-items-center">
                <div style={{ maxWidth: 280, width: '100%' }}>
                  {stats && (
                    <Doughnut
                      data={{
                        labels: ['To Do', 'In Progress', 'In Review', 'Done'],
                        datasets: [{
                          data: [stats.todoTasks, stats.inProgressTasks, stats.inReviewTasks, stats.doneTasks],
                          backgroundColor: ['#6c757d', '#0d6efd', '#ffc107', '#198754'],
                          borderWidth: 2, borderColor: '#fff', hoverOffset: 6,
                        }],
                      }}
                      options={{
                        cutout: '68%',
                        plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom-0 pt-4 pb-0 px-4">
                Project Status Overview
              </div>
              <div className="card-body">
                {stats && (
                  <Bar
                    data={{
                      labels: ['Active', 'On Hold', 'Completed'],
                      datasets: [{
                        label: 'Projects',
                        data: [stats.activeProjects, stats.onHoldProjects, stats.completedProjects],
                        backgroundColor: ['rgba(13,110,253,0.8)', 'rgba(255,193,7,0.8)', 'rgba(25,135,84,0.8)'],
                        borderRadius: 8, borderSkipped: false, maxBarThickness: 60,
                      }],
                    }}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f0f0f0' } },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <Link to="/projects" className="card shadow-sm text-decoration-none quick-link-card">
              <div className="card-body d-flex align-items-center gap-3">
                <BsFolderPlus className="fs-3 text-primary" />
                <div>
                  <div className="fw-semibold text-dark">Manage Projects</div>
                  <small className="text-muted">Create, edit, or delete projects</small>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-6">
            <Link to="/tasks" className="card shadow-sm text-decoration-none quick-link-card">
              <div className="card-body d-flex align-items-center gap-3">
                <BsKanban className="fs-3 text-success" />
                <div>
                  <div className="fw-semibold text-dark">Open Task Board</div>
                  <small className="text-muted">Drag & drop tasks between columns</small>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
