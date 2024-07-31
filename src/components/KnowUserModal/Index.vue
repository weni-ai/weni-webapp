<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="account-init-modal">
    <div class="account-init-modal__container">
      <div class="account-init-modal__container__header">
        <UnnnicIndicator
          class="indicator"
          :numberOfSteps="3"
          :currentStep="current"
          :titles="steps.map(({ titleIndicator }) => titleIndicator)"
        />

        <h1 class="unnnic-font secondary body-lg bold color-neutral-darkest">
          {{ steps[current - 1].title }}
        </h1>

        <p class="unnnic-font secondary body-md color-neutral-cloudy">
          {{ steps[current - 1].subtitle }}
        </p>
      </div>

      <CompanySector
        v-if="current === 2"
        :sector.sync="company.sector"
      />

      <CompanySubSector
        v-else-if="current === 3"
        :sector="company.sector"
        :subSector.sync="company.subSector"
      />

      <div class="navigation">
        <UnnnicButton
          v-if="current !== 1"
          type="tertiary"
          size="small"
          @click="handleBackPage"
          :disabled="loading"
        >
          {{ $t('orgs.create.back') }}
        </UnnnicButton>

        <UnnnicButton
          type="secondary"
          size="small"
          @click="handleNextPage"
          :disabled="!canGoNext"
          :loading="loading"
        >
          {{ $t('orgs.create.next') }}
        </UnnnicButton>
      </div>
    </div>
  </div>
</template>

<script>
import CompanySector from './Steps/CompanySector.vue';
import CompanySubSector from './Steps/CompanySubSector.vue';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { mapActions } from 'vuex';
import { openAlertModal } from '../../utils/openServerErrorAlertModal';

export default {
  components: {
    CompanySector,
    CompanySubSector,
  },

  data() {
    return {
      user: {
        phone: '',
        position: '',
      },

      company: {
        name: '',
        number_people: '',
        segment: '',
        sector: null,
        subSector: null,
      },

      current: 1,

      loading: null,
    };
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
          title: this.$t('account.init.sector.title'),
          subtitle: this.$t('account.init.sector.subtitle'),
          titleIndicator: this.$t('account.init.sector.titleIndicator'),
          icon: '',
        },
        {
          title: this.$t('account.init.category.title'),
          subtitle: this.$t('account.init.category.subtitle', {
            value: this.$t(this.company.sector?.title),
          }),
          titleIndicator: this.$t('account.init.category.titleIndicator'),
          icon: '',
        },
      ];
    },

    phoneNumber() {
      return parsePhoneNumberFromString(this.user.phone);
    },

    phoneError() {
      if (
        !this.user.phone.length ||
        !this.phoneNumber ||
        !this.phoneNumber.isValid()
      ) {
        return this.$t('errors.invalid_contact');
      }

      return '';
    },

    canGoNext() {
      if (this.current === 1) {
        // personal
        return (
          this.user.phone &&
          this.user.position &&
          !this.phoneError &&
          this.company.name &&
          this.company.number_people &&
          this.company.segment
        );
      } else if (this.current === 2) {
        // company sector
        return (
          (!this.company.sector?.insert && this.company.sector) ||
          (this.company.sector?.insert && this.company.sector?.other)
        );
      } else if (this.current === 3) {
        // company subsector
        return (
          (!this.company.subSector?.insert && this.company.subSector) ||
          (this.company.subSector?.insert && this.company.subSector?.other)
        );
      }

      return false;
    },
  },

  watch: {
    'company.sector.value'() {
      this.company.subSector = null;
    },
  },

  methods: {
    ...mapActions(['addInitialInfo', 'updateAccountLanguage']),

    async handleNextPage() {
      if (
        this.canGoNext &&
        ((this.current === 2 && this.company.sector.value === 'others') ||
          this.current === 3)
      ) {
        try {
          this.loading = true;

          const UTMParams = Array.from(new URLSearchParams(location.search))
            .map(([name, value]) => [name.toLowerCase(), value])
            .filter(([name]) => name.startsWith('utm_'));

          const UTMObject = Object.fromEntries(UTMParams);

          await this.addInitialInfo({
            company: {
              name: this.company.name,
              number_people: Number(this.company.number_people),
              segment: this.company.segment,
              sector:
                this.company.sector.value === 'others'
                  ? this.company.sector.other
                  : this.company.sector.value,
              weni_helps:
                this.company.subSector?.value === 'others'
                  ? this.company.subSector?.other
                  : this.company.subSector?.value,
            },
            user: {
              phone: this.user.phone.replace(/[^\d]/g, ''),
              position: this.user.position,
              utm: UTMObject,
            },
          });

          this.$router.push('/orgs');
        } catch (error) {
          openAlertModal({
            type: 'warn',
            description: error?.response?.data?.error || undefined,
          });
        } finally {
          this.loading = false;
        }
      } else {
        this.current++;
      }
    },
    handleBackPage() {
      this.current--;
    },
  },
};
</script>

<style socped lang="scss">
.account-init-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(5px);
  background-color: rgba(0, 0, 0, 0.08);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1;

  &__container {
    box-sizing: border-box;

    font-family: $unnnic-font-family-secondary;
    background-color: $unnnic-color-background-carpet;
    padding: $unnnic-spacing-stack-md;
    border-radius: $unnnic-border-radius-sm;
    box-shadow: $unnnic-shadow-level-separated;
    width: 100%;
    max-width: 607px;
    min-height: 29.5625rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__header {
      display: flex;
      align-items: center;
      flex-direction: column;

      .indicator {
        max-width: 15.625rem;
      }

      h1 {
        margin-top: 3.125rem;
        margin-bottom: $unnnic-spacing-stack-nano;
      }

      p {
        margin: 0;
        margin-bottom: $unnnic-spacing-stack-sm;
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
