import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useRightBarStore } from '@/store/RightBar';

describe('useRightBarStore', () => {
  let rightBarStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    rightBarStore = useRightBarStore();
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(rightBarStore.lastInsertedId).toBe(0);
      expect(rightBarStore.all).toEqual([]);
    });
  });

  describe('openRightBar', () => {
    it('assigns an incremental id, mutates the payload, and appends it', () => {
      const first = { props: { type: 'Notifications' } };
      const second = { props: { type: 'LearningCenter' } };

      const firstId = rightBarStore.openRightBar(first);
      const secondId = rightBarStore.openRightBar(second);

      expect(firstId).toBe(1);
      expect(secondId).toBe(2);
      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(rightBarStore.lastInsertedId).toBe(2);
      expect(rightBarStore.all).toEqual([first, second]);
    });
  });

  describe('closeRightBar', () => {
    it('removes the matching entry and returns a promise', async () => {
      const first = { props: { type: 'Notifications' } };
      const second = { props: { type: 'LearningCenter' } };

      const firstId = rightBarStore.openRightBar(first);
      const secondId = rightBarStore.openRightBar(second);

      await expect(
        rightBarStore.closeRightBar(firstId),
      ).resolves.toBeUndefined();

      expect(rightBarStore.all).toEqual([second]);
      expect(rightBarStore.all[0].id).toBe(secondId);
      expect(rightBarStore.lastInsertedId).toBe(2);
    });

    it('leaves the list unchanged when the id is not present', async () => {
      const payload = { props: { type: 'Notifications' } };
      rightBarStore.openRightBar(payload);

      await rightBarStore.closeRightBar(999);

      expect(rightBarStore.all).toEqual([payload]);
    });
  });
});
