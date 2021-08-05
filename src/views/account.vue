<template>
  <div
    :class="{
      'unnnic-grid-giant': showPrimaryDesign,
      'weni-account': true,
      'unnnic-grid-xl': !showPrimaryDesign,
      'weni-account--simple': !showPrimaryDesign,
    }"
  >
    <div v-if="showPrimaryDesign" class="unnnic-grid-span-4 weni-account__card">
      <unnnic-card
        class="weni-account__card__item"
        type="account"
        icon="single-neutral-2"
        :title="$t('account.profile')"
        :description="$t('account.profile_text')"
      />
    </div>
    <div v-if="!showPrimaryDesign" class="unnnic-grid-span-2"></div>
    <div class="unnnic-grid-span-8">
      <div class="weni-account__header">
        <avatar :imageUrl="imageBackground" size="md" />
        <div class="weni-account__header__text">
          <div class="weni-account__header__text__title">
            {{ profile ? profile.first_name : '' }}
            {{ profile ? profile.last_name : '' }}
          </div>
          <div class="weni-account__header__text__subtitle">
            {{ profile ? `@${profile.username}` : '' }}
          </div>
        </div>
        <div class="weni-account__field__group">
          <unnnic-button
            v-if="imageBackground"
            :disabled="loadingPicture"
            size="small"
            type="terciary"
            icon-left="delete-1"
            @click="onDeletePicture()"
          >
            {{ $t('account.reset') }}
          </unnnic-button>
          <unnnic-button
            :disabled="loadingPicture"
            size="small"
            type="terciary"
            @click="onFileUpload()"
          >
            {{ $t('account.change_picture') }}
          </unnnic-button>
          <input
            ref="imageInput"
            :hidden="true"
            type="file"
            accept="image/*"
            @change="onChangePicture"
          />
        </div>
      </div>
      <div class="weni-account__header__info">
        <div class="weni-account__header__info__separator" />
        <div class="weni-account__header__info__separator__text">
          Images by Vecteezy
        </div>
      </div>
      <div class="weni-account__field">
        <unnnic-input
          v-for="field in formScheme"
          :key="field.key"
          v-model="formData[field.key]"
          :icon-left="field.icon"
          :type="errorFor(field.key) ? 'error' : 'normal'"
          :message="errorFor(field.key)"
          :label="$t(`account.fields.${field.key}`)"
        />
        <div class="weni-account__field__group">
          <unnnic-input
            v-model="formData['email']"
            icon-left="email-action-unread-1"
            :placeholder="$t('account.contact_placeholder')"
            :label="$t('account.fields.email')"
            :type="errorFor('email') ? 'error' : 'normal'"
            :message="errorFor('email')"
            disabled
          />
          <unnnic-input
            v-model="contact"
            icon-left="phone-3"
            :placeholder="$t('account.contact_placeholder')"
            :label="$t('account.fields.contact')"
            :type="errorFor('contact') ? 'error' : 'normal'"
            :message="errorFor('contact')"
            mask="+## (##) # ####-####"
          />
        </div>
        <div class="weni-account__field__group">
          <unnnic-input
            v-for="field in groupScheme"
            :key="field.key"
            :icon-left="field.icon"
            :type="errorFor(field.key) ? 'error' : 'normal'"
            :message="errorFor(field.key)"
            v-model="formData[field.key]"
            :label="$t(`account.fields.${field.key}`)"
            disabled
          />
          <unnnic-input
            v-model="password"
            icon-left="lock-2-1"
            :placeholder="$t('account.password_placeholder')"
            :label="$t('account.fields.password')"
            :type="errorFor('password') || error.password ? 'error' : 'normal'"
            :message="errorFor('password') || message(error.password)"
            native-type="password"
            toggle-password
            @input="error.password = ''"
          />
        </div>
      </div>
      <div class="weni-account__field__group">
        <unnnic-button
          type="secondary"
          :disabled="saveButtonIsDisabled()"
          :loading="loading"
          @click="onSave()"
        >
          {{ $t('account.save') }}
        </unnnic-button>
        <unnnic-button
          class="weni-account__danger"
          type="terciary"
          :disabled="isLoading"
          @click="onDeleteProfile()"
        >
          {{ $t('account.delete_account') }}
        </unnnic-button>
      </div>
    </div>

    <modal
      type="alert"
      v-model="isServerErrorAlertModalOpen"
      :data="serverErrorAlertModalData"
    />

    <modal
      type="confirm"
      v-model="isSaveChangesConfirmModalOpen"
      :data="saveChangesConfirmModalData"
    />

    <modal
      type="alert"
      v-model="isSavedChangesSuccessfullyAlertModalOpen"
      :data="savedChangesSuccessfullyAlertModalData"
    />

    <modal
      type="confirm"
      v-model="isFormatPictureInvalidConfirmModalOpen"
      :data="formatPictureInvalidConfirmModalData"
    />

    <modal
      type="confirm"
      v-model="isDeletePictureConfirmModalOpen"
      :data="deletePictureConfirmModalData"
    />

    <modal
      type="confirm"
      v-model="isDeleteProfileConfirmModalOpen"
      :data="deleteProfileConfirmModalData"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { unnnicCallAlert } from '@weni/unnnic-system';
