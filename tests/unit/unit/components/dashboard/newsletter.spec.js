import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';

import { unnnicCallAlert as mockUnnnicCallAlert } from '@weni/unnnic-system';

jest.mock('@weni/unnnic-system', () => ({
  ...jest.requireActual('@weni/unnnic-system'),
  unnnicCallAlert: jest.fn(),
}));

import newsletter from '@/components/dashboard/newsletter.vue';
import i18n from '@/utils/plugins/i18n';

import project from '../../../__mocks__/project';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('newsletter.vue', () => {
  let wrapper;
  let store;
  let actions;
  let getters;
  let state;

  beforeEach(() => {
    actions = {
      getNewsletterList: jest.fn(),
    };
    getters = {
      currentProject() {
        return project;
      },
    };
    state = {
      Account: {
        profile: {
          language: 'pt-br',
        },
      },
    };
    store = new Vuex.Store({
      getters,
      actions,
      state,
    });
    wrapper = shallowMount(newsletter, {
      localVue,
      store,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        RouterLink: RouterLinkStub,
        unnnicIconSvg: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('getLetter()', () => {
    it('test default value', async () => {
      const DATA = [
        {
          id: 1,
          title: 'top',
          description: 'top desc',
          created_at: new Date(),
        },
      ];

      wrapper.setData({
        page: 1,
      });

      actions.getNewsletterList.mockImplementation(() => {
        return {
          data: {
            results: DATA,
            next: 2,
          },
        };
      });
      await wrapper.vm.getLetter();
      expect(wrapper.vm.newsletter).toEqual(DATA);
      expect(wrapper.vm.hasMore).toBeTruthy;
      expect(wrapper.vm.page).toEqual(2);
    });

    it('should call unnnicCallAlert on error', async () => {
      actions.getNewsletterList.mockImplementation(() => {
        throw new Error('error fetching');
      });
      expect(mockUnnnicCallAlert).toHaveBeenCalled();
    });
  });

  describe('onScroll()', () => {
    it('verify if hasnt more', async () => {
      wrapper.setData({
        hasMore: 0,
      });
      const res = await wrapper.vm.onScroll();
      expect(res).toBeFalsy;
    });

    it('verify if has more and loading is true', async () => {
      wrapper.setData({
        hasMore: 1,
        loading: false,
      });
      const res = await wrapper.vm.onScroll();
      expect(res).toBeFalsy;
    });

    it('verify if has more and loading is false', async () => {
      await wrapper.setData({
        hasMore: 1,
        loading: true,
      });
      await wrapper.vm.onScroll();
      // expect(spy).toHaveBeenCalled();
    });
  });

  it('verify changes in profile.language', async () => {
    const spy = jest.spyOn(wrapper.vm, 'getLetter');
    wrapper.vm.$store.state.Account.profile.language = 'es';
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.newsletter).toEqual([]);
      expect(wrapper.vm.page).toEqual(1);
      expect(wrapper.vm.hasMore).toBeFalsy;
      expect(wrapper.vm.loading).toBeFalsy;
      expect(spy).toHaveBeenCalled();
    });
  });

  it('verify when loading change', () => {
    wrapper.setData({
      loading: true,
    });
    expect(wrapper.emitted('loadingNews')).toBeTruthy();
  });
});
