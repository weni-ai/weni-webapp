<template>
  <unnnic-sidebar-primary
    v-if="theme === 'normal'"
    class="sidebar"
    :language="language"
    @change-language="changeLanguage"
    :hide-expand-button="isToContract"
    :expanded="open"
    @toggle-expanded="open = $event"
    :hide-text="open ? $t('SIDEBAR.HIDE') : $t('SIDEBAR.SHOW')"
    :items="categories"
  >
    <template v-slot:header>
      <div class="sidebar-header">
        <router-link to="/orgs/list">
          <img src="../../assets/brand-name.svg">
        </router-link>
      </div>
    </template>
  </unnnic-sidebar-primary>
</template>

<script>
import {
  unnnicSidebarPrimary,
} from '@weni/unnnic-system';

export default {
  name: 'Sidebar',
  props: {},
  data() {
    return {
      items: [],
      open: true,
      current: '',
    };
  },
  components: { 
    unnnicSidebarPrimary,
  },

  created() {
    this.$root.$on('set-sidebar-expanded', () => {
      if (!this.isToContract) {
        this.open = true;
      }
    });
  },

  mounted() {
  },

  computed: {
    language() {
      return this.$i18n.locale;
    },

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

      return [
        {
          "type":"category",
          "label":"SIDEBAR.MAIN_MENU",
          "items":[
            {
              "label":"SIDEBAR.HOME",
              "icon":"house",
              "viewUrl":"/home/index",
            }
          ]
        },
        {
          "type":"category",
          "label":"SIDEBAR.SYSTEMS",
          "items":[
            {
              "label":"SIDEBAR.PUSH",
              "icon":"hierarchy",
              "viewUrl":"/systems/push",
            },
            {
              "label":"SIDEBAR.BH",
              "icon":"science-fiction-robot",
              "viewUrl":"/systems/bothub",
            },
            {
              "label":"SIDEBAR.RC",
              "icon":"messaging-we-chat",
              "viewUrl":"/systems/rocketchat",
            }
          ]
        },
        {
          "type":"category",
          "label":"SIDEBAR.PROFILE",
          "items":[
            {
              "label":"SIDEBAR.ACCOUNT",
              "icon":"single-neutral",
              "viewUrl":"/account/edit",
            },
            {
              "label":"SIDEBAR.PROJECT",
              "icon":"folder",
              "viewUrl":"/project/index",
            },
            {
              "label":"SIDEBAR.HELP",
              "icon":"question-circle",
              "viewUrl":"/help/index",
            }
          ]
        }
      ].map(item => ({
        ...item,
        label: this.$t(item.label),
        items: item.items.map(route => {
          const active = this.$route.path.startsWith(route.viewUrl);

          return {
            ...route,
            label: this.$t(route.label),
            active,
            icon: icons[route.icon][active ? 0 : 1],
            click: () => {
              this.$router.push(route.viewUrl);
            },
          };
        })
      }));
    },

    isToContract() {
      return [
        '/systems/push',
        '/systems/bothub',
        '/systems/rocketchat',
      ].some((href) => this.$route.path.startsWith(href))
        || [
        '/project',
      ].some((href) => this.$route.path === href);
    }
  },
  methods: {
    changeLanguage(language) {
      this.$root.$emit('change-language', language);
    },

    goToNode(context, pathSegment) {
      window.Luigi.navigation().navigate(this.pathname(context, pathSegment));
    },

    pathname(context, pathSegment) {
      if ( !context ) return `/${pathSegment}`;
      else return `/${context}/${pathSegment}`;
    },
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler () {
        if (this.isToContract) {
          this.open = false;
        }
      },
    },
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
