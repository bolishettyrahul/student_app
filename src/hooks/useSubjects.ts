import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { Subject } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';

export const useSubjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setSubjects(data || []);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
      setError(err.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addSubject = async (name: string, code: string | null, color: string) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('subjects')
        .insert([
          {
            user_id: user.id,
            name,
            code,
            color,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setSubjects((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding subject:', err);
      return { success: false, error: err.message || 'Failed to add subject' };
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setSubjects((prev) => prev.filter((sub) => sub.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting subject:', err);
      return { success: false, error: err.message || 'Failed to delete subject' };
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    refresh: fetchSubjects,
    addSubject,
    deleteSubject,
  };
};
