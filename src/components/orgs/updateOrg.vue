<template>
  <unnnic-tab
    :tabs="tabs"
    :active-tab="activeTab"
    @change="$emit('update:active-tab', $event)"
    class="settings-content"
  >
    <template slot="tab-panel-first">
      <h2 class="weni-update-org__title">{{ $t('orgs.change_name') }}</h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.change_name_description') }}
      </p>

      <div class="weni-update-org__separator"></div>

      <div class="weni-update-org">
        <unnnic-input
          :label="$t('orgs.create.org_name')"
          v-model="formData.name"
        />
        <unnnic-input
          :label="$t('orgs.create.org_description')"
          v-model="formData.description"
        />
        <unnnic-button
          :disabled="isSaveButtonDisabled()"
          class="weni-update-org__button"
          type="secondary"
          :loading="loading"
          @click="updateOrg"
        >
          {{ $t('orgs.save') }}
        </unnnic-button>
      </div>

      <div class="separator" />

      <div class="weni-delete-org">
        <h2>{{ $t('orgs.delete.title') }}</h2>
        <p>{{ $t('orgs.delete.description') }}</p>
        <unnnic-button
          type="secondary"
          class="weni-delete-org__button"
          @click="openDeleteConfirmation(org)"
        >
          {{ $t('orgs.delete.title') }}
        </unnnic-button>
      </div>
    </template>
    <template slot="tab-panel-second">
      <h2 class="weni-update-org__title">
        {{ $t('orgs.2fa_title') }}
        <unnnic-tag
          scheme="aux-baby-blue"
          :text="$t('orgs.recommended')"
          type="default"
        />
      </h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.2fa_description') }}
      </p>

      <unnnic-switch :textRight="$t('orgs.enable_2fa')" v-model="enable2FA" />

      <unnnic-button
        @click="beforeUpdate2FAVerification"
        type="secondary"
        class="weni-update-org__button"
        :loading="loading2FA"
      >
        {{ $t('orgs.save') }}
      </unnnic-button>
    </template>
  </unnnic-tab>
</template>

<script>
import { mapActions } from 'vuex';
import account from '../../api/account';
export default {
  name: 'UpdateOrg',

  props: {
    org: {
      type: Object,
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
      tabs: ['first', 'second'],
      enable2FA: true,
      loading2FA: false,

      loading: false,
    };
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
    isSaveButtonDisabled() {
      if (!this.formData.name || !this.formData.description) return true;
      return (
        this.formData.name === this.org.name &&
        this.formData.description === this.org.description
      );
    },
    async updateOrg() {
      const { name, description } = this.formData;
      this.loading = true;
      try {
        await this.editOrg({
          uuid: this.org.uuid,
          name,
          description,
        });
        this.showConfirmation();
        this.$emit('finish', { uuid: this.org.uuid, ...this.formData });
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
      let realEnforce2FA = this.org.enforce_2fa;

      this.loading2FA = true;
      try {
        const response = await account.updateAccount2FAStatus(
          this.enable2FA,
          this.org.uuid,
        );

        realEnforce2FA = response?.data?.['2fa_required'];

        if (realEnforce2FA) {
          this.showEnabledConfirmation();
        } else {
          this.showDisabledConfirmation();
        }

        this.$emit('finish2FA', this.enable2FA);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading2FA = true;
      }
    },

    showEnabledConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
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
          icon: 'check-circle-1-1',
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
      } catch (e) {
        this.openServerErrorAlertModal();
      }
    },

    showDeleteConfirmation(name) {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
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
