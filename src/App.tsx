import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';

type AppState = 'splash' | 'auth' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const splashTimeout = setTimeout(() => {
      checkSession();
    }, 2500);

    return () => clearTimeout(splashTimeout);
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setAppState('dashboard');
      } else {
        setAppState('auth');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAppState('auth');
    }
  };

  const handleAuth = (token: string) => {
    setAccessToken(token);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setAccessToken(null);
    setAppState('auth');
  };

  if (appState === 'splash') {
    return <SplashScreen />;
  }

  if (appState === 'auth') {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return <Dashboard accessToken={accessToken!} onLogout={handleLogout} />;
}
