<template>
  <UnnnicTab
    :tabs="tabs"
    :activeTab="activeTab"
    class="settings-content"
  >
    <template slot="tab-panel-first">
      <h2 class="weni-update-org__title">{{ $t('orgs.change_name') }}</h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.change_name_description') }}
      </p>

      <div class="weni-update-org__separator"></div>

      <div class="weni-update-org">
        <UnnnicInput
          :label="$t('orgs.create.org_name')"
          v-model="formData.name"
        />
        <UnnnicInput
          :label="$t('orgs.create.org_description')"
          v-model="formData.description"
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

    <template slot="tab-panel-second">
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
        :textRight="$t('orgs.enable_2fa')"
        v-model="enable2FA"
      />

      <UnnnicButton
        @click="beforeUpdate2FAVerification"
        type="secondary"
        class="weni-update-org__button"
        :loading="loading2FA"
        :disabled="enable2FA === this.org.enforce_2fa"
      >
        {{ $t('orgs.save') }}
      </UnnnicButton>
    </template>
  </UnnnicTab>
</template>

<script>
import { mapActions } from 'vuex';
import account from '../../../api/account';
import { openAlertModal } from '../../../utils/openServerErrorAlertModal';
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
  data() {
    return {
      formData: {
        name: null,
        description: null,
      },

      enable2FA: null,

      tabs: ['first', 'second'],
      loading2FA: false,

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
      if (!this.formData.name || !this.formData.description) return true;

      return (
        this.formData.name === this.org.name &&
        this.formData.description === this.org.description
      );
    },
  },

  mounted() {
    const { name, description } = this.org;

    this.formData = { name, description };
    this.enable2FA = this.org.enforce_2fa;
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
            icon: 'alert-circle-1',
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

    showEnabledConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check_circle',
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
          icon: 'check_circle',
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
        this.$emit('reload-organizations');
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
          icon: 'check_circle',
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
          icon: 'alert-circle-1',
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
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.tab {
  ::v-deep .tab-header {
    display: none;
  }
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

.unnnic-switch {
  margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-xl;
}
</style>
