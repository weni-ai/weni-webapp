<template>
  <section class="profile-preferences">
    <main>
      <header class="profile-preferences__header">
        <h1 class="profile-preferences__title">
          {{ $t('account.preferences.mail.title') }}
        </h1>
      </header>

      <section class="profile-preferences__content">
        <p class="profile-preferences__label">
          {{ $t('account.preferences.mail.description') }}
        </p>

        <div class="profile-preferences__divider" />

        <section class="profile-preferences__options">
          <unnnic-switch
            v-model="receiveOrganization"
            :textRight="$t('account.preferences.mail.organization')"
          />

          <unnnic-switch
            v-model="receiveProject"
            :textRight="$t('account.preferences.mail.project')"
          />
        </section>
      </section>
    </main>

    <unnnic-button
      :text="$t('save_changes')"
      type="secondary"
      @click="updateMailStatus"
      :loading="saving"
    />
  </section>
</template>

<script>
import { unnnicCallAlert } from '@weni/unnnic-system';
import { mapGetters } from 'vuex';
import account from '../../api/account';

export default {
  name: 'AccountPreferences',

  data: () => ({
    saving: false,
    receiveOrganization: true,
    receiveProject: true,
  }),

  computed: {
    ...mapGetters(['user']),
  },

  mounted() {
    if (Object.keys(this.user.send_email_setup).length > 0) {
      this.receiveOrganization =
        this.user.send_email_setup.receive_organization_emails;
      this.receiveProject = this.user.send_email_setup.receive_project_emails;
    }
  },

  methods: {
    async updateMailStatus() {
      try {
        this.saving = true;
        await account.updateMailReceipt(
          this.receiveOrganization,
          this.receiveProject,
        );

        unnnicCallAlert({
          props: {
            title: this.$t('orgs.saved_changes'),
            icon: 'check-circle-1-1-1',
            scheme: 'feedback-green',
            closeText: this.$t('close'),
            position: 'top-right',
          },
          seconds: 5,
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.$store.state.Account.profile.send_email_setup.receive_organization_emails =
          this.receiveOrganization;
        this.$store.state.Account.profile.send_email_setup.receive_project_emails =
          this.receiveProject;
        this.saving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.profile-preferences {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-stack-xl;

  &__header {
    font-family: $unnnic-font-family-primary;
    margin-bottom: $unnnic-spacing-inline-ant;
  }

  &__title {
    margin: 0;
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-line-height-md + $unnnic-font-size-title-md;
    color: $unnnic-color-neutral-black;
  }

  &__content {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-family: $unnnic-font-size-body-lg;
    color: $unnnic-color-neutral-cloudy;
    margin: 0;
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-stack-sm;
  }

  &__divider {
    border-top: 1px solid #d0d3d9;
    margin: $unnnic-spacing-stack-sm 0 $unnnic-spacing-stack-lg;
  }
}
</style>
