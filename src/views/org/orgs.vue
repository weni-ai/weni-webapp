<template>
  <div :class="['weni-orgs', `status-${organizationsStatus}`]">
    <div>
      <div class="weni-orgs__left">
        <div :class="['box', 'aux-blue', 'weni-orgs__left__icon']">
          <unnnic-icon-svg icon="building-2-1" size="xl" scheme="aux-blue" />
        </div>

        <h1>
          {{
            organizationsStatus === 'empty'
              ? $t('orgs.orgs')
              : $t('orgs.new_org')
          }}
        </h1>

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
          <p>
            {{
              $t(
                organizationsStatus === 'empty'
                  ? 'orgs.orgs_description_empty'
                  : 'orgs.orgs_description',
              )
            }}
          </p>

          <router-link
            :to="{
              name: 'create_org',
              query: {
                plan: 'trial',
              },
            }"
          >
            <unnnic-button type="secondary" icon-left="add-1">
              {{ $t('orgs.add_org') }}
            </unnnic-button>
          </router-link>
        </template>
      </div>

      <div class="unnnic-grid-span-5 weni-orgs__right">
        <div v-if="organizationsStatus !== 'empty'" class="weni-orgs__list">
          <div class="orgs-title">
            {{ $t('orgs.orgs') }}
          </div>

          <div class="filters">
            <unnnic-input
              v-model="organizationName"
              icon-left="search-1"
              size="sm"
              :placeholder="$t('search')"
            ></unnnic-input>

            <list-ordinator
              v-model="order"
              :ordinators="['alphabetical', 'newer', 'older']"
            />
          </div>

          <org-list
            class="list-container"
            ref="orgList"
            :filter-name="organizationName"
            :ordering="order"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrgList from '../../components/orgs/orgList.vue';
import ListOrdinator from '@/components/ListOrdinator.vue';
import { mapActions } from 'vuex';

export default {
  name: 'Orgs',
  components: {
    OrgList,
    ListOrdinator,
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

  data() {
    return {
      error: false,
      organizationName: '',

      order: '',
    };
  },

  mounted() {
    this.clearCurrentOrg();
    this.clearCurrentProject();
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

  methods: {
    ...mapActions(['clearCurrentOrg', 'clearCurrentProject']),

    tryAgain() {
      this.$refs.orgList.reloadOrganizations();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

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
  }

  > div {
    .weni-orgs__left {
      margin: 0px auto;
      max-width: 25.8125rem;
      text-align: center;
      align-items: center;
    }
  }

  .box {
    border-radius: $unnnic-border-radius-sm;
    padding: $unnnic-spacing-inset-nano;

    &.aux-blue {
      background-color: rgba(
        $unnnic-color-aux-blue,
        $unnnic-opacity-level-extra-light
      );
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

    &::-webkit-scrollbar {
      display: none;
    }

    padding-bottom: $unnnic-spacing-stack-lg;

    .orgs-title {
      font-family: $unnnic-font-family-primary;
      color: $unnnic-color-neutral-black;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-title-md;
      line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
      padding-bottom: $unnnic-spacing-stack-sm;
      margin-bottom: $unnnic-spacing-stack-md;
      border-bottom: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-soft;
    }

    .filters {
      margin-bottom: $unnnic-spacing-stack-sm;
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

    > * {
      // margin-bottom: $unnnic-spacing-stack-xs;
    }

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
    padding: $unnnic-spacing-stack-lg 0;

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
</style>
