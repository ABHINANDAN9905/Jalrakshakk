import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminChallenge } from '../../types/admin';
import {
  Trophy,
  PlusCircle,
  Calendar,
  Zap,
  Edit2,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEEKLY' as 'DAILY' | 'WEEKLY' | 'LIMITED_TIME',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    xpReward: 150,
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchChallenges = () => {
    setLoading(true);
    adminService.getChallenges()
      .then((data) => {
        if (data) setChallenges(data);
      })
      .catch((err) => console.error('Failed to load challenges:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedChallengeId(null);
    setFormData({
      title: '',
      description: '',
      type: 'WEEKLY',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      xpReward: 150,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: AdminChallenge) => {
    setIsEditing(true);
    setSelectedChallengeId(c.id);
    setFormData({
      title: c.title,
      description: c.description,
      type: c.type,
      startDate: new Date(c.startDate).toISOString().slice(0, 16),
      endDate: new Date(c.endDate).toISOString().slice(0, 16),
      xpReward: c.xpReward,
      isActive: c.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setFeedback({ type: 'error', message: 'Challenge end date must be strictly after start date.' });
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing && selectedChallengeId) {
        await adminService.updateChallenge(selectedChallengeId, {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        });
        setFeedback({ type: 'success', message: `Challenge '${formData.title}' updated successfully.` });
      } else {
        await adminService.createChallenge({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        });
        setFeedback({ type: 'success', message: `Challenge '${formData.title}' created successfully.` });
      }
      setIsModalOpen(false);
      fetchChallenges();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save challenge.'
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
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Time-Bound Events & Competitions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Community Challenge Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Launch daily, weekly, and seasonal hydrological conservation challenges with verified rewards.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-amber-950/40 border border-amber-500/30 text-amber-300'
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

        {/* Challenges Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-semibold">Loading community challenges...</span>
          </div>
        ) : challenges.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            No challenges currently active or configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((c) => (
              <div key={c.id} className="glass-panel p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.type === 'DAILY' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      c.type === 'WEEKLY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {c.type}
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mt-2">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ends:</span>
                    </span>
                    <span className="font-bold text-slate-200">
                      {new Date(c.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Participants:</span>
                    <span className="font-bold text-sky-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {c.participationCount || 0} enrolled
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">XP Reward:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      +{c.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Challenge Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-md w-full border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Challenge' : 'Launch New Community Challenge'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="LIMITED_TIME">Limited Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">XP Reward</label>
                    <input
                      type="number"
                      required
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold"
                  >
                    {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Launch Challenge')}
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

export default AdminChallengesPage;
