<template>
    <unnic-sidebar :expanded="open"> 
            <div class="weni__sidebar__header" slot="header"> 
                <img v-if="open" src="../assets/brand-name.svg">
                <img v-else src="../assets/brand.svg">
            </div>
            <div v-for="(node, index) in categoryItems" :key="index">
            <unnic-sidebar-menu :text="node.label" v-if="node.type == 'category'">
                <unnic-sidebar-item
                    v-for="item in node.items"
                    :key="item.pathSegment"
                    :icon="item.icon"
                    :text="item.label" 
                    @click="goToNode(item.context, item.pathSegment)">
                </unnic-sidebar-item>
            </unnic-sidebar-menu>
            <unnic-sidebar-item
                v-else
                @click="goToNode(node.context, node.pathSegment)"
                :icon="node.icon"
                :text="node.label"/>
        </div>
        <div slot="footer">
            <unnic-sidebar-item
                :icon="open ? 'expand-8-1' : 'expand-full-1'"
                text="Encolher" 
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
        };
    },
    components: { 
        UnnicSidebar: unnic.UnnicSidebar,
        UnnicSidebarMenu: unnic.UnnicSidebarMenu,
        UnnicSidebarItem: unnic.UnnicSidebarItem,
    },
    mounted() {
        this.categoryItems = this.groupByCategory(this.getItems());
    },
    methods: {
        goToNode(context, pathSegment) {
            window.Luigi.navigation().navigate(`/${context}/${pathSegment}`);
        },
        getItems() {
            const navigation = window.Luigi.getConfigValue('navigation.nodes');
            const nodes = navigation().flatMap((node) => node.children.map((item) => ({ ...item, context: node.pathSegment })));
            return nodes;
        },
        groupByCategory(items) {
            const grouped = [];
            const categoryIndex = {};
            items.forEach(item => {
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
    }
};
</script>

<style lang="scss">
@import '~unnic-system-beta/dist/unnic.css';

.weni__sidebar__header {
    display: flex;
    justify-content: center;
    color: #4E5666;
    font-size: 12px;
}

.unnic-side-bar {
    background-color: #F4F6F8;
}
</style>