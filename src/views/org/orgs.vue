<template>
  <div :class="['weni-orgs', `status-${organizationsStatus}`]">
    <div>
      <div class="weni-orgs__left">
        <div class="page-header">
          <UnnnicAvatarIcon
            v-if="organizationsStatus === 'empty'"
            class="weni-orgs__left__icon"
            icon="building-2-1"
            size="xl"
            scheme="weni-600"
          />

          <div>
            <h1>
              {{ $t('orgs.orgs') }}
            </h1>

            <p>
              {{
                $t(
                  organizationsStatus === 'empty'
                    ? 'orgs.orgs_description_empty'
                    : 'orgs.orgs_description',
                )
              }}
            </p>
          </div>

          <template v-if="error">
            <p>{{ $t('orgs.error_on_loading_orgs') }}</p>

            <UnnnicButton
              type="secondary"
              iconLeft="button-refresh-arrow-1"
              :disabled="organizationsStatus === 'loading'"
              @click="tryAgain()"
            >
              {{ $t('try_again') }}
            </UnnnicButton>
          </template>

          <template v-else>
            <RouterLink
              :to="{
                name: 'create_org',
              }"
            >
              <UnnnicButton
                class="create-org-button"
                type="primary"
                iconLeft="add-1"
              >
                {{ $t('orgs.add_org') }}
              </UnnnicButton>
            </RouterLink>
          </template>
        </div>
      </div>

      <template v-if="organizationsStatus !== 'empty'">
        <hr />

        <div class="unnnic-grid-span-5 weni-orgs__right">
          <div class="weni-orgs__list">
            <div class="filters">
              <UnnnicInput
                v-model="organizationName"
                iconLeft="search-1"
                size="md"
                :placeholder="$t('search')"
              ></UnnnicInput>

              <ListOrdinator
                v-model="$store.state.Org.orgs.ordering"
                :ordinators="['alphabetical', 'newer', 'older']"
              />
            </div>

            <OrgList
              ref="orgList"
              class="list-container"
              :filterName="organizationName"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import OrgList from '../../components/orgs/orgList.vue';
import ListOrdinator from '@/components/ListOrdinator.vue';
import { mapActions } from 'vuex';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Orgs',
  components: {
    OrgList,
    ListOrdinator,
  },

  data() {
    return {
      error: false,
      organizationName: '',
    };
  },
  computed: {
    organizationsStatus() {
      if (
        this.$store.state.Org.orgs.status === 'complete' &&
        this.$store.state.Org.orgs.data.length === 0
      ) {
        return 'empty';
      }

      return this.$store.state.Org.orgs.status;
    },
  },

  watch: {
    organizationsStatus(status) {
      if (status === 'error') {
        this.error = true;
      } else if (status === 'loaded' || status === 'empty') {
        this.error = false;
      }
    },
  },

  mounted() {
    this.clearCurrentOrg();
    this.clearCurrentProject();
  },

  methods: {
    ...mapActions(['clearCurrentOrg', 'clearCurrentProject']),

    tryAgain() {
      this.$refs.orgList.reloadOrganizations();
    },
  },
};
</script>

<style lang="scss" scoped>
hr {
  width: 100%;
  margin-block: $unnnic-spacing-xl;
  border-width: 0;
  margin-block-start: $unnnic-spacing-xl - $unnnic-border-width-thinner;
  border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
}

.weni-orgs {
  display: flex;
  margin: 0 12.88%;
  flex: 1;
  display: flex;
  flex-direction: column;

  &.page {
    overflow: initial !important;
  }

  &.status-empty {
    justify-content: center;

    .page-header {
      display: block;

      p {
        margin: 0 0 $unnnic-spacing-stack-md 0;
      }

      .create-org-button {
        width: 15.625 * $unnnic-font-size;
      }
    }

    > div {
      .weni-orgs__left {
        margin: 0px auto;
        max-width: 25.8125rem;
        text-align: center;
        align-items: center;
      }
    }
  }

  a {
    text-decoration: none;
  }

  .unnnic-grid-lg {
    flex: 1;
    padding: 0;
    box-sizing: border-box;
    padding: 0 12.88%;
    padding-bottom: $unnnic-spacing-stack-xl - ($unnnic-border-width-thick * 2);
    border-bottom: $unnnic-border-width-thick * 2 solid $unnnic-color-brand-weni;
  }

  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: $unnnic-spacing-stack-lg;

    &::-webkit-scrollbar {
      display: none;
    }

    .filters {
      margin-bottom: $unnnic-spacing-stack-md;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: $unnnic-spacing-stack-sm $unnnic-spacing-inline-md;

      .unnnic-form {
        flex: 1;
        min-width: 14rem;
      }
    }
  }

  &__list {
    // overflow-y: scroll;
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // max-height: 100%;
    // height: 100%;

    // > * {
    //   margin-bottom: $unnnic-spacing-stack-xs;
    // }

    flex: 1;
    // overflow: overlay;
    // min-height: 4rem;

    $scroll-size: $unnnic-inline-nano;
    // padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
    width: 100%;

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
    }
  }

  &__left {
    font-family: $unnnic-font-family-primary;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin: $unnnic-spacing-stack-lg 0;

    &__icon {
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      column-gap: 12%;

      h1 {
        font-family: $unnnic-font-family-primary;
        color: $unnnic-color-neutral-darkest;
        font-weight: $unnnic-font-weight-bold;
        font-size: $unnnic-font-size-title-lg;
        line-height: $unnnic-font-size-title-lg + $unnnic-line-height-md;

        margin: 0 0 $unnnic-spacing-sm 0;
      }

      p {
        font-family: $unnnic-font-family-secondary;
        color: $unnnic-color-neutral-dark;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;

        margin: 0;
      }

      .create-org-button {
        width: 19.875 * $unnnic-font-size;
      }
    }
  }
}
</style>
