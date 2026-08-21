import { describe, it, expect, beforeEach } from 'vitest';
import {
  openServerErrorAlertModal,
  openAlertModal,
} from '@/utils/openServerErrorAlertModal.js';
import i18n from '@/utils/plugins/i18n';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { useModalStore } from '@/store/modal';

describe('openServerErrorAlertModal.js', () => {
  let modalStore;

  beforeEach(() => {
    setActivePinia(createTestingPinia());
    modalStore = useModalStore();
  });

  it('it should dispatch server alert with default params', () => {
    openServerErrorAlertModal();

    expect(modalStore.openModal).toHaveBeenCalledWith({
      type: 'alert',
      data: {
        icon: 'alert-circle-1',
        title: i18n.global.t('alerts.server_problem.title'),
        description: i18n.global.t('alerts.server_problem.description'),
        scheme: 'feedback-yellow',
      },
    });
  });

  it('it should dispatch server alert with customizable values', () => {
    openServerErrorAlertModal({
      type: 'danger',
      title: 'title',
      description: 'description',
    });

    expect(modalStore.openModal).toHaveBeenCalledWith({
      type: 'alert',
      data: {
        icon: 'alert-circle-1',
        title: 'title',
        description: 'description',
        scheme: 'feedback-red',
      },
    });
  });

  it('it should dispatch alert with default params', () => {
    openAlertModal();

    expect(modalStore.openModal).toHaveBeenCalledWith({
      type: 'alert',
      data: {
        icon: 'alert-circle-1',
        title: i18n.global.t('alerts.server_problem.title'),
        description: i18n.global.t('alerts.server_problem.description'),
        scheme: 'feedback-yellow',
      },
    });
  });

  it('it should dispatch danger alert with customizable values', () => {
    openAlertModal({
      type: 'danger',
      title: 'title',
      description: 'description',
    });

    expect(modalStore.openModal).toHaveBeenCalledWith({
      type: 'alert',
      data: {
        icon: 'alert-circle-1',
        title: 'title',
        description: 'description',
        scheme: 'feedback-red',
      },
    });
  });

  it('it should dispatch success alert with customizable values', () => {
    openAlertModal({
      type: 'success',
      title: 'title',
      description: 'description',
    });

    expect(modalStore.openModal).toHaveBeenCalledWith({
      type: 'alert',
      data: {
        icon: 'check_circle',
        title: 'title',
        description: 'description',
        scheme: 'feedback-green',
      },
    });
  });
});
