import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DeadlineTrackerProps {
  accessToken: string;
}

export const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({ accessToken }) => {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/deadlines`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.deadlines) {
        setDeadlines(data.deadlines.sort((a: any, b: any) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/deadlines`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setFormData({
          title: '',
          dueDate: '',
          description: '',
          priority: 'medium',
        });
        setShowAddForm(false);
        fetchDeadlines();
      } else {
        alert('Failed to save deadline');
      }
    } catch (error) {
      console.error('Error saving deadline:', error);
      alert('Failed to save deadline');
    } finally {
      setSaving(false);
    }
  };

  const getDaysUntil = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusStyle = (daysUntil: number) => {
    if (daysUntil < 0) return styles.statusOverdue;
    if (daysUntil <= 7) return styles.statusUrgent;
    if (daysUntil <= 30) return styles.statusSoon;
    return styles.statusOk;
  };

  const getStatusText = (daysUntil: number) => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `${daysUntil} days remaining`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading deadlines...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Deadline Tracker</h2>
          <p style={styles.subtitle}>Never miss a tax filing deadline again</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
          {showAddForm ? '✕ Cancel' : '+ Add Deadline'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Add Tax Deadline</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Annual Tax Return Filing"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              style={styles.input}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this deadline..."
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={saving ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Deadline'}
          </button>
        </form>
      )}

      <div style={styles.deadlinesList}>
        {deadlines.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⏰</div>
            <h3 style={styles.emptyTitle}>No Deadlines Set</h3>
            <p style={styles.emptyText}>
              Add important tax deadlines to stay on top of your filing obligations
            </p>
          </div>
        ) : (
          deadlines.map((deadline, index) => {
            const daysUntil = getDaysUntil(deadline.dueDate);
            return (
              <div key={index} style={styles.deadlineCard}>
                <div style={styles.deadlineHeader}>
                  <div style={styles.deadlineInfo}>
                    <h4 style={styles.deadlineTitle}>{deadline.title}</h4>
                    <p style={styles.deadlineDate}>
                      Due: {new Date(deadline.dueDate).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {deadline.description && (
                      <p style={styles.deadlineDescription}>{deadline.description}</p>
                    )}
                  </div>
                  <div style={styles.priorityBadge}>
                    {deadline.priority === 'high' && '🔴'}
                    {deadline.priority === 'medium' && '🟡'}
                    {deadline.priority === 'low' && '🟢'}
                  </div>
                </div>
                <div style={{ ...styles.statusBadge, ...getStatusStyle(daysUntil) }}>
                  {getStatusText(daysUntil)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>🗓️ Key Tax Deadlines in Nigeria</h4>
        <div style={styles.defaultDeadlines}>
          <div style={styles.defaultDeadline}>
            <strong>Monthly PAYE:</strong> 10th of the following month
          </div>
          <div style={styles.defaultDeadline}>
            <strong>Individual Annual Returns:</strong> 30th June
          </div>
          <div style={styles.defaultDeadline}>
            <strong>Company Annual Returns:</strong> 6 months after financial year-end
          </div>
          <div style={styles.defaultDeadline}>
            <strong>WHT Remittance:</strong> Within 21 days of deduction
          </div>
          <div style={styles.defaultDeadline}>
            <strong>VAT Returns:</strong> 21st of the following month
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #E9ECEF',
    borderTop: '3px solid #0A5C36',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#212529',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6C757D',
    margin: 0,
  },
  addButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0A5C36',
    backgroundColor: '#E7F4EE',
    border: '1px solid #0A5C36',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 20px 0',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212529',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #DEE2E6',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#0A5C36',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  deadlinesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  deadlineCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  deadlineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 4px 0',
  },
  deadlineDate: {
    fontSize: '13px',
    color: '#6C757D',
    margin: '0 0 8px 0',
  },
  deadlineDescription: {
    fontSize: '13px',
    color: '#495057',
    margin: 0,
    lineHeight: '1.5',
  },
  priorityBadge: {
    fontSize: '20px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '6px',
  },
  statusOverdue: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  statusUrgent: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusSoon: {
    backgroundColor: '#D1ECF1',
    color: '#0C5460',
  },
  statusOk: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6C757D',
    margin: 0,
    lineHeight: '1.5',
  },
  infoCard: {
    backgroundColor: '#E7F4EE',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #B8E6CF',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0A5C36',
    margin: '0 0 12px 0',
  },
  defaultDeadlines: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  defaultDeadline: {
    fontSize: '13px',
    color: '#0A5C36',
    lineHeight: '1.6',
  },
};
