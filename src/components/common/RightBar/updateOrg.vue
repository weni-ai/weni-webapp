<template>
  <UnnnicTab
    :tabs="tabs"
    :activeTab="activeTab"
    class="settings-content"
  >
    <template #tab-panel-first>
      <h2 class="weni-update-org__title">{{ $t('orgs.change_name') }}</h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.change_name_description') }}
      </p>

      <div class="weni-update-org__separator"></div>

      <div class="weni-update-org">
        <UnnnicInput
          v-model="formData.name"
          :label="$t('orgs.create.org_name')"
        />
        <UnnnicInput
          v-model="formData.description"
          :label="$t('orgs.create.org_description')"
        />
        <UnnnicButton
          :disabled="isSaveButtonDisabled"
          class="weni-update-org__button"
          type="secondary"
          :loading="loading"
          @click="updateOrg"
        >
          {{ $t('orgs.save') }}
        </UnnnicButton>
      </div>

      <div class="separator" />

      <div class="weni-delete-org">
        <h2>{{ $t('orgs.delete.title') }}</h2>
        <p>{{ $t('orgs.delete.description') }}</p>
        <UnnnicButton
          type="secondary"
          class="weni-delete-org__button"
          @click="openDeleteConfirmation(org)"
        >
          {{ $t('orgs.delete.title') }}
        </UnnnicButton>
      </div>
    </template>

    <template #tab-panel-second>
      <div class="weni-update-org__panel">
        <div class="weni-update-org__security">
          <h2 class="weni-update-org__title">
            {{ $t('orgs.2fa_title') }}
            <UnnnicTag
              scheme="aux-baby-blue"
              :text="$t('orgs.recommended')"
              type="default"
            />
          </h2>
          <p class="weni-update-org__description">
            {{ $t('orgs.2fa_description') }}
          </p>

          <UnnnicSwitch
            v-model="enable2FA"
            :textRight="$t('orgs.enable_2fa')"
          />

          <div class="separator" />

          <h2 class="weni-update-org__title">
            {{ $t('orgs.sso.title') }}
          </h2>
          <p class="weni-update-org__description">
            {{ $t('orgs.sso.description') }}
          </p>

          <div class="weni-update-org__sso-switch">
            <UnnnicSwitch
              v-model="ssoForm.isEnabled"
              :textRight="$t('orgs.sso.enable')"
            />
            <p class="weni-update-org__sso-helper">
              {{ $t('orgs.sso.helper') }}
            </p>
          </div>

          <template v-if="ssoForm.isEnabled">
            <UnnnicFormElement
              class="weni-update-org__sso-field"
              :label="$t('orgs.sso.provider_label')"
            >
              <UnnnicSelect
                :modelValue="ssoForm.provider ?? ''"
                :options="providerOptions"
                :placeholder="$t('orgs.sso.provider_placeholder')"
                @update:model-value="ssoForm.provider = $event || null"
              />
            </UnnnicFormElement>

            <UnnnicInput
              v-model="ssoForm.domainInput"
              class="weni-update-org__sso-field"
              :label="$t('orgs.sso.allowed_domains')"
              :placeholder="$t('orgs.sso.allowed_domains_placeholder')"
              :iconRight="
                ssoForm.domainInput.trim() ? 'keyboard-return-1' : undefined
              "
              iconRightClickable
              :errors="domainInputError"
              @icon-right-click="addDomain"
              @keydown="onDomainKeydown"
            />

            <div
              v-if="ssoForm.domains.length"
              class="weni-update-org__sso-domains"
            >
              <UnnnicChip
                v-for="domain in ssoForm.domains"
                :key="domain"
                type="multiple"
                :isSelected="true"
                :text="domain"
                @click="removeDomain(domain)"
              />
            </div>
          </template>
        </div>

        <div class="weni-update-org__footer">
          <UnnnicButton
            type="tertiary"
            @click="$emit('close')"
          >
            {{ $t('cancel') }}
          </UnnnicButton>
          <UnnnicButton
            type="primary"
            :loading="loadingSSO || loading2FA"
            :disabled="isSaveDisabled"
            @click="saveChanges"
          >
            {{ $t('orgs.save') }}
          </UnnnicButton>
        </div>
      </div>
    </template>
  </UnnnicTab>
</template>

<script>
import { mapActions } from 'vuex';
import account from '../../../api/account';
import orgs from '../../../api/orgs';
import { openAlertModal } from '../../../utils/openServerErrorAlertModal';
import Unnnic from '@weni/unnnic-system';
import _ from 'lodash';

const SSO_PROVIDERS = ['google', 'microsoft'];

const EMAIL_DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export default {
  name: 'UpdateOrg',

  props: {
    orgUuid: {
      type: String,
      required: true,
    },

    activeTab: {
      type: String,
    },
  },

  emits: ['remove-org', 'close'],

  data() {
    return {
      formData: {
        name: null,
        description: null,
      },

      enable2FA: null,

      ssoForm: {
        isEnabled: false,
        provider: null,
        domains: [],
        domainInput: '',
      },

      ssoBaseline: {
        isEnabled: false,
        provider: null,
        domains: [],
      },

      tabs: ['first', 'second'],
      loading2FA: false,
      loadingSSO: false,

      loading: false,
    };
  },

  computed: {
    org() {
      return this.$store.state.Org.orgs.data.find(
        ({ uuid }) => this.orgUuid === uuid,
      );
    },

    isSaveButtonDisabled() {
      if (!this.formData || !this.formData.name || !this.formData.description) {
        return true;
      }

      return (
        this.formData.name === this.org.name &&
        this.formData.description === this.org.description
      );
    },

    providerOptions() {
      return SSO_PROVIDERS.map((provider) => ({
        value: provider,
        label: provider.charAt(0).toUpperCase() + provider.slice(1),
      }));
    },

    twoFADirty() {
      return this.enable2FA !== this.org.enforce_2fa;
    },

    ssoDirty() {
      return !_.isEqual(
        this._ssoComparableState(this.ssoForm),
        this.ssoBaseline,
      );
    },

    ssoValid() {
      return (
        !this.ssoForm.isEnabled ||
        (!!this.ssoForm.provider && this.ssoForm.domains.length > 0)
      );
    },

    domainInputError() {
      const value = this.ssoForm.domainInput.trim();
      if (!value) return false;

      return this._getDomainValidationError(value) || false;
    },

    isSaveDisabled() {
      if (this.domainInputError) {
        return true;
      }

      if (this.ssoDirty && !this.ssoValid) {
        return true;
      }

      return !(this.twoFADirty || this.ssoDirty);
    },
  },

  mounted() {
    const { name, description } = this.org;

    this.formData = { name, description };
    this.enable2FA = this.org.enforce_2fa;

    this.ssoForm = this._hydrateSsoFromOrg(this.org);
    this.ssoBaseline = this._ssoComparableState(this.ssoForm);
  },
  methods: {
    ...mapActions([
      'editOrg',
      'getOrgs',
      'deleteOrg',
      'setCurrentOrg',
      'clearCurrentOrg',
      'clearCurrentProject',
      'openModal',
    ]),

    async updateOrg() {
      const { name, description } = this.formData;

      try {
        this.loading = true;

        const response = await this.editOrg({
          uuid: this.orgUuid,
          name,
          description,
        });

        this.org.name = response.data.name;
        this.org.description = response.data.description;

        this.formData.name = this.org.name;
        this.formData.description = this.org.description;

        openAlertModal({
          type: 'success',
          title: this.$t('orgs.save_success'),
          description: this.$t('orgs.save_success_text'),
        });
      } catch (error) {
        openAlertModal({
          type: 'warn',
          description: error?.response?.data?.detail || undefined,
        });
      } finally {
        this.loading = false;
      }
    },

    beforeUpdate2FAVerification() {
      if (this.enable2FA) {
        this.update2FAVerification();
      } else {
        this.openModal({
          type: 'confirm',
          data: {
            persistent: true,
            scheme: 'feedback-red',
            title: this.$t('account.2fa.modals.disable.title'),
            description: this.$t('account.2fa.modals.org_disable.description', {
              sentence: this.$t('account.2fa.modals.disable.sentence'),
            }),
            validate: {
              label: this.$t('account.2fa.modals.disable.label', {
                sentence: this.$t('account.2fa.modals.disable.sentence'),
              }),
              placeholder: this.$t('account.2fa.modals.disable.sentence'),
              text: this.$t('account.2fa.modals.disable.sentence'),
            },
            cancelText: this.$t('cancel'),
            confirmText: this.$t('account.2fa.modals.disable.buttons.save'),
            onConfirm: async (justClose, { setLoading }) => {
              setLoading(true);
              await this.update2FAVerification();
              setLoading(false);

              justClose();
            },
          },
        });
      }
    },

    async update2FAVerification() {
      try {
        this.loading2FA = true;

        const response = await account.updateAccount2FAStatus(
          this.enable2FA,
          this.orgUuid,
        );

        const realEnforce2FA = response?.data?.['2fa_required'];

        if (realEnforce2FA) {
          this.showEnabledConfirmation();
        } else {
          this.showDisabledConfirmation();
        }

        this.org.enforce_2fa = realEnforce2FA;
        this.enable2FA = this.org.enforce_2fa;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading2FA = false;
      }
    },

    onDomainKeydown(event) {
      if (!['Enter', ' ', ','].includes(event.key)) return;

      event.preventDefault();
      this.addDomain();
    },

    addDomain() {
      const raw = this.ssoForm.domainInput.trim();
      if (!raw) return;

      if (this._getDomainValidationError(raw)) return;

      const domain = raw.toLowerCase();
      if (!this.ssoForm.domains.includes(domain)) {
        this.ssoForm.domains.push(domain);
      }

      this.ssoForm.domainInput = '';
    },

    _getDomainValidationError(value) {
      if (value.includes('@') || value.includes('://') || /\s/.test(value)) {
        return this.$t('orgs.sso.invalid_domain');
      }

      if (!EMAIL_DOMAIN_PATTERN.test(value)) {
        return this.$t('orgs.sso.invalid_domain');
      }

      return null;
    },

    removeDomain(domain) {
      this.ssoForm.domains = this.ssoForm.domains.filter((d) => d !== domain);
    },

    async saveChanges() {
      if (this.ssoDirty) {
        const saved = await this.updateSSOConfig();

        if (!saved) {
          return;
        }
      }

      if (this.twoFADirty) {
        this.beforeUpdate2FAVerification();
      }
    },

    _hydrateSsoFromOrg(org) {
      const config = org.sso_config ?? {};

      return {
        isEnabled: config.is_enabled ?? false,
        provider: config.allowed_sso_providers?.[0] ?? null,
        domains: [...(config.allowed_email_domains ?? [])],
        domainInput: '',
      };
    },

    _ssoComparableState({ isEnabled, provider, domains }) {
      return { isEnabled, provider, domains };
    },

    async updateSSOConfig() {
      try {
        this.loadingSSO = true;

        const { isEnabled, provider, domains } = this.ssoForm;
        const response = await orgs.updateSSOConfig({
          organizationUuid: this.orgUuid,
          isEnabled,
          allowedEmailDomains: domains,
          allowedSSOProviders: provider ? [provider] : [],
        });

        this.org.sso_config = response.data;
        this.ssoBaseline = this._ssoComparableState(this.ssoForm);

        this.showSuccessToast();

        return true;
      } catch (error) {
        this.showSSOErrorToast(error);

        return false;
      } finally {
        this.loadingSSO = false;
      }
    },

    showSuccessToast() {
      Unnnic.unnnicCallAlert({
        props: {
          title: this.$t('orgs.save_success'),
          icon: 'check_circle',
          scheme: 'feedback-green',
          position: 'bottom-right',
          closeText: this.$t('close'),
        },
        seconds: 3,
      });
    },

    showSSOErrorToast(error) {
      const isLockout = error?.response?.status === 400;

      Unnnic.unnnicCallAlert({
        props: {
          title: isLockout
            ? this.$t('orgs.sso.lockout_error.title')
            : this.$t('orgs.error'),
          text: isLockout
            ? this.$t('orgs.sso.lockout_error.description')
            : error?.response?.data?.detail || this.$t('orgs.save_error'),
          icon: 'error',
          scheme: 'feedback-red',
          position: 'bottom-right',
          closeText: this.$t('close'),
        },
        seconds: 5,
      });
    },

    showEnabledConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          scheme: 'feedback-green',
          title: this.$t('account.2fa.modals.org_enabled.title'),
          description: this.$t('account.2fa.modals.org_enabled.description'),
        },
      });
    },

    showDisabledConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          scheme: 'feedback-green',
          title: this.$t('account.2fa.modals.disabled.title'),
          description: this.$t('account.2fa.modals.disabled.description'),
        },
      });
    },

    async onDelete(uuid, name) {
      try {
        await this.deleteOrg({ uuid });
        if (_.get(this.currentOrg, 'uuid') === uuid) {
          this.clearCurrentOrg();
        }
        this.showDeleteConfirmation(name);
        this.$emit('remove-org', uuid);
        this.$emit('close');
      } catch (error) {
        openAlertModal({
          type: 'warn',
          description: error?.response?.data?.detail || undefined,
        });
      }
    },

    showDeleteConfirmation(name) {
      this.openModal({
        type: 'alert',
        data: {
          scheme: 'feedback-green',
          title: this.$t('orgs.delete_confirmation_title'),
          description: this.$t('orgs.delete_confirmation_text', {
            name,
          }),
        },
      });
    },

    openDeleteConfirmation(organization) {
      this.openModal({
        type: 'confirm',
        data: {
          scheme: 'feedback-red',
          persistent: true,
          title: this.$t('orgs.delete.title'),
          description: this.$t('orgs.delete_confirm', {
            org: organization.name,
          }),
          validate: {
            label: this.$t('orgs.delete.confirm_with_name', {
              name: organization.name,
            }),
            placeholder: this.$t('orgs.delete.confirm_with_name_placeholder'),
            text: organization.name,
          },
          cancelText: this.$t('cancel'),
          confirmText: this.$t('orgs.delete.title'),
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);
            await this.onDelete(organization.uuid, organization.name);
            setLoading(false);
            justClose();
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;

  :deep(.tab-body),
  :deep(.tab-panel) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

.tab {
  :deep(.tab-header) {
    display: none;
  }
}

.weni-update-org__panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.separator {
  border: 1px solid $unnnic-color-neutral-soft;
  margin: $unnnic-spacing-stack-lg 0;
}

.weni-update-org {
  &__button {
    width: 100%;
    margin-top: $unnnic-spacing-stack-sm;
  }

  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }
}

.weni-delete-org {
  h2 {
    margin: 0;
    font-size: $unnnic-font-size-title-sm;
    color: $unnnic-color-neutral-black;
  }

  p {
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    margin-top: $unnnic-spacing-stack-xs;
    margin-bottom: $unnnic-spacing-stack-sm;
    color: $unnnic-color-neutral-dark;
  }

  &__button {
    color: $unnnic-color-feedback-red;
    width: 100%;
  }
}

.weni-update-org__title {
  display: flex;
  font-size: $unnnic-font-size-title-sm;
  font-weight: $unnnic-font-weight-bold;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-xs;
  color: $unnnic-color-neutral-black;

  .unnnic-tag {
    margin-left: $unnnic-spacing-stack-sm;
  }
}

.weni-update-org__description {
  font-size: $unnnic-font-size-body-gt;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  margin: 0;
  color: $unnnic-color-neutral-cloudy;
}

.weni-update-org__security {
  .unnnic-switch {
    margin-top: $unnnic-spacing-stack-md;
  }
}

.weni-update-org__sso-switch {
  margin-top: $unnnic-spacing-stack-md;

  .unnnic-switch {
    margin-top: 0;
  }
}

.weni-update-org__sso-helper {
  font-size: $unnnic-font-size-body-md;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  margin: $unnnic-spacing-stack-nano 0 0;
  padding-left: $unnnic-spacing-inline-md + $unnnic-spacing-inline-sm;
  color: $unnnic-color-neutral-cloudy;
}

.weni-update-org__sso-field {
  margin-top: $unnnic-spacing-stack-sm;
}

.weni-update-org__sso-domains {
  display: flex;
  flex-wrap: wrap;
  gap: $unnnic-spacing-stack-xs;
  margin-top: $unnnic-spacing-stack-sm;
}

.weni-update-org__footer {
  display: flex;
  justify-content: flex-end;
  column-gap: $unnnic-spacing-inline-sm;
  margin-top: auto;
  padding-top: $unnnic-spacing-stack-md;
  border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
}
</style>
