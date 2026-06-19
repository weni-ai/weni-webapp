import { describe, expect, it } from 'vitest';
import {
  ACCESS_STATUS_DISABLED,
  getOrgAccessDisabledMessage,
  isOrgAccessDisabled,
} from '@/utils/orgAccess';

describe('orgAccess', () => {
  const t = (key, params = {}) => {
    if (params.providers) {
      return `${key}:${params.providers}`;
    }

    return key;
  };

  describe('isOrgAccessDisabled', () => {
    it('returns true when access_status is disabled', () => {
      expect(
        isOrgAccessDisabled({ access_status: ACCESS_STATUS_DISABLED }),
      ).toBe(true);
    });

    it('returns false when access_status is active', () => {
      expect(isOrgAccessDisabled({ access_status: 'active' })).toBe(false);
    });

    it('returns false when org is undefined', () => {
      expect(isOrgAccessDisabled()).toBe(false);
    });
  });

  describe('getOrgAccessDisabledMessage', () => {
    it('returns empty string when reason is missing', () => {
      expect(getOrgAccessDisabledMessage({}, t)).toBe('');
    });

    it('returns locale key for known reason', () => {
      expect(
        getOrgAccessDisabledMessage(
          { access_disabled_reason: 'sso_session_required' },
          t,
        ),
      ).toBe('orgs.access_disabled_reason.sso_session_required');
    });

    it('interpolates allowed providers for provider not allowed reason', () => {
      expect(
        getOrgAccessDisabledMessage(
          {
            access_disabled_reason: 'sso_provider_not_allowed',
            sso_config: { allowed_sso_providers: ['google', 'microsoft'] },
          },
          t,
        ),
      ).toBe(
        'orgs.access_disabled_reason.sso_provider_not_allowed:Google, Microsoft',
      );
    });
  });
});
