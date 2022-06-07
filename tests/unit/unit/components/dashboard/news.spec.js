import { shallowMount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import Vuex from 'vuex';

import news from '@/components/dashboard/news.vue';
import i18n from '@/utils/plugins/i18n';

import project from '../../../__mocks__/project';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('news.vue', () => {
  let wrapper;
  let store;
  let getters;

  beforeEach(() => {
    getters = {
      currentProject() {
        return project;
      },
    };
    store = new Vuex.Store({
      getters,
    });
    wrapper = shallowMount(news, {
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
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('test computed projectUuid()', () => {
    const res = wrapper.vm.projectUuid;
    expect(res).toEqual(project.uuid);
  });

  it('test computed hasNext()', async () => {
    wrapper.setData({
      current: 2,
      total: 4,
    });
    const res = await wrapper.vm.hasNext;
    expect(res).toBeTruthy;
  });

  it('test computed hasPrevious()', async () => {
    wrapper.setData({
      current: 2,
    });
    const res = await wrapper.vm.hasPrevious;
    expect(res).toBeTruthy;
  });

  it('test method startAnimating()', async () => {
    await wrapper.vm.startAnimating();
    expect(wrapper.vm.animating).toBeTruthy;
  });

  it('test method onSelect()', async () => {
    const INDEX = 2;
    const spy = jest.spyOn(wrapper.vm, 'resetTimeout');
    await wrapper.vm.onSelect(INDEX);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.current).toEqual(INDEX - 1);
  });

  it('test method onFinishAnimating()', async () => {
    const spy = jest.spyOn(wrapper.vm, 'next');
    await wrapper.vm.onFinishAnimating();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.animating).toBeFalsy;
  });
});
