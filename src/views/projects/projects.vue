<template>
  <div class="weni-projects">
    <div class="container">
      <div v-show="!loadingPage" class="unnnic-grid-span-12 content">
        <div class="header">
          <div class="unnnic-grid-lg">
            <div class="unnnic-grid-span-6 title-container">
              <div class="title">
                {{ $t('projects.projects_title', { name: orgName }) }}
              </div>
            </div>

            <div class="unnnic-grid-span-6 subtitle-container">
              <div class="subtitle">
                {{ $t('projects.projects_subtitle') }}
              </div>
            </div>

            <div class="unnnic-grid-span-3 admin-buttons-container">
              <unnnic-tool-tip
                side="top"
                enabled
                :text="$t('orgs.manage_members')"
                v-if="isContributor || isAdmin"
              >
                <unnnic-button
                  type="secondary"
                  icon-center="single-neutral-actions-1"
                  @click="openManageMembers"
                />
              </unnnic-tool-tip>

              <unnnic-tool-tip
                side="top"
                enabled
                :text="$t('projects.change_org')"
                v-if="isContributor || isAdmin"
              >
                <router-link to="/orgs">
                  <unnnic-button
                    type="secondary"
                    icon-center="button-refresh-arrows-1"
                  />
                </router-link>
              </unnnic-tool-tip>

              <unnnic-tool-tip
                v-if="isAdmin"
                side="top"
                enabled
                :text="$t('orgs.billing')"
              >
                <router-link
                  :to="{
                    name: 'billing',
                    params: {
                      orgUuid: currentOrg.uuid,
                    },
                  }"
                >
                  <unnnic-button
                    type="secondary"
                    icon-center="currency-dollar-circle-1"
                  />
                </router-link>
              </unnnic-tool-tip>
            </div>
          </div>

          <div></div>
        </div>

        <div class="line"></div>

        <list-ordinator
          class="order"
          v-model="order"
          :ordinators="ordinators"
        />

        <div class="projects-list-container">
          <div
            class="projects-list"
            :style="{
              paddingRight: verifyMozilla,
            }"
          >
            <project-list
              v-if="orgUuid"
              :can-create-project="canCreateProject"
              :org="orgUuid"
              :order="order"
              @select-project="selectProject"
              @loading="loadingProject"
            />
          </div>
        </div>
      </div>

      <div v-show="loadingPage" class="unnnic-grid-span-12 content">
        <project-loading />
      </div>
    </div>
  </div>
</template>

<script>
import ProjectList from '../../components/projects/ProjectList';
import { mapGetters, mapActions } from 'vuex';
import ProjectLoading from '../loadings/projects';
import { get } from 'lodash';
import {
  ORG_ROLE_ADMIN,
  ORG_ROLE_CONTRIBUTOR,
} from '../../components/orgs/orgListItem.vue';
import ListOrdinator from '../../components/ListOrdinator.vue';

const orderProjectsLocalStorageKey = 'orderProjects';

export default {
  name: 'Projects',
  components: {
    ProjectList,
    ProjectLoading,
    ListOrdinator,
  },

  data() {
    return {
      order: '',
      verifyMozilla: '',
      ordinators: ['lastAccess', 'alphabetical', 'newer', 'older'],

      loadingProjects: false,

      firstLoading: false,
      hadFirstLoading: false,
    };
  },
  computed: {
    ...mapGetters(['currentOrg']),

    loadingPage() {
      return this.firstLoading;
    },

    orgUuid() {
      return get(this.currentOrg, 'uuid');
    },

    orgName() {
      return get(this.currentOrg, 'name');
    },

    isAdmin() {
      return get(this.currentOrg, 'authorization.is_admin');
    },

    isContributor() {
      return this.currentOrg?.authorization?.role === 2;
    },

    canCreateProject() {
      if (this.currentOrg?.is_suspended) {
        return false;
      }

      return [ORG_ROLE_CONTRIBUTOR, ORG_ROLE_ADMIN].includes(
        this.currentOrg?.authorization?.role,
      );
    },
  },

  beforeMount() {
    this.verifyMozilla =
      window.navigator.appCodeName === 'Mozilla' ? '15px' : '';
  },

  async created() {
    const orderProjects = localStorage.getItem(orderProjectsLocalStorageKey);

    if (!this.ordinators.includes(orderProjects)) {
      localStorage.removeItem(orderProjectsLocalStorageKey);
    }

    this.order =
      localStorage.getItem(orderProjectsLocalStorageKey) || this.ordinators[0];
  },

  watch: {
    order(value) {
      if (value === this.ordinators[0]) {
        localStorage.removeItem(orderProjectsLocalStorageKey);
      } else {
        localStorage.setItem(orderProjectsLocalStorageKey, value);
      }
    },
  },

  methods: {
    ...mapActions(['setCurrentProject']),

    openManageMembers() {
      this.$store.dispatch('openRightBar', {
        props: {
          type: 'OrgManageUsers',
          orgUuid: this.currentOrg.uuid,
        },
      });
    },

    openViewMembers() {
      this.$store.dispatch('openRightBar', {
        props: {
          type: 'OrgViewUsers',
          orgUuid: this.currentOrg.uuid,
        },
      });
    },

    loadingProject(payload) {
      if (payload && !this.hadFirstLoading) {
        this.firstLoading = true;
        this.hadFirstLoading = true;
      } else if (!payload) {
        this.firstLoading = false;
      }

      this.loadingProjects = payload;
    },

    selectProject(project, route) {
      this.setCurrentProject(project);
      this.$router.push(
        !route
          ? {
              name: 'home',
              params: {
                projectUuid: project.uuid,
              },
            }
          : route,
      );
      this.$root.$emit('set-sidebar-expanded');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-projects {
  display: flex;
  flex-direction: column;

  .container {
    flex: 1;
    margin-top: $unnnic-spacing-stack-md;
    padding-bottom: $unnnic-spacing-stack-lg;
    display: flex;
    border-bottom: 0.5rem solid $unnnic-color-brand-weni;

    .content {
      margin: 0 12.88%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;

      .title-container {
        display: flex;

        .title {
          color: $unnnic-color-neutral-black;
          font-family: $unnnic-font-family-primary;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-title-lg;
          line-height: $unnnic-font-size-title-lg + $unnnic-line-height-md;
        }
      }

      .subtitle-container {
        grid-row-start: 2;

        .subtitle {
          color: $unnnic-color-neutral-dark;
          font-family: $unnnic-font-family-secondary;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-body-lg;
          line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        }
      }

      .admin-buttons-container,
      .change-organization-button-container {
        align-self: center;
        grid-row: 1 / 3;

        .button {
          min-width: 100%;
        }

        ::v-deep a {
          text-decoration: none;
        }
      }

      .admin-buttons-container {
        grid-column-end: 13;
        display: flex;
        column-gap: 1.25rem;
        justify-content: flex-end;
      }

      .change-organization-button-container {
        grid-column-end: 13;
      }
    }

    .projects-list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 215px;

      .projects-list {
        $scroll-size: 4px;

        padding-right: 8px;
        width: 100%;
        height: 1px;
        flex: 1;
        overflow: auto;
        overflow: overlay;
        &::-webkit-scrollbar {
          width: $scroll-size;
        }

        &::-webkit-scrollbar-thumb {
          background: $unnnic-color-neutral-clean;
          border-radius: $unnnic-border-radius-pill;
        }

        &::-webkit-scrollbar-track {
          background: $unnnic-color-neutral-soft;
          border-radius: $unnnic-border-radius-pill;
          // background-color: blue;
        }
      }
    }
  }

  .line {
    height: 1px;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }

  .order {
    margin-bottom: $unnnic-spacing-stack-md;
  }

  ::v-deep .weni-project-list__item {
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.unnnic-grid-lg {
  width: 100%;
  padding: 0;
  grid-row-gap: $unnnic-spacing-stack-xs;
}
</style>
