<template>
  <div
    v-if="['normal', 'secondary'].includes(theme)"
    :class="['weni-navbar', `weni-navbar--theme-${theme}`]"
  >
    <div v-if="theme == 'normal'" class="greetings">
      <img
        src="../../assets/emoji/waving-hand_1f44b_20x20.png"
        alt="Waving Hand Emoji"
        class="emoji"
      />

      <div class="u font title-sm color-neutral-darkest">
        {{
          $t('home.welcome_user', {
            user: profileFirstName,
          })
        }}
      </div>
    </div>

    <div
      v-if="theme == 'secondary'"
      class="weni-navbar__logo unnnic--clickable"
    >
      <router-link to="/orgs">
        <img src="../../assets/brand-name.svg" />
      </router-link>
    </div>

    <div :style="{ display: 'flex', alignItems: 'center' }">
      <project-select
        v-if="theme == 'normal' && currentOrg"
        :key="orgUpdate"
        class="weni-navbar__select"
        :org="currentOrg"
      />

      <warning-trial-chip />

      <unnnic-language-select
        v-if="theme == 'secondary'"
        :value="language"
        @input="changeLanguage"
        class="language-select"
        position="bottom"
        :supported-languages="['pt-br', 'en', 'es']"
      ></unnnic-language-select>

      <unnnic-dropdown :open.sync="academyToolip" class="libraries">
        <div slot="trigger">
          <unnnic-tool-tip
            :enabled="!academyToolip"
            :text="$t('NAVBAR.LEARN.TITLE')"
            side="left"
            maxWidth="15rem"
          >
            <unnnic-icon-svg
              v-if="theme == 'normal' || theme === 'secondary'"
              icon="book-library-1"
              enabled
              :scheme="theme === 'normal' ? 'neutral-dark' : 'neutral-darkest'"
              :class="
                theme === 'normal'
                  ? 'weni-navbar__item'
                  : 'weni-navbar__academy'
              "
            />
          </unnnic-tool-tip>
        </div>

        <unnnic-dropdown-item class="weni-navbar__dropdown-academy">
          <a
            @click="
              $router.push({
                name: 'academy',
                params: {
                  internal: ['init'],
                },
              })
            "
            class="unnnic--clickable"
          >
            <strong>Academy</strong>
            <p>{{ $t('NAVBAR.LEARN.WENI_ACADEMY') }}</p>
          </a>
        </unnnic-dropdown-item>
        <unnnic-dropdown-item class="weni-navbar__dropdown-academy">
          <a href="https://docs.weni.ai/" target="_blank">
            <strong>Docs</strong>
            <p>{{ $t('NAVBAR.LEARN.WENI_DOCS') }}</p>
          </a>
        </unnnic-dropdown-item>

        <unnnic-dropdown-item class="weni-navbar__dropdown-academy">
          <a
            href="https://comunidade.weni.ai/"
            target="_blank"
            :style="{ display: 'block' }"
          >
            <strong>{{ $t('weni_community.title') }}</strong>
            <p>{{ $t('weni_community.description') }}</p>
          </a>
        </unnnic-dropdown-item>

        <unnnic-dropdown-item>
          <router-link
            :to="{
              name: 'apiFlows',
              params: {
                internal: ['index'],
              },
            }"
          >
            <strong>API's</strong>
            <p>{{ $t('NAVBAR.LEARN.weni_APIs') }}</p>
          </router-link>
        </unnnic-dropdown-item>
      </unnnic-dropdown>

      <a
        class="weni-navbar__item"
        @click="
          $router.push({
            name: 'help',
            params: { projectUuid: currentProject.uuid },
          })
        "
      >
        <unnnic-tool-tip
          class=""
          :text="$t('NAVBAR.HELP')"
          side="left"
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

      <a
        v-if="['normal', 'secondary'].includes(theme)"
        class="weni-navbar__item"
        @click="
          $store.dispatch('openRightBar', {
            props: {
              type: 'Notifications',
              orgUuid,
            },
          })
        "
      >
        <unnnic-icon-svg
          icon="alarm-bell-3"
          scheme="neutral-dark"
          class="weni-navbar__item-icon"
        />

        <unnnic-icon-svg
          v-if="newNews"
          icon="indicator"
          size="sm"
          scheme="brand-weni-soft"
          class="new-icon"
        />
      </a>

      <unnnic-dropdown position="bottom-left" :open.sync="dropdownOpen">
        <avatar
          :image-url="imageBackground"
          size="sm"
          slot="trigger"
          class="unnnic--clickable"
          :style="{ margin: 0 }"
        />

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
    </div>
  </div>
