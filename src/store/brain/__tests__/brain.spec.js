import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useBrainStore } from '@/store/brain';

describe('useBrainStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('exposes the default state', () => {
    const brainStore = useBrainStore();

    expect(brainStore.name).toBe('');
    expect(brainStore.goal).toBe('');
    expect(brainStore.content).toEqual({
      text: '',
      files: [],
      sites: [],
    });
  });

  it('brainFormReset restores name, goal, and content to empty values', () => {
    const brainStore = useBrainStore();

    brainStore.name = 'Support agent';
    brainStore.goal = 'Answer questions';
    brainStore.content.text = 'FAQ';
    brainStore.content.files = [{ name: 'guide.pdf' }];
    brainStore.content.sites = ['https://example.com'];

    brainStore.brainFormReset();

    expect(brainStore.name).toBe('');
    expect(brainStore.goal).toBe('');
    expect(brainStore.content).toEqual({
      text: '',
      files: [],
      sites: [],
    });
  });
});
