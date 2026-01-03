import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    status: 'Applied',
    jobUrl: '',
    location: '',
    salary: '',
    appliedDate: new Date().toISOString().split('T')[0],
    deadline: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showToast } = useToast();

  useEffect(() => {
    if (isEdit) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationAPI.getOne(id);
      const app = response.data.data;
      setFormData({
        companyName: app.companyName,
        position: app.position,
        status: app.status,
        jobUrl: app.jobUrl || '',
        location: app.location || '',
        salary: app.salary || '',
        appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
        deadline: app.deadline ? new Date(app.deadline).toISOString().split('T')[0] : '',
        notes: app.notes || ''
      });
    } catch (error) {
      setError('Error loading application');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await applicationAPI.update(id, formData);
        showToast('Application updated successfully', 'success');
      } else {
        await applicationAPI.create(formData);
        showToast('Application created successfully', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error saving application';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Application' : 'Add New Application'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isEdit ? 'Update your job application details' : 'Track a new job application'}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company and Position Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Google, Microsoft"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            {/* Status and Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            {/* Job URL and Salary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job URL
                </label>
                <input
                  type="url"
                  name="jobUrl"
                  value={formData.jobUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://company.com/jobs/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., $80k-$100k"
                />
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applied Date
                </label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Add any additional notes about this application..."
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Update Application' : 'Create Application'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
