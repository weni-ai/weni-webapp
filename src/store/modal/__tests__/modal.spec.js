import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useModalStore } from '@/store/modal';

describe('useModalStore', () => {
  let modalStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    modalStore = useModalStore();
  });

  describe('initial state', () => {
    it('exposes the default state', () => {
      expect(modalStore.lastId).toBe(0);
      expect(modalStore.actives).toEqual([]);
    });
  });

  describe('openModal', () => {
    it('assigns an incremental id, mutates the payload, and appends it', async () => {
      const first = { type: 'alert', data: { title: 'First' } };
      const second = { type: 'confirm', data: { title: 'Second' } };

      const firstId = await modalStore.openModal(first);
      const secondId = await modalStore.openModal(second);

      expect(firstId).toBe(1);
      expect(secondId).toBe(2);
      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(modalStore.lastId).toBe(2);
      expect(modalStore.actives).toEqual([first, second]);
    });
  });

  describe('closeModal', () => {
    it('removes the matching entry and returns a promise', async () => {
      const first = { type: 'alert', data: { title: 'First' } };
      const second = { type: 'confirm', data: { title: 'Second' } };

      const firstId = await modalStore.openModal(first);
      const secondId = await modalStore.openModal(second);

      await expect(modalStore.closeModal(firstId)).resolves.toBeUndefined();

      expect(modalStore.actives).toEqual([second]);
      expect(modalStore.actives[0].id).toBe(secondId);
      expect(modalStore.lastId).toBe(2);
    });

    it('leaves the list unchanged when the id is not present', async () => {
      const payload = { type: 'alert', data: { title: 'First' } };
      await modalStore.openModal(payload);

      await modalStore.closeModal(999);

      expect(modalStore.actives).toEqual([payload]);
    });
  });
});
