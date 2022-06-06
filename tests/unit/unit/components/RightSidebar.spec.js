import { shallowMount } from '@vue/test-utils';
import RightSidebar from '@/components/RightSidebar.vue';

jest.mock('@/services/Keycloak.js', () => {});
jest.useFakeTimers();
describe('RightSidebar.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RightSidebar, {
      mocks: {
        $t: () => '',
        onFinished: jest.fn(),
      },
      stubs: {
        updateOrg: true,
        orgPermissionsRead: true,
        orgPermissions: true,
        skeletonLoading: true,
      },
      propsData: {
        props: {
          onFinished: jest.fn(),
        },
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });

  describe('isOpen', () => {
    it('toggle is open to true', async () => {
      await wrapper.setProps({
        isOpen: true,
      });

      jest.runAllTimers();

      expect(wrapper.vm.isClosed).toBeFalsy;
    });
  });

  describe('close()', () => {
    it('test type is manage-members and exists onFinished in props', async () => {
      await wrapper.vm.close();
      expect(wrapper.props('onFinished')).toBeTruthy;
      expect(wrapper.vm.isClosed).toBeFalsy;

      jest.runAllTimers();

      expect(wrapper.emitted('input')).toBeTruthy();
    });
  });
  it('wantToClose()', async () => {
    await wrapper.vm.wantToClose();
    expect(wrapper.vm.shakeCloseButton).toBeFalsy;
    jest.runAllTimers();
    expect(wrapper.vm.shakeCloseButton).toBeTruthy;
  });
});
