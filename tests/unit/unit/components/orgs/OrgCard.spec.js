import { describe, expect, it, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import OrgCard from '@/components/orgs/OrgCard.vue';
import {
  ORG_ROLE_ADMIN,
  ORG_ROLE_CONTRIBUTOR,
  ORG_ROLE_FINANCIAL,
} from '@/components/orgs/orgListItem.vue';
import { ACCESS_STATUS_DISABLED } from '@/utils/orgAccess';

describe('OrgCard.vue', () => {
  const defaultProps = {
    name: 'Test Org',
    description: 'Test description',
    plan: 'trial',
    role: ORG_ROLE_ADMIN,
  };

  const mountCard = (props = {}) =>
    shallowMount(OrgCard, {
      props: {
        ...defaultProps,
        ...props,
      },
      global: {
        stubs: {
          UnnnicTag: true,
          UnnnicDropdown: {
            template: '<div><slot name="trigger" /><slot /></div>',
          },
          UnnnicIcon: true,
          UnnnicIconSvg: true,
          UnnnicToolTip: {
            template: '<div class="tooltip-stub"><slot /></div>',
          },
        },
      },
    });

  describe('when access is active', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mountCard();
    });

    it('emits enter on card click for admin role', async () => {
      await wrapper.trigger('click');

      expect(wrapper.emitted('enter')).toHaveLength(1);
    });

    it('does not apply disabled class', () => {
      expect(wrapper.classes()).not.toContain('org-card--disabled');
    });

    it('does not render access tooltip', () => {
      expect(wrapper.find('.tooltip-stub').exists()).toBe(false);
    });

    it('renders options menu for contributor role', () => {
      const contributorWrapper = mountCard({ role: ORG_ROLE_CONTRIBUTOR });

      expect(contributorWrapper.find('.unnnic-dropdown').exists()).toBe(true);
    });

    it('renders options menu for financial role', () => {
      const financialWrapper = mountCard({ role: ORG_ROLE_FINANCIAL });

      expect(financialWrapper.find('.unnnic-dropdown').exists()).toBe(true);
    });
  });

  describe('when access is disabled', () => {
    const disabledProps = {
      accessStatus: ACCESS_STATUS_DISABLED,
      accessDisabledReason: 'sso_session_required',
    };

    it('applies disabled class', () => {
      const wrapper = mountCard(disabledProps);

      expect(wrapper.classes()).toContain('org-card--disabled');
    });

    it('does not emit enter on card click', async () => {
      const wrapper = mountCard(disabledProps);

      await wrapper.trigger('click');

      expect(wrapper.emitted('enter')).toBeUndefined();
    });

    it('renders access tooltip', () => {
      const wrapper = mountCard(disabledProps);

      expect(wrapper.find('.tooltip-stub').exists()).toBe(true);
    });

    it('shows only leave option for admin', () => {
      const wrapper = mountCard({
        ...disabledProps,
        role: ORG_ROLE_ADMIN,
      });

      const options = wrapper.findAll('.option');

      expect(options).toHaveLength(1);
      expect(options[0].text()).toContain('Leave organization');
    });

    it('hides options menu for contributor', () => {
      const wrapper = mountCard({
        ...disabledProps,
        role: ORG_ROLE_CONTRIBUTOR,
      });

      expect(wrapper.find('.unnnic-dropdown').exists()).toBe(false);
    });

    it('hides options menu for financial role', () => {
      const wrapper = mountCard({
        ...disabledProps,
        role: ORG_ROLE_FINANCIAL,
      });

      expect(wrapper.find('.unnnic-dropdown').exists()).toBe(false);
    });
  });
});
