<template>
  <div class="account-init-modal">
    <div class="account-init-modal__container">
      <div class="account-init-modal__container__header">
        <Indicator
          class="account-init-modal__container__header-indicator"
          :steps="steps.length"
          :current="current"
          :names="steps.map((step) => step.titleIndicator)"
        />
        <h1>{{ steps[current - 1].title }}</h1>
        <p>
          {{ steps[current - 1].subtitle }}
        </p>
      </div>

      <AccountInfo
        v-if="current === 1"
        :phone.sync="user.phone"
        :company-name.sync="company.name"
        :company-size.sync="company.number_people"
        :company-segment.sync="company.segment"
      />

      <AccountCompanySector v-else-if="current === 2" :sector.sync="sector" />

      <AccountCompanySubSector
        v-else-if="current === 3"
        :sector="sector"
        :sub-sector.sync="subSector"
      />

      <div class="navigation">
        <unnnic-button
          v-if="current !== 1"
          type="terciary"
          size="small"
          @click="handleBackPage"
        >
          {{ $t('orgs.create.back') }}
        </unnnic-button>

        <unnnic-button
          type="secondary"
          size="small"
          @click="handleNextPage"
          :disabled="!canGoNext"
          :loading="loading"
        >
          {{ $t('orgs.create.next') }}
        </unnnic-button>
      </div>
    </div>
  </div>
</template>

<script>
import Indicator from '@/components/orgs/indicator';
import AccountInfo from './AccountInitModalSteps/AccountInfo.vue';
import AccountCompanySector from './AccountInitModalSteps/AccountCompanySector.vue';
import AccountCompanySubSector from './AccountInitModalSteps/AccountCompanySubSector.vue';
import { mapActions, mapState } from 'vuex';

export default {
  components: {
    Indicator,
    AccountInfo,
    AccountCompanySector,
    AccountCompanySubSector,
  },
  computed: {
    ...mapState({
      loading: (state) => state.Account.initialInfoLoading,
    }),

    steps() {
      return [
        {
          title: this.$t('account.init.info.title'),
          subtitle: this.$t('account.init.info.subtitle'),
          titleIndicator: this.$t('account.init.info.titleIndicator'),
          icon: '',
        },
        {
          title: this.$t('account.init.sector.title'),
          subtitle: this.$t('account.init.sector.subtitle'),
          titleIndicator: this.$t('account.init.sector.titleIndicator'),
          icon: '',
        },
        {
          title: this.$t('account.init.category.title'),
          subtitle: this.$t('account.init.category.subtitle', {
            value: this.sector?.title,
          }),
          titleIndicator: this.$t('account.init.category.titleIndicator'),
          icon: '',
        },
      ];
    },

    canGoNext() {
      if (this.current === 1) {
        return (
          this.user.phone &&
          this.company.name &&
          this.company.number_people &&
          this.company.segment
        );
      } else if (this.current === 2) {
        return (
          (!this.sector?.insert && this.sector) ||
          (this.sector?.insert && this.sector?.other)
        );
      } else if (this.current === 3) {
        return (
          (!this.subSector?.insert && this.subSector) ||
          (this.subSector?.insert && this.subSector?.other)
        );
      }

      return false;
    },
  },
  data() {
    return {
      user: {
        phone: '',
      },

      company: {
        name: '',
        number_people: '',
        segment: '',
      },

      current: 1,

      sector: null,

      subSector: null,
    };
  },
  methods: {
    ...mapActions(['addInitialInfo']),

    async handleNextPage() {
      if (this.canGoNext && this.current === 3) {
        console.log('entrou 2');
        try {
          const a = await this.addInitialInfo({
            company: {
              ...this.company,
              sector:
                this.sector.value === 'others'
                  ? this.sector.other
                  : this.sector.value,
              weni_helps:
                this.subSector.valuee === 'others'
                  ? this.subSector.other
                  : this.subSector.value,
            },
            user: this.user,
          });
          console.log(a);
        } catch (error) {
          console.log(error);
        }
      }
      this.current++;
    },
    handleBackPage() {
      this.current--;
    },
  },
};
</script>

<style socped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.account-init-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1;

  &__container {
    box-sizing: border-box;

    font-family: $unnnic-font-family-secondary;
    background-color: $unnnic-color-background-carpet;
    padding: $unnnic-squish-lg;
    border-radius: $unnnic-border-radius-sm;
    box-shadow: $unnnic-shadow-level-separated;
    width: 100%;
    max-width: 628px;
    min-height: 29.5625rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__header {
      display: flex;
      align-items: center;
      flex-direction: column;

      &-indicator {
        max-width: 286px;
      }

      h1 {
        margin-top: 48px;
        margin-bottom: 4px;
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        color: $unnnic-color-neutral-darkest;
      }
      p {
        margin: 0;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        color: $unnnic-color-neutral-cloudy;
      }
    }

    .navigation {
      display: flex;
      gap: 32px;
      width: 100%;
      max-width: 356px;
      align-self: center;

      margin-top: 16px;

      button {
        width: 100%;
      }
    }
  }
}
</style>
