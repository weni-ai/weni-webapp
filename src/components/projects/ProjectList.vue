<template>
  <div class="weni-project-list infinite-wrapper">
    <div
      v-if="canCreateProject"
      class="weni-project-list__item weni-project-list__create unnnic--clickable"
      @click="onCreate"
    >
      <UnnnicIconSvg
        scheme="neutral-clean"
        icon="add"
        size="xl"
      />
      <div class="title">
        {{ $t('projects.create.create') }}
      </div>
    </div>
    <ProjectListItem
      v-for="(project, index) in projectsOrdered"
      :key="index"
      class="weni-project-list__item"
      :project="project"
      :uuid="project.uuid"
      :name="project.name"
      :time="timeLabel()"
      :aiCount="project.inteligence_count"
      :flowsCount="project.flow_count"
      :contactCount="project.total_contact_count"
      :authorizations="project.authorizations"
      :pendingAuthorizations="project.pending_authorizations"
      @click="selectProject(project, $event)"
      @added-authorization="addAuthorization(project.uuid, $event)"
      @deleted-authorization="deleteAuthorization(project.uuid, $event)"
      @changed-role-authorization="
        changedRoleAuthorization(project.uuid, $event)
      "
      @updated-project="updateProject(project.uuid, $event)"
      @project-update-status="updateProjectStatus(project.uuid, $event)"
    />

    <div
      v-show="orgProjects.status !== 'complete'"
      ref="infinite-loading-element"
    >
      <div class="project-loading-grid__item">
        <div>
          <UnnnicSkeletonLoading
            :style="{ flex: 1 }"
            tag="div"
            height="49px"
          />
          <UnnnicSkeletonLoading
            class="project-loading-grid__item__small"
            tag="div"
            width="12px"
            height="12px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="51px"
            height="25px"
          />
        </div>
        <UnnnicSkeletonLoading
          tag="div"
          width="100%"
          height="50px"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import ProjectListItem from './ProjectListItem.vue';
import localStorageSaver from './localStorageSaver.js';
import ProjectDescriptionChanges from '../../utils/ProjectDescriptionChanges';
import { get } from 'lodash';
import ProjectService from '../../api/projects.js';

