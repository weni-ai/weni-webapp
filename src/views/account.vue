<template>
  <div :class="{ 
    'unnnic-grid-giant': showPrimaryDesign,
    'weni-account': true,
    'weni-account--simple': !showPrimaryDesign }">
    <div v-if="showPrimaryDesign" class="unnnic-grid-span-4 weni-account__card">
      <unnnic-card class="weni-account__card__item"
        type="account"
        icon="single-neutral-2"
        :title="$t('account.profile')"
        :description="$t('account.profile_text')" />
    </div>
    <div :class="{'unnnic-grid-span-8': showPrimaryDesign}">
        <div class="weni-account__header">
            <avatar :imageUrl="imageBackground" size="md" />
            <div class="weni-account__header__text">
                <div class="weni-account__header__text__title"> 
                  {{ profile ? profile.first_name : '' }} {{ profile ? profile.last_name : '' }}
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
                  @click="onDeletePicture()" >
                  {{ $t('account.reset') }}
                </unnnic-button>
                <unnnic-button
                  :disabled="loadingPicture"
                  size="small"
                  type="terciary"
                  @click="onFileUpload()">
                  {{ $t('account.change_picture') }}
                </unnnic-button>
                <input
                  ref="imageInput"
                  :hidden="true"
                  type="file"
                  accept="image/*"
                  @change="onChangePicture">
            </div>
        </div>
        <div class="weni-account__header__info"> 
            <div class="weni-account__header__info__separator" /> 
            <div class="weni-account__header__info__separator__text"> Images by Vecteezy </div> 
        </div>
        <div class="weni-account__field">
            <unnnic-input
              v-for="field in formScheme"
              :key="field.key"
              v-model="formData[field.key]"
              :icon-left="field.icon"
              :type="error[field.key] ? 'error' : 'normal'"
              :message="error[field.key]"
              :label="$t(`account.fields.${field.key}`)" />
            <div class="weni-account__field__group">
              <unnnic-input
              v-for="field in groupScheme"
              :key="field.key" :icon-left="field.icon"
              :type="error[field.key] ? 'error' : 'normal'"
              :message="error[field.key]"
              v-model="formData[field.key]"
              :label="$t(`account.fields.${field.key}`)" />
              <unnnic-input
                v-model="password"
                icon-left="lock-2-1"
                :placeholder="$t('account.password_placeholder')"
                :label="$t('account.fields.password')"
                :type="error.password ? 'error' : 'normal'"
                :message="message(error.password)"
                native-type="password"
                toggle-password />
            </div>
        </div>
        <div class="weni-account__field__group">
            <unnnic-button
              type="secondary"
              :disabled="saveButtonIsDisabled()" 
              @click="onSave()"
            > 
              {{ $t('account.save') }} 
            </unnnic-button>
            <unnnic-button
              class="weni-account__danger"
              type="terciary"
              :disabled="isLoading"
              @click="onDeleteProfile()">
              {{ $t('account.delete_account') }}
            </unnnic-button>
        </div>
    </div>
    <unnnic-modal
      :show-modal="modal.open"
      :text="modal.title"
      closeIcon
      modal-icon="alert-circle-1"
      :scheme="modal.scheme || 'feedback-yellow'"
      @close="modal.open = false">
        <div v-html="modal.text" slot="message" />
        <div
          v-if="modal.requirePassword"
          class="weni-account__modal__field"
          slot="message">
          <unnnic-input
            :placeholder="$t('account.confirm_with_username_placeholder')"
            v-model="confirmPassword"
          >
            <span
              slot="label"
              v-html="$t('account.confirm_with_username', { username: profile.username })"
            />
          </unnnic-input>
        </div>
        <unnnic-button
          type="terciary"
          slot="options"
          @click="modal.open = false">
          {{ $t('account.cancel') }}
        </unnnic-button>
        <unnnic-button
          :class="modal.confirmButtonClass"
          type="primary"
          slot="options"
          :disabled="modal.requirePassword && confirmPassword !== profile.username"
          @click="modal.onConfirm()">
            {{ modal.confirmText }}
          </unnnic-button>
    </unnnic-modal>
  </div>
</template>

<script>
import { unnnicCard, unnnicInput, unnnicButton, unnnicModal, unnnicCallAlert } from '@weni/unnnic-system';
import account from '../api/account.js';
import Avatar from '../components/Avatar';

export default {
  name: 'Account',
  components: {
    unnnicCard,
    unnnicInput,
    unnnicButton,
    Avatar,
    unnnicModal,
  },
  data() {
    return {
      loading: false,
      loadingPicture: false,
      loadingPassword: false,
      showSaveModal: false,
      error: {},
      formScheme: [
        { key: 'first_name', icon: 'single-neutral-actions-1' },
        { key: 'last_name', icon: 'single-neutral-actions-1' },
        { key: 'email', icon: 'email-action-unread-1' },
      ],
      groupScheme: [
        { key: 'username', icon: 'read-email-at-1' },
      ],
      formData: {
        email: '',
        first_name: '',
        last_name: '',
        username: '',
        photo: null,
      },
      password: null,
      confirmPassword: '',
      profile: null,
      picture: null,
      modal: {
        open: false,
        requirePassword: false,
        scheme: 'feedback-red',
        title: '',
        text: '',
        onConfirm: () => {},
        confirmText: '',
      },
    };
  },
  computed: {
    imageBackground() {
      return this.temporaryPicture || this.formData.photo;
    },
    isLoading() {
      return this.loading || this.loadingPassword;
    },
    temporaryPicture() {
      if (!this.picture) return null;
      return URL.createObjectURL(this.picture);
    },
    showPrimaryDesign() {
      const org = window.localStorage.getItem('org');
      const project = window.localStorage.getItem('_project');

      return org && project;
    }
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    onPictureChange() {
      this.luigiClient.sendCustomMessage({id: 'profile-update'});
    },
    changedFields() {
      return [ ...this.formScheme, ...this.groupScheme ]
      .filter((item) => {
        if (!this.profile) return this.formData[item.key];
        return this.formData[item.key] !== this.profile[item.key]
      }).map((item) => item.key);
    },
    changedFieldNames() {
      const changedNames = this.changedFields();
      if(this.password && this.password.length !== 0) { changedNames.push('password') }
      return changedNames.map((key) => this.$t(`account.fields.${key}`)).join('<br>');
    },
    message(object) {
      if (Array.isArray(object)) return object.join(', ');
      return object;
    },
    onFileUpload() {
      this.$refs.imageInput.click();
    },
    saveButtonIsDisabled() {
      if (this.loading) return true;
      if(this.changedFields().length !== 0) return false;
      if (this.password && this.password.length !== 0) return false;
      return true;
    },
    onSave() {
      this.modal = {
        open: true,
        title: this.$t('account.save'),
        text: `${this.$t('account.save_confirm')} <br> ${this.changedFieldNames()}` ,
        confirmText: this.$t('account.save'),
        onConfirm: () => {
          this.updateProfile()
        },
      }
    },
    async getProfile() {
      try {
        const response = {
          data: JSON.parse(localStorage.getItem('user')),
        }
        this.profile = { ...response.data };
        this.formData = { ...response.data };
      } catch(e) {
        this.onError({
          text: this.$t('account.profile_error'),
        });
      }
    },
    async updateProfile() {
      this.error = {};
      this.modal.open = false;
      if (this.password) this.updatePassword();
      this.loading = true;
      const fields = this.changedFields();
      if (fields.length === 0) return
      const data = fields.reduce((object, key) => { 
        object[key] = this.formData[key]; 
        return object; 
      }, {});
      try {
        const response = await account.updateProfile(data);
        this.profile = response.data;
        window.localStorage.setItem('user', JSON.stringify(this.profile));
        this.onSuccess({
          text: this.$t('account.profile_update_success'),
        });
      } catch(e) {
        this.onError({
          text: this.$t('account.profile_update_error'),
        });
      } finally {
        this.loading = false;
      }
    },
    async updatePicture() {
      if (!this.picture) return;
      this.loadingPicture = true;
      try {
        await account.updatePicture(this.picture);
        this.formData.photo = URL.createObjectURL(this.picture);
        this.onPictureChange();
        this.onSuccess({
          text: this.$t('account.picture_update_success'),
        });
      } catch(e) {
        this.onError({
          text: this.$t('problem_server_try_again'),
          scheme: 'feedback-yellow',
        });
      } finally {
        this.picture = null;
        this.loadingPicture = false;
      }
    },
    async updatePassword() {
      this.loadingPassword = true;
      try {
        await account.updatePassword(this.password);
        this.password = null;
        this.onSuccess({
          text: this.$t('account.password_update_success'),
        });
      } catch(error) {
        this.error = { ...this.error, ...error.response.data }
        this.onError({
          text: this.$t('account.password_update_error'),
        });
      } finally {
        this.loadingPassword = false;
      }
    },
    onSuccess({ title = '', text }) {
      unnnicCallAlert({ props: {
        version: '1.1',
        text,
        title,
        scheme: 'feedback-green',
        icon: 'alert-circle-1-1',
        position: 'bottom-right',
        closeText: this.$t('close'),
      }, seconds: 3 });
    },
    onError({ title = '', text, scheme = 'feedback-red' }) {
      unnnicCallAlert({ props: {
        version: '1.1',
        text,
        title,
        icon: 'alert-circle-1-1',
        scheme,
        position: 'bottom-right',
        closeText: this.$t('close'),
      }, seconds: 3 });
    },
    onChangePicture(element) {
      const file = element.target.files[0];
      this.picture = file;
      this.updatePicture();
    },
    onDeletePicture() {
      this.modal = {
        open: true,
        title: this.$t('account.reset'),
        text: this.$t('account.reset_confirm'),
        confirmText: this.$t('account.reset'),
        confirmButtonClass: 'weni-alert-button',
        onConfirm: () => {
          this.modal.open = false;
          this.deletePicture()
        },
      };
    },
    onDeleteProfile() {
      this.confirmPassword = null;
      this.modal = {
        open: true,
        title: this.$t('account.delete_account'),
        text: this.$t('account.delete_account_confirm'),
        confirmText: this.$t('account.delete_account'),
        requirePassword: true,
        scheme: 'feedback-red',
        onConfirm: () => {
          this.modal.open = false;
          this.deleteProfile();
        },
      };
    },
    async deleteProfile() {
      this.modal.open = false;
      this.loading = true;
      const confirmPassword = this.confirmPassword;
      this.confirmPassword = null;
      try {
        await account.deleteProfile(confirmPassword);
        window.parent.Luigi.auth().logout();
      } catch(e) {
        this.onError({
          text: this.$t('account.delete_account_error')
        });
      } finally {
        this.loading = false;
      }
    },
    async deletePicture() {
      this.modal.open = false;
      this.loadingPicture = true;
      try {
        await account.removePicture();
        this.formData.photo = null;
        this.picture = null;
        this.onPictureChange();
        this.onSuccess({
          text: this.$t('account.delete_picture_success'),
        });
      } catch(e) {
        this.onError({
          text: this.$t('account.delete_picture_error'),
        });
      } finally {
        this.loadingPicture = false;
      }
    },
  }
}
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

        &--simple {
          max-width: 700px;
          margin: auto;
          min-height: auto;
          padding: 1.5rem 1rem 0 1rem;
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
                align-items: center;

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