<template>
  <div class="weni-project-list">
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
  .weni-project-list {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    width: 100%;
  }
</style>