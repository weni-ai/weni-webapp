<template>
    <div class="weni-orgs">
        <div class="unnnic-grid-lg">
            <div class="weni-orgs__left unnnic-grid-span-3">
                <unnnic-icon class="weni-orgs__left__icon" icon="building-2-1" size="xl" scheme="aux-blue" has-background />
                <h1> {{ $t('orgs.orgs') }} </h1>

                <template v-if="error">
                  <p>{{ $t('orgs.error_on_loading_orgs') }}</p>

                  <unnnic-button
                    type="secondary"
                    icon-left="button-refresh-arrow-1"
                    @click="tryAgain()"
                    :disabled="organizationsStatus === 'loading'"
                  >
                    {{ $t('try_again') }}
                  </unnnic-button>
                </template>

                <template v-else>
                  <p> {{ $t('orgs.orgs_description') }} </p>
                  <unnnic-button type="secondary" icon-left="add-1" @click="createOrg()"> {{ $t('orgs.add_org') }} </unnnic-button>
                </template>
            </div>
            <div class="unnnic-grid-span-3"/>
            <div class="unnnic-grid-span-5 weni-orgs__right">
                <div class="weni-orgs__list">
                  <org-list ref="orgList" @selected="onSelectOrg()" @status="organizationsStatus = $event"/>
                </div>
            </div>
        </div>
        <footer />
    </div>
</template>

<script>
import OrgList from '../../components/orgs/orgList.vue';

export default {
  name: 'Orgs',
  components: {
    OrgList,
  },
  
  data() {
    return {
      error: false,
      organizationsStatus: '',
    }
  },

  watch: {
    organizationsStatus(status) {
      if (status === 'error') {
        this.error = true;
      } else if (status === 'loaded') {
        this.error = false;
      }
    },
  },

  methods: {
    tryAgain() {
      this.$refs.orgList.reloadOrganizations();
    },

    createOrg() {
      this.luigiClient.linkManager().navigate('/orgs/create');
    },
    onSelectOrg() {
      this.luigiClient.linkManager().navigate('/projects/list');
    }
  }
}
</script>

<style lang="scss" scoped>
    @import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

    .weni-orgs {
        display: flex;
        flex-direction: column;
        &__right {
            height: calc(100vh - 0.5rem);
            display: flex;
            flex-direction: column;
            justify-content: center;

            &::-webkit-scrollbar {
                display:none;
            }
        }

        &__list {
            // align-items: flex-start;
            overflow-y: scroll;
            // overflow: hidden;
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            max-height: 100%;
            justify-content: center;
            height: 100%;
            padding: 4px 0 0 0;

            &::-webkit-scrollbar {
              display: none;
            }

            > * {
                margin-bottom: $unnnic-spacing-stack-xs;
            }
        }

        &__left {
            font-family: $unnnic-font-family-primary;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            height: 100%;

            &__icon {
                margin: 0 0 $unnnic-spacing-stack-md 0;
            }

            h1 {
                font-size: $unnnic-font-size-title-lg;
                font-weight: $unnnic-font-weight-regular;
                margin: 0 0 $unnnic-spacing-stack-xs 0;
            }

            p {
                font-family: $unnnic-font-family-secondary;
                font-size: $unnnic-font-size-body-lg;
                margin: 0 0 $unnnic-spacing-stack-md 0;
                color: $unnnic-color-neutral-dark;
            }
        }
    }

    footer {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      &::before {
        content: '';
        height: 0.5rem;
        display: block;
        background-color: $unnnic-color-brand-weni;
      }
    }
</style>