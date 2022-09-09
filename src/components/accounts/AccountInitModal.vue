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
        @handleNextStepAccount="getAccountInfoData"
      />

      <AccountCompanySector
        v-else-if="current === 2"
        @handleBackToStepAccount="handleBackPage"
        @handleNextToSubSector="
          sector = $event;
          handleNextPage();
        "
      />

      <AccountCompanySubSector
        v-else-if="current === 3"
        :sector="sector"
        @handleFinishProcess="handleNextPage"
        @handleBackToCompanySector="handleBackPage"
      />
    </div>
  </div>
</template>

<script>
import Indicator from '@/components/orgs/indicator';
import AccountInfo from './AccountInitModalSteps/AccountInfo.vue';
import AccountCompanySector from './AccountInitModalSteps/AccountCompanySector.vue';
import AccountCompanySubSector from './AccountInitModalSteps/AccountCompanySubSector.vue';

export default {
  components: {
    Indicator,
    AccountInfo,
    AccountCompanySector,
    AccountCompanySubSector,
  },
  computed: {
    steps() {
      return [
        {
          title: this.$t('account.init.info.title'),
          subtitle: this.$t('account.init.info.subtitle'),
          titleIndicator: this.$t('account.init.info.titleIndicator'),
          icon: '',
        },
        {
          title: 'title 2',
          subtitle: '',
          icon: '',
        },
        {
          title: 'Como a plataforma Weni vai ajudar a sua equipe? 👨‍💻',
          subtitle: `Ótimo, vamos otimizar o processo ${this.sector?.title}`,
          icon: '',
        },
      ];
    },
  },
  data() {
    return {
      current: 2,

      sector: null,
    };
  },
  methods: {
    handleNextPage() {
      this.current++;
    },
    handleBackPage() {
      this.current--;
    },
    getAccountInfoData({ cellphone, companyName, companySector, companySize }) {
      this.user = {
        phone: cellphone,
      };
      this.company = {
        name: companyName,
        number_people: companySize,
        sector: companySector,
      };
      this.handleNextPage();
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

    &__header {
      display: flex;
      align-items: center;
      flex-direction: column;

      &-indicator {
        max-width: 286px;
      }

      h1 {
        font-size: $unnnic-font-size-body-lg;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        margin-top: $unnnic-spacing-stack-md;
        margin-bottom: $unnnic-spacing-stack-nano;
        color: $unnnic-color-neutral-darkest;
      }
      p {
        margin: 0;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        color: $unnnic-color-neutral-cloudy;
      }
    }
  }
}
</style>
