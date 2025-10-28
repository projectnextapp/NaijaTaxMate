import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TaxRecordsProps {
  accessToken: string;
}

export const TaxRecords: React.FC<TaxRecordsProps> = ({ accessToken }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    paymentDate: '',
    taxType: 'PAYE',
    amount: '',
    referenceNumber: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/tax-records`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.records) {
        setRecords(data.records.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/tax-records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            type: 'payment',
            ...formData,
            amount: parseFloat(formData.amount),
          }),
        }
      );

      if (response.ok) {
        setFormData({
          paymentDate: '',
          taxType: 'PAYE',
          amount: '',
          referenceNumber: '',
          description: '',
        });
        setShowAddForm(false);
        fetchRecords();
      } else {
        alert('Failed to save record');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading records...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Tax Records</h2>
          <p style={styles.subtitle}>Keep organized records for audits and compliance</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addButton}>
          {showAddForm ? '✕ Cancel' : '+ Add Record'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.formTitle}>Add Tax Payment Record</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Payment Date</label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tax Type</label>
            <select
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
              style={styles.input}
            >
              <option value="PAYE">PAYE (Pay As You Earn)</option>
              <option value="VAT">VAT (Value Added Tax)</option>
              <option value="WHT">WHT (Withholding Tax)</option>
              <option value="CIT">CIT (Company Income Tax)</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Amount Paid (₦)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              placeholder="e.g., TXN123456789"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes..."
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            style={saving ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      )}

      <div style={styles.recordsList}>
        {records.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📁</div>
            <h3 style={styles.emptyTitle}>No Records Yet</h3>
            <p style={styles.emptyText}>
              Start adding your tax payment records to keep track of your compliance history
            </p>
          </div>
        ) : (
          records.map((record, index) => (
            <div key={index} style={styles.recordCard}>
              {record.type === 'calculation' ? (
                <>
                  <div style={styles.recordHeader}>
                    <div style={styles.recordIcon}>🧮</div>
                    <div style={styles.recordInfo}>
                      <h4 style={styles.recordTitle}>Tax Calculation</h4>
                      <p style={styles.recordDate}>
                        {new Date(record.createdAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span>Annual Income:</span>
                      <span>₦{record.annualIncome?.toLocaleString()}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span>Tax Amount:</span>
                      <span style={styles.detailAmount}>₦{record.taxAmount?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.recordHeader}>
                    <div style={styles.recordIcon}>💵</div>
                    <div style={styles.recordInfo}>
                      <h4 style={styles.recordTitle}>{record.taxType} Payment</h4>
                      <p style={styles.recordDate}>
                        {new Date(record.paymentDate).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div style={styles.recordAmount}>
                      ₦{record.amount?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={styles.recordDetails}>
                    <div style={styles.detailRow}>
                      <span>Reference:</span>
                      <span>{record.referenceNumber}</span>
                    </div>
                    {record.description && (
                      <div style={styles.detailRow}>
                        <span>Note:</span>
                        <span>{record.description}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>💡 Record Keeping Tips</h4>
        <ul style={styles.infoList}>
          <li>Keep all records for at least 6 years as required by law</li>
          <li>Include payment receipts, TIN certificates, and correspondence</li>
          <li>Organize records by tax year and type</li>
          <li>Maintain both digital and physical copies when possible</li>
        </ul>
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
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  recordHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  },
  recordIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 4px 0',
  },
  recordDate: {
    fontSize: '12px',
    color: '#6C757D',
    margin: 0,
  },
  recordAmount: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0A5C36',
  },
  recordDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '36px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#6C757D',
  },
  detailAmount: {
    fontWeight: '600',
    color: '#0A5C36',
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
};
