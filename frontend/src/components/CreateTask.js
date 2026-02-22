import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { FiArrowLeft, FiPlus, FiAlertCircle } from 'react-icons/fi';
import './CreateTask.css';

function CreateTask({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      await taskAPI.createTask(taskData);
      navigate('/tasks');
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--gray-500)';
    }
  };

  return (
    <div className="create-task-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/tasks')}>
            <FiArrowLeft className="back-icon" />
            <span>Back to Tasks</span>
          </button>
          <h1 className="page-title">Create New Task</h1>
        </div>
        <div className="header-right">
          <div className="priority-indicator">
            <span className="indicator-label">Priority:</span>
            <span 
              className="priority-value"
              style={{ color: getPriorityColor(formData.priority) }}
            >
              {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <FiAlertCircle className="alert-icon" />
          <span className="alert-message">{error}</span>
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit} className="task-form">
          {/* Title Field */}
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            <div className="form-group">
              <label htmlFor="title">
                Task Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Implement user authentication"
                className="form-input"
              />
              <span className="input-hint">Be specific and descriptive</span>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Describe the task in detail. Include requirements, context, and any important notes..."
                className="form-textarea"
              />
            </div>
          </div>

          {/* Task Details */}
          <div className="form-section">
            <h2 className="section-title">Task Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority Level</label>
                <div className="priority-selector">
                  {['low', 'medium', 'high'].map((priority) => (
                    <label key={priority} className={`priority-option ${formData.priority === priority ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={handleChange}
                      />
                      <span className={`priority-badge ${priority}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., urgent, backend, bug-fix, feature"
                className="form-input"
              />
              <span className="input-hint">Separate tags with commas</span>
            </div>
          </div>

          {/* Preview Section */}
          {formData.title && (
            <div className="preview-section">
              <h2 className="section-title">Preview</h2>
              <div className="task-preview">
                <div className="preview-header">
                  <h3 className="preview-title">{formData.title}</h3>
                  <span className={`preview-priority ${formData.priority}`}>
                    {formData.priority.toUpperCase()}
                  </span>
                </div>
                <p className="preview-description">
                  {formData.description || 'No description provided'}
                </p>
                <div className="preview-meta">
                  {formData.dueDate && (
                    <span className="preview-due">
                      Due: {new Date(formData.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  )}
                  {formData.tags && (
                    <div className="preview-tags">
                      {formData.tags.split(',').map((tag, index) => (
                        tag.trim() && <span key={index} className="preview-tag">{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/tasks')} 
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Task...
                </>
              ) : (
                <>
                  <FiPlus className="btn-icon" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;