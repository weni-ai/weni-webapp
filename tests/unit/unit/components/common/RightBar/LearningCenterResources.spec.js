import LearningCenterResources from '@/components/common/RightBar/LearningCenterResources.vue';
import { mount, RouterLinkStub } from '@vue/test-utils';

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/academy/:internal+',
      name: 'academy',
    },
    {
      path: '/api/:internal+',
      name: 'apiFlows',
    },
  ],
});

const setup = () =>
  mount(LearningCenterResources, {
    global: {
      plugins: [router],
      stubs: {
        UnnnicIcon: true,
        RouterLink: RouterLinkStub,
      },
    },
    props: {},
  });

const elements = {
  academy: '[data-test="academy"]',
  docs: '[data-test="docs"]',
  community: '[data-test="community"]',
  apis: '[data-test="apis"]',
};

window.open;

describe('LearningCenterResources.vue', () => {
  let wrapper;

  const internalLinks = [
    { element: 'academy', expectedPage: 'academy' },
    { element: 'apis', expectedPage: 'apiFlows' },
  ];

  const externalLinks = [
    { element: 'docs', externalLink: 'https://docs.weni.ai/' },
    { element: 'community', externalLink: 'https://comunidade.weni.ai/' },
  ];

  describe.each(internalLinks)(
    'when the user clicks on $element internal link',
    ({ element, expectedPage }) => {
      it(`redirects to ${expectedPage} and emits redirected event`, () => {
        wrapper = setup();

        wrapper.findComponent(elements[element]).trigger('click');

        expect(
          wrapper.findComponent(elements[element]).props('to').name,
        ).toEqual(expectedPage);
        expect(wrapper.emitted('redirected')).toBeTruthy();
      });
    },
  );

  it.each(externalLinks)(
    '$element external link should be an anchor tag and have the proper attributes',
    ({ element, externalLink }) => {
      wrapper = setup();

      const anchor = wrapper.find(elements[element]);

      expect(anchor.attributes()).toEqual(
        expect.objectContaining({
          target: '_blank',
          href: externalLink,
        }),
      );
    },
  );
});
