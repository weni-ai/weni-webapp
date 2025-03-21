import { shallowMount } from '@vue/test-utils';
import OrgRole from '@/components/orgs/orgRole.vue';

describe('OrgRole.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(OrgRole, {
      global: {
        stubs: {
          UnnnicButton: true,
          UnnnicDropdown: true,
          UnnnicDropdownItem: true,
        },
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
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
