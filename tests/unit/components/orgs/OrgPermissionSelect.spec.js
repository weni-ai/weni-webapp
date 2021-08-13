import { shallowMount, createLocalVue } from '@vue/test-utils';
import OrgPermissionSelect from '@/components/orgs/orgPermissionSelect.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

describe('OrgPermissionSelect.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(OrgPermissionSelect, {
      localVue,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicSelect: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('roleOptions()', async () => {
    await wrapper.setData({
      roles: {
        1: 'view',
        2: 'contributor',
        3: 'admin',
      },
    });
    const response = wrapper.vm.roleOptions;
    expect(response).toStrictEqual(Object.keys(wrapper.vm.roles));
  });

  it('labelFor()', async () => {
    await wrapper.setData({
      roles: {
        1: 'view',
        2: 'contributor',
        3: 'admin',
      },
    });
    const response = wrapper.vm.labelFor(1);
    expect(response).toStrictEqual(wrapper.vm.$t());
  });
});
