import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminMission } from '../../types/admin';
import {
  BookOpenCheck,
  Search,
  PlusCircle,
  Filter,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Award,
  Zap,
  Loader2,
  ShieldAlert,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'GROUNDWATER_CONSERVATION',
  'RAINWATER_HARVESTING',
  'SUSTAINABLE_AGRICULTURE',
  'WATER_QUALITY',
  'DROUGHT_MANAGEMENT'
];

export const AdminMissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GROUNDWATER_CONSERVATION',
    difficulty: 'INTERMEDIATE',
    xpReward: 250,
    requiredLevel: 1,
    estimatedDurationMinutes: 30,
    instructions: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMissions = () => {
    setLoading(true);
    adminService.getMissions({
      category: categoryFilter,
      difficulty: difficultyFilter
    })
      .then((data) => {
        if (data) {
          setMissions(data.missions);
          setTotal(data.total);
        }
      })
      .catch((err) => console.error('Failed to load missions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMissions();
  }, [categoryFilter, difficultyFilter]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedMissionId(null);
    setFormData({
      title: '',
      description: '',
      category: 'GROUNDWATER_CONSERVATION',
      difficulty: 'INTERMEDIATE',
      xpReward: 250,
      requiredLevel: 1,
      estimatedDurationMinutes: 30,
      instructions: 'Run a baseline simulation and verify aquifer water balance.',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: AdminMission) => {
    setIsEditing(true);
    setSelectedMissionId(m.id);
    setFormData({
      title: m.title,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      xpReward: m.xpReward,
      requiredLevel: m.requiredLevel,
      estimatedDurationMinutes: m.estimatedDurationMinutes,
      instructions: m.instructions || '',
      isActive: m.isActive
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (missionId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleMissionStatus(missionId, !currentStatus);
      setFeedback({
        type: 'success',
        message: `Mission status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`
      });
      fetchMissions();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update mission status.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (isEditing && selectedMissionId) {
        await adminService.updateMission(selectedMissionId, formData);
        setFeedback({ type: 'success', message: `Mission '${formData.title}' updated successfully.` });
      } else {
        await adminService.createMission({
          ...formData,
          tasks: [
            {
              title: 'Execute Groundwater Model Simulation',
              description: 'Run simulation and inspect percolation thresholds.',
              taskType: 'COMPLETE_SIMULATION',
              xpReward: Math.floor(formData.xpReward * 0.4),
              orderIndex: 0
            }
          ]
        });
        setFeedback({ type: 'success', message: `Mission '${formData.title}' created successfully.` });
      }
      setIsModalOpen(false);
      fetchMissions();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save mission.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <BookOpenCheck className="w-4 h-4" />
              <span>Educational Curriculum Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Mission & Quest Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Author and configure hydrological missions, evaluate task criteria, manage XP rewards, and monitor completion rates.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-indigo-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Mission</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300'
              : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <span className="text-slate-400 font-bold">
            Total Missions: <span className="text-indigo-400 font-extrabold">{total}</span>
          </span>
        </div>

        {/* Missions Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span className="text-xs font-semibold">Loading missions catalog...</span>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Mission Title & Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Level Req</th>
                    <th className="py-3 px-4">XP Reward</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {missions.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{m.title}</div>
                        <div className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">
                          {m.category.replace(/_/g, ' ')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.difficulty === 'BEGINNER' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          m.difficulty === 'INTERMEDIATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {m.difficulty}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-300">
                        Level {m.requiredLevel}+
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          +{m.xpReward} XP
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {m.isActive ? (
                          <span className="text-emerald-400 font-bold text-[11px]">Active</span>
                        ) : (
                          <span className="text-slate-500 font-bold text-[11px]">Inactive</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusToggle(m.id, m.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            m.isActive
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {m.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Mission Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-lg w-full border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Mission Parameters' : 'Author New Curriculum Mission'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Mission Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description & Pedagogical Context</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Curriculum Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">XP Reward</label>
                    <input
                      type="number"
                      required
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Level Req</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={formData.requiredLevel}
                      onChange={(e) => setFormData({ ...formData, requiredLevel: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Est. Duration (m)</label>
                    <input
                      type="number"
                      value={formData.estimatedDurationMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: parseInt(e.target.value, 10) || 30 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-slate-950 text-xs font-bold"
                  >
                    {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Mission')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMissionsPage;
