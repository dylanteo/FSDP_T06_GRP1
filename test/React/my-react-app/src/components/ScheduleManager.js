import React, { useState, useEffect } from 'react';

const ScheduleManager = ({ selectedFiles, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [scheduleType, setScheduleType] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentSchedule();
  }, []);

  const fetchCurrentSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schedule');
      const data = await response.json();
      if (data) {
        setCurrentSchedule(data);
        setScheduleType(data.type);
        setTime(data.time);
        setDayOfMonth(data.dayOfMonth?.toString() || '1');
        setEmail(data.email);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError('Failed to fetch current schedule');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (scheduleType === 'monthly' && (dayOfMonth < 1 || dayOfMonth > 31)) {
      setError('Day of month must be between 1 and 31');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: scheduleType,
          time,
          dayOfMonth: scheduleType === 'monthly' ? parseInt(dayOfMonth) : null,
          email,
          selectedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      const data = await response.json();
      setCurrentSchedule(data.schedule);
      localStorage.setItem('userEmail', email);
      onClose();
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Failed to create schedule');
    }
  };

  const handleDelete = async () => {
    if (!currentSchedule?._id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/schedule/${currentSchedule._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      setCurrentSchedule(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError('Failed to delete schedule');
    }
  };

  if (loading) {
    return (
      <div className="schedule-modal-overlay">
        <div className="schedule-modal">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal">
        <div className="schedule-header">
          <h2 className="schedule-title">Schedule Test Execution</h2>
        </div>

        {error && (
          <div className="error-alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="form-group">
            <label className="form-label">Schedule Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="scheduleType"
                  value="daily"
                  checked={scheduleType === 'daily'}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                Daily
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="scheduleType"
                  value="monthly"
                  checked={scheduleType === 'monthly'}
                  onChange={(e) => setScheduleType(e.target.value)}
                />
                Monthly
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="time-input"
              required
            />
          </div>

          {scheduleType === 'monthly' && (
            <div className="form-group">
              <label className="form-label">Day of Month (1-31)</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="number-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email for Reports</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Selected Files ({selectedFiles.length})</label>
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  {file}
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            {currentSchedule && (
              <button
                type="button"
                className="button button-danger"
                onClick={handleDelete}
              >
                Delete Schedule
              </button>
            )}
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {currentSchedule ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleManager;