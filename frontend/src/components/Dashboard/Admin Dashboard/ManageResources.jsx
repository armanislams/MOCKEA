import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiExternalLink, FiBookOpen } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const CATEGORIES = ["Vocabulary", "Writing Guide", "Speaking Templates", "Study Tips", "General"];

const ManageResources = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const initialFormState = {
    title: '',
    description: '',
    ctaText: '',
    link: '',
    imageUrl: '',
    category: 'General',
    fileType: 'PDF',
    size: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch all resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await axiosSecure.get('/resources');
      return res.data.resources;
    }
  });

  // Create Resource Mutation
  const createMutation = useMutation({
    mutationFn: (newResource) => axiosSecure.post('/resources', newResource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error creating resource')
  });

  // Update Resource Mutation
  const updateMutation = useMutation({
    mutationFn: (updatedResource) => axiosSecure.put(`/resources/${updatedResource._id}`, updatedResource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error updating resource')
  });

  // Delete Resource Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted successfully');
    },
    onError: (error) => toast.error('Error deleting resource')
  });

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData(resource);
    } else {
      setEditingResource(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setFormData(initialFormState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResource) {
      updateMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading resources...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FiBookOpen className="text-cta-btn" />
            Manage Free Resources
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Upload, edit, or remove free IELTS study assets and PDFs.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-cta-btn text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
        >
          <FiPlus />
          Add Resource
        </button>
      </div>

      {/* Grid List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">File Specs</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No resources found.</td>
                </tr>
              ) : (
                resources.map(res => (
                  <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={res.imageUrl} alt={res.title} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <span className="font-semibold text-slate-900 block">{res.title}</span>
                          <a href={res.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline inline-flex items-center gap-0.5">
                            View Link <FiExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {res.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold mr-2">{res.fileType}</span>
                      <span className="text-slate-400 text-xs">{res.size || 'No size'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {res.downloadCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleOpenModal(res)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this resource?')) {
                            deleteMutation.mutate(res._id);
                          }
                        }} 
                        className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white rounded-t-3xl sticky top-0 z-10">
              <h2 className="text-2xl font-black text-slate-900">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resource Title *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="e.g. Master Writing Task 1 templates" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                    <textarea rows="3" name="description" required value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all resize-none" placeholder="Enter a brief, compelling description of this resource..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all bg-white">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">CTA Button Text *</label>
                    <input type="text" name="ctaText" required value={formData.ctaText} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="e.g. Download PDF" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Download / Resource Link *</label>
                    <input type="url" name="link" required value={formData.link} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="https://example.com/file.pdf" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cover Image URL *</label>
                    <input type="url" name="imageUrl" required value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="https://images.unsplash.com/photo-..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">File Type *</label>
                    <input type="text" name="fileType" required value={formData.fileType} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="e.g. PDF" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">File Size (Optional)</label>
                    <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-cta-btn focus:ring-2 focus:ring-cta-btn/20 outline-none transition-all" placeholder="e.g. 2.4 MB" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-3xl z-10">
              <button onClick={closeModal} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" form="resource-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-6 py-2.5 bg-cta-btn hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 transition-colors disabled:opacity-50">
                {editingResource ? 'Update Resource' : 'Create Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResources;
