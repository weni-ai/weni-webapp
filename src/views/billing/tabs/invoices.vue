<template>
  <unnnic-table
    :items="tableInvoicesItems"
    :loading="loading"
    class="invoices-table"
  >
    <template v-slot:header>
      <unnnic-table-row :headers="tableInvoicesHeaders">
        <template v-slot:checkarea>
          <unnnic-checkbox
            :value="generalValue(tableInvoicesItems)"
            @change="changeGeneralCheckbox($event, 'tableInvoicesItems')"
            class="checkbox"
          />
        </template>

        <template v-slot:lastEvent>
          <div :style="{ display: 'flex', alignItems: 'center' }">
            <div class="break-text" :style="{ flex: 1 }">
              {{ $t('billing.invoices.last_event') }}
            </div>

            <unnnic-icon-svg
              size="xs"
              :icon="`sort-${sorts.lastEvent}`"
              :scheme="
                sorts.lastEvent === 'default'
                  ? 'neutral-clean'
                  : 'brand-weni-soft'
              "
              clickable
              @click="
                sorts.lastEvent =
                  sorts.lastEvent === 'default'
                    ? 'asc'
                    : sorts.lastEvent === 'asc'
                    ? 'desc'
                    : 'default'
              "
            />

            <span :class="['dropdown', { active: showCalendarFilter }]">
              <unnnic-icon-svg
                size="xs"
                icon="filter"
                :scheme="
                  showCalendarFilter ? 'brand-weni-soft' : 'neutral-clean'
                "
                clickable
                @click="showCalendarFilter = !showCalendarFilter"
              />

              <div class="dropdown-data">
                <unnnic-date-picker
                  clearLabel="Limpar"
                  actionLabel="Filtrar"
                  :months="months"
                  :days="days"
                  :options="options"
                  @submit="changeDate"
                />
              </div>
            </span>
          </div>
        </template>

        <template v-slot:view>
          <div class="action">
            {{ $t('billing.invoices.view') }}
          </div>
        </template>
      </unnnic-table-row>
    </template>

    <template v-slot:item="{ item }">
      <unnnic-table-row :headers="tableInvoicesHeaders">
        <template v-slot:checkarea>
          <unnnic-checkbox v-model="item.selected" class="checkbox" />
        </template>

        <template v-slot:lastEvent>
          <span :title="item.lastEvent">
            {{ item.lastEvent }}
          </span>
        </template>

        <template v-slot:payment>
          <span :title="item.payment">
            {{ item.payment }}
          </span>
        </template>

        <template v-slot:paymentStatus>
          <span :title="item.paymentStatus">
            <unnnic-icon-svg
              size="sm"
              icon="indicator"
              :scheme="
                {
                  confirmed: 'feedback-green',
                  cancelled: 'feedback-red',
                  pending: 'feedback-yellow',
                  reversed: 'feedback-yellow',
                }[item.paymentStatus]
              "
            />

            {{ $t(`billing.invoices.statuses.${item.paymentStatus}`) }}
          </span>
        </template>

        <template v-slot:contacts>
          <span :title="item.contacts">
            {{ item.contacts }}
          </span>
        </template>

        <template v-slot:value>
          <span :title="item.value">
            {{ item.value }}
          </span>
        </template>

        <!-- <template v-slot:view>
          <div class="action">
            <unnnic-button
              size="small"
              type="secondary"
              iconCenter="view-1-1"
            />
          </div>
        </template> -->
      </unnnic-table-row>
    </template>
  </unnnic-table>
</template>

<script>
export default {
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      tableInvoicesItems: [
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'confirmed',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'cancelled',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'pending',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
        {
          selected: false,
          lastEvent: '25/08/2021',
          payment: 'Mastercard ••56',
          paymentStatus: 'reversed',
          contacts: '440.890',
          value: 'R$ 150.250,00',
        },
      ],

      loading: true,

      showCalendarFilter: false,

      months: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],

      days: ['D', 'T', 'Q', 'Q', 'S', 'S', 'D'],

      options: [
        {
          name: 'Últimos 7 dias',
          id: 'last-7-days',
        },
        {
          name: 'Últimos 14 dias',
          id: 'last-14-days',
        },
        {
          name: 'Últimos 30 dias',
          id: 'last-30-days',
        },
        {
          name: 'Últimos 12 meses',
          id: 'last-12-months',
        },
        {
          name: 'Mês Atual',
          id: 'current-month',
        },
        {
          name: 'Personalizar',
          id: 'custom',
        },
      ],

      sorts: {
        lastEvent: 'default',
        payment: 'default',
        paymentStatus: 'default',
        contacts: 'default',
        value: 'default',
      },
    };
  },

  computed: {
    tableInvoicesHeaders() {
      const base = [
        {
          id: 'checkarea',
          text: '',
          width: '32px',
        },
        {
          id: 'lastEvent',
          text: this.$t('billing.invoices.last_event'),
          flex: 1,
        },
        {
          id: 'payment',
          text: this.$t('billing.invoices.payment_used'),
          flex: 1,
        },
        {
          id: 'paymentStatus',
          text: this.$t('billing.invoices.payment_status'),
          flex: 1,
        },
        {
          id: 'contacts',
          text: this.$t('billing.invoices.active_contacts'),
          flex: 1,
        },
      ];
      const compactDesign = [
        {
          id: 'value',
          text: this.$t('billing.invoices.value'),
          width: '120px',
        },
      ];

      const normal = [
        {
          id: 'value',
          text: this.$t('billing.invoices.value'),
          flex: 1,
        },
        {
          id: 'view',
          text: this.$t('billing.invoices.view'),
          width: '67px',
        },
      ];
      return this.compact ? [...base, ...compactDesign] : [...base, ...normal];
    },
  },

  created() {
    window.addEventListener('click', (event) => {
      if (event.target.closest('.dropdown')) {
        return false;
      }

      this.showCalendarFilter = false;
    });
  },

  methods: {
    generalValue(items) {
      if (!items.find((item) => item.selected)) {
        return false;
      }

      if (!items.find((item) => !item.selected)) {
        return true;
      }

      return 'less';
    },

    changeGeneralCheckbox(value, table) {
      this[table] = this[table].map((item) => ({
        ...item,
        selected: value,
      }));
    },

    changeDate(value) {
      console.log('value', value);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.invoices-table {
  ::v-deep .header {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .checkbox {
    margin: 0.25rem;
  }

  .action {
    text-align: center;
  }

  .dropdown {
    position: relative;

    .dropdown-data {
      position: absolute;
      pointer-events: none;
      display: none;
      left: 100%;
      top: 100%;
    }

    &.active .dropdown-data {
      pointer-events: auto;
      display: block;
    }
  }
}
</style>
