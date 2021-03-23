<template>
  <div class="weni-project-list infinite-wrapper">
    <div class="weni-project-list__item weni-project-list__create unnnic--clickable" @click="onCreate()">
        <unnnic-icon
          class="weni-project-list__create__icon"
          icon="add-1"
          size="xl" />
        <p> {{ $t('projects.create.create') }} </p>
    </div>
    <project-list-item
      class="weni-project-list__item unnnic--clickable"
      v-for="(project, index) in projects"
      :key="index"
      :name="project.name"
      owner="user"
      :time="timeLabel()"
      @click="selectProject(project)"
    />
      <infinite-loading ref="infiniteLoading" @infinite="infiniteHandler" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getTimeAgo } from '../../utils/plugins/timeAgo';
import ProjectListItem from './ProjectListItem';
import InfiniteLoading from '../InfiniteLoading';
export default {
  name: 'ProjectList',
  components: { ProjectListItem, InfiniteLoading },
  props: {
    org: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      projects: [],
      page: 1,
      complete: false,
    };
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
      const response = await this.getProjects({page: this.page, orgId: this.org, limit: 12});
      this.page = this.page + 1;
      this.projects = [...this.projects, ...response.data.results];
      this.complete = response.data.next == null;
    },
    onCreate() {
      this.luigiClient.linkManager().navigate('/projects/create');
    },
    selectProject(project) {
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
    height: 100%;
    max-height: 100%;
    align-content: start;

    &__item {
      max-height: 156px;
      box-sizing: border-box;
    }

    &__create {
       padding: $unnnic-inset-sm;
       border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
       color: $unnnic-color-neutral-cloudy;
       border-radius: $unnnic-border-radius-md;
       font-family: $unnnic-font-family-secondary;
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       box-sizing: border-box;

       &__icon {
         color: $unnnic-color-neutral-clean;
       }
    }
  }
</style>