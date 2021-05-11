<template>
  <unnnic-sidebar-primary
    v-if="theme === 'normal'"
    class="sidebar"
    :language="language"
    @change-language="changeLanguage"
    :hide-expand-button="isToContract"
    :expanded="open"
    @toggle-expanded="open = $event"
    :hide-text="open ? getTranslation('SIDEBAR.HIDE') : getTranslation('SIDEBAR.SHOW')"
    :items="categories"
  >
    <template v-slot:header>
      <div
        class="unnnic--clickable sidebar-header"
        slot="header"
        @click="goHome()"
      > 
        <img src="../../assets/brand-name.svg">
      </div>
    </template>
  </unnnic-sidebar-primary>
</template>

<script>
import {
  unnnicSidebarPrimary,
} from '@weni/unnnic-system';
import account from '../../api/account';

export default {
  name: 'Sidebar',
  props: {
    theme: {
      type: String,
      default: 'secondary',
    },
  },
  data() {
    return {
      items: [],
      open: true,
      language: window.Luigi.i18n().getCurrentLocale(),
      current: null,
    };
  },
  components: { 
    unnnicSidebarPrimary,
  },

  created() {
    window.Luigi.i18n().addCurrentLocaleChangeListener((language) => {
      this.language = language;
    });
  },

  mounted() {
    this.items = this.groupByCategory(this.getItems());

    this.changeRoute();

    window.addEventListener('popstate', this.changeRoute);
  },
  computed: {
    categories() {
      const icons = {
        'house': ['house-2-2', 'house-1-1'],
        'hierarchy': ['hierarchy-3-3', 'hierarchy-3-2'],
        'science-fiction-robot': ['science-fiction-robot-1', 'science-fiction-robot-2'],
        'messaging-we-chat': ['messaging-we-chat-2', 'messaging-we-chat-3'],
        'single-neutral': ['single-neutral-2', 'single-neutral-actions-1'],
        'folder': ['folder-2', 'folder-1'],
        'question-circle': ['question-circle-2', 'question-circle-1'],
      };

      return this.items.filter(node => node.type == 'category').map(category => {
        return {
          ...category,
          label: this.getTranslation(category.label),
          items: category.items.map(item => {
            const active = this.current.startsWith(this.pathname(item.context, item.pathSegment));

            return {
              ...item,
              label: this.getTranslation(item.label),
              language: this.language,
              active,
              icon: icons[item.icon][active ? 0 : 1],
              click: () => {
                this.goToNode(item.context, item.pathSegment);
              },
            }
          }),
        };
      });
    },

    isToContract() {
      return [
        '/systems/push',
        '/systems/bothub',
        '/systems/rocketchat',
        '/project',
      ].some((href) => this.current.startsWith(href));
    }
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

    goToNode(context, pathSegment) {
      window.Luigi.navigation().navigate(this.pathname(context, pathSegment));
    },

    pathname(context, pathSegment) {
      if ( !context ) return `/${pathSegment}`;
      else return `/${context}/${pathSegment}`;
    },

    goHome() {
      this.goToNode('home', '')
    },

    getItems() {
      const navigation = window.Luigi.getConfigValue('navigation.nodes');
      const nodes = navigation().flatMap(({ children, ...node }) => children.map((item) => ({ ...item, context: node.pathSegment })));
      return nodes;
    },

    groupByCategory(items) {
      const grouped = [];
      const categoryIndex = {};
      items.forEach(item => {
        if (item.hideFromNav) return;
        const category = item.category;
        if (category && category.length > 0) {
          if(categoryIndex[category] !== undefined) {
            grouped[categoryIndex[category]].items.push(item);
          } else {
            categoryIndex[category] = grouped.length
            grouped.push({ type: 'category', label: category, items: [item] });
          }
        } else {
           grouped.push({ type: 'item', label: item.label, item });
        }
      });
      return grouped;
    },

    getTranslation(label) {
      return window.Luigi.i18n().getTranslation(label);
    },

    changeRoute() {
      this.current = window.location.pathname;

      if (![
        '/privacy-policy',
      ].some((href) => this.current.startsWith(href))
        && !window.parent.Luigi.auth().store.getAuthData()) {
        window.Luigi.auth().login();
      } else if (/(\?|&)error=tokenExpired(&|$)/.test(window.location.search)) {
        Object.keys(localStorage)
          .filter(key => key.startsWith('oidc.'))
          .forEach(key => {
            localStorage.removeItem(key);
          })

        window.Luigi.auth().login();
      }
    },
  },

  watch: {
    current() {
      if (this.isToContract) {
        this.open = false;
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import "~@weni/unnnic-system/src/assets/scss/unnnic.scss";
@import '~@weni/unnnic-system/dist/unnnic.css';

$transition-time: 0.4s;

.sidebar {
  min-height: 100vh;

  &-header {
    width: 24px;
    height: $unnnic-icon-size-md;
    overflow: hidden;
    margin: 0 auto;
    transition: width $transition-time;

    img {
      vertical-align: middle;
      height: 18.89px;
      transition: all $transition-time;
    }
  }

  &.unnnic-sidebar-primary-expanded {
    .sidebar-header {
      width: 85px;

      img {
        height: $unnnic-icon-size-md;
      }
    }
  }
}
</style>
