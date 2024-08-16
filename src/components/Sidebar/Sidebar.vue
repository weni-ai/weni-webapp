<template>
  <section :class="['sidebar', { 'sidebar--is-expanded': isExpanded }]">
    <RouterLink
      :to="{ name: 'orgs' }"
      class="sidebar__logo"
    >
      <section class="sidebar__logo-outer">
        <img src="@/assets/brand-name.svg" />
      </section>
    </RouterLink>

    <SidebarOption
      :option="{
        label: project.name,
        icon: 'folder',
      }"
      useDropdown
      :isExpanded="isExpanded"
      iconRight="expand_all"
      useEllipsis
      :tooltipText="$t('NAVBAR.PROJECTS')"
    >
      <template slot="dropdown-content">
        <section class="projects">
          <section class="projects__title">{{ $t('NAVBAR.PROJECTS') }}</section>

          <section class="projects__list">
            <SidebarOption
              v-for="(option, index) in projects.data"
              :key="index"
              :option="option"
              :isExpanded="true"
              isInDropdown
              useEllipsis
            />

            <template v-if="projects.status === 'loading'">
              <UnnnicSkeletonLoading
                v-for="i in 2"
                :key="i"
                tag="div"
                height="38px"
              />
            </template>
          </section>

          <footer class="projects__footer">
            <SidebarOption
              :option="{
                label: $t('NAVBAR.PROJECT_CREATE'),
                icon: 'add',
                viewUrl:
                  '/orgs/70174dd0-9ae0-4115-8ec0-951eed15047b/projects/create',
              }"
              :isExpanded="true"
              isInDropdown
              align="center"
            />

            <SidebarOption
              :option="{
                label: $t('NAVBAR.ALL_PROJECTS'),
                viewUrl: '/orgs/70174dd0-9ae0-4115-8ec0-951eed15047b/projects',
              }"
              :isExpanded="true"
              isInDropdown
              align="center"
            />
          </footer>
        </section>
      </template>
    </SidebarOption>

    <section class="pages">
      <section
        v-for="(group, index) in options"
        class="page-group"
        :key="index"
      >
        <template v-for="(option, index) in group">
          <SidebarOption
            :option="option"
            :key="index"
            :isExpanded="isExpanded"
          />
        </template>
      </section>
    </section>

    <footer class="sidebar__footer">
      <SidebarOption
        :option="{
          label: isExpanded ? $t('SIDEBAR.HIDE') : $t('SIDEBAR.SHOW'),
          icon: 'chevron_right',
        }"
        :isExpanded="isExpanded"
        variant="static"
        :iconRotate180deg="isExpanded"
        @click.native="isExpanded = !isExpanded"
      />
    </footer>
  </section>
</template>

<script>
export default {
  name: 'SidebarComponent',
};
</script>

<script setup>
import { get } from 'lodash';
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue';
import SidebarOption from './SidebarOption.vue';
import gifStudio from '../../assets/tutorial/sidebar-studio.gif';
import gifIntelligences from '../../assets/tutorial/sidebar-intelligences.gif';
import gifChats from '../../assets/tutorial/sidebar-chats.gif';
import gifIntegrations from '../../assets/tutorial/sidebar-integrations.gif';
import i18n from '../../utils/plugins/i18n.js';
import APIProjects from '../../api/projects.js';
import { PROJECT_ROLE_CHATUSER } from '../users/permissionsObjects.js';

/*
  For test compatibility reasons, "store" and "route" are used as computeds.
  When possible, change this to "useStore" and "useRoute" composables.
*/

const store = computed(() => {
  const { proxy } = getCurrentInstance();
  const store = proxy.$store;
  return store;
});

const route = computed(() => {
  const { proxy } = getCurrentInstance();
  const route = proxy.$route;
  return route;
});

const props = defineProps({
  unreadMessages: Number,
});

const isExpanded = ref(true);

const projects = reactive({
  status: null,
  data: [],
});

const project = computed(() => store.value.getters.currentProject);

watch(
  () => store.value.getters.currentOrg?.uuid,
  (orgUuid) => {
    if (orgUuid) {
      loadProjects({ orgUuid });
    }
  },
  { immediate: true },
);

async function loadProjects({ orgUuid }) {
  projects.status = null;
  projects.data = [
    {
      label: project.value.name,
      viewUrl: `/projects/${get(project.value, 'uuid')}`,
      type: 'isActive',
    },
  ];

  try {
    projects.status = 'loading';

    const { data } = await APIProjects.v2List({
      params: {
        organization: orgUuid,
        offset: 0,
        limit: 6,
        ordering: '-created_at',
      },
    });

    projects.data.push(
      ...data.results
        .filter(({ uuid }) => uuid !== project.value.uuid)
        .slice(0, 5)
        .map(({ name, uuid }) => ({
          label: name,
          viewUrl: `/projects/${uuid}`,
          type: 'isActive',
        })),
    );
  } finally {
    projects.status = null;
  }
}

const isToContract = computed(() => {
  return route.value.meta?.forceContractedSidebar;
});

watch(
  () => route.value.path,
  () => {
    if (isToContract.value) {
      isExpanded.value = false;
    }
  },
  { immediate: true },
);

const hasFlows = computed(() => {
  const championChatbot =
    store.value.state.Project.championChatbots[
      store.value.getters.currentProject?.flow_organization
    ];

  return championChatbot?.error || championChatbot?.has_flows;
});

