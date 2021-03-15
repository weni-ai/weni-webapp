<template>
  <div class="weni-projects">
    <div class="weni-projects__header">
      <div class="weni-projects__info">
        <h1> Projetos na Weni </h1>
        <h2> Visualize abaixo os projetos existentes dentro da sua organização. Se preferir, você pode criar um projeto do zero. </h2>
      </div>
      <unnnic-button
        type="secondary"
        icon-left="button-refresh-arrows-1"
        @click="changeOrg()">
        Trocar de organização
      </unnnic-button>
    </div>
    <div class="weni-projects__separator" />
    <div class="weni-projects__list">
      <project-list class="weni-projects__list" />
  </div>
  </div>
</template>

<script>
import { unnnicButton } from 'unnic-system-beta';
import ProjectList from '../../components/projects/ProjectList';
export default {
  name: 'Projects',
  components: { unnnicButton, ProjectList },
  methods: {
    changeOrg() {
      this.luigiClient.linkManager().navigate('/orgs/list');
    },
  }
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
    }

    &__list {
      max-height: 80vh;
      overflow: auto;
    }
    
    &__separator {
      margin: $unnnic-spacing-stack-md 0;
      border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    }
  }
</style>