</template>

<script>
import ProjectSelect from './ProjectSelect';
import Avatar from '../Avatar';
import projects from '../../api/projects';
import { mapGetters, mapActions } from 'vuex';
import { get } from 'lodash';
import getEnv from '../../utils/env';
import { PROJECT_ROLE_CHATUSER } from '../users/permissionsObjects';
import WarningTrialChip from '../billing/WarningTrialChip.vue';

export default {
  name: 'Navbar',
  components: {
    ProjectSelect,
    Avatar,
    WarningTrialChip,
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

      academyToolip: false,

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
          href: '/orgs',
        },
        {
          requireLogged: true,
          icon: 'logout-1-1',
          scheme: 'feedback-red',
          name: 'NAVBAR.LOGOUT',
          click: () => {
            this.openModal({
              type: 'confirm',
              data: {
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
              },
            });

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
    };
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    profileFirstName() {
      return get(this.$store.state.Account.profile, 'first_name');
    },

    orgUuid() {
      return this.$store.getters.currentOrg?.uuid;
    },

    newNews() {
      const max = Math.max.apply(
        null,
        this.$store.state.News.all.map(({ id }) => id),
      );

      return this.$store.state.News.lastViewedNews < max;
    },

    hideModulesButChats() {
      if (
        !this.$store.getters.currentProject.menu.chat.length &&
        getEnv('MODULES_YAML').chats &&
        this.$store.getters.currentProject.authorization.role ===
          PROJECT_ROLE_CHATUSER
      ) {
        return true;
      }

      return false;
    },

    language() {
      return this.$i18n.locale;
    },

    imageBackground() {
      return get(this.$store.state, 'Account.profile.photo');
    },
  },
  methods: {
    ...mapActions(['updateAccountLanguage', 'openModal']),

    changeLanguage(language) {
      this.updateAccountLanguage({ language });
    },

    closeAccountMenu() {
      this.dropdownOpen = false;
    },

    login() {
      /* verify if it is needed: what pages account dropdown should appear? */
    },
    logout() {
      this.$keycloak.logout();
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

.greetings {
  display: flex;
  align-items: center;
  column-gap: $unnnic-spacing-inline-nano;
  margin-right: auto;

  .emoji {
    height: $unnnic-font-size-title-sm;
  }
}

.libraries ::v-deep .unnnic-dropdown__content > a.unnnic-dropdown-item {
  cursor: default;

  & > a {
    display: block;
  }
}

.weni-navbar {
  z-index: 1;

  .new-icon {
    position: absolute;
    margin-left: -14px;
    margin-top: 8px;
  }
}

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
    width: 11.5rem;
    z-index: 0;
    margin: 0 $unnnic-spacing-sm 0 0;
  }

  &__item {
    cursor: pointer;
    margin-right: $unnnic-inline-md;
  }

  &__academy {
    cursor: pointer;
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

.unnnic-dropdown {
  .unnnic-dropdown__trigger .unnnic-dropdown__content {
    margin-top: $unnnic-spacing-stack-sm;
    padding: $unnnic-squish-nano;

    a {
      text-decoration: none;
    }

    strong,
    p {
      color: $unnnic-color-neutral-dark;
      width: 191px;
    }
    strong {
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
    p {
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      margin: 0;
    }
  }
}

.weni-button-danger {
  background-color: $unnnic-color-feedback-red !important;
  color: $unnnic-color-neutral-snow !important;
}
</style>
