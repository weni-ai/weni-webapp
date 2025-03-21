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
      <template #dropdown-content>
        <section class="projects">
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
              v-if="canCreateProject"
              :option="{
                label: $t('NAVBAR.PROJECT_CREATE'),
                icon: 'add',
                viewUrl: `/orgs/${org.uuid}/projects/create`,
              }"
              :isExpanded="true"
              isInDropdown
              align="center"
            />

            <SidebarOption
              :option="{
                label: $t('NAVBAR.ALL_PROJECTS'),
                viewUrl: `/orgs/${org.uuid}/projects`,
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
        :key="index"
        class="page-group"
      >
        <template
          v-for="option in group"
          :key="option"
        >
          <SidebarOption
            :option="option"
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
        @click="isExpanded = !isExpanded"
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
import moment from 'moment';
import {
  computed,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';

import env from '@/utils/env';

import SidebarOption from './SidebarOption.vue';
import gifStudio from '../../assets/tutorial/sidebar-studio.gif';
import gifIntelligences from '../../assets/tutorial/sidebar-intelligences.gif';
import gifChats from '../../assets/tutorial/sidebar-chats.gif';
import gifIntegrations from '../../assets/tutorial/sidebar-integrations.gif';
import i18n from '../../utils/plugins/i18n.js';
import APIProjects from '../../api/projects.js';
import { PROJECT_ROLE_CHATUSER } from '../users/permissionsObjects.js';
import {
  ORG_ROLE_ADMIN,
  ORG_ROLE_CONTRIBUTOR,
} from '@/components/orgs/orgListItem.vue';
import brainAPI from '../../api/brain';
import getEnv from '../../utils/env.js';
import { PROJECT_COMMERCE } from '../../utils/constants.js';

import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

const props = defineProps({
  unreadMessages: { type: Number, default: 0 },
});

const isExpanded = ref(true);

const projects = reactive({
  status: null,
  data: [],
});

const BrainOn = ref(false);

const project = computed(() => store.getters.currentProject);
const org = computed(() => store.getters.currentOrg);
const isCommerceProject = computed(() => {
  return project.value.project_mode === PROJECT_COMMERCE;
});

const canCreateProject = computed(() => {
  return (
    org.value?.is_suspended === false &&
    [ORG_ROLE_CONTRIBUTOR, ORG_ROLE_ADMIN].includes(
      org.value?.authorization?.role,
    )
  );
});

watch(
  () => store.getters.currentOrg?.uuid,
  (orgUuid) => {
    if (orgUuid) {
      loadProjects({ orgUuid });
    }
  },
  { immediate: true },
);

watch(
  () => store.getters.currentProject?.uuid,
  (projectUuid) => {
    if (projectUuid) {
      loadBrain(projectUuid);
    }
  },
  { immediate: true },
);

async function loadBrain(projectUuid) {
  try {
    const { data } = await brainAPI.read({
      projectUuid,
    });
    BrainOn.value = data.brain_on;
  } catch (e) {
    console.error('loadBrain Error:', e);
  }
}

function handleBrainStatusChange(event) {
  if (event.data?.event === 'change-brain-status') {
    BrainOn.value = JSON.parse(event.data.value);
  }
}

onMounted(() => {
  window.addEventListener('message', handleBrainStatusChange);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleBrainStatusChange);
});

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
  return route.meta?.forceContractedSidebar;
});

watch(
  () => route.path,
  () => {
    if (isToContract.value) {
      isExpanded.value = false;
    }
  },
  { immediate: true },
);