const options = computed(() => {
  const isDisabled = !hasFlows.value;

  const chatsModule = {
    label: i18n.t('SIDEBAR.chats'),
    icon: 'forum',
    viewUrl: `/projects/${get(project.value, 'uuid')}/chats`,
    type: 'isActive',
    hasNotification: !!props.unreadMessages,
    disabled: isDisabled,
    disabledModal: {
      title: i18n.t('SIDEBAR.modules.chats.title'),
      description: i18n.t('SIDEBAR.modules.chats.description'),
      image: gifChats,
    },
  };

  const settingsModule = {
    label: i18n.t('SIDEBAR.CONFIG'),
    icon: 'settings',
    viewUrl: `/projects/${get(project.value, 'uuid')}/settings`,
    type: 'isActive',
  };

  const isRoleChatUser =
    store.value.getters.currentProject.authorization.role ===
    PROJECT_ROLE_CHATUSER;

  if (isRoleChatUser) {
    return [[chatsModule], [settingsModule]];
  }

  return [
    [
      {
        label: i18n.t('SIDEBAR.HOME'),
        icon: 'home',
        viewUrl: `/projects/${get(project.value, 'uuid')}`,
        type: 'isExactActive',
      },
      {
        label: i18n.t('SIDEBAR.INSIGHTS'),
        icon: 'monitoring',
        viewUrl: `/projects/${get(project.value, 'uuid')}/insights`,
        tag: 'Beta',
        type: 'isActive',
      },
    ],
    [
      {
        label: i18n.t('SIDEBAR.BH'),
        icon: 'neurology',
        type: 'isActive',
        children: [
          {
            label: i18n.t('SIDEBAR.BRAIN'),
            viewUrl: `/projects/${get(project.value, 'uuid')}/brain`,
            tag: 'Beta',
            type: 'isActive',
          },
          {
            label: i18n.t('SIDEBAR.CLASSIFICATION_AND_CONTENT'),
            viewUrl: `/projects/${get(project.value, 'uuid')}/bothub`,
            type: 'isActive',
            disabled: isDisabled,
            disabledModal: {
              title: i18n.t('SIDEBAR.modules.intelligences.title'),
              description: i18n.t('SIDEBAR.modules.intelligences.description'),
              image: gifIntelligences,
            },
          },
        ],
      },
      {
        label: i18n.t('SIDEBAR.PUSH'),
        icon: 'account_tree',
        viewUrl: `/projects/${get(project.value, 'uuid')}/push`,
        type: 'isActive',
      },
      {
        label: i18n.t('SIDEBAR.STUDIO'),
        icon: 'ad',
        viewUrl: `/projects/${get(project.value, 'uuid')}/studio`,
        type: 'isActive',
        disabled: isDisabled,
        disabledModal: {
          title: i18n.t('SIDEBAR.modules.studio.title'),
          description: i18n.t('SIDEBAR.modules.studio.description'),
          image: gifStudio,
        },
      },
      chatsModule,
    ],
    [
      {
        label: i18n.t('SIDEBAR.INTEGRATIONS'),
        icon: 'browse',
        viewUrl: `/projects/${get(project.value, 'uuid')}/integrations`,
        type: 'isActive',
        disabled: isDisabled,
        disabledModal: {
          title: i18n.t('SIDEBAR.modules.integrations.title'),
          description: i18n.t('SIDEBAR.modules.integrations.description'),
          image: gifIntegrations,
        },
      },
      settingsModule,
    ],
  ];
});
</script>

<style lang="scss" scoped>
.pages {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;
}

.page-group {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-nano;

  + .page-group {
    margin-top: -$unnnic-spacing-xs - $unnnic-border-width-thinner;
    padding-top: $unnnic-spacing-xs;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-darkest;
  }
}

.sidebar {
  width: 4.5 * $unnnic-font-size;
  box-sizing: border-box;
  transition: width 100ms;

  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-ant;

  padding: $unnnic-spacing-sm;
  padding-top: $unnnic-spacing-ant;
  background-color: $unnnic-color-neutral-black;

  height: 100%;

  &__logo:hover {
    background-color: $unnnic-color-weni-900;
  }

  &__logo-outer {
    overflow: hidden;
    transition: height 200ms;
    height: 1.1875 * $unnnic-font-size;
  }

  &--is-expanded .sidebar__logo-outer {
    overflow: hidden;

    height: 1.25 * $unnnic-font-size;
  }

  &__logo {
    display: flex;
    align-items: center;
    height: $unnnic-icon-size-md;
    padding: $unnnic-spacing-xs;
    border-radius: $unnnic-border-radius-sm;
    user-select: none;

    img {
      height: 100%;
    }
  }

  &__footer {
    margin-top: auto;
  }

  &--is-expanded {
    width: 16.875 * $unnnic-font-size;
  }
}

.projects {
  &__title {
    color: $unnnic-color-neutral-clean;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-md;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    margin-bottom: $unnnic-spacing-xs;
  }

  &__list,
  &__footer {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;
  }

  &__footer {
    margin-top: $unnnic-spacing-xs - $unnnic-border-width-thinner;
    border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-dark;
    padding-top: $unnnic-spacing-xs;
  }
}
</style>
