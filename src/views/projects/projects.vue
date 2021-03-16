<template>
  <div class="unnnic-grid-lg">
    <div class="weni-projects unnnic-grid-span-11">
      <div class="weni-projects__header">
        <div class="weni-projects__info">
          <h1> {{ $t('projects.projects_title') }} </h1>
          <h2> {{ $t('projects.projects_subtitle') }} </h2>
        </div>
        <unnnic-button
          type="secondary"
          icon-left="button-refresh-arrows-1"
          @click="changeOrg()">
          {{ $t('projects.change_org') }}
        </unnnic-button>
      </div>
      <div class="weni-projects__separator" />
      <div class="weni-projects__list">
        <project-list
          :org="getCurrentOrgId" />
      </div>
    </div>
  </div>
</template>

<script>
import { unnnicButton } from 'unnic-system-beta';
import ProjectList from '../../components/projects/ProjectList';
import { mapGetters } from 'vuex';
export default {
  name: 'Projects',
  components: { unnnicButton, ProjectList },
  computed: {
    ...mapGetters(['getCurrentOrgId']),
  },
  methods: {
    changeOrg() {
      this.luigiClient.linkManager().navigate('/orgs/list');
    },
  },
  created() {
    if (!this.getCurrentOrgId) this.changeOrg();
  },
}
</script>

<style lang="scss" scoped>
   @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-projects {
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h1 {
      font-family: $unnnic-font-family-primary;
      margin: 0 0 $unnnic-spacing-stack-xs 0;
      font-size: $unnnic-font-size-title-lg;
      font-weight: $unnnic-font-weight-regular;
      color: $unnnic-color-neutral-black;
    }

    h2 {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      margin: 0;
      font-size: $unnnic-font-size-body-lg;
      color: $unnnic-color-neutral-dark;
      max-width: 500px;
    }

    &__list {
      height: 80vh;
      overflow-y: auto;
    }
    
    &__separator {
      margin: $unnnic-spacing-stack-md 0;
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    }
  }
</style>

