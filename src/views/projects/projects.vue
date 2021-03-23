<template>
 <div class="weni-projects">
    <div class="container">
      <div class="unnnic-grid-span-12 content">
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

            <div class="unnnic-grid-span-3 change-organization-button-container">
              <unnnic-button
                type="secondary"
                icon-left="button-refresh-arrows-1"
                @click="changeOrg()"
                class="button"
              >
                {{ $t('projects.change_org') }}
              </unnnic-button>
            </div>
          </div>
        </div>

        <div class="line"></div>

        <div class="projects-list-container">
          <div class="projects-list">
            <project-list
              :org="getCurrentOrgId()"
              @select-project="selectProject"
            />
          </div>
        </div>
      </div>
    </div>

    <footer />
  </div>
</template>

<script>
import { unnnicButton } from '@weni/unnnic-system';
import ProjectList from '../../components/projects/ProjectList';
import { mapGetters } from 'vuex';
export default {
  name: 'Projects',
  components: { unnnicButton, ProjectList },
  data() {
    return {
      orgName: '',
    };
  },
  computed: {
    ...mapGetters(['getCurrentOrgId']),
  },
  mounted() {
    try {
      const { name } = JSON.parse(window.localStorage.getItem('org'));
      this.orgName = name;
    } catch(e) {
      return null;
    }
  },
  methods: {
    changeOrg() {
      this.luigiClient.linkManager().navigate('/orgs/list');
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
          id: project.flow_organization_id,
        }
      };

      window.localStorage.setItem('_project', JSON.stringify(projectObject));

      this.luigiClient.linkManager().navigate('/home/index');
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.weni-projects {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .container {
    flex: 1;
    margin: 0 12.88%;
    margin-top: $unnnic-spacing-stack-md;
    margin-bottom: $unnnic-spacing-stack-lg;

    .content {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 0.5rem - 32px - 24px);
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

      .change-organization-button-container {
        align-self: center;
        grid-column-end: 13;
        grid-row: 1 / 3;

        .button {
          min-width: 100%;
        }
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

footer {
  height: 0.5rem;
  background-color: $unnnic-color-brand-weni;
}
</style>

