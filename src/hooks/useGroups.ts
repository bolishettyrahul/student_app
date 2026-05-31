import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { Group } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext';

export const useGroups = () => {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get IDs of groups the user has joined
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const joinedIds = (memberships || []).map((m) => m.group_id);

      // 2. Fetch all groups visible to the user
      const { data: allGroups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // 3. For each group, get member count
      const groupsWithCounts: Group[] = await Promise.all(
        (allGroups || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          return { ...group, member_count: count || 0 };
        })
      );

      // 4. Split into joined vs discoverable
      const joined = groupsWithCounts.filter((g) => joinedIds.includes(g.id));
      const discover = groupsWithCounts.filter((g) => !joinedIds.includes(g.id));

      setJoinedGroups(joined);
      setDiscoverGroups(discover);
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError(err.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createGroup = async (name: string, description: string | null) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      // Create the group
      const { data: group, error: createError } = await supabase
        .from('groups')
        .insert([{ name, description, created_by: user.id }])
        .select()
        .single();

      if (createError) throw createError;

      // Auto-join the creator
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: user.id }]);

      if (joinError) throw joinError;

      // Refresh the lists
      await fetchGroups();
      return { success: true, data: group };
    } catch (err: any) {
      console.error('Error creating group:', err);
      return { success: false, error: err.message || 'Failed to create group' };
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([{ group_id: groupId, user_id: user.id }]);

      if (joinError) throw joinError;

      await fetchGroups();
      return { success: true };
    } catch (err: any) {
      console.error('Error joining group:', err);
      return { success: false, error: err.message || 'Failed to join group' };
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setError(null);
    try {
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (leaveError) throw leaveError;

      await fetchGroups();
      return { success: true };
    } catch (err: any) {
      console.error('Error leaving group:', err);
      return { success: false, error: err.message || 'Failed to leave group' };
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroups();
  }, [fetchGroups]);

  return {
    joinedGroups,
    discoverGroups,
    loading,
    error,
    refresh: fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
  };
};