const options = computed(() => {
  const isShortOptions = [
    [
      {
        label: i18n.global.t('SIDEBAR.HOME'),
        icon: 'home',
        viewUrl: `/projects/${get(project.value, 'uuid')}`,
        type: 'isExactActive',
      },
      {
        label: i18n.global.t('SIDEBAR.BRAIN'),
        icon: 'neurology',
        viewUrl: `/projects/${get(project.value, 'uuid')}/brain`,
        tag: BrainOn.value ? i18n.global.t('SIDEBAR.ACTIVE') : null,
        type: 'isActive',
      },
      {
        label: i18n.global.t('SIDEBAR.INTEGRATIONS'),
        icon: 'browse',
        viewUrl: `/projects/${get(project.value, 'uuid')}/integrations`,
        type: 'isActive',
        disabledModal: {
          title: i18n.global.t('SIDEBAR.modules.integrations.title'),
          description: i18n.global.t(
            'SIDEBAR.modules.integrations.description',
          ),
          image: gifIntegrations,
        },
      },
    ],
  ];

  if (isCommerceProject.value) {
    return isShortOptions;
  }

  const chatsModule = {
    label: i18n.global.t('SIDEBAR.chats'),
    icon: 'forum',
    viewUrl: `/projects/${get(project.value, 'uuid')}/chats`,
    type: 'isActive',
    hasNotification: !!props.unreadMessages,
    disabledModal: {
      title: i18n.global.t('SIDEBAR.modules.chats.title'),
      description: i18n.global.t('SIDEBAR.modules.chats.description'),
      image: gifChats,
    },
  };

  const settingsModule = {
    label: i18n.global.t('SIDEBAR.CONFIG'),
    icon: 'settings',
    viewUrl: `/projects/${get(project.value, 'uuid')}/settings`,
    type: 'isActive',
  };

  const isRoleChatUser =
    store.getters.currentProject.authorization.role === PROJECT_ROLE_CHATUSER;

  if (isRoleChatUser) {
    return [[chatsModule], [settingsModule]];
  }

  const commerceAllowedEmails = getEnv('TEMP_COMMERCE_ALLOWED_EMAILS');

  const hasCommercePermission =
    commerceAllowedEmails === '*' ||
    commerceAllowedEmails
      ?.split(',')
      .includes(store.state.Account.profile.email);

  const isProjectAllowedToUseBothub =
    moment(project.value.created_at).year() < 2025 ||
    env('PROJECTS_BOTHUB_ALLOWED')?.split(',').includes(project.value.uuid);

  return [
    [
      {
        label: i18n.global.t('SIDEBAR.HOME'),
        icon: 'home',
        viewUrl: `/projects/${get(project.value, 'uuid')}`,
        type: 'isExactActive',
      },
      {
        label: i18n.global.t('SIDEBAR.INSIGHTS'),
        icon: 'monitoring',
        viewUrl: `/projects/${get(project.value, 'uuid')}/insights`,
        tag: 'Beta',
        type: 'isActive',
      },
    ],
    [
      {
        label: i18n.global.t('SIDEBAR.BH'),
        icon: 'neurology',
        type: 'isActive',
        children: [
          {
            label: i18n.global.t('SIDEBAR.BRAIN'),
            viewUrl: `/projects/${get(project.value, 'uuid')}/brain`,
            tag: BrainOn.value ? i18n.global.t('SIDEBAR.ACTIVE') : null,
            type: 'isActive',
          },
          isProjectAllowedToUseBothub
            ? {
                label: i18n.global.t('SIDEBAR.CLASSIFICATION_AND_CONTENT'),
                viewUrl: `/projects/${get(project.value, 'uuid')}/bothub`,
                type: 'isActive',
                disabledModal: {
                  title: i18n.global.t('SIDEBAR.modules.intelligences.title'),
                  description: i18n.global.t(
                    'SIDEBAR.modules.intelligences.description',
                  ),
                  image: gifIntelligences,
                },
              }
            : {},
        ],
      },
      hasCommercePermission
        ? {
            label: 'Commerce',
            icon: 'storefront',
            viewUrl: `/projects/${get(project.value, 'uuid')}/commerce`,
            type: 'isActive',
            tag: i18n.global.t('new'),
          }
        : null,
      {
        label: i18n.global.t('SIDEBAR.PUSH'),
        icon: 'account_tree',
        viewUrl: `/projects/${get(project.value, 'uuid')}/push`,
        type: 'isActive',
      },
      {
        label: i18n.global.t('SIDEBAR.STUDIO'),
        icon: 'ad',
        viewUrl: `/projects/${get(project.value, 'uuid')}/studio`,
        type: 'isActive',
        disabledModal: {
          title: i18n.global.t('SIDEBAR.modules.studio.title'),
          description: i18n.global.t('SIDEBAR.modules.studio.description'),
          image: gifStudio,
        },
      },
      chatsModule,
    ].filter((item) => item),
    [
      {
        label: i18n.global.t('SIDEBAR.INTEGRATIONS'),
        icon: 'browse',
        viewUrl: `/projects/${get(project.value, 'uuid')}/integrations`,
        type: 'isActive',
        disabledModal: {
          title: i18n.global.t('SIDEBAR.modules.integrations.title'),
          description: i18n.global.t(
            'SIDEBAR.modules.integrations.description',
          ),
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
  transition: width 300ms;

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
