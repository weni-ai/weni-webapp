import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSharedStore } from '@/store/Shared';

const project = {
  uuid: 'a-project-uuid',
  project_type: 'commerce',
  name: 'Irrelevant to the shared store',
};

describe('useSharedStore current project', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should expose an empty current project without a Vuex store present', () => {
    const sharedStore = useSharedStore();

    expect(sharedStore.current.project.uuid).toBeUndefined();
    expect(sharedStore.current.project.type).toBeUndefined();
  });

  it('should expose the uuid and type of the project it receives', () => {
    const sharedStore = useSharedStore();

    sharedStore.setCurrentProject(project);

    expect(sharedStore.current.project.uuid).toBe('a-project-uuid');
    expect(sharedStore.current.project.type).toBe('commerce');
  });

  it('should clear the current project when it is unset', () => {
    const sharedStore = useSharedStore();

    sharedStore.setCurrentProject(project);
    sharedStore.setCurrentProject(null);

    expect(sharedStore.current.project.uuid).toBeUndefined();
    expect(sharedStore.current.project.type).toBeUndefined();
  });
});
