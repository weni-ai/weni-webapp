<template>
  <div class="billing-modal">
    <div class="billing-modal__content unnnic-grid-xl">
      <div class="unnnic-grid-span-12">
        <h1 class="billing-modal__content__title">Precificação</h1>
      </div>
      <div class="unnnic-grid-span-12">
        <unnnic-table
          :items="items"
          :style="{ maxHeight: '280px', maxWidth: '800px' }"
        >
          <template v-slot:header>
            <unnnic-table-row :headers="table.headers" />
          </template>

          <template v-slot:item="{ item }">
            <unnnic-table-row :headers="table.headers">
              <template v-slot:nToM>
                <span :title="item.nToM">
                  {{ item.nToM }}
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
          :initialValue="minActiveContacts"
          :minValue="minActiveContacts"
          :maxValue="maxActiveContacts"
          :step="1"
          @valueChange="localValue = $event"
        />

        <p class="slider__title">Simulação de custo mensal</p>
        <h2 class="slider__value">$ {{ finalPrice }}</h2>
      </div>

      <div class="unnnic-grid-span-12 info">
        {{
          $t('billing.pricing.info_price', {
            price_base: price(minActiveContacts),
            max_active_contacts: minActiveContacts,
          })
        }}
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
    ranges: {
      type: Array,
    },
  },
  computed: {
    minActiveContacts() {
      return this.ranges.find(({ from }) => from === 1)?.to;
    },

    maxActiveContacts() {
      return this.ranges.find(({ to }) => to === 'infinite')?.from;
    },

    finalPrice() {
      const finalResult = this.price(this.localValue);

      return finalResult.toFixed(2);
    },

    items() {
      return this.ranges
        .filter(({ from }) => from !== 1)
        .map(({ from, to, value_per_contact }) => ({
          nToM:
            to === 'infinite'
              ? this.$t('billing.pricing.n_to_up', { from })
              : this.$t('billing.pricing.n_to_m', { from, to }),
          contacts: `$ ${value_per_contact}`,
        }));
    },
  },

  watch: {
    ranges: {
      deep: true,
      immediate: true,
      handler() {
        this.localValue = this.minActiveContacts;
      },
    },
  },

  methods: {
    coastByContact(ativeContacts) {
      return this.ranges.find((range) => {
        if (range.to === 'infinite') {
          return ativeContacts >= range.from;
        }

        return ativeContacts >= range.from && ativeContacts <= range.to;
      })?.value_per_contact;
    },

    price(activeContacts) {
      return activeContacts * this.coastByContact(activeContacts);
    },
  },

  data() {
    return {
      localValue: 0,
      table: {
        headers: [
          {
            id: 'nToM',
            text: this.$t('billing.pricing.active_contacts'),
            flex: 1,
          },
          {
            id: 'contacts',
            text: this.$t('billing.pricing.coast_by_contact'),
            width: '120px',
          },
        ],
      },
    };
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
