'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../supabase/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
        if (mounted) setLoading(false);
        return;
      }

      if (session?.user) {
        if (mounted) setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      }
      
      if (mounted) setLoading(false);
    }

    async function fetchProfile(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, is_active, is_receiving_cases, marketer_code')
        .eq('id', userId)
        .single();
        
      if (!error && data && mounted) {
        setProfile(data);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (mounted) setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return { user, profile, loading, signIn, signOut };
}
