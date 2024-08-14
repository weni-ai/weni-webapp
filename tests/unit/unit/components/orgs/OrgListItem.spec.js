import { shallowMount, createLocalVue } from '@vue/test-utils';
import orgListItem from '@/components/orgs/orgListItem.vue';
import i18n from '@/utils/plugins/i18n';
import { org } from '../../../__mocks__';

const localVue = createLocalVue();

describe('orgListItem.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(orgListItem, {
      localVue,
      i18n,
      propsData: {
        steps: 1,
        names: [],
        current: 0,
        org,
      },
      mocks: {
        $t: () => 'some specific text',
      },
      stubs: {
        UnnnicCardCompany: true,
      },
    });
  });

  it('renders a snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('getName()', () => {
    const response = wrapper.vm.getName({
      first_name: 'Test',
      last_name: 'Vue',
    });

    expect(response).toBe('Test Vue');
  });

  describe('displayMembers()', () => {
    it('Test when dont have members passing by props', async () => {
      await wrapper.setProps({ members: null });
      const response = wrapper.vm.displayMembers;

      expect(response).toStrictEqual([]);
    });

    it('Test when have members passing by props', async () => {
      const members = [
        { first_name: 'Test', last_name: 'Vue', photo_user: 'vue' },
      ];
      await wrapper.setProps({ members });
      expect(wrapper.vm.displayMembers).toStrictEqual([
        {
          name: 'Test Vue',
          photo: 'vue',
        },
      ]);
    });
  });

  describe('remainingMembers()', () => {
    it('When have more or equal to 4 members', async () => {
      const members = [1, 2, 3, 4, 5];
      await wrapper.setProps({ members });

      const response = wrapper.vm.remainingMembers;
      expect(response).toStrictEqual(members.length - 3);
    });

    it('When have less then 4 members', async () => {
      const members = [1, 2, 3];
      await wrapper.setProps({ members });

      const response = wrapper.vm.remainingMembers;
      expect(response).toStrictEqual(0);
    });
  });

  describe('options()', () => {
    it('When can edit', async () => {
      await wrapper.setProps({ role: 3 });

      const response = wrapper.vm.options;
      expect(response.length).toStrictEqual(4);
    });

    it('When cannot edit', async () => {
      await wrapper.setProps({ role: 2 });
      const optionsRole2 = wrapper.vm.options;
      expect(optionsRole2.length).toStrictEqual(1);

      await wrapper.setProps({ role: 4 });
      const optionsRole4 = wrapper.vm.options;
      expect(optionsRole4.length).toStrictEqual(1);
    });
  });

  it('openDeleteModal()', () => {
    wrapper.vm.openDeleteModal();
    expect(wrapper.emitted('open-delete-confirmation')).toBeTruthy();
  });

  it('onSelectOrg()', () => {
    wrapper.vm.onSelectOrg();
    expect(wrapper.emitted('select')).toBeTruthy();
  });

  it('onEdit()', () => {
    wrapper.vm.onEdit();
    expect(wrapper.emitted('edit')).toBeTruthy();
  });

  it('onManage()', () => {
    wrapper.vm.onManage();
    expect(wrapper.emitted('manage')).toBeTruthy();
  });

  it('onView()', () => {
    wrapper.vm.onView();
    expect(wrapper.emitted('view')).toBeTruthy();
  });

  it('onSelectBilling()', () => {
    wrapper.vm.onSelectBilling();
    expect(wrapper.emitted('billing')).toBeTruthy();
  });
});