import Modal from '../components/external/Modal.vue';
import account from '../api/account.js';
import Avatar from '../components/Avatar';
import SecurityService from '../services/SecurityService';
import _ from 'lodash';

export default {
  name: 'Account',
  components: {
    Avatar,
    Modal,
  },
  data() {
    return {
      loading: false,
      loadingPicture: false,
      loadingPassword: false,
      error: {},
      formScheme: [
        { key: 'first_name', icon: 'single-neutral-actions-1' },
        { key: 'last_name', icon: 'single-neutral-actions-1' },
        // { key: 'email', icon: 'email-action-unread-1' },
      ],
      groupScheme: [{ key: 'username', icon: 'read-email-at-1' }],
      formData: {
        email: '',
        first_name: '',
        last_name: '',
        username: '',
        photo: null,
      },
      contact: '',
      ddiContact: '',
      finalContact: '',
      password: '',
      confirmPassword: '',
      profile: null,
      picture: null,

      isServerErrorAlertModalOpen: false,
      serverErrorAlertModalData: {},

      isSaveChangesConfirmModalOpen: false,
      saveChangesConfirmModalData: {},

      isSavedChangesSuccessfullyAlertModalOpen: false,
      savedChangesSuccessfullyAlertModalData: {},

      isFormatPictureInvalidConfirmModalOpen: false,
      formatPictureInvalidConfirmModalData: {},

      isDeletePictureConfirmModalOpen: false,
      deletePictureConfirmModalData: {},

      isDeleteProfileConfirmModalOpen: false,
      deleteProfileConfirmModalData: {},
    };
  },
  watch: {
    contact() {
      let clearContact = this.contact.replace(/[^\d]/g, '');
      this.ddiContact = clearContact.substr(0, 2);
      this.finalContact = clearContact.slice(2);
    },
  },
  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    ...mapState({
      accountProfile: (state) => state.Account.profile,
    }),

    imageBackground() {
      return this.temporaryPicture || this.$store.state.Account.profile.photo;
    },
    isLoading() {
      return this.loading || this.loadingPassword;
    },
    temporaryPicture() {
      if (!this.picture) return null;
      return URL.createObjectURL(this.picture);
    },
    showPrimaryDesign() {
      return this.currentOrg && this.currentProject;
    },
  },
  created() {
    this.getProfile();
  },
  methods: {
    ...mapActions([
      'updateProfile',
      'updateProfilePicture',
      'removeProfilePicture',
    ]),

    openServerErrorAlertModal({
      type = 'warn',
      title = this.$t('alerts.server_problem.title'),
      description = this.$t('alerts.server_problem.description'),
    } = {}) {
      let icon = null;
      let scheme = null;

      if (type === 'warn') {
        icon = 'alert-circle-1';
        scheme = 'feedback-yellow';
      } else if (type === 'danger') {
        icon = 'alert-circle-1';
        scheme = 'feedback-red';
      }

      this.isServerErrorAlertModalOpen = true;

      this.serverErrorAlertModalData = {
        icon,
        scheme,
        title,
        description,
      };
    },

    errorFor(key) {
      const value = this.formData[key];

      if (['first_name', 'last_name'].includes(key)) {
        if (value.length < 2) {
          return this.$t('errors.min_characters', { characters: 2 });
        }
      }

      if (key === 'password') {
        if (this.password.length && this.password.length < 8) {
          return this.$t('errors.min_characters', { characters: 8 });
        }
      }

      if (key === 'email') {
        if (!this.rules.email.test(value)) {
          return this.$t('errors.invalid_email');
        }
      }

      if (key === 'contact') {
        if (!this.rules.contact.test(this.contact)) {
          return this.$t('errors.invalid_contact');
        }
      }

      return this.error[key];
    },

    changedFields() {
      const fields = [];

      if (this.temporaryPicture) {
        fields.push('picture');
      }

      [...this.formScheme] //...this.groupScheme
        .filter((item) => {
          if (!this.profile) return this.formData[item.key];
          return this.formData[item.key] !== this.profile[item.key];
        })
        .forEach((item) => fields.push(item.key));

      if (
        this.formData.short_phone_prefix != this.ddiContact ||
        this.formData.phone != this.finalContact
      ) {
        fields.push('contact');
      }
      return fields;
    },
    changedFieldNames() {
      const changedNames = this.changedFields();
      if (this.password && this.password.length !== 0) {
        changedNames.push('password');
      }
      return changedNames
        .map((key) => this.$t(`account.fields.${key}`))
        .join('<br>');
    },
    message(object) {
      if (Array.isArray(object)) return object.join(', ');
      return object;
    },
    onFileUpload() {
      this.$refs.imageInput.click();
    },
    saveButtonIsDisabled() {
      if (
        ['first_name', 'last_name', 'email', 'password', 'contact'].some(
          this.errorFor,
        )
      ) {
        return true;
      }

      if (this.loading) return true;
      if (this.changedFields().length !== 0) return false;
      if (this.password && this.password.length !== 0) return false;
      return true;
    },
    onSave() {
      this.isSaveChangesConfirmModalOpen = true;

      this.saveChangesConfirmModalData = {
        persistent: true,
        icon: 'alert-circle-1',
        scheme: 'feedback-yellow',
        title: this.$t('account.save'),
        description: `${this.$t(
          'account.save_confirm',
        )}<br/><br/><b>${this.changedFieldNames()}</b>`,
        cancelText: this.$t('cancel'),
        confirmText: this.$t('account.save'),
        onConfirm: async (justClose, { setLoading }) => {
          setLoading(true);
          await this.updateUserProfile();
          setLoading(false);

          this.isSaveChangesConfirmModalOpen = false;
        },
      };
    },
    async getProfile() {
      const response = {
        data: this.$store.state.Account.profile,
      };
      this.profile = { ...response.data };
      this.formData = { ...response.data };
      this.ddiContact = response.data.short_phone_prefix;
      this.contact = `+${response.data.short_phone_prefix} ${String(
        _.get(response, 'data.phone', ''),
      ).substr(0, 2)} ${String(_.get(response, 'data.phone', '')).slice(2)}`;
    },
    async updateUserProfile() {
      this.error = {};
      if (this.password) await this.updatePassword();

      const fields = this.changedFields();

      if (fields.length === 0) {
        return false;
      }

      this.loading = true;
      if (fields.length === 0) return;
      const data = fields.reduce((object, key) => {
        if (key === 'picture') {
          return object;
        }

        if (key === 'contact') {
          object.short_phone_prefix = Number(this.ddiContact);
          object.phone = Number(this.finalContact);
          return object;
        }

        object[key] = this.formData[key];
        return object;
      }, {});
      try {
        if (fields.includes('picture')) {
          await this.updatePicture();
        }

        if (!_.isEmpty(data)) {
          await this.updateProfile(data);

          const {
            first_name,
            last_name,
            email,
            username,
            short_phone_prefix,
            phone,
          } = this.accountProfile;

          this.formData.first_name = first_name;
          this.formData.last_name = last_name;
          this.formData.email = email;
          this.formData.username = username;
          this.contact = `+${short_phone_prefix} ${
            phone ? String(phone).substr(0, 2) : ''
          } ${phone ? String(phone).slice(2) : ''}`;

          this.profile = this.accountProfile;
        }

        this.isSavedChangesSuccessfullyAlertModalOpen = true;

        this.savedChangesSuccessfullyAlertModalData = {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('saved_successfully'),
          description: this.$t('account.updated'),
        };
      } catch (e) {
        const Unsupported_Media_Type = 415;

        const detail = _.get(e, 'response.data.detail');
        const status = _.get(e, 'response.status');

        if (detail && status === Unsupported_Media_Type) {
          this.isFormatPictureInvalidConfirmModalOpen = true;

          this.formatPictureInvalidConfirmModalData = {
            persistent: true,
            icon: 'alert-circle-1',
            scheme: 'feedback-red',
            title: this.$t('account.picture_format_invalid'),
            description: detail,
            cancelText: this.$t('cancel'),
            confirmText: this.$t('account.picture_send_another'),
            onConfirm: () => {
              this.isFormatPictureInvalidConfirmModalOpen = false;
              this.onFileUpload();
            },
          };
        } else if (detail) {
          this.openServerErrorAlertModal({
            type: 'danger',
            description: detail,
          });
        } else {
          this.openServerErrorAlertModal();
        }
      } finally {
        this.loading = false;
      }
    },
    async updatePicture() {
      if (!this.picture) return;
      this.loadingPicture = true;
      try {
        await this.updateProfilePicture({ file: this.picture });
      } finally {
        this.picture = null;
        this.loadingPicture = false;
      }
    },
    async updatePassword() {
      this.loadingPassword = true;
      try {
        await account.updatePassword(this.password);
        this.password = '';
        this.onSuccess({
          text: this.$t('account.password_update_success'),
        });
      } catch (error) {
        this.error = { ...this.error, ...error.response.data };

        if (_.get(this.error, 'password.length')) {
          this.error.password = _.get(this.error, 'password.0');
        }

        this.onError({
          text: this.$t('account.password_update_error'),
        });
      } finally {
        this.loadingPassword = false;
      }
    },
    onSuccess({ title = '', text }) {
      unnnicCallAlert({
        props: {
          text,
          title,
          scheme: 'feedback-green',
          icon: 'check-circle-1-1-1',
          position: 'bottom-right',
          closeText: this.$t('close'),
        },
        seconds: 3,
      });
    },
    onError({ title = '', text, scheme = 'feedback-red' }) {
      unnnicCallAlert({
        props: {
          text,
          title,
          icon: 'alert-circle-1-1',
          scheme,
          position: 'bottom-right',
          closeText: this.$t('close'),
        },
        seconds: 3,
      });
    },
    onChangePicture(element) {
      const file = element.target.files[0];
      this.picture = file;
    },
    onDeletePicture() {
      this.isDeletePictureConfirmModalOpen = true;

      this.deletePictureConfirmModalData = {
        persistent: true,
        icon: 'alert-circle-1',
        scheme: 'feedback-yellow',
        title: this.$t('account.reset'),
        description: this.$t('account.reset_confirm'),
        cancelText: this.$t('cancel'),
        confirmText: this.$t('account.reset_picture'),
        onConfirm: async (justClose, { setLoading }) => {
          setLoading(true);
          await this.deletePicture();
          setLoading(false);

          this.isDeletePictureConfirmModalOpen = false;
        },
      };
    },
    onDeleteProfile() {
      this.isDeleteProfileConfirmModalOpen = true;

      this.deleteProfileConfirmModalData = {
        persistent: true,
        icon: 'alert-circle-1',
        scheme: 'feedback-red',
        title: this.$t('account.delete_account'),
        description: this.$t('account.delete_account_confirm'),
        validate: {
          label: this.$t('account.confirm_with_username', {
            username: this.profile.username,
          }),
          placeholder: this.$t('account.confirm_with_username_placeholder'),
          text: this.profile.username,
        },
        cancelText: this.$t('cancel'),
        confirmText: this.$t('account.delete_account'),
        onConfirm: async (justClose, { setLoading }) => {
          setLoading(true);
          await this.deleteProfile();
          setLoading(false);

          this.isDeleteProfileConfirmModalOpen = false;
        },
      };
    },
    async deleteProfile() {
      this.loading = true;
      const confirmPassword = this.confirmPassword;
      this.confirmPassword = null;
      try {
        await account.deleteProfile(confirmPassword);
        SecurityService.signOut();
      } catch (e) {
        this.onError({
          text: this.$t('account.delete_account_error'),
        });
      } finally {
        this.loading = false;
      }
    },
    async deletePicture() {
      this.loadingPicture = true;
      try {
        await this.removeProfilePicture();
        this.picture = null;
        this.onSuccess({
          text: this.$t('account.delete_picture_success'),
        });
      } catch (e) {
        this.openServerErrorAlertModal();
      } finally {
        this.loadingPicture = false;
      }
    },
  },
};
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-alert-button {
  background-color: $unnnic-color-feedback-yellow;
  color: $unnnic-color-neutral-snow;
}

.weni-account {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;

  &__card {
    border-right: 2px $unnnic-color-neutral-soft solid;
    padding-right: 16px;

    &__item {
      box-shadow: none !important;
    }
  }

  &--simple.unnnic-grid-xl {
    padding: 1.5rem 0 0 0;
    width: 100%;
    max-width: 1140px;
    margin: 0 auto;
  }

  &__modal {
    &__field {
      text-align: left;
      margin-top: $unnnic-spacing-stack-giant;
    }
  }

  &__field {
    margin-bottom: $unnnic-spacing-stack-md !important;
    &__group {
      display: flex;

      button {
        width: 100%;
      }

      > * {
        flex: 1;
      }

      > :not(:last-child) {
        margin-right: 1rem;
      }
    }
  }

  &__danger {
    color: $unnnic-color-feedback-red !important;
  }

  &__header {
    display: flex;
    font-family: $unnnic-font-family-primary;
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-squish-lg;
    background: url('../assets/banner/banner_1.svg');
    overflow: hidden;
    align-items: center;

    button {
      background-color: $unnnic-color-background-snow;
    }

    &__text {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      &__title {
        font-size: $unnnic-font-size-title-sm;
      }
      &__subtitle {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        color: $unnnic-color-neutral-dark;
      }
    }

    &__info {
      display: flex;
      align-items: center;
      color: $unnnic-color-neutral-clean;
      font-size: $unnnic-font-size-body-sm;
      margin: $unnnic-spacing-stack-sm 0 0 0;
      &__separator {
        flex: 1;
        border: 1px solid $unnnic-color-neutral-soft;
        margin-right: $unnnic-inline-nano;

        &__text {
          line-height: $unnnic-font-size-body-sm + $unnnic-line-height-medium;
        }
      }
    }
  }
}
</style>
