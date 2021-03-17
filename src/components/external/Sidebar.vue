<template>
<unnnic-sidebar
  v-if="theme === 'normal'"
  :expanded="open">
  <div
    class="unnnic--clickable weni-sidebar__header"
    slot="header"
    @click="goHome()"> 
      <img v-if="open" src="../../assets/brand-name.svg">
      <img v-else src="../../assets/brand.svg">
    </div>
    <div >
      <unnnic-sidebar-menu
        v-for="(node, index) in categoryItems.category"
        :key="index"
        :text="getTranslation(node.label)">
        <unnnic-sidebar-item
          v-for="item in node.items"
          :active="node.pathSegment === current"
          :key="item.pathSegment"
          :icon="item.icon"
          :text="getTranslation(item.label)" 
          @click="goToNode(item.context, item.pathSegment)">
      </unnnic-sidebar-item>
    </unnnic-sidebar-menu>
      <unnnic-sidebar-item
        v-for="(node, index) in categoryItems.noCategory"
        :key="index"
        :active="node.pathSegment === current"
        :icon="node.icon"
        :text="getTranslation(node.label)"
        @click="goToNode(node.context, node.pathSegment)"/>
      </div>
      <div slot="footer">
        <unnniclanguage-select
          class="weni-sidebar__language"
          :contracted="!open"
          v-model="language" />
        <unnnic-sidebar-item
          :icon="open ? 'expand-8-1' : 'expand-full-1'"
          :text="getTranslation('SIDEBAR.HIDE')"
          @click="open = !open" />
    </unnnic-sidebar>
</template>

<script>
import { unnnicSidebar, unnnicSidebarMenu, unnnicSidebarItem, unnniclanguageSelect } from 'unnic-system-beta';
export default {
  name: 'Sidebar',
  props: {
    current: {
      type: String,
      default: null,
    },
    theme: {
      type: String,
      default: 'normal',
    },
  },
  data() {
    return {
      items: [],
      open: true,
      language: window.Luigi.i18n().getCurrentLocale(),
    };
  },
  components: { 
    unnnicSidebar,
    unnnicSidebarMenu,
    unnnicSidebarItem,
    unnniclanguageSelect,
  },
  watch: {
    language() {
      window.Luigi.i18n().setCurrentLocale(this.language);
    },
  },
  mounted() {
    this.items = this.groupByCategory(this.getItems());
  },
  computed: {
    categoryItems() {
      return {
        category: this.items.filter(node => node.type == 'category'),
        noCategory: this.items.filter(node => node.type !== 'category'),
      }
    }
  },
  methods: {
    goToNode(context, pathSegment) {
      if ( !context )  window.Luigi.navigation().navigate(`/${pathSegment}`);
      else window.Luigi.navigation().navigate(`/${context}/${pathSegment}`);
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
      return window.Luigi.getConfigValue('settings.customTranslationImplementation').getTranslation(label);
    },
  },
};
</script>

<style lang="scss">
@import '~unnic-system-beta/src/assets/scss/unnnic.scss';
@import '~unnic-system-beta/dist/unnnic.css';

.weni-sidebar {

  background-color: $unnnic-color-background-sky;

  &__header {
    display: flex;
    justify-content: center;
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-md;
  }

  &__language {
    margin-bottom: $unnnic-spacing-stack-sm;
  }
}
</style>