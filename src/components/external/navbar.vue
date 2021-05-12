<template>
    <div v-if="['normal', 'secondary'].includes(theme)" :class="['weni-navbar', `weni-navbar--theme-${theme}`]">
        <unnnic-autocomplete
          v-if="theme == 'normal'"
          :placeholder="getTranslation(placeholder)"
          size="sm"
          class="weni-navbar__search"
          icon-left="search-1"
          v-model="search"
          :data="items"
          @input="onSearch"
          highlight
          @choose="chooseOption"
        />

        <project-select v-if="theme == 'normal' && currentOrg()" :key="orgUpdate" class="weni-navbar__select" :org="currentOrg()" />


        <div
          v-if="theme == 'secondary'"
          class="weni-navbar__logo unnnic--clickable">
          <img
            src="../../assets/brand-name.svg"
            @click="goHome()">
        </div>

        <unnnic-language-select
          v-if="theme == 'secondary'"
          v-model="language"
          @input="changeLanguage"
          class="language-select"
          position="bottom"
        />

        <unnnic-dropdown position="bottom-left" :open.sync="dropdownOpen">
          <div
            :style="imageBackground"
            class="weni-navbar__icon unnnic--clickable"
            :clickable="true"
            slot="trigger">
            <unnnic-icon-svg v-if="!imageBackground" icon="default-avatar"></unnnic-icon-svg>
            </div>
            <unnnic-dropdown-item v-if="isLogged()" @click="account(); dropdownOpen = false"> 
                <div class="weni-navbar__dropdown">
                  <unnnic-icon-svg class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('NAVBAR.ACCOUNT') }}
                </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-if="isLogged()" @click="orgs(); dropdownOpen = false">
              <div class="weni-navbar__dropdown">
                <unnnic-icon-svg size="sm" class="weni-navbar__dropdown__icon" icon="building-2-1" /> {{ getTranslation('NAVBAR.CHANGE_ORG') }}
              </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-if="isLogged()" class="weni-navbar__logout" @click="logoutModalOpen = true; dropdownOpen = false">
              <div class="weni-navbar__dropdown">
                <unnnic-icon-svg size="sm" class="weni-navbar__dropdown__icon" icon="logout-1-1" /> {{ getTranslation('NAVBAR.LOGOUT') }}
              </div>
            </unnnic-dropdown-item>
            <unnnic-dropdown-item v-else  @click="login(); dropdownOpen = false;"> 
              <div class="weni-navbar__dropdown">
                <unnnic-icon-svg class="weni-navbar__dropdown__icon" size="sm" icon="single-neutral-actions-1" /> {{ getTranslation('NAVBAR.LOGIN') }}
              </div>
            </unnnic-dropdown-item>
        </unnnic-dropdown>
        <unnnic-modal 
          :show-modal="logoutModalOpen"
          has-button
          close-icon
          scheme="feedback-red"
          modal-icon="logout-1-1"
          :description="getTranslation('NAVBAR.LOGOUT_MESSAGE')"
          :text="getTranslation('NAVBAR.LOGOUT')"
          @close="logoutModalOpen = false">
          <unnnic-button
            slot="options"
            @click="logoutModalOpen = false"
            type="terciary">
              {{ getTranslation('NAVBAR.CANCEL') }}
            </unnnic-button>
          <unnnic-button
            class="weni-button-danger"
            slot="options"
            @click="logout()">
              {{ getTranslation('NAVBAR.LOGOUT', language) }}
            </unnnic-button>
        </unnnic-modal>
    </div>    
</template>

<script>
import { unnnicDropdown, unnnicDropdownItem, unnnicButton, unnnicModal, unnnicAutocomplete } from '@weni/unnnic-system';
import ProjectSelect from './ProjectSelect';
import projects from '../../api/projects';
import account from '../../api/account';

