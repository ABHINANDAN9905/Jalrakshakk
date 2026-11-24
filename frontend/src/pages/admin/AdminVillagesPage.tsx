import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';
import { AdminVillage } from '../../types/admin';
import {
  MapPin,
  Search,
  PlusCircle,
  Users,
  Activity,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe2,
  Database
} from 'lucide-react';

export const AdminVillagesPage: React.FC = () => {
  const [villages, setVillages] = useState<AdminVillage[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region: 'Central India',
    district: '',
    state: '',
    country: 'India',
    population: 2500,
    latitude: 20.0,
    longitude: 78.0
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchVillages = () => {
    setLoading(true);
    adminService.getVillages({
      search: search.trim() || undefined,
      region: regionFilter.trim() || undefined
    })
      .then((data) => {
        if (data) {
          setVillages(data.villages);
          setTotal(data.total);
        }
      })
      .catch((err) => console.error('Failed to load villages:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVillages();
  }, [regionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVillages();
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedVillageId(null);
    setFormData({
      name: '',
      description: '',
      region: 'Central India',
      district: '',
      state: 'Maharashtra',
      country: 'India',
      population: 3000,
      latitude: 20.5937,
      longitude: 78.9629
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: AdminVillage) => {
    setIsEditing(true);
    setSelectedVillageId(v.id);
    setFormData({
      name: v.name,
      description: v.description,
      region: v.region,
      district: v.district || '',
      state: v.state || '',
      country: v.country,
      population: v.population || 2500,
      latitude: v.latitude || 20.0,
      longitude: v.longitude || 78.0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (isEditing && selectedVillageId) {
        await adminService.updateVillage(selectedVillageId, formData);
        setFeedback({ type: 'success', message: `Village '${formData.name}' updated successfully.` });
      } else {
        await adminService.createVillage(formData);
        setFeedback({ type: 'success', message: `Village '${formData.name}' created successfully.` });
      }
      setIsModalOpen(false);
      fetchVillages();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save village details.'
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
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Spatial Environment Modeling</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Village Environments
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure virtual Indian village environments, aquifer boundaries, geographical coordinates, and enrolled player rosters.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-teal-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Village</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-teal-950/40 border border-teal-500/30 text-teal-300'
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

        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, region, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </form>

          <span className="text-xs text-slate-400 font-bold">
            Total Modeled Environments: <span className="text-teal-400">{total}</span>
          </span>
        </div>

        {/* Villages Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <span className="text-xs font-semibold">Loading village simulation environments...</span>
          </div>
        ) : villages.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-500 text-xs">
            No village environments found. Click &quot;Create New Village&quot; to model a watershed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {villages.map((v) => (
              <div key={v.id} className="glass-panel p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                      {v.region}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{v.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{v.description}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(v)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Geography & Location */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">State / District</span>
                    <span className="font-bold text-slate-300">{v.state || 'N/A'}, {v.district || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Coordinates</span>
                    <span className="font-bold text-slate-300">{v.latitude?.toFixed(2)}°N, {v.longitude?.toFixed(2)}°E</span>
                  </div>
                </div>

                {/* Simulation & Enrollment Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Members</span>
                    <span className="font-bold text-sky-400 flex items-center justify-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" />
                      {v.memberCount || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Simulations</span>
                    <span className="font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                      <Activity className="w-3 h-3" />
                      {v.simulationRunsCount || 0}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Population</span>
                    <span className="font-bold text-amber-400 mt-0.5 block">
                      {v.population ? v.population.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Village Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 max-w-lg w-full border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Village: ${formData.name}` : 'Create Village Simulation Environment'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Village Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="e.g. Kisanpur Watershed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Description & Hydrogeology Context</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    placeholder="Describe village soil, seasonal rainfall, and aquifer characteristics..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Region</label>
                    <input
                      type="text"
                      required
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Population</label>
                    <input
                      type="number"
                      value={formData.population}
                      onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
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
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 text-xs font-bold"
                  >
                    {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Village')}
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

export default AdminVillagesPage;
