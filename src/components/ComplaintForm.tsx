import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ComplaintFormProps {
  accessToken: string;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ accessToken }) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Assessment',
    subject: '',
    description: '',
    taxOffice: '',
    referenceNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/complaints`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.complaints) {
        setComplaints(data.complaints.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/complaints`,
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
          category: 'Assessment',
          subject: '',
          description: '',
          taxOffice: '',
          referenceNumber: '',
        });
        setShowForm(false);
        fetchComplaints();
        alert('Complaint submitted successfully! We will track the status for you.');
      } else {
        alert('Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FFC107';
      case 'In Progress':
        return '#17A2B8';
      case 'Resolved':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Tax Office Support</h2>
          <p style={styles.subtitle}>Submit and track complaints or inquiries</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          {showForm ? '✕ Cancel' : '+ New Complaint'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Submit a Complaint or Inquiry</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={styles.input}
            >
              <option value="Assessment">Tax Assessment Issue</option>
              <option value="Payment">Payment Problem</option>
              <option value="Refund">Refund Request</option>
              <option value="TIN">TIN Related</option>
              <option value="Documentation">Documentation Issue</option>
              <option value="Audit">Audit Concerns</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tax Office</label>
            <input
              type="text"
              value={formData.taxOffice}
              onChange={(e) => setFormData({ ...formData, taxOffice: e.target.value })}
              placeholder="e.g., Lagos State Tax Office"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Reference Number (if applicable)</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              placeholder="e.g., Assessment notice number, TIN, etc."
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Detailed Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your complaint or inquiry..."
              style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
              required
            />
          </div>

          <button
            type="submit"
            style={submitting ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      )}

      <div style={styles.complaintsList}>
        {complaints.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <h3 style={styles.emptyTitle}>No Complaints Yet</h3>
            <p style={styles.emptyText}>
              Having issues with the tax office? Submit a complaint and track its resolution
            </p>
          </div>
        ) : (
          complaints.map((complaint, index) => (
            <div key={index} style={styles.complaintCard}>
              <div style={styles.complaintHeader}>
                <div>
                  <div style={styles.categoryBadge}>{complaint.category}</div>
                  <h4 style={styles.complaintTitle}>{complaint.subject}</h4>
                  <p style={styles.complaintMeta}>
                    {complaint.taxOffice} • {new Date(complaint.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(complaint.status),
                  }}
                >
                  {complaint.status}
                </div>
              </div>
              
              <p style={styles.complaintDescription}>{complaint.description}</p>
              
              {complaint.referenceNumber && (
                <div style={styles.referenceRow}>
                  <span style={styles.referenceLabel}>Reference:</span>
                  <span style={styles.referenceValue}>{complaint.referenceNumber}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>💡 Tips for Effective Complaints</h4>
        <ul style={styles.infoList}>
          <li>Be specific and include all relevant reference numbers</li>
          <li>Provide clear documentation and evidence</li>
          <li>Keep a copy of all correspondence</li>
          <li>Follow up regularly on pending complaints</li>
          <li>Escalate to the Tax Appeal Tribunal if unresolved</li>
        </ul>
      </div>

      <div style={styles.contactCard}>
        <h4 style={styles.contactTitle}>📞 Important Contacts</h4>
        <div style={styles.contactList}>
          <div style={styles.contactItem}>
            <strong>FIRS Contact Centre:</strong> 0700-CALL-FIRS (0700-2255-3477)
          </div>
          <div style={styles.contactItem}>
            <strong>Email:</strong> contactcentre@firs.gov.ng
          </div>
          <div style={styles.contactItem}>
            <strong>Tax Appeal Tribunal:</strong> www.tat.gov.ng
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
  complaintsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  complaintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#0A5C36',
    backgroundColor: '#E7F4EE',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  complaintTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 4px 0',
  },
  complaintMeta: {
    fontSize: '12px',
    color: '#6C757D',
    margin: 0,
  },
  statusBadge: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  complaintDescription: {
    fontSize: '14px',
    color: '#495057',
    margin: '0 0 12px 0',
    lineHeight: '1.6',
  },
  referenceRow: {
    display: 'flex',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#F8F9FA',
    borderRadius: '6px',
    fontSize: '13px',
  },
  referenceLabel: {
    fontWeight: '600',
    color: '#6C757D',
  },
  referenceValue: {
    color: '#212529',
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
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#0A5C36',
    lineHeight: '1.8',
  },
  contactCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #FFE69C',
  },
  contactTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#856404',
    margin: '0 0 12px 0',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  contactItem: {
    fontSize: '13px',
    color: '#856404',
    lineHeight: '1.6',
  },
};
