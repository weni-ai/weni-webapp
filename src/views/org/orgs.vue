<template>
  <div class="weni-orgs">
    <div v-show="organizationsStatus !== 'loading'" class="unnnic-grid-lg">
      <div class="weni-orgs__left unnnic-grid-span-5">
        <unnnic-icon
          class="weni-orgs__left__icon"
          icon="building-2-1"
          size="xl"
          scheme="aux-blue"
          has-background
        />
        <h1>{{ $t('orgs.orgs') }}</h1>

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
          <p>{{ $t('orgs.orgs_description') }}</p>

          <router-link to="/orgs/create">
            <unnnic-button type="secondary" icon-left="add-1">
              {{ $t('orgs.add_org') }}
            </unnnic-button>
          </router-link>
        </template>
      </div>
      <div class="unnnic-grid-span-2" />
      <div class="unnnic-grid-span-5 weni-orgs__right">
        <div class="weni-orgs__main-wrapper">
          <org-list
            class="list-container"
            ref="orgList"
            @status="organizationsStatus = $event"
          />
        </div>
      </div>
    </div>
    <skeleton-loading v-show="organizationsStatus === 'loading'" />
  </div>
</template>

<script>
import OrgList from '../../components/orgs/orgList.vue';
import SkeletonLoading from '../loadings/orgs.vue';
import { mapActions } from 'vuex';

export default {
  name: 'Orgs',
  components: {
    OrgList,
    SkeletonLoading,
  },

  data() {
    return {
      error: false,
      organizationsStatus: '',
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
      } else if (status === 'loaded') {
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
  flex-direction: column;

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

  .weni-orgs__main-wrapper {
    max-height: calc(100vh - 200px);
    overflow: auto;
    padding-right: 0.5rem;
  }

  &__right {
    display: flex;
    flex-direction: column;
    justify-content: center;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  // &__list {
  //   overflow-y: scroll;
  //   -ms-overflow-style: none; /* IE and Edge */
  //   scrollbar-width: none;
  //   display: flex;
  //   flex-direction: column;
  //   justify-content: flex-start;
  //   max-height: 100%;
  //   height: 100%;

  //   > * {
  //     margin-bottom: $unnnic-spacing-stack-xs;
  //   }

  //   .list-container {
  //     margin: 0;
  //     max-height: 0;
  //   }

  //   flex: 1;
  //   overflow: overlay;
  //   min-height: 4rem;

  //   $scroll-size: $unnnic-inline-nano;
  //   padding-right: calc(#{$unnnic-inline-xs} + #{$scroll-size});
  //   width: 100%;

  //   &::-webkit-scrollbar {
  //     width: $scroll-size;
  //   }

  //   &::-webkit-scrollbar-thumb {
  //     background: $unnnic-color-neutral-clean;
  //     border-radius: $unnnic-border-radius-pill;
  //   }

  //   &::-webkit-scrollbar-track {
  //     background: $unnnic-color-neutral-soft;
  //     border-radius: $unnnic-border-radius-pill;
  //   }
  // }

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
</style>
