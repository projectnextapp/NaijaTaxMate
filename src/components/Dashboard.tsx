import React, { useState, useEffect } from 'react';
import { TaxCalculator } from './TaxCalculator';
import { TaxRecords } from './TaxRecords';
import { DeadlineTracker } from './DeadlineTracker';
import { ComplaintForm } from './ComplaintForm';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface DashboardProps {
  accessToken: string;
  onLogout: () => void;
}

type Tab = 'home' | 'calculator' | 'records' | 'deadlines' | 'complaints';

export const Dashboard: React.FC<DashboardProps> = ({ accessToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dad2c3ab/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>NaijaTaxMate</h1>
          <h2 style={styles.headerTitle}>Developed by Egwi U. Kelvin 08034444055</h2>
          <p style={styles.headerSubtitle}>
            {profile?.name} • {profile?.userType === 'individual' ? 'Individual' : 'Business'}
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {activeTab === 'home' && (
          <div style={styles.home}>
            <div style={styles.welcomeCard}>
              <h2 style={styles.welcomeTitle}>Welcome to NaijaTaxMate</h2>
              <p style={styles.welcomeText}>
                Your comprehensive tax management solution for Nigerian taxpayers
              </p>
            </div>

            <div style={styles.features}>
              <h3 style={styles.featuresTitle}>How NaijaTaxMate Helps You</h3>
              
              <div style={styles.featureCard} onClick={() => setActiveTab('calculator')}>
                <div style={styles.featureIcon}>💰</div>
                <div style={styles.featureContent}>
                  <h4 style={styles.featureCardTitle}>Tax Calculation</h4>
                  <p style={styles.featureCardText}>
                    Not knowing how much tax to pay? Calculate your exact tax obligations based on Nigerian Tax Reform Act
                  </p>
                </div>
              </div>

              <div style={styles.featureCard} onClick={() => setActiveTab('deadlines')}>
                <div style={styles.featureIcon}>⏰</div>
                <div style={styles.featureContent}>
                  <h4 style={styles.featureCardTitle}>Deadline Management</h4>
                  <p style={styles.featureCardText}>
                    Missing deadlines? Track and get reminders for all important tax filing dates
                  </p>
                </div>
              </div>

              <div style={styles.featureCard} onClick={() => setActiveTab('records')}>
                <div style={styles.featureIcon}>📁</div>
                <div style={styles.featureContent}>
                  <h4 style={styles.featureCardTitle}>Record Keeping</h4>
                  <p style={styles.featureCardText}>
                    Keeping records for audits? Maintain organized records of all tax payments and documents
                  </p>
                </div>
              </div>

              <div style={styles.featureCard} onClick={() => setActiveTab('complaints')}>
                <div style={styles.featureIcon}>📝</div>
                <div style={styles.featureContent}>
                  <h4 style={styles.featureCardTitle}>Tax Office Support</h4>
                  <p style={styles.featureCardText}>
                    Dealing with tax office issues? Submit and track complaints or inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <TaxCalculator userType={profile?.userType} accessToken={accessToken} />
        )}

        {activeTab === 'records' && (
          <TaxRecords accessToken={accessToken} />
        )}

        {activeTab === 'deadlines' && (
          <DeadlineTracker accessToken={accessToken} />
        )}

        {activeTab === 'complaints' && (
          <ComplaintForm accessToken={accessToken} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.navigation}>
        <button
          onClick={() => setActiveTab('home')}
          style={activeTab === 'home' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          <span style={styles.navIcon}>🏠</span>
          <span style={styles.navLabel}>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          style={activeTab === 'calculator' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          <span style={styles.navIcon}>🧮</span>
          <span style={styles.navLabel}>Calculate</span>
        </button>
        <button
          onClick={() => setActiveTab('records')}
          style={activeTab === 'records' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          <span style={styles.navIcon}>📁</span>
          <span style={styles.navLabel}>Records</span>
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          style={activeTab === 'deadlines' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          <span style={styles.navIcon}>⏰</span>
          <span style={styles.navLabel}>Deadlines</span>
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          style={activeTab === 'complaints' ? { ...styles.navButton, ...styles.navButtonActive } : styles.navButton}
        >
          <span style={styles.navIcon}>📝</span>
          <span style={styles.navLabel}>Support</span>
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
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
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #E9ECEF',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0A5C36',
    margin: '0 0 4px 0',
  },
  headerSubtitle: {
    fontSize: '12px',
    color: '#6C757D',
    margin: 0,
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#DC3545',
    backgroundColor: 'transparent',
    border: '1px solid #DC3545',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    paddingBottom: '80px',
  },
  home: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeCard: {
    backgroundColor: '#0A5C36',
    borderRadius: '12px',
    padding: '24px',
    color: 'white',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  welcomeText: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featuresTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 8px 0',
  },
  featureCard: {
    display: 'flex',
    gap: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
  },
  featureCardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 8px 0',
  },
  featureCardText: {
    fontSize: '14px',
    color: '#6C757D',
    margin: 0,
    lineHeight: '1.5',
  },
  navigation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    backgroundColor: 'white',
    borderTop: '1px solid #E9ECEF',
    padding: '8px',
    justifyContent: 'space-around',
  },
  navButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
    minWidth: '60px',
  },
  navButtonActive: {
    backgroundColor: '#E7F4EE',
  },
  navIcon: {
    fontSize: '20px',
  },
  navLabel: {
    fontSize: '11px',
    color: '#6C757D',
    fontWeight: '500',
  },
};
