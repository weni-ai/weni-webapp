<template>
  <div class="billing-modal" v-if="isOpen">
    <div class="billing-modal__content unnnic-grid-xl">
      <div class="unnnic-grid-span-12">
        <h1 class="billing-modal__content__title">Precificação</h1>
      </div>
      <div class="unnnic-grid-span-12">
        <unnnic-table
          :items="table.items"
          :style="{ maxHeight: '280px', maxWidth: '800px' }"
        >
          <template v-slot:header>
            <unnnic-table-row :headers="table.headers" />
          </template>

          <template v-slot:item="{ item }">
            <unnnic-table-row :headers="table.headers">
              <template v-slot:project>
                <span :title="item.project">
                  {{ item.project }}
                </span>
              </template>

              <template v-slot:contacts>
                <span :title="item.contacts">
                  {{ item.contacts }}
                </span>
              </template>
            </unnnic-table-row>
          </template>
        </unnnic-table>
      </div>
      <div class="unnnic-grid-span-12 slider">
        <unnnicSlider
          :initialValue="1"
          :minValue="1"
          :maxValue="2000"
          :step="1"
          @valueChange="localValue = $event"
        />

        <p class="slider__title">Simulação de custo mensal</p>
        <h2 class="slider__value">{{ finalPrice }}</h2>
      </div>

      <div class="unnnic-grid-span-12 info">
        {{ $t('billing.pricing.info_price') }}
      </div>
      <div class="close-button">
        <unnnic-icon-svg
          icon="close-1"
          size="md"
          clickable
          @click="$emit('togglePriceModal')"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BillingModalPrice',
  props: {
    isOpenModal: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    finalPrice() {
      let coast_by_contact = 0;

      if (this.localValue < 9999) {
        coast_by_contact = 1.2;
      } else if (this.localValue >= 1000 && this.localValue <= 49999) {
        coast_by_contact = 0.75;
      } else if (this.localValue >= 50000 && this.localValue <= 249999) {
        coast_by_contact = 0.65;
      } else if (this.localValue >= 250000) {
        coast_by_contact = 0.6;
      }

      const finalResult = this.localValue * coast_by_contact;

      return `R$ ${finalResult.toFixed(2)}`;
    },
  },
  data() {
    return {
      isOpen: this.isOpenModal,
      localValue: 1,
      table: {
        headers: [
          {
            id: 'project',
            text: this.$t('billing.pricing.active_contacts'),
            flex: 1,
          },
          {
            id: 'contacts',
            text: this.$t('billing.pricing.coast_by_contact'),
            width: '120px',
          },
        ],
        items: [
          {
            project: this.$t('billing.pricing.1000_to_9999'),
            contacts: 'R$ 1,20',
          },
          {
            project: this.$t('billing.pricing.10000_to_49999'),
            contacts: 'R$ 0,75',
          },
          {
            project: this.$t('billing.pricing.50000_to_24999'),
            contacts: 'R$ 0,65',
          },
          {
            project: this.$t('billing.pricing.250000_to_up'),
            contacts: 'R$ 0,60',
          },
        ],
      },
    };
  },
  watch: {
    isOpenModal() {
      this.isOpen = this.isOpenModal;
    },
  },
  methods: {
    closeModal() {
      this.isOpen = false;
    },
  },
};
</script>

<style scoped lang="scss">
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.billing-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 100;

  &__content {
    position: relative;
    padding: $unnnic-spacing-inset-md;
    border-radius: $unnnic-border-radius-md;
    background-color: $unnnic-color-background-sky;
    width: 100%;
    max-width: 545px;
    margin: 0 24px;

    &__title {
      font-size: $unnnic-font-size-title-sm;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-black;
      text-align: start;
      color: $unnnic-color-brand-sec-dark;
      margin: 0;
    }

    .slider {
      padding: 0 $unnnic-inline-awesome;
      text-align: center;

      &__title {
        color: $unnnic-color-neutral-dark;
        font-size: $unnnic-font-size-body-gt;
        margin-top: $unnnic-spacing-stack-sm;
        margin-bottom: $unnnic-spacing-stack-nano;
      }
      &__value {
        color: $unnnic-color-neutral-darkest;
        font-size: $unnnic-font-size-title-sm;
        font-weight: $unnnic-font-weight-black;
        margin: 0;
        // margin-bottom: $unnnic-spacing-stack-md;
      }
    }

    ::v-deep .unnnic-slider__content__range-input {
      background: none;
    }

    ::v-deep .unnnic-slider__value-input {
      > .unnnic-form__input {
        width: unset;
      }
    }

    .info {
      padding-top: $unnnic-spacing-stack-sm;
      border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
      color: $unnnic-color-neutral-cloudy;
      font-size: $unnnic-font-size-body-gt;
    }

    .close-button {
      display: unset;
      position: absolute;
      top: 0;
      right: 0;
      margin-top: $unnnic-spacing-stack-md;
      margin-right: $unnnic-inline-md;
    }
  }
}
</style>
