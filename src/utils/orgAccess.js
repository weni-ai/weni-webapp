const SSO_PROVIDER_LABELS = {
  google: 'Google',
  microsoft: 'Microsoft',
};

export const ACCESS_STATUS_ACTIVE = 'active';
export const ACCESS_STATUS_DISABLED = 'disabled';

export function isOrgAccessDisabled(org) {
  return org?.access_status === ACCESS_STATUS_DISABLED;
}

function formatAllowedProviders(providers = []) {
  return providers
    .map((provider) => SSO_PROVIDER_LABELS[provider] || provider)
    .join(', ');
}

export function getOrgAccessDisabledMessage(
  { access_disabled_reason: reason, sso_config: ssoConfig } = {},
  t,
) {
  if (!reason) {
    return '';
  }

  const key = `orgs.access_disabled_reason.${reason}`;
  const params =
    reason === 'sso_provider_not_allowed'
      ? { providers: formatAllowedProviders(ssoConfig?.allowed_sso_providers) }
      : {};

  return t(key, params);
}
