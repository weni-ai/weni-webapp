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

            <div
              v-if="isAdmin"
              class="unnnic-grid-span-3 admin-buttons-container"
            >
              <unnnic-tool-tip
                side="top"
                enabled
                :text="$t('orgs.manage_members')"
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
              >
                <router-link to="/orgs">
                  <unnnic-button
                    type="secondary"
                    icon-center="button-refresh-arrows-1"
                    @click="openManageMembers"
                  />
                </router-link>
              </unnnic-tool-tip>

              <unnnic-tool-tip side="top" enabled :text="$t('orgs.billing')">
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
                    @click="openManageMembers"
                  />
                </router-link>
              </unnnic-tool-tip>
            </div>

            <div
              v-else
              class="unnnic-grid-span-3 change-organization-button-container"
            >
              <router-link to="/orgs">
                <unnnic-button
                  type="secondary"
                  icon-left="button-refresh-arrows-1"
                  class="button"
                >
                  {{ $t('projects.change_org') }}
                </unnnic-button>
              </router-link>
            </div>
          </div>
        </div>

        <div class="line"></div>

        <div class="order">
          <span class="label">
            {{ $t('projects.ordinators.label') }}
          </span>

          <unnnic-radio
            v-for="(option, index) in ordinators"
            :key="index"
            class="radio"
            v-model="order"
            size="md"
            :value="option.value"
          >
            {{ $t(`projects.ordinators.${option.text}`) }}
          </unnnic-radio>
        </div>

        <div class="projects-list-container">
          <div
            class="projects-list"
            :style="{
              paddingRight: verifyMozilla,
            }"
          >
            <project-list
              v-if="orgUuid"
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

    <right-side-bar
      type="view-members"
      v-model="isMemberViewerBarOpen"
      :props="{
        organization: currentOrg,
      }"
    />

    <right-side-bar
      type="manage-members"
      v-model="isMemberManagementBarOpen"
      :props="{
        organization: currentOrg,
      }"
    />
  </div>
</template>

<script>
import ProjectList from '../../components/projects/ProjectList';
import RightSideBar from '../../components/RightSidebar.vue';
import { mapGetters, mapActions } from 'vuex';
import ProjectLoading from '../loadings/projects';
import { get } from 'lodash';

const orderProjectsLocalStorageKey = 'orderProjects';
export default {
  name: 'Projects',
  components: {
    ProjectList,
    ProjectLoading,
    RightSideBar,
  },

  data() {
    return {
      order: '',
      verifyMozilla: '',
      ordinators: [
        {
          default: true,
          value: 'lastAccess',
          text: 'last_access',
        },
        {
          value: 'alphabetical',
          text: 'alphabetical',
        },
        {
          value: 'newer',
          text: 'newer',
        },
        {
          value: 'older',
          text: 'older',
        },
      ],

      loadingProjects: false,

      isMemberViewerBarOpen: false,
      isMemberManagementBarOpen: false,

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
  },

  beforeMount() {
    this.verifyMozilla =
      window.navigator.appCodeName === 'Mozilla' ? '15px' : '';
  },

  async created() {
    const orderProjects = localStorage.getItem(orderProjectsLocalStorageKey);

    if (
      !this.ordinators.some(
        (ordinator) => ordinator.value === orderProjects && !ordinator.default,
      )
    ) {
      localStorage.removeItem(orderProjectsLocalStorageKey);
    }

    this.order =
      localStorage.getItem(orderProjectsLocalStorageKey) ||
      this.ordinators.find((ordinator) => ordinator.default).value;
  },

  watch: {
    order(value) {
      if (
        value === this.ordinators.find((ordinator) => ordinator.default).value
      ) {
        localStorage.removeItem(orderProjectsLocalStorageKey);
      } else {
        localStorage.setItem(orderProjectsLocalStorageKey, value);
      }
    },
  },

  methods: {
    ...mapActions(['setCurrentProject']),

    openManageMembers() {
      this.isMemberManagementBarOpen = true;
    },

    openViewMembers() {
      this.isMemberViewerBarOpen = true;
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
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    margin-bottom: $unnnic-spacing-stack-md;

    .label {
      margin-right: $unnnic-spacing-inline-nano;
    }

    .radio {
      margin-right: $unnnic-spacing-inline-xs;
    }
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
