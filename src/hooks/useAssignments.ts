import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { Assignment } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';

export const useAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('assignments')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setAssignments(data || []);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addAssignment = async (
    title: string,
    description: string | null,
    due_date: string,
    priority: 'low' | 'medium' | 'high',
    subject_id: string | null
  ) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('assignments')
        .insert([
          {
            user_id: user.id,
            subject_id: subject_id || null,
            title,
            description,
            due_date,
            priority,
            status: 'pending',
          },
        ])
        .select('*, subject:subjects(*)')
        .single();

      if (insertError) {
        throw insertError;
      }

      setAssignments((prev) => [...prev, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding assignment:', err);
      return { success: false, error: err.message || 'Failed to add assignment' };
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, subject:subjects(*)')
        .single();

      if (updateError) {
        throw updateError;
      }

      setAssignments((prev) =>
        prev
          .map((item) => (item.id === id ? data : item))
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      );
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      return { success: false, error: err.message || 'Failed to update assignment' };
    }
  };

  const toggleAssignmentStatus = async (id: string, currentStatus: 'pending' | 'completed') => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    // Optimistic Update
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    try {
      const { error: updateError } = await supabase
        .from('assignments')
        .update({ status: nextStatus })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling assignment status:', err);
      // Revert Optimistic Update
      setAssignments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: currentStatus } : item))
      );
      return { success: false, error: err.message || 'Failed to toggle assignment' };
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      setAssignments((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      return { success: false, error: err.message || 'Failed to delete assignment' };
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refresh: fetchAssignments,
    addAssignment,
    updateAssignment,
    toggleAssignmentStatus,
    deleteAssignment,
  };
};
