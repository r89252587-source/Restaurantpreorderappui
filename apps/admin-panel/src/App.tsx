import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import Login from './screens/Login';
import AccountStatus from './screens/AccountStatus';
import Dashboard from './screens/Dashboard';
import Onboarding from './screens/Onboarding';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      let didFinish = false;
      // Safety timeout: use a local flag, not stale state from closure
      const timer = setTimeout(() => {
        if (mounted && !didFinish) {
          setError(
            'Initialization timed out.\n\n' +
            'Possible causes:\n' +
            '1. Your Supabase anon key is missing/invalid in .env\n' +
            '2. The "profiles" table does not exist in your Supabase database\n' +
            '3. Your internet connection is unstable\n\n' +
            'Please check apps/admin-panel/.env and your Supabase Dashboard.'
          );
          setLoading(false);
        }
      }, 10000);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        didFinish = true;
        clearTimeout(timer);

        if (sessionError) throw sessionError;
        if (!mounted) return;
        
        setSession(session);
        if (session) {
          await checkUserRole(session.user);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        didFinish = true;
        clearTimeout(timer);
        console.error('Init error:', err);
        if (mounted) {
          setError(err.message || 'Failed to connect to authentication server');
          setLoading(false);
        }
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session) {
        await checkUserRole(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function checkUserRole(user: any) {
    try {
      setError(null);
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
            role: 'pending',
            requestforAdmin: false
          })
          .select()
          .single();
        if (createError) throw createError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      setProfile(profile);
    } catch (err: any) {
      console.error('Error checking role:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setAuthError(error.message);
  };

  const signOut = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <Loader2 style={{ width: '40px', height: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Initializing Application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
        </div>
        <h2 style={{ marginBottom: '0.75rem', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>Connection Error</h2>
        <pre style={{ color: '#94A3B8', maxWidth: '500px', marginBottom: '2rem', whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.6, textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>{error}</pre>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Try Again
        </button>
      </div>
    );
  }
  // Guard: avoid redirect loop when session exists but profile not yet fetched
  if (session && !profile && !loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <Loader2 style={{ width: '40px', height: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>Loading user data...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login onLogin={loginWithGoogle} authError={authError} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/onboarding" 
          element={
            session && profile ? (
              profile.role === 'admin' ? <Navigate to="/" replace /> :
              profile.requestforAdmin ? <Navigate to="/account-status" replace /> :
              <Onboarding profile={profile} onComplete={() => checkUserRole(session.user)} />
            ) : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/account-status" 
          element={
            session && profile ? (
              profile.role === 'admin' ? <Navigate to="/" replace /> :
              <AccountStatus onSignOut={signOut} />
            ) : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/*" 
          element={
            !session ? <Navigate to="/login" replace /> :
            !profile ? <Navigate to="/login" replace /> :
            profile.role === 'admin' ? <Dashboard session={session} profile={profile} onSignOut={signOut} /> :
            profile.requestforAdmin ? <Navigate to="/account-status" replace /> :
            <Navigate to="/onboarding" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
