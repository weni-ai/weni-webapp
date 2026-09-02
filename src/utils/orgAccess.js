export const ACCESS_STATUS_ACTIVE = 'active';
export const ACCESS_STATUS_DISABLED = 'disabled';

const KNOWN_ACCESS_DISABLED_REASONS = [
  'sso_credential_unavailable',
  'sso_email_domain_not_allowed',
  'sso_password_configured',
  'sso_provider_not_allowed',
  'sso_session_required',
];

export function isOrgAccessDisabled(org) {
  return org?.access_status === ACCESS_STATUS_DISABLED;
}

export function getOrgAccessDisabledMessage(
  { access_disabled_reason: reason } = {},
  t,
) {
  if (!reason) {
    return '';
  }

  const key = KNOWN_ACCESS_DISABLED_REASONS.includes(reason)
    ? `orgs.access_disabled_reason.${reason}`
    : 'orgs.access_disabled_reason.default';

  return t(key);
}
