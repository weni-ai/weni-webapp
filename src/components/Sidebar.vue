<template>
<unnic-sidebar :expanded="open">
  <div
    class="unnic--clickable weni-sidebar__header"
    slot="header"
    @click="goHome()"> 
      <img v-if="open" src="../assets/brand-name.svg">
      <img v-else src="../assets/brand.svg">
    </div>
    <div v-for="(node, index) in categoryItems" :key="index">
      <unnic-sidebar-menu
        v-if="node.type == 'category'"
        :text="getTranslation(node.label)">
        <unnic-sidebar-item
          v-for="item in node.items"
          :key="item.pathSegment"
          :icon="item.icon"
          :text="getTranslation(item.label)" 
          @click="goToNode(item.context, item.pathSegment)">
      </unnic-sidebar-item>
    </unnic-sidebar-menu>
      <unnic-sidebar-item
        v-else
        @click="goToNode(node.context, node.pathSegment)"
        :icon="node.icon"
        :text="getTranslation(node.label)"/>
      </div>
      <div slot="footer">
        <unnic-language-select
          :class="{ 'weni-sidebar__language': true, 'weni-sidebar__language--contracted': !open }"
          :contracted="!open"
          v-model="language" />
        <unnic-sidebar-item
          :icon="open ? 'expand-8-1' : 'expand-full-1'"
          :text="getTranslation('SIDEBAR.HIDE')" 
          @click="open = !open" />
        </div>
    </unnic-sidebar>
</template>

<script>
import unnic from 'unnic-system-beta';
export default {
  name: 'Sidebar',
  data() {
    return {
      categoryItems: {},
      open: true,
      language: window.Luigi.i18n().getCurrentLocale(),
    };
  },
  components: { 
    UnnicSidebar: unnic.UnnicSidebar,
    UnnicSidebarMenu: unnic.UnnicSidebarMenu,
    UnnicSidebarItem: unnic.UnnicSidebarItem,
    UnnicLanguageSelect: unnic.UnnicLanguageSelect,
  },
  watch: {
    language() {
      window.Luigi.i18n().setCurrentLocale(this.language);
    },
  },
  mounted() {
    this.categoryItems = this.groupByCategory(this.getItems());
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
@import '~unnic-system-beta/dist/unnic.css';
@import '~unnic-system-beta/src/assets/scss/unnic.scss';

.weni-sidebar {

  background-color: $unnic-color-background-sky;

  &__header {
    display: flex;
    justify-content: center;
    color: $unnic-color-neutral-dark;
    font-size: $unnic-font-size-body-md;
  }

  &__language {
    margin-bottom: $unnic-spacing-stack-sm;

    &--contracted {
      max-width: 1.625rem;
      margin-left: -0.75rem;
    }
  }
}
</style>