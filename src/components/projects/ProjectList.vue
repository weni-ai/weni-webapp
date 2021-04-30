<template>
  <div class="weni-project-list infinite-wrapper">
    <div class="weni-project-list__item weni-project-list__create unnnic--clickable" @click="onCreate()">
        <unnnic-icon
          class="weni-project-list__create__icon"
          icon="add-1"
          size="xl" />
      <div class="title">
        {{ $t('projects.create.create') }}
      </div>
    </div>
    <project-list-item
      class="weni-project-list__item unnnic--clickable"
      v-for="(project, index) in projectsOrdered"
      :key="index"
      :name="project.name"
      owner="user"
      :time="timeLabel()"
      @click="selectProject(project)"
      :ai-count="project.inteligence_count"
      :flows-count="project.flow_count"
      :contact-count="project.contact_count"
    />
      <infinite-loading ref="infiniteLoading" @infinite="infiniteHandler" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import ProjectListItem from './ProjectListItem';
import InfiniteLoading from '../InfiniteLoading';

const localStorageSaver = (key, defaultValue = {}) => {
  const data = localStorage.getItem(key);

  let value;

  if (data) {
    try {
      value = JSON.parse(data);
    } catch (error) {
      console.log(error);
    }
  } else {
    value = defaultValue;
  }

  return {
    value,

    save() {
      localStorage.setItem(key, JSON.stringify(this.value));
    },
  }
}

export default {
  name: 'ProjectList',
  components: { ProjectListItem, InfiniteLoading },
  props: {
    org: {
      type: String,
      required: true,
    },

    order: {
      type: String,
    }
  },
  data() {
    return {
      projects: [],
      page: 1,
      complete: false,
    };
  },

  computed: {
    ordering() {
      if (this.order === 'alphabetical') {
        return 'name';
      }

      return '';
    },

    projectsOrdered() {
      if (this.order === 'lastAccess') {
        const saver = localStorageSaver('projects', []);

        return this.projects.slice().sort((project1, project2) => {
          const projectSaved1 = saver.value.find(item => item.uuid === project1.uuid);
          const projectSaved2 = saver.value.find(item => item.uuid === project2.uuid);

          if (projectSaved1 && projectSaved1.lastAccess && !projectSaved2) {
            return -1;
          }

          if (projectSaved2 && projectSaved2.lastAccess && !projectSaved1) {
            return 1;
          }

          if (!projectSaved1 && !projectSaved2) {
            return 0;
          }

          if (projectSaved1.lastAccess > projectSaved2.lastAccess) {
            return -1;
          }

          if (projectSaved1.lastAccess < projectSaved2.lastAccess) {
            return 1;
          }

          return 0;
        });
      } else {
        return this.projects;
      }
    },
  },

  watch: {
    order(value) {
      if (value === 'alphabetical') {
        this.projects = [];
        this.page = 1;
        this.complete = false;
        this.$refs.infiniteLoading.reset();
      }
    }
  },
  
  methods: {
    ...mapActions(['getProjects']),
    async infiniteHandler($state) {
      try {
        await this.fetchProjects();
      } catch(e) {
        $state.error();
      } finally {
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    timeLabel() {
      const date = Date.now();
      return getTimeAgo(date, this.getCurrentLanguage);
    },
    async fetchProjects() {
      const response = await this.getProjects({
        page: this.page,
        orgId: this.org,
        limit: 12,
        ordering: this.ordering,
      });

      this.page = this.page + 1;
      this.projects = [...this.projects, ...response.data.results];
      this.complete = response.data.next == null;
    },
    onCreate() {
      this.luigiClient.linkManager().navigate('/projects/create');
    },
    selectProject(project) {
      const saver = localStorageSaver('projects', []);

      const projectSaved = saver.value.find(item => item.uuid === project.uuid);

      if (projectSaved) {
        projectSaved.lastAccess = new Date().getTime();
      } else {
        saver.value.push({
          uuid: project.uuid,
          lastAccess: new Date().getTime(),
        });
      }

      saver.save();

      this.$emit('select-project', project);
    },
  }
}
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

       &__icon {
         color: $unnnic-color-neutral-clean;
       }
    }
  }
</style>