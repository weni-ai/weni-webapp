<template>
  <div class="weni-project-list">
    <div class="weni-project-list__create">
        <unnnic-icon
          class="weni-project-list__create__icon"
          icon="add-1"
          size="xl" />
        <p> {{ $t('projects.create') }} </p>
    </div>
    <project-list-item
      v-for="index in 42"
      :key="index"
      name="Project name"
      owner="user"
      time="Just now" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import ProjectListItem from './ProjectListItem';
export default {
  name: 'ProjectList',
  components: { ProjectListItem },
  props: {
    // org: {
    //   type: String,
    //   required: true,
    // },
  },
  methods: {
    ...mapActions([' getProjects ']),
  }
}
</script>

<style lang="scss" scoped>
  @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-project-list {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    width: 100%;

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
       min-height: 145px;
       box-sizing: border-box;

       &__icon {
         color: $unnnic-color-neutral-clean;
       }
    }
  }
</style>