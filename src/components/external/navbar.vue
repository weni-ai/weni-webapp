<template>
  <div
    v-if="['normal', 'secondary'].includes(theme)"
    :class="['weni-navbar', `weni-navbar--theme-${theme}`]"
  >
    <unnnic-autocomplete
      v-if="theme == 'normal'"
      :placeholder="$t(placeholder)"
      size="sm"
      class="weni-navbar__search"
      icon-left="search-1"
      v-model="search"
      :data="items"
      @input="onSearch"
      highlight
      @choose="chooseOption"
    />

    <project-select
      v-if="theme == 'normal' && currentOrg"
      :key="orgUpdate"
      class="weni-navbar__select"
      :org="currentOrg"
    />
    <a class="weni-navbar__item" @click="$router.push('/help/index')">
      <unnnic-tool-tip
        class=""
        :text="$t('NAVBAR.HELP')"
        side="bottom"
        :enabled="true"
      >
        <unnnic-icon-svg
          v-if="theme == 'normal'"
          icon="question-circle-1"
          scheme="neutral-dark"
          class="weni-navbar__item-icon"
        />
      </unnnic-tool-tip>
    </a>
    <div
      v-if="theme == 'secondary'"
      class="weni-navbar__logo unnnic--clickable"
    >
      <router-link to="/orgs/list">
        <img src="../../assets/brand-name.svg" />
      </router-link>
    </div>

    <unnnic-language-select
      v-if="theme == 'secondary'"
      :value="language"
      @input="changeLanguage"
      class="language-select"
      position="bottom"
    ></unnnic-language-select>

    <unnnic-dropdown position="bottom-left" :open.sync="dropdownOpen">
      <div
        :style="imageBackground"
        class="weni-navbar__icon unnnic--clickable"
        :clickable="true"
        slot="trigger"
      >
        <unnnic-icon-svg
          v-if="!imageBackground"
          icon="default-avatar"
        ></unnnic-icon-svg>
      </div>

      <div class="dropdown-content">
        <template v-for="(option, index) in filterOptions(options)">
          <router-link
            v-if="option.href"
            :key="index"
            :to="option.href"
            @click.stop.native="closeAccountMenu"
          >
            <div :class="['option', option.scheme]">
              <unnnic-icon-svg
                size="sm"
                :icon="option.icon"
                class="icon-left"
                :scheme="option.scheme"
              />

              <div class="label">{{ $t(option.name) }}</div>
            </div>
          </router-link>

          <a v-else :key="index" href="#" @click.stop.prevent="option.click">
            <div :class="['option', option.scheme]">
              <unnnic-icon-svg
                size="sm"
                :icon="option.icon"
                class="icon-left"
                :scheme="option.scheme"
              />

              <div class="label">{{ $t(option.name) }}</div>
            </div>
          </a>

          <div
            v-if="index !== filterOptions(options).length - 1"
            :key="`divider-${index}`"
            class="divider"
          />
        </template>
      </div>
    </unnnic-dropdown>

    <modal type="confirm" v-model="isLogoutModalOpen" :data="logoutModalData" />
  </div>
</template>

<script>
import ProjectSelect from './ProjectSelect';
import Modal from './Modal.vue';
import projects from '../../api/projects';
import SecurityService from '../../services/SecurityService';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Navbar',
  components: {
    ProjectSelect,
    Modal,
  },
  props: {
    update: {
      type: String,
      default: null,
    },
    orgUpdate: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      dropdownOpen: false,
      search: '',
      items: [],
      activeSearch: null,
      loading: false,

      options: [
        {
          requireLogged: true,
          icon: 'single-neutral-actions-1',
          scheme: 'neutral-dark',
          name: 'NAVBAR.ACCOUNT',
          href: '/account/edit',
        },
        {
          requireLogged: true,
          icon: 'button-refresh-arrows-1',
          scheme: 'neutral-dark',
          name: 'NAVBAR.CHANGE_ORG',
          href: '/orgs/list',
        },
        {
          requireLogged: true,
          icon: 'logout-1-1',
          scheme: 'feedback-red',
          name: 'NAVBAR.LOGOUT',
          click: () => {
            this.isLogoutModalOpen = true;

            this.logoutModalData = {
              icon: 'logout-1-1',
              scheme: 'feedback-red',
              title: this.$t('NAVBAR.LOGOUT'),
              description: this.$t('NAVBAR.LOGOUT_MESSAGE'),
              cancelText: this.$t('NAVBAR.CANCEL'),
              confirmText: this.$t('NAVBAR.LOGOUT'),
              onConfirm: (justClose) => {
                justClose();
                this.logout();
              },
            };

            this.closeAccountMenu();
          },
        },
        {
          requireLogged: false,
          icon: 'single-neutral-actions-1',
          scheme: 'neutral-dark',
          name: 'NAVBAR.LOGIN',
          click: () => {
            this.login();
            this.closeAccountMenu();
          },
        },
      ],

      isLogoutModalOpen: false,
      logoutModalData: {},
    };
  },

  watch: {
    loading() {
      if (this.loading) {
        this.items = [];
        this.items.push({
          type: 'category',
          text: this.$t('NAVBAR.LOADING'),
        });
      }
    },
  },
  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    language() {
      return this.$i18n.locale;
    },

    imageBackground() {
      if (
        !(
          this.$store.state.Account.profile &&
          this.$store.state.Account.profile.photo
        )
      )
        return null;
      return `background-image: url('${this.$store.state.Account.profile.photo}')`;
    },
    placeholder() {
      return 'NAVBAR.SEARCH_PLACEHOLDER';
    },
  },
  methods: {
    ...mapActions(['updateAccountLanguage']),

    changeLanguage(language) {
      this.updateAccountLanguage({ language });
    },

    closeAccountMenu() {
      this.dropdownOpen = false;
    },

    onSearch() {
      if (!this.search) {
        this.items = [];
        return false;
      }

      this.loading = true;

      if (this.activeSearch) {
        clearTimeout(this.activeSearch);
      }

      this.activeSearch = setTimeout(async () => {
        try {
          const response = await projects.search(
            null,
            this.currentProject.uuid,
            this.search,
          );

          const { data } = response;

          this.items = [];

          if (data.inteligence.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('SIDEBAR.BH'),
            });

            data.inteligence
              .map((item) => ({
                type: 'option',
                text: item.inteligence_name,
                value: {
                  ...item, // { inteligence_uuid: String, inteligence_name: String, inteligence_owner: String, inteligence_slug: String, }
                  href: `/systems/bothub/${item.inteligence_owner}/${item.inteligence_slug}`,
                },
              }))
              .forEach((item) => this.items.push(item));
          }

          if (data.flow.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('SIDEBAR.PUSH'),
            });

            data.flow
              .map((item) => ({
                type: 'option',
                text: item.flow_name,
                value: {
                  ...item, // { "flow_uuid": String, "flow_name": String }
                  href: `/systems/push/${item.flow_uuid}`,
                },
              }))
              .forEach((item) => this.items.push(item));
          }

          if (this.items.length === 0) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.$t('NAVBAR.NO_RESULTS'),
            });
          }
        } catch (e) {
          console.log(e);
        }
      }, 300);
    },

    chooseOption(value) {
      if (value.href) {
        this.$router.push(value.href);
      }
    },

    login() {
      /* verify if it is needed: what pages account dropdown should appear? */
    },
    logout() {
      SecurityService.signOut();
    },
    isLogged() {
      return true;
    },

    filterOptions(options) {
      return options.filter(
        (option) => option.requireLogged === !!this.isLogged(),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-navbar ::v-deep .unnnic-dropdown__content {
  min-width: 10rem;
  padding: 0;
  overflow: hidden;
}

.dropdown-content {
  // background-color: $unnnic-color-background-snow;
  // border-radius: $unnnic-border-radius-sm;
  // box-shadow: $unnnic-shadow-level-near;
  // min-width: 9rem;
  // overflow: hidden;

  a {
    text-decoration: none;
  }

  .divider {
    margin: $unnnic-spacing-stack-xs $unnnic-spacing-inline-sm;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-background-sky;
  }

  .option {
    background-color: $unnnic-color-background-snow;
    padding: $unnnic-squish-nano;
    display: flex;
    align-items: center;

    .icon-left {
      margin-right: $unnnic-spacing-inline-xs;
    }

    .label {
      flex: 1;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
      color: $unnnic-color-neutral-dark;
    }

    &.neutral-dark .label {
      color: $unnnic-color-neutral-dark;
    }

    &.feedback-red .label {
      color: $unnnic-color-feedback-red;
    }
  }
}
</style>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';

.weni-navbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  * {
    z-index: 1;
  }

  &--theme {
    &-normal {
      background-color: $unnnic-color-neutral-lightest;
      padding: $unnnic-inset-md $unnnic-inset-md $unnnic-inset-md 0;
    }

    &-secondary {
      background-color: $unnnic-color-neutral-snow;
      padding: $unnnic-inset-md;
    }
  }

  &__logo {
    height: $unnnic-inset-md;
    flex: 1;
    img {
      height: 100%;
    }
  }

  &__search {
    margin: 0 $unnnic-inline-sm 0 0;
    flex: 1;
  }

  .language-select {
    width: 12.5rem;
    margin-right: $unnnic-inline-md;
  }

  &__select {
    z-index: 0;
    margin: 0 $unnnic-inline-md 0 0;
  }

  &__item {
    cursor: pointer;
    margin-right: $unnnic-inline-md;
  }

  &__dropdown {
    text-align: center;
    white-space: nowrap;
    display: flex;
    align-items: center;

    &__icon {
      margin-right: $unnnic-inline-xs;
    }
  }

  &__icon {
    width: $unnnic-avatar-size-sm;
    height: $unnnic-avatar-size-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: $unnnic-color-background-snow;
    color: $unnnic-color-neutral-clean;
    background-size: cover;
  }

  &__logout {
    color: $unnnic-color-feedback-red !important;
  }
}

.weni-button-danger {
  background-color: $unnnic-color-feedback-red !important;
  color: $unnnic-color-neutral-snow !important;
}
</style>
