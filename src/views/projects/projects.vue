<template>
 <div class="weni-projects">
    <div class="container">
      <div class="unnnic-grid-span-12 content">
        <div class="header">
          <div class="unnnic-grid-lg">
            <div class="unnnic-grid-span-6 title-container">
              <div class="title">
                {{ $t('projects.projects_title', { name: organization.name }) }}
              </div>
            </div>

            <div class="unnnic-grid-span-6 subtitle-container">
              <div class="subtitle">
                {{ $t('projects.projects_subtitle') }}
              </div>
            </div>

            <div class="unnnic-grid-span-3 view-or-menage-organization-members-button-container">
              <unnnic-button
                v-if="organization.authorization.is_admin"
                type="secondary"
                icon-left="single-neutral-actions-1"
                @click="openManageMembers"
                class="button"
              >
                {{ $t('orgs.manage_members') }}
              </unnnic-button>

              <unnnic-button
                v-else
                type="secondary"
                icon-left="view-1-1"
                @click="openViewMembers"
                class="button"
              >
                {{ $t('orgs.view_members') }}
              </unnnic-button>
            </div>

            <div class="unnnic-grid-span-3 change-organization-button-container">
              <router-link to="/orgs/list">
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
          <div class="projects-list">
            <project-list
              :org="getCurrentOrgId()"
              :order="order"
              @select-project="selectProject"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { unnnicButton } from '@weni/unnnic-system';
import ProjectList from '../../components/projects/ProjectList';
import { mapGetters } from 'vuex';

const orderProjectsLocalStorageKey = 'orderProjects';

export default {
  name: 'Projects',
  components: {
    unnnicButton,
    ProjectList,
  },
  data() {
    return {
      order: '',

      ordinators: [{
        default: true,
        value: 'lastAccess',
        text: 'last_access',
      }, {
        value: 'alphabetical',
        text: 'alphabetical',
      }, {
        value: 'newer',
        text: 'newer',
      }, {
        value: 'older',
        text: 'older',
      }],
    };
  },
  computed: {
    ...mapGetters(['getCurrentOrgId']),

    organization() {
      try {
        return JSON.parse(window.localStorage.getItem('org'));
      } catch (e) {
        return {};
      }
    },
  },

  created() {
    const orderProjects = localStorage.getItem(orderProjectsLocalStorageKey);

    if (!this.ordinators.some((ordinator) =>
      ordinator.value === orderProjects
      && !ordinator.default
    )) {
      localStorage.removeItem(orderProjectsLocalStorageKey);
    }

    this.order = localStorage.getItem(orderProjectsLocalStorageKey)
      || this.ordinators.find((ordinator) => ordinator.default).value;
  },

  watch: {
    order(value) {
      if (value === this.ordinators.find((ordinator) => ordinator.default).value) {
        localStorage.removeItem(orderProjectsLocalStorageKey);
      } else {
        localStorage.setItem(orderProjectsLocalStorageKey, value);
      }
    },
  },

  methods: {
    openManageMembers() {
      this.$root.$emit('manage-members', {
        organization: this.organization,
      });
    },

    openViewMembers() {
      this.$root.$emit('view-members', {
        organization: this.organization,
      });
    },

    selectProject(project) {
      const projectObject = {
        uuid: project.uuid,
        organization: {
          uuid: project.organization,
        },
        name: project.name,
        flow_organization: {
          uuid: project.flow_organization,
        }
      };

      window.localStorage.setItem('_project', JSON.stringify(projectObject));

      this.$router.push('/home/index');
      this.$root.$emit('set-sidebar-expanded');
    },
  },
}
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

      .view-or-menage-organization-members-button-container, .change-organization-button-container {
        align-self: center;
        grid-row: 1 / 3;

        .button {
          min-width: 100%;
        }

        ::v-deep a {
          text-decoration: none;
        }
      }

      .view-or-menage-organization-members-button-container {
        grid-column-end: 10;
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

        padding-right: calc(#{$unnnic-inline-nano} + #{$scroll-size});
        width: 100%;
        height: 1px;
        flex: 1;
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

