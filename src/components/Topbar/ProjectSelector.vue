<template>
  <UnnnicPopover
    :open="isOpen"
    @update:open="isOpen = $event"
  >
    <UnnnicPopoverTrigger>
      <section
        class="project-selector"
        :class="{ 'project-selector--open': isOpen }"
        data-test="project-selector-trigger"
      >
        <p class="project-selector__name">{{ currentProject?.name }}</p>
        <UnnnicIcon
          class="project-selector__icon"
          :class="{ 'project-selector__icon--rotate': isOpen }"
          icon="keyboard_arrow_down"
          size="avatar-nano"
        />
      </section>
    </UnnnicPopoverTrigger>

    <UnnnicPopoverContent
      side="bottom"
      align="start"
      size="medium"
      role="listbox"
      :aria-label="$t('NAVBAR.PROJECTS')"
    >
      <section class="project-selector__content">
        <p class="project-selector__label">{{ $t('NAVBAR.PROJECTS') }}</p>

        <section class="project-selector__list">
          <ProjectSelectorItem
            v-for="project in visibleProjects"
            :key="project.uuid"
            :project="project"
            :isActive="project.uuid === currentProject?.uuid"
            @select="navigateToProject"
          />

          <template v-if="isLoading">
            <UnnnicSkeletonLoading
              v-for="i in 2"
              :key="`skeleton-${i}`"
              height="36px"
            />
          </template>
        </section>
      </section>

      <UnnnicPopoverFooter>
        <UnnnicButton
          type="secondary"
          @click="viewAllProjects"
        >
          {{ $t('NAVBAR.ALL_PROJECTS') }}
        </UnnnicButton>
      </UnnnicPopoverFooter>
    </UnnnicPopoverContent>
  </UnnnicPopover>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ProjectSelectorItem from './ProjectSelectorItem.vue';
import { useProjectStore } from '@/store/project';
import { useOrgStore } from '@/store/org';

const PROJECT_STATUS_INACTIVE = 'INACTIVE';
const MAX_VISIBLE_PROJECTS = 5;

const projectStore = useProjectStore();
const orgStore = useOrgStore();
const router = useRouter();

const isOpen = ref(false);

const currentProject = computed(() => projectStore.currentProject);
const currentOrg = computed(() => orgStore.currentOrg);

const orgProjects = computed(() =>
  projectStore.projects.find(
    (orgProjects) => orgProjects.orgUuid === currentOrg.value?.uuid,
  ),
);

const isLoading = computed(() => orgProjects.value?.status === 'loading');

const visibleProjects = computed(() => {
  const projects = orgProjects.value?.data || [];
  const currentUuid = currentProject.value?.uuid;

  const currentFromList = projects.find(
    (project) => project.uuid === currentUuid,
  );
  const current = currentFromList || currentProject.value;

  const otherProjects = projects.filter(
    (project) =>
      project.status !== PROJECT_STATUS_INACTIVE &&
      project.uuid !== currentUuid,
  );

  const ordered = current ? [current, ...otherProjects] : otherProjects;

  return ordered.slice(0, MAX_VISIBLE_PROJECTS);
});

watch(
  () => currentOrg.value?.uuid,
  (orgUuid) => {
    if (orgUuid) {
      projectStore.loadProjects({ orgUuid, ordering: '-created_at' });
    }
  },
  { immediate: true },
);

function navigateToProject(project) {
  isOpen.value = false;

  if (project.uuid === currentProject.value?.uuid) {
    return;
  }

  router.push({
    name: 'home',
    params: { projectUuid: project.uuid },
  });
}

function viewAllProjects() {
  isOpen.value = false;

  const orgUuid = currentOrg.value?.uuid;

  if (!orgUuid) {
    return;
  }

  router.push(`/orgs/${orgUuid}/projects`);
}
</script>

<style lang="scss" scoped>
.project-selector {
  display: flex;
  column-gap: $unnnic-space-1;
  align-items: center;

  padding: $unnnic-space-3 0;

  &__name,
  &__icon {
    color: $unnnic-color-fg-base;
  }

  &__name {
    margin: 0;

    max-width: 12.5 * $unnnic-font-size;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    @include unnnic-font-emphasis;
  }

  &__icon {
    transition: transform 200ms;
    flex-shrink: 0;

    &--rotate {
      transform: rotate(180deg);
    }
  }

  &:hover,
  &--open {
    .project-selector__name,
    .project-selector__icon {
      color: $unnnic-color-fg-emphasized;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-space-2;
  }

  &__label {
    margin: 0;
    font: $unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }

  &__list {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-space-2;
    width: 100%;
  }
}
</style>
