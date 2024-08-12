import { vi } from 'vitest';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Modal from '@/components/external/Modal.vue';
import i18n from '@/utils/plugins/i18n';

import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Modal.vue', () => {
  let wrapper;

  let actions;
  let store;

  beforeEach(() => {
    actions = {
      closeModal: vi.fn(),
    };
    store = new Vuex.Store({
      actions,
    });
    wrapper = shallowMount(Modal, {
      localVue,
      i18n,
      propsData: {
        id: 12,
        data: {
          isPersistent: true,
          validate: {
            text: 'top',
          },
          scheme: 'feedback-red',
        },
      },
      store,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        unnnicIconSvg: true,
        unnnicInput: true,
        unnnicButton: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should verify is persistent', async () => {
    expect(wrapper.vm.isPersistent).toBeTruthy;
  });

  describe('should verify is button type', () => {
    it('verify feedback-red', async () => {
      await wrapper.setData({
        confirmText: 'top',
      });
      const res = await wrapper.vm.buttonType;
      expect(res).toEqual('danger');
    });

    it('verify feedback-red', async () => {
      await wrapper.setData({
        confirmText: 'top',
      });

      await wrapper.setProps({
        data: {
          scheme: 'feedback-yellow',
        },
      });
      const res = await wrapper.vm.buttonType;
      expect(res).toEqual('alert');
    });

    it('verify feedback-red', async () => {
      await wrapper.setData({
        confirmText: '',
      });

      const res = await wrapper.vm.buttonType;
      expect(res).toEqual('');
    });
  });

  it('should verify close', async () => {
    const spy = vi.spyOn(wrapper.vm, 'justClose');
    await wrapper.vm.close();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should verify disabled', async () => {
    await wrapper.setData({
      confirmText: 'top',
    });
    const res = wrapper.vm.disabled;
    expect(res).toBeTruthy;
  });

  it('should verify close with data.onclose', async () => {
    await wrapper.setProps({
      data: {
        onClose: vi.fn(),
      },
    });

    const spy = vi.spyOn(wrapper.vm, 'justClose');
    await wrapper.vm.close();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.data.onClose).toHaveBeenCalled();
  });

  it('should verify just close', async () => {
    await wrapper.vm.justClose();
    expect(actions.closeModal).toHaveBeenCalledTimes(1);
  });

  it('should verify set Loading', async () => {
    await wrapper.vm.setLoading(true);
    expect(wrapper.vm.loading).toBeTruthy;
  });
});
