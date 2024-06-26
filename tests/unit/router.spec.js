import { createLocalVue, mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import router from '@/router.js';

jest.mock('@/services/Keycloak.js');
import Keycloak from '@/services/Keycloak.js';

const localVue = createLocalVue();
localVue.use(VueRouter);

describe('router.js', () => {
  let wrapper = null;
  let mockIsAuthenticated = false;

  const createComponent = () => {
    Keycloak.isAuthenticated.mockImplementation(async () => {
      return mockIsAuthenticated;
    });

    const Component = {
      template: '<div></div>',
    };

    return mount(Component, {
      localVue,
      router,
    });
  };

  it('should redirect to login by accessing the initial page', async () => {
    mockIsAuthenticated = false;

    wrapper = createComponent();

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.name).toBe(null);
    expect(Keycloak.keycloak.login).toBeCalled();
  });

  it('should go to terms page since its authorization is not required', async () => {
    mockIsAuthenticated = false;

    wrapper = createComponent();

    wrapper.vm.$router.push({
      name: 'privacy_policy',
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.name).toBe('privacy_policy');
  });

  it('should access module with init internal param', async () => {
    mockIsAuthenticated = true;

    wrapper = createComponent();

    wrapper.vm.$router.push('/projects/projectUuid/integrations/init');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.name).toBe('integrations');
  });

  it('should force access init page of the module', async () => {
    mockIsAuthenticated = true;

    wrapper = createComponent();

    wrapper.vm.$router.push('/projects/projectUuid/integrations/home');

    await wrapper.vm.$nextTick();

    wrapper.vm.$router.push('/projects/projectUuid/integrations/init');

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.params.internal).toContain('force');
  });

  it('should clear hash param if it is to authenticate', async () => {
    mockIsAuthenticated = true;

    wrapper = createComponent();

    wrapper.vm.$router.push({
      name: 'orgs',
      hash: '#state=token',
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$route.name).toBe('orgs');
    expect(wrapper.vm.$route.hash).toBe('');
  });
});
