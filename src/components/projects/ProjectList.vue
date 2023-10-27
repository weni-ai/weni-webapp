<template>
  <div class="weni-project-list infinite-wrapper">
    <div
      v-if="canCreateProject"
      class="
        weni-project-list__item weni-project-list__create
        unnnic--clickable
      "
      @click="onCreate"
    >
      <unnnic-icon-svg scheme="neutral-clean" icon="add-1" size="xl" />
      <div class="title">
        {{ $t('projects.create.create') }}
      </div>
    </div>
    <project-list-item
      class="weni-project-list__item"
      v-for="(project, index) in projectsOrdered"
      :key="index"
      :project="project"
      :uuid="project.uuid"
      :name="project.name"
      :time="timeLabel()"
      @click="selectProject(project, $event)"
      @added-authorization="addAuthorization(project.uuid, $event)"
      @deleted-authorization="deleteAuthorization(project.uuid, $event)"
      @changed-role-authorization="
        changedRoleAuthorization(project.uuid, $event)
      "
      @updated-project="updateProject(project.uuid, $event)"
      :ai-count="project.inteligence_count"
      :flows-count="project.flow_count"
      :contact-count="project.total_contact_count"
      :authorizations="project.authorizations"
      :pending-authorizations="project.pending_authorizations"
    />

    <div
      v-show="orgProjects.status !== 'complete'"
      ref="infinite-loading-element"
    >
      <div class="project-loading-grid__item">
        <div>
          <unnnic-skeleton-loading
            :style="{ flex: 1 }"
            tag="div"
            height="49px"
          />
          <unnnic-skeleton-loading
            class="project-loading-grid__item__small"
            tag="div"
            width="12px"
            height="12px"
          />
          <unnnic-skeleton-loading tag="div" width="51px" height="25px" />
        </div>
        <unnnic-skeleton-loading tag="div" width="100%" height="50px" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import ProjectListItem from './ProjectListItem';
import localStorageSaver from './localStorageSaver.js';

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
    },

    canCreateProject: {
      type: Boolean,
    },
  },
  data() {
    return {
      isInfiniteLoadingElementShowed: false,
      intersectionObserver: null,
    };
  },

  computed: {
    ...mapState({
      profile: (state) => state.Account.profile,
    }),

    orgProjects() {
      return this.$store.state.Project.projects.find(
        ({ orgUuid }) => orgUuid === this.$route.params.orgUuid,
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
      return this.orgProjects.data.slice().sort((a, b) => {
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

  beforeDestroy() {
    this.intersectionObserver.unobserve(this.$refs['infinite-loading-element']);
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
            if (
              this.isInfiniteLoadingElementShowed &&
              this.orgProjects.status !== 'complete'
            ) {
              this.loadNextProjects();
            }
          }, 0);
        });
    },

    addAuthorization(projectUuid, { isPending, authorization }) {
      this.orgProjects.data
        .find((project) => project.uuid === projectUuid)
        [isPending ? 'pending_authorizations' : 'authorizations'].users.push(
          authorization,
        );
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

      const chatsAttribute = project.menu.chat.length
        ? 'rocket_authorization'
        : 'chats_role';

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
    updateProject(projectUuid, projectName) {
      this.orgProjects.data.find(
        (project) => project.uuid === projectUuid,
      ).name = projectName;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
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