export default {
  name: 'Navbar',
  components: {
    unnnicDropdown,
    unnnicDropdownItem,
    unnnicButton,
    unnnicModal,
    unnnicAutocomplete,
    ProjectSelect,
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
    theme: {
      type: String,
      default: 'expand',
    },
  },
  data() {
    return {
      profile: null,
      logoutModalOpen: false,
      dropdownOpen: false,
      language: window.Luigi.i18n().getCurrentLocale(),
      search: '',
      items: [],
      activeSearch: null,
      loading:false,
    };
  },

  created() {
    window.Luigi.i18n().addCurrentLocaleChangeListener((language) => {
      this.language = language;
    });
  },

  mounted() {
    this.getProfile();
    window.Luigi.i18n().addCurrentLocaleChangeListener((language) => {
      this.language = language;
    });
  },
  watch: {
    mustUpdate() {
      this.getProfile();
    },
    loading(){
      if (this.loading) {
        this.items = []
        this.items.push({
          type: 'category',
          text: this.getTranslation('NAVBAR.LOADING'),
        });
      }
    }
  },
  computed: {
    imageBackground() {
      if(!(this.profile && this.profile.photo)) return null;
      return `background-image: url('${this.profile.photo}')`;
    },
    mustUpdate() {
      return `${this.update}`;
    },
    placeholder() {
      return 'NAVBAR.SEARCH_PLACEHOLDER';
    },
  },
  methods: {
    async changeLanguage(language) {
      if (language === window.Luigi.i18n().getCurrentLocale()) {
        return false;
      }

      const languages = {
        'en': 'en-us',
        'pt-br': 'pt-br',
      };

      try {
        const token = window.parent.Luigi.auth().store.getAuthData().accessToken;

        await account.updateProfileLanguage({
          headers: {
            Authorization: `Bearer ${token}`,
          },
          language: languages[language],
        });
      } catch (error) {
        console.log(error);
      } finally {
        window.Luigi.i18n().setCurrentLocale(language);
      }
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
          const project = JSON.parse(localStorage.getItem('_project'));

          const response = await projects.search(
            window.parent.Luigi.auth().store.getAuthData().accessToken,
            project.uuid,
            this.search,
          );

          const { data } = response;

          this.items = [];

          if (data.inteligence.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.getTranslation('SIDEBAR.BH'),
            });

            data.inteligence.map(item => ({
              type: 'option',
              text: item.inteligence_name,
              value: {
                ...item, // { inteligence_uuid: String, inteligence_name: String, inteligence_owner: String, inteligence_slug: String, }
                href: `/systems/bothub/${item.inteligence_owner}/${item.inteligence_slug}`,
              },
            })).forEach(item => this.items.push(item));
          }

          if (data.flow.length) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.getTranslation('SIDEBAR.PUSH'),
            });

            data.flow.map(item => ({
              type: 'option',
              text: item.flow_name,
              value: {
                ...item, // { "flow_uuid": String, "flow_name": String }
                href: `/systems/push/${item.flow_uuid}`,
              },
            })).forEach(item => this.items.push(item));
          }

          if (this.items.length === 0) {
            this.loading = false;
            this.items.push({
              type: 'category',
              text: this.getTranslation('NAVBAR.NO_RESULTS'),
            })
          }
        } catch (e) {
          console.log(e);
        }
      }, 300);
    },

    chooseOption(value) {
      if (value.href) {
        window.Luigi.navigation().navigate(value.href);
      }
    },

    currentOrg() {
      const org =  window.localStorage.getItem('org');
      try {
        return JSON.parse(org);
      } catch(e) {
        return null;
      }
    },
    goHome() {
      window.Luigi.navigation().navigate('/home/index');
    },
    login() {
      window.Luigi.auth().login();
    },
    logout() {
      this.logoutModalOpen = false;
      window.Luigi.auth().logout();
    },
    isLogged() {
      const token = window.parent.Luigi.auth().store.getAuthData();
      return token && token.accessToken;
    },
    // eslint-disable-next-line no-unused-vars
    getTranslation(label, language) {
      return window.Luigi.i18n().getTranslation(label);
    },
    account() {
      window.Luigi.navigation().navigate('/account/edit');
    },
    orgs() {
      window.Luigi.navigation().navigate('/orgs/list');
    },
    async getProfile() {
      const authData = window.Luigi.auth().store.getAuthData();
      try {
        this.profile = await window.Luigi.getConfigValue('auth.openIdConnect.userInfoFn')(null, authData);
      } catch(e) {
        console.log(e);
      }
    },
  },
}
</script>

<style lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
@import '~@weni/unnnic-system/dist/unnnic.css';

.weni-navbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &--theme {
      &-normal {
        background-color: #F4F6F8;
        padding: $unnnic-inset-md $unnnic-inset-md $unnnic-inset-md 0;
      }

      &-secondary {
        background-color: white;
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
      margin: 0 $unnnic-inline-md 0 0;
    }

    &__item {
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