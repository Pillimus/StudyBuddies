import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchGroups } from '../api/groups';
import type { Group } from '../types';

interface GroupsContextValue {
  groups: Group[];
  loadingGroups: boolean;
  groupsError: string;
  refreshGroups: () => Promise<Group[]>;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroupById: (groupId: number) => void;
}

const GroupsContext = createContext<GroupsContextValue>({
  groups: [],
  loadingGroups: true,
  groupsError: '',
  refreshGroups: async () => [],
  addGroup: () => {},
  updateGroup: () => {},
  removeGroupById: () => {},
});

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupsError, setGroupsError] = useState('');

  const refreshGroups = useCallback(async () => {
    setLoadingGroups(true);
    setGroupsError('');

    try {
      const nextGroups = await fetchGroups();
      setGroups(nextGroups);
      return nextGroups;
    } catch (error) {
      setGroupsError(error instanceof Error ? error.message : 'Unable to load groups.');
      return [];
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    void refreshGroups();
  }, [refreshGroups]);

  const addGroup = useCallback((group: Group) => {
    setGroups(prev => [...prev, group]);
  }, []);

  const updateGroup = useCallback((updatedGroup: Group) => {
    setGroups(prev => prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
  }, []);

  const removeGroupById = useCallback((groupId: number) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  }, []);

  return (
    <GroupsContext.Provider
      value={{ groups, loadingGroups, groupsError, refreshGroups, addGroup, updateGroup, removeGroupById }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupsContext);
}
