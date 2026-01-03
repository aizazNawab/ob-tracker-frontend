import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ApplicationDetail = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationAPI.getOne(id);
      setApplication(response.data.data);
    } catch (error) {
      showToast('Error loading application', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await applicationAPI.delete(id);
      showToast('Application deleted successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Error deleting application', 'error');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-yellow-100 text-yellow-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Accepted': 'bg-emerald-100 text-emerald-800',
      'Withdrawn': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{application.companyName}</h1>
              <p className="text-xl text-gray-600 mt-2">{application.position}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/edit-application/${id}`)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
              <div className="flex items-center gap-4">
                <span className={`status-badge ${getStatusColor(application.status)} text-lg px-4 py-2`}>
                  {application.status}
                </span>
                <div className="text-sm text-gray-500">
                  Applied on {new Date(application.appliedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <dl className="grid grid-cols-1 gap-4">
                {application.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.location}</dd>
                  </div>
                )}
                {application.salary && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Salary</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.salary}</dd>
                  </div>
                )}
                {application.jobUrl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Job Posting</dt>
                    <dd className="mt-1">
                      <a
                        href={application.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Job Posting
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </dd>
                  </div>
                )}
                {application.deadline && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(application.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Notes Card */}
            {application.notes && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}

            {/* Contacts Card */}
            {application.contacts && application.contacts.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
                <div className="space-y-4">
                  {application.contacts.map((contact, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      {contact.name && <p className="font-medium text-gray-900">{contact.name}</p>}
                      {contact.role && <p className="text-sm text-gray-600">{contact.role}</p>}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/edit-application/${id}`)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Application
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full btn-danger flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Application
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-xs text-gray-500">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {application.updatedAt && application.updatedAt !== application.appliedDate && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;

