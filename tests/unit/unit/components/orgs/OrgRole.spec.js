import { shallowMount, createLocalVue } from '@vue/test-utils';
import OrgRole from '@/components/orgs/orgRole.vue';
import i18n from '@/utils/plugins/i18n';

const localVue = createLocalVue();

describe('OrgRole.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(OrgRole, {
      localVue,
      i18n,
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicButton: true,
        UnnnicDropdown: true,
        UnnnicDropdownItem: true,
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

  it('onSelectRole()', async () => {
    const param = 'test';
    wrapper.vm.onSelectRole(param);
    expect(wrapper.vm.currentRole).toBe(param);
    expect(wrapper.emitted('onChangeRole')).toBeTruthy();
  });

  it('onDelete()', async () => {
    wrapper.vm.onDelete();
    expect(wrapper.emitted('onDelete')).toBeTruthy();
  });
});
