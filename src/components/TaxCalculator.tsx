import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TaxCalculatorProps {
  userType: 'individual' | 'business';
  accessToken: string;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ userType, accessToken }) => {
  const [income, setIncome] = useState('');
  const [reliefs, setReliefs] = useState('');
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const calculateTax = () => {
    const annualIncome = parseFloat(income) || 0;
    const totalReliefs = parseFloat(reliefs) || 0;
    const taxableIncome = Math.max(0, annualIncome - totalReliefs);

    let tax = 0;
    let exemptionApplied = false;
    let developmentLevy = 0;

    if (userType === 'individual') {
      // Nigerian Personal Income Tax (PIT) Reform - New Progressive Rates
      // Incomes ≤ ₦800,000/year are tax-exempt
      if (taxableIncome <= 800000) {
        tax = 0;
        exemptionApplied = true;
      } else if (taxableIncome <= 1500000) {
        tax = (taxableIncome - 800000) * 0.07;
      } else if (taxableIncome <= 3000000) {
        tax = 49000 + (taxableIncome - 1500000) * 0.11;
      } else if (taxableIncome <= 5000000) {
        tax = 214000 + (taxableIncome - 3000000) * 0.15;
      } else if (taxableIncome <= 10000000) {
        tax = 514000 + (taxableIncome - 5000000) * 0.19;
      } else if (taxableIncome <= 20000000) {
        tax = 1464000 + (taxableIncome - 10000000) * 0.21;
      } else {
        // Top marginal rate increased to 25% for high earners
        tax = 3564000 + (taxableIncome - 20000000) * 0.25;
      }
    } else {
      // Small Business Corporate Tax
      // Small companies (gross turnover ≤ ₦50m and fixed assets ≤ ₦250m) are exempt from CIT
      if (annualIncome <= 50000000) {
        // Small company exemption applies
        tax = 0;
        exemptionApplied = true;
        // Note: This assumes fixed assets are also ≤ ₦250m
      } else {
        // Standard corporate tax rate (aligned with CGT at 30%)
        tax = taxableIncome * 0.30;
        
        // Add 4% Development Levy on assessable profits
        developmentLevy = taxableIncome * 0.04;
      }
    }

    setResult({
      annualIncome,
      reliefs: totalReliefs,
      taxableIncome,
      taxAmount: tax,
      developmentLevy,
      totalTax: tax + developmentLevy,
      monthlyTax: (tax + developmentLevy) / 12,
      exemptionApplied,
    });
  };

  const saveRecord = async () => {
    if (!result) return;
    
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
            type: 'calculation',
            userType,
            ...result,
          }),
        }
      );

      if (response.ok) {
        alert('Tax calculation saved successfully!');
      } else {
        const error = await response.json();
        console.error('Error saving record:', error);
        alert('Failed to save record');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tax Calculator</h2>
        <p style={styles.subtitle}>
          Calculate your tax obligations as {userType === 'individual' ? 'an individual' : 'a small business'}
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Annual {userType === 'business' ? 'Revenue' : 'Income'} (₦)
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Tax Reliefs & Allowances (₦)
          </label>
          <input
            type="number"
            value={reliefs}
            onChange={(e) => setReliefs(e.target.value)}
            placeholder="0"
            style={styles.input}
          />
          <p style={styles.hint}>
            {userType === 'individual' 
              ? 'Includes: Consolidated Relief Allowance (₦200,000 + 20% of gross income), Life Assurance, NHIS, Pension'
              : 'Includes: Business expenses, depreciation, and allowable deductions'}
          </p>
        </div>

        <button onClick={calculateTax} style={styles.calculateButton}>
          Calculate Tax
        </button>
      </div>

      {result && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>Tax Calculation Result</h3>
          
          {result.exemptionApplied && (
            <div style={styles.exemptionBanner}>
              ✅ {userType === 'individual' 
                ? 'Tax Exemption Applied - Your income is below ₦800,000 threshold'
                : 'Small Business Exemption - Your turnover is ≤ ₦50m (assumes fixed assets ≤ ₦250m)'}
            </div>
          )}
          
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Annual {userType === 'business' ? 'Revenue' : 'Income'}:</span>
            <span style={styles.resultValue}>₦{result.annualIncome.toLocaleString()}</span>
          </div>

          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Less: Reliefs & Allowances:</span>
            <span style={styles.resultValue}>₦{result.reliefs.toLocaleString()}</span>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Taxable Income:</span>
            <span style={styles.resultValue}>₦{result.taxableIncome.toLocaleString()}</span>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>{userType === 'business' ? 'Corporate Income Tax (CIT):' : 'Personal Income Tax (PIT):'}</span>
            <span style={styles.resultValue}>₦{result.taxAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {userType === 'business' && result.developmentLevy > 0 && (
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Development Levy (4%):</span>
              <span style={styles.resultValue}>₦{result.developmentLevy.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          {userType === 'business' && result.developmentLevy > 0 && (
            <div style={styles.divider}></div>
          )}

          <div style={styles.resultRow}>
            <span style={styles.resultLabelBold}>Total Annual Tax Due:</span>
            <span style={styles.resultValueBold}>₦{result.totalTax.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {userType === 'individual' && (
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Monthly Tax (PAYE):</span>
              <span style={styles.resultValue}>₦{result.monthlyTax.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}

          <button 
            onClick={saveRecord} 
            style={saving ? { ...styles.saveButton, ...styles.saveButtonDisabled } : styles.saveButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save This Calculation'}
          </button>

          <p style={styles.disclaimer}>
            *This is an estimate based on the Nigerian Tax Reform Act 2025. Actual tax may vary based on your state, fixed assets (for businesses), and specific circumstances. Consult a tax professional for accurate filing.
          </p>
        </div>
      )}

      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>📋 Nigerian Tax Reform Act 2025 - Key Changes</h4>
        <ul style={styles.infoList}>
          {userType === 'individual' ? (
            <>
              <li><strong>Tax-Free Threshold:</strong> Incomes ≤ ₦800,000/year are now tax-exempt</li>
              <li><strong>Top Rate:</strong> Marginal rate increased to 25% for high earners (₦20m+)</li>
              <li><strong>Progressive Bands:</strong> More progressive tax bands for fairer taxation</li>
            </>
          ) : (
            <>
              <li><strong>Small Business Relief:</strong> Turnover ≤ ₦50m & fixed assets ≤ ₦250m exempt from CIT</li>
              <li><strong>Corporate Tax:</strong> Standard CIT rate aligned with CGT at 30%</li>
              <li><strong>Development Levy:</strong> 4% on assessable profits (replaces multiple levies)</li>
            </>
          )}
          <li><strong>VAT:</strong> Retained at 7.5% with expanded zero-rated goods list</li>
          <li><strong>E-Invoicing:</strong> Mandatory VAT e-invoicing for all registered businesses</li>
        </ul>
      </div>

      <div style={styles.infoCardSecondary}>
        <h4 style={styles.infoTitleSecondary}>📅 Tax Filing Deadlines</h4>
        <ul style={styles.infoListSecondary}>
          <li>Monthly PAYE: 10th of following month</li>
          <li>Annual Returns: 30th June (Individuals)</li>
          <li>Annual Returns: 6 months after year-end (Companies)</li>
          <li>WHT Remittance: 21 days after deduction</li>
          <li>VAT Returns: 21st of the following month</li>
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
  header: {
    marginBottom: '8px',
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
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  inputGroup: {
    marginBottom: '20px',
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
  hint: {
    fontSize: '12px',
    color: '#6C757D',
    margin: '8px 0 0 0',
    lineHeight: '1.4',
  },
  calculateButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#0A5C36',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  resultTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 20px 0',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
  },
  resultLabel: {
    fontSize: '14px',
    color: '#6C757D',
  },
  resultValue: {
    fontSize: '14px',
    color: '#212529',
    fontWeight: '500',
  },
  resultLabelBold: {
    fontSize: '16px',
    color: '#212529',
    fontWeight: '700',
  },
  resultValueBold: {
    fontSize: '20px',
    color: '#0A5C36',
    fontWeight: '700',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E9ECEF',
    margin: '8px 0',
  },
  saveButton: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0A5C36',
    backgroundColor: '#E7F4EE',
    border: '1px solid #0A5C36',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  },
  saveButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  disclaimer: {
    fontSize: '11px',
    color: '#6C757D',
    margin: '12px 0 0 0',
    fontStyle: 'italic',
    lineHeight: '1.4',
  },
  infoCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #FFE69C',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#856404',
    margin: '0 0 12px 0',
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#856404',
    lineHeight: '1.8',
  },
  exemptionBanner: {
    padding: '12px 16px',
    backgroundColor: '#D4EDDA',
    color: '#155724',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    border: '1px solid #C3E6CB',
  },
  infoCardSecondary: {
    backgroundColor: '#E7F4EE',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #B8E6CF',
  },
  infoTitleSecondary: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0A5C36',
    margin: '0 0 12px 0',
  },
  infoListSecondary: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#0A5C36',
    lineHeight: '1.8',
  },
};
