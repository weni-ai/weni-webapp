import { vi } from 'vitest';
import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';

import { unnnicCallAlert as mockunnnicCallAlert } from '@weni/unnnic-system';

import status from '@/components/dashboard/status.vue';
import i18n from '@/utils/plugins/i18n';

import { project, profile } from '../../../__mocks__';

vi.mock('@weni/unnnic-system', () => ({
  unnnicCallAlert: vi.fn(),
}));

const localVue = createLocalVue();
localVue.use(Vuex);

describe('status.vue', () => {
  let wrapper;
  let store;
  let getters;
  let actions;
  let state;

  beforeEach(() => {
    getters = {
      currentProject() {
        return project;
      },
    };
    actions = {
      getStatus: vi.fn(),
    };
    state = {
      Account: {
        profile,
      },
    };
    store = new Vuex.Store({
      getters,
      actions,
      state,
    });
    wrapper = shallowMount(status, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
        setTimeout: function () {
          return 99;
        },
        clearTimeout: function () {},
      },
      stubs: {
        RouterLink: RouterLinkStub,
        UnnnicCard: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  describe('fetchStatus()', () => {
    it('test default value', async () => {
      const DATA = [
        {
          id: 481,
          project: 'a07f30ac-eab5-4ae6-9bb6-8f82c6c78087',
          service__status: {
            status: 'online',
            intercurrence: '2022-03-02T00:33:10.146802Z',
          },
          service__url: 'https://api.bothub.it/',
          service__default: true,
          service__last_updated: '2022-03-02T19:39:00.288738Z',
          service__type_service: 'type_service_inteligence',
          created_at: '2021-10-25T20:43:03.868486Z',
        },
      ];
      actions.getStatus.mockImplementation(() => {
        return {
          data: {
            results: DATA,
          },
        };
      });
      await wrapper.vm.fetchStatus();
      expect(wrapper.vm.statusList).toEqual(DATA);
    });

    it('should call unnnicCallAlert on error', async () => {
      actions.getStatus.mockImplementation(() => {
        throw new Error('error fetching');
      });
      expect(mockunnnicCallAlert).toHaveBeenCalled();
    });
  });

  // it('test computed projectUuid()', () => {
  //   const res = wrapper.vm.projectUuid;
  //   expect(res).toEqual(project.uuid);
  // });

  // it('test computed hasNext()', async () => {
  //   wrapper.setData({
  //     current: 2,
  //     total: 4,
  //   });
  //   const res = await wrapper.vm.hasNext;
  //   expect(res).toBeTruthy;
  // });

  // it('test computed hasPrevious()', async () => {
  //   wrapper.setData({
  //     current: 2,
  //   });
  //   const res = await wrapper.vm.hasPrevious;
  //   expect(res).toBeTruthy;
  // });

  // it('test method startAnimating()', async () => {
  //   await wrapper.vm.startAnimating();
  //   expect(wrapper.vm.animating).toBeTruthy;
  // });

  // it('test method onSelect()', async () => {
  //   const INDEX = 2;
  //   const spy = vi.spyOn(wrapper.vm, 'resetTimeout');
  //   await wrapper.vm.onSelect(INDEX);

  //   expect(spy).toHaveBeenCalledTimes(1);
  //   expect(wrapper.vm.current).toEqual(INDEX - 1);
  // });

  // it('test method onFinishAnimating()', async () => {
  //   const spy = vi.spyOn(wrapper.vm, 'next');
  //   await wrapper.vm.onFinishAnimating();

  //   expect(spy).toHaveBeenCalledTimes(1);
  //   expect(wrapper.vm.animating).toBeFalsy;
  // });
});
