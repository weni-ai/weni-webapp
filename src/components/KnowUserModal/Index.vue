<template>
  <div class="account-init-modal">
    <div class="account-init-modal__container">
      <div class="account-init-modal__container__header">
        <unnnic-indicator
          class="indicator"
          :number-of-steps="3"
          :current-step="current"
          :titles="steps.map(({ titleIndicator }) => titleIndicator)"
        />

        <h1 class="unnnic-font secondary body-lg bold color-neutral-darkest">
          {{ steps[current - 1].title }}
        </h1>

        <p class="unnnic-font secondary body-md color-neutral-cloudy">
          {{ steps[current - 1].subtitle }}
        </p>
      </div>

      <about
        v-if="current === 1"
        :phone.sync="user.phone"
        :company-name.sync="company.name"
        :company-size.sync="company.number_people"
        :company-segment.sync="company.segment"
        :company-position.sync="company.position"
      />

      <company-sector v-else-if="current === 2" :sector.sync="company.sector" />

      <company-sub-sector
        v-else-if="current === 3"
        :sector="company.sector"
        :sub-sector.sync="company.subSector"
      />

      <div class="navigation">
        <unnnic-button
          v-if="current !== 1"
          type="terciary"
          size="small"
          @click="handleBackPage"
          :disabled="loading"
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
import About from './Steps/About.vue';
import CompanySector from './Steps/CompanySector.vue';
import CompanySubSector from './Steps/CompanySubSector.vue';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import { mapActions } from 'vuex';
import { openAlertModal } from '../../utils/openServerErrorAlertModal';

let observer = null;

export default {
  components: {
    About,
    CompanySector,
    CompanySubSector,
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
        position: '',
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
          !this.phoneError &&
          this.company.name &&
          this.company.number_people &&
          this.company.segment &&
          this.company.position
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

  mounted() {
    if (window['helphero-dom']) {
      window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));
    } else {
      observer = new MutationObserver(() => {
        if (window['helphero-dom']) {
          window.dispatchEvent(new CustomEvent('hideBottomRightOptions'));
        }
      });

      observer.observe(document.body, { childList: true });
    }
  },

  destroyed() {
    window.dispatchEvent(new CustomEvent('showBottomRightOptions'));

    if (observer) {
      observer.disconnect();
    }
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

          await this.addInitialInfo({
            company: {
              name: this.company.name,
              number_people: Number(this.company.number_people),
              segment: this.company.segment,
              position: this.company.position,
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
      if (this.current === 2) this.company.sector = null;
      if (this.current === 3) this.company.subSector = null;
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
