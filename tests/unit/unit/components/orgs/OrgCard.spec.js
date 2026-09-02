import { describe, expect, it, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import OrgCard from '@/components/orgs/OrgCard.vue';
import {
  ORG_ROLE_ADMIN,
  ORG_ROLE_CONTRIBUTOR,
  ORG_ROLE_FINANCIAL,
  ORG_ROLE_MODERATOR,
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
            props: ['text'],
            template: '<div class="tooltip-stub">{{ text }}<slot /></div>',
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

    it('emits billing on card click for financial role', async () => {
      const financialWrapper = mountCard({ role: ORG_ROLE_FINANCIAL });

      await financialWrapper.trigger('click');

      expect(financialWrapper.emitted('billing')).toHaveLength(1);
      expect(financialWrapper.emitted('enter')).toBeUndefined();
    });

    it('hides options menu for a role outside the menu allowlist', () => {
      const moderatorWrapper = mountCard({ role: ORG_ROLE_MODERATOR });

      expect(moderatorWrapper.vm.showOptionsMenu).toBe(false);
      expect(moderatorWrapper.find('.unnnic-dropdown').exists()).toBe(false);
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

    it('declares no ssoConfig prop', () => {
      const wrapper = mountCard();

      expect(wrapper.vm.$options.props).not.toHaveProperty('ssoConfig');
    });

    it('resolves disabledTooltipText from accessDisabledReason alone', () => {
      const wrapper = mountCard({
        ...disabledProps,
        accessDisabledReason: 'sso_session_required',
      });

      expect(wrapper.vm.disabledTooltipText).toBe(
        "Your current session doesn't meet this organization's sign-in requirements. Sign in the way this organization requires.",
      );
    });

    it('renders the default message for an unrecognized reason', () => {
      const wrapper = mountCard({
        ...disabledProps,
        accessDisabledReason: 'some_future_reason',
      });

      expect(wrapper.vm.disabledTooltipText).toBe(
        'Access to this organization is unavailable. Contact the organization admin.',
      );
      expect(wrapper.find('.tooltip-stub').text()).not.toContain(
        'orgs.access_disabled_reason.some_future_reason',
      );
      expect(wrapper.find('.tooltip-stub').text()).not.toContain(
        'some_future_reason',
      );
    });

    it('does not render an identity-source value passed in leftover props', () => {
      const identitySource = 'okta-acme';
      const wrapper = mountCard({
        ...disabledProps,
        accessDisabledReason: 'sso_provider_not_allowed',
        ssoConfig: { allowed_sso_providers: [identitySource] },
      });

      expect(wrapper.vm.disabledTooltipText).not.toContain(identitySource);
      expect(wrapper.html()).not.toContain(identitySource);
      expect(wrapper.find('.tooltip-stub').text()).not.toContain(
        identitySource,
      );
    });
  });
});
