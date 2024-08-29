import LearningCenter from '@/components/common/RightBar/LearningCenter.vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';

import VueRouter from 'vue-router';

const localVue = createLocalVue();

localVue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: 'initial',
      name: 'initial',
    },
    {
      path: '/',
      name: 'outside-a-project',
    },
    {
      path: '/:projectUuid/home',
      name: 'inside-a-project',
    },
  ],
});

const setup = () =>
  shallowMount(LearningCenter, {
    localVue,
    router,

    propsData: {},
  });

const elements = {
  championChatbot: { name: 'LearningCenterChampionChatbot' },
  resources: { name: 'LearningCenterResources' },
};

describe('LearningCenter.vue', () => {
  let wrapper;

  beforeEach(() => {
    router.push({ name: 'initial' });
  });

  it('emits close event when the resources component emits redirected', () => {
    wrapper = setup();

    wrapper.findComponent(elements.resources).vm.$emit('redirected');

    expect(wrapper.emitted('close')).toBeTruthy();
  });

  /* it('does not show champion chatbot area if the user is not in a project', () => {
    router.push({
      name: 'outside-a-project',
    });

    wrapper = setup();

    expect(
      wrapper.findComponent(elements.championChatbot).exists(),
    ).toBeFalsy();
  }); */

  /* it('shows champion chatbot area if the user is in a project', () => {
    router.push({
      name: 'inside-a-project',
      params: {
        projectUuid: '1234',
      },
    });

    wrapper = setup();

    expect(
      wrapper.findComponent(elements.championChatbot).exists(),
    ).toBeTruthy();
  }); */
});
