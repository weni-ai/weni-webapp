import { describe, expect, it, vi } from 'vitest';
import {
  ACCESS_STATUS_DISABLED,
  getOrgAccessDisabledMessage,
  isOrgAccessDisabled,
} from '@/utils/orgAccess';

describe('orgAccess', () => {
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
    const KNOWN_REASONS = [
      'sso_credential_unavailable',
      'sso_email_domain_not_allowed',
      'sso_password_configured',
      'sso_provider_not_allowed',
      'sso_session_required',
    ];

    const t = vi.fn((key) => key);

    const expectTranslatedKey = (reason, expectedKey) => {
      t.mockClear();

      const result = getOrgAccessDisabledMessage(
        { access_disabled_reason: reason },
        t,
      );

      expect(result).toBe(expectedKey);
      expect(t).toHaveBeenCalledTimes(1);
      expect(t.mock.calls[0]).toEqual([expectedKey]);
    };

    it.each([null, undefined, ''])(
      'returns empty string when reason is %j',
      (reason) => {
        t.mockClear();

        expect(
          getOrgAccessDisabledMessage({ access_disabled_reason: reason }, t),
        ).toBe('');
        expect(t).not.toHaveBeenCalled();
      },
    );

    it.each(KNOWN_REASONS)('resolves %s to its own key', (reason) => {
      expectTranslatedKey(reason, `orgs.access_disabled_reason.${reason}`);
    });

    it('resolves an unrecognized reason to the default key', () => {
      expectTranslatedKey(
        'some_future_reason',
        'orgs.access_disabled_reason.default',
      );
    });

    it('does not pass interpolation parameters for any reason', () => {
      const reasons = [...KNOWN_REASONS, 'some_future_reason'];

      reasons.forEach((reason) => {
        t.mockClear();
        getOrgAccessDisabledMessage({ access_disabled_reason: reason }, t);
        expect(t.mock.calls[0]).toHaveLength(1);
      });
    });

    it('ignores a legacy sso_config argument', () => {
      t.mockClear();

      const result = getOrgAccessDisabledMessage(
        {
          access_disabled_reason: 'sso_provider_not_allowed',
          sso_config: { allowed_sso_providers: ['okta-acme', 'google'] },
        },
        t,
      );

      expect(result).toBe(
        'orgs.access_disabled_reason.sso_provider_not_allowed',
      );
      expect(t.mock.calls[0]).toEqual([
        'orgs.access_disabled_reason.sso_provider_not_allowed',
      ]);
    });
  });
});