export default {
  name: 'ProjectList',
  components: { ProjectListItem },
  props: {
    org: {
      type: String,
      required: true,
    },

    order: {
      type: String,
      required: true,
    },

    filterName: {
      type: String,
      default: '',
    },

    canCreateProject: {
      type: Boolean,
    },
  },
  emits: ['loading', 'select-project'],
  data() {
    return {
      isInfiniteLoadingElementShowed: false,
      intersectionObserver: null,
    };
  },

  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
      projects: (state) => state.Project.projects,
    }),

    orgProjects() {
      return this.projects.find(
        (project) => project.orgUuid === this.$route.params.orgUuid,
      );
    },

    ordering() {
      if (this.order === 'alphabetical') {
        return 'name';
      } else if (this.order === 'newer') {
        return '-created_at';
      } else if (this.order === 'older') {
        return 'created_at';
      }

      return '';
    },

    projectsOrdered() {
      const projectsOrdered = this.orgProjects.data.slice().sort((a, b) => {
        let first = null;
        let second = null;

        if (this.order === 'alphabetical') {
          first = a.name.toLowerCase();
          second = b.name.toLowerCase();
        } else if (this.order === 'newer') {
          first = new Date(b.created_at).getTime();
          second = new Date(a.created_at).getTime();
        } else if (this.order === 'older') {
          first = new Date(a.created_at).getTime();
          second = new Date(b.created_at).getTime();
        } else if (this.order === 'lastAccess') {
          const saver = localStorageSaver('projects', []);

          const projectSaved1 = saver.value.find(
            (item) => item.uuid === a.uuid,
          );

          const projectSaved2 = saver.value.find(
            (item) => item.uuid === b.uuid,
          );

          if (projectSaved1 && projectSaved1.lastAccess) {
            second = projectSaved1.lastAccess;
          }

          if (projectSaved2 && projectSaved2.lastAccess) {
            first = projectSaved2.lastAccess;
          }
        }

        return first === second ? 0 : first > second ? 1 : -1;
      });

      return this.filterName.trim()
        ? projectsOrdered.filter(({ name }) =>
            name.toLowerCase().includes(this.filterName.trim().toLowerCase()),
          )
        : projectsOrdered;
    },
  },

  watch: {
    order(value) {
      if (['alphabetical', 'newer', 'older'].includes(value)) {
        this.projects = [];
        this.page = 1;
        this.complete = false;
      }
    },

    isInfiniteLoadingElementShowed(isShowed) {
      if (isShowed && this.orgProjects.status !== 'loading') {
        this.loadNextProjects();
      }
    },

    loading() {
      this.$emit('loading', this.loading);
    },
  },

  created() {
    this.loadNextProjects();
  },

  mounted() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isInfiniteLoadingElementShowed = entry.isIntersecting;
      });
    });

    this.intersectionObserver.observe(this.$refs['infinite-loading-element']);
  },

  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs['infinite-loading-element']);
  },

  methods: {
    ...mapActions(['getProjects']),

    loadNextProjects() {
      return this.$store
        .dispatch('loadProjects', {
          orgUuid: this.$route.params.orgUuid,
          ordering: '-created_at',
        })
        .then(() => {
          setTimeout(() => {
            if (this.orgProjects.status === 'complete') {
              return;
            }

            if (
              get(this.$route, 'query.edit_project_uuid') &&
              !ProjectDescriptionChanges.project({
                projectUuid: get(this.$route, 'query.edit_project_uuid'),
              })
            ) {
              this.loadNextProjects();
              return;
            }

            if (this.isInfiniteLoadingElementShowed) {
              this.loadNextProjects();
            }
          }, 0);
        });
    },

    addAuthorization(projectUuid, { isPending, authorization }) {
      this.orgProjects.data
        .find((project) => project.uuid === projectUuid)
        [
          isPending ? 'pending_authorizations' : 'authorizations'
        ].users.push(authorization);
    },

    deleteAuthorization(projectUuid, userEmail) {
      const project = this.orgProjects.data.find(
        (project) => project.uuid === projectUuid,
      );

      const indexPending = project.pending_authorizations.users.findIndex(
        (user) => user.email === userEmail,
      );

      const indexNormal = project.authorizations.users.findIndex(
        (user) => user.email === userEmail,
      );

      if (indexPending !== -1) {
        project.pending_authorizations.users.splice(indexPending, 1);
      }

      if (indexNormal !== -1) {
        project.authorizations.users.splice(indexNormal, 1);
      }
    },

    changedRoleAuthorization(projectUuid, { email, role, chatRole }) {
      const project = this.orgProjects.data.find(
        (project) => project.uuid === projectUuid,
      );

      const chatsAttribute = 'chats_role';

      const indexPending = project.pending_authorizations.users.findIndex(
        (user) => user.email === email,
      );

      const indexNormal = project.authorizations.users.findIndex(
        (user) => user.email === email,
      );

      if (indexPending !== -1) {
        project.pending_authorizations.users[indexPending].project_role = role;
        project.pending_authorizations.users[indexPending][chatsAttribute] =
          chatRole;
      }

      if (indexNormal !== -1) {
        project.authorizations.users[indexNormal].project_role = role;
        project.authorizations.users[indexNormal][chatsAttribute] = chatRole;
      }
    },

    timeLabel() {
      const date = Date.now();
      return getTimeAgo(date, this.profile.language);
    },

    onCreate() {
      this.$router.push({
        name: 'project_create',
        params: {
          orgUuid: this.org,
        },
      });
    },
    selectProject(project, route) {
      const saver = localStorageSaver('projects', []);

      const projectSaved = saver.value.find(
        (item) => item.uuid === project.uuid,
      );

      if (projectSaved) {
        projectSaved.lastAccess = new Date().getTime();
      } else {
        saver.value.push({
          uuid: project.uuid,
          lastAccess: new Date().getTime(),
        });
      }

      saver.save();

      this.$emit('select-project', project, route);
    },
    updateProject(projectUuid, { name, timezone, description }) {
      const project = this.orgProjects.data.find(
        (project) => project.uuid === projectUuid,
      );

      project.name = name;
      project.description = description;
      project.timezone = timezone;
    },
    updateProjectStatus(projectUuid, status) {
      const project = this.orgProjects.data.find(
        (project) => project.uuid === projectUuid,
      );
      if (project) {
        ProjectService.updateProjectStatus({ projectUuid, status })
          .then(() => {
            project.status = status;
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.weni-project-list {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  height: 0;
  max-height: 100%;
  align-content: start;

  &__item {
    max-height: 156px;
    box-sizing: border-box;
  }

  &__create {
    padding: $unnnic-inset-md;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    color: $unnnic-color-neutral-cloudy;
    border-radius: $unnnic-border-radius-md;
    font-family: $unnnic-font-family-secondary;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    .title {
      margin-top: $unnnic-spacing-stack-xs;
    }
  }

  .project-loading-grid__item {
    width: 100%;

    > div {
      display: flex;

      &:first-child {
        margin-bottom: 11px;
      }

      div:first-child {
        margin-right: 15px;
      }
      div:last-child {
        margin-left: 5px;
      }
    }
    &__small {
      margin-top: 6px;
    }
  }
}
</style>
