<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <div
      v-show="state === 'first-loading'"
      class="loading"
    >
      <div class="filters">
        <UnnnicSkeletonLoading
          tag="div"
          height="2.375rem"
          style="max-width: 18rem"
        />
      </div>

      <div class="table-header">
        <UnnnicSkeletonLoading
          tag="div"
          height="2.875rem"
        />
      </div>
    </div>

    <div
      v-if="!compact && state !== 'first-loading'"
      class="filters"
    >
      <div class="date-picker-label">
        {{ $t('billing.filter_by') }}
      </div>

      <UnnnicInputDatePicker
        v-model="filter"
        size="sm"
        :options="options"
        :months="$t('common.months')"
        :days="$t('common.days')"
        :inputFormat="$t('date_format')"
        :clearText="$t('billing.date_picker_options.clear')"
        :actionText="$t('billing.date_picker_options.action')"
        @changed="reload"
      />
    </div>

    <div
      v-if="noInvoicesYet"
      class="no-invoices-yet-container"
    >
      <img
        class="image"
        src="../../../assets/empty-inbox-flatline-1.svg"
      />

      <div class="title">{{ $t('billing.invoices.empty.title') }}</div>

      <div class="description">
        {{ $t('billing.invoices.empty.description') }}
      </div>
    </div>

    <UnnnicTable
      v-else
      v-show="state !== 'first-loading'"
      :items="invoices"
      class="invoices-table"
    >
      <template v-slot:header>
        <UnnnicTableRow :headers="tableInvoicesHeaders">
          <template v-slot:checkarea>
            <UnnnicCheckbox
              :value="generalValue(invoices)"
              @change="changeGeneralCheckbox($event, 'invoices')"
              class="checkbox"
            />
          </template>

          <template v-slot:lastEvent>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div
                class="break-text"
                :style="{ flex: 1 }"
              >
                {{ $t('billing.invoices.due_date') }}
              </div>

              <UnnnicIconSvg
                v-if="!hideSorts"
                size="xs"
                :icon="`sort-${sorts.due_date}`"
                :scheme="
                  sorts.due_date === 'default'
                    ? 'neutral-clean'
                    : 'brand-weni-soft'
                "
                clickable
                @click="sort('due_date')"
              />
            </div>
          </template>

          <template v-slot:paymentStatus>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div
                class="break-text"
                :style="{ flex: 1 }"
              >
                {{ $t('billing.invoices.payment_status') }}
              </div>

              <UnnnicIconSvg
                v-if="!hideSorts"
                size="xs"
                :icon="`sort-${sorts.payment_status}`"
                :scheme="
                  sorts.payment_status === 'default'
                    ? 'neutral-clean'
                    : 'brand-weni-soft'
                "
                clickable
                @click="sort('payment_status')"
              />
            </div>
          </template>

          <template v-slot:contacts>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div
                class="break-text"
                :style="{ flex: 1 }"
              >
                {{
                  $t(
                    `billing.invoices.${
                      $store.getters.currentOrg.organization_billing
                        .plan_method === 'attendances'
                        ? 'attendences'
                        : 'active_contacts'
                    }`,
                  )
                }}
              </div>
            </div>
          </template>

          <template v-slot:value>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div
                class="break-text"
                :style="{ flex: 1 }"
              >
                {{ $t('billing.invoices.value') }}
              </div>

              <UnnnicIconSvg
                v-if="!hideSorts"
                size="xs"
                :icon="`sort-${sorts.invoice_amount}`"
                :scheme="
                  sorts.invoice_amount === 'default'
                    ? 'neutral-clean'
                    : 'brand-weni-soft'
                "
                clickable
                @click="sort('invoice_amount')"
              />
            </div>
          </template>

          <template v-slot:view>
            <div class="action">
              {{ $t('billing.invoices.view') }}
            </div>
          </template>
        </UnnnicTableRow>
      </template>

      <template v-slot:item="{ item }">
        <UnnnicTableRow :headers="tableInvoicesHeaders">
          <template v-slot:checkarea>
            <UnnnicCheckbox
              v-model="item.selected"
              class="checkbox"
            />
          </template>

          <template v-slot:lastEvent>
            <span :title="item.lastEvent">
              {{ localeDate(item.due_date) }}
            </span>
          </template>

          <template v-slot:payment>
            <span
              :title="item.payment"
              :style="{ textTransform: 'capitalize' }"
            >
              {{ item.card_data.response.brand }} ••
              {{ item.card_data.response.final_card_number }}
            </span>
          </template>

          <template v-slot:paymentStatus>
            <span :title="item.paymentStatus">
              <UnnnicIconSvg
                size="sm"
                icon="indicator"
                :scheme="
                  {
                    paid: 'feedback-green',
                    canceled: 'feedback-red',
                    pending: 'feedback-yellow',
                    fraud: 'feedback-red',
                  }[item.payment_status]
                "
              />
              {{ $t(`billing.invoices.statuses.${item.payment_status}`) }}
            </span>
          </template>

          <template v-slot:contacts>
            <span :title="item.contacts">
              {{ formatNumber(calculateContactCount(item.invoice_details)) }}
            </span>
          </template>

          <template v-slot:value>
            <span :title="item.value">
              {{ formatNumber(item.invoice_amount, 'money') }}
            </span>
          </template>

          <template v-slot:view>
            <div class="action">
              <UnnnicButton
                size="small"
                type="secondary"
                iconCenter="view-1-1"
                :loading="loadingPdfs.includes(item.invoice_random_id)"
                @click="
                  openInvoicePdf({
                    randomId: item.invoice_random_id,
                    dueDate: item.due_date,
                  })
                "
              />
            </div>
          </template>
        </UnnnicTableRow>
      </template>
    </UnnnicTable>

    <InfiniteLoading
      empty
      hideErrorSlot
      ref="infiniteLoading"
      @infinite="infiniteHandler"
    >
      <div
        class="loading"
        slot="loading"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="table-row"
        >
          <UnnnicSkeletonLoading
            tag="div"
            height="2.25rem"
          />
        </div>
      </div>
    </InfiniteLoading>
  </div>
</template>

<script>
import InfiniteLoading from '../../../components/InfiniteLoading.vue';
import activeContactsDocDefinition from './activeContactsDocDefinition';
import { mapActions } from 'vuex';

export default {
  props: {
    compact: {
      type: Boolean,
      default: false,
    },

    limit: {
      type: Number,
    },

    hideCheckbox: {
      type: Boolean,
      default: false,
    },

    hideSorts: {
      type: Boolean,
      default: false,
    },

    hideFilters: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    InfiniteLoading,
  },

  data() {
    const ref = new Date();

    ref.setDate(1);
    ref.setMonth(ref.getMonth() + 1);
    ref.setDate(0);

    const end = [ref.getFullYear(), ref.getMonth() + 1, ref.getDate()].join(
      '-',
    );

    ref.setDate(1);
    ref.setMonth(ref.getMonth() - 11);

    const start = `${ref.getFullYear()}-${ref.getMonth() + 1}-1`;

    return {
      state: null,
      noInvoicesYet: false,

      page: 1,
      complete: false,
      ordering: '',
      invoices: [],

      sorts: {
        due_date: 'default',
        payment_status: 'default',
        invoice_amount: 'default',
      },

      filter: {
        start,
        end,
      },

      options: [
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 30 }),
          id: 'last-30-days',
        },
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 60 }),
          id: 'last-60-days',
        },
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 90 }),
          id: 'last-90-days',
        },
        {
          name: this.$t('billing.date_picker_options.last_x_months', { x: 12 }),
          id: 'last-12-months',
        },
        {
          name: this.$t('billing.date_picker_options.current_month'),
          id: 'current-month',
        },
        {
          name: this.$t('billing.date_picker_options.custom'),
          id: 'custom',
        },
      ],

      loadingPdfs: [],
    };
  },

  computed: {
    tableInvoicesHeaders() {
      const base = [
        /*{
          id: 'checkarea',
          text: '',
          width: '32px',
        },*/
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

      const headers = this.compact
        ? [...base, ...compactDesign]
        : [...base, ...normal];

      return headers.filter(
        (header) =>
          (this.hideCheckbox && header.id !== 'checkarea') ||
          !this.hideCheckbox,
      );
    },
  },

  methods: {
    ...mapActions(['getOrgInvoices', 'organizationUniqueInvoice', 'openModal']),

    genericServerErrorModal() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'alert-circle-1',
          scheme: 'feedback-yellow',
          title: this.$t('alerts.server_problem.title'),
          description: this.$t('alerts.server_problem.description'),
        },
      });
    },

    async openInvoicePdf({ randomId, dueDate }) {
      this.loadingPdfs.push(randomId);

      try {
        const ref = new Date(dueDate);

        const after = `${ref.getUTCFullYear()}-${ref.getUTCMonth() + 1}-01`;

        ref.setUTCMonth(ref.getUTCMonth() + 1);
        ref.setUTCDate(0);

        const before = [
          ref.getUTCFullYear(),
          ref.getUTCMonth() + 1,
          ref.getUTCDate(),
        ].join('-');

        const {
          data: { payment_data, invoice, client_data },
        } = await this.organizationUniqueInvoice({
          organizationUuid: this.$route.params.orgUuid,
          randomId,
          after,
          before,
        });

        /*
        const {
          data: { payment_data, invoice, client_data },
        } = {
          data: {
            payment_data: { projects: [] },
            invoice: { invoice_id: '' },
            client_data: {},
          },
        };
        */

        activeContactsDocDefinition
          .fillValues({
            clientName: client_data?.response?.name || '',
            clientAddress: client_data?.response?.address?.line1 || '',
            invoiceId: invoice.invoice_id || '',
            billingDate: invoice.billing_date || '',
            invoiceDate: invoice.invoice_date || '',
            organizationPlan: invoice.plan || '',
            totalPurchasePrice: '',
            iva: '',
            totalOrder: invoice.invoice_amount || '',
            payment: '',
            balance: '',
            currency: invoice.currency || '',
            projects: payment_data.projects.map(
              ({ project_name, contact_count }) => [
                project_name || '',
                contact_count || '',
              ],
            ),
          })
          .open();
      } catch (error) {
        console.log('error', error);

        this.genericServerErrorModal();
      }

      this.loadingPdfs.splice(this.loadingPdfs.indexOf(randomId), 1);
    },

    reload() {
      this.$refs.infiniteLoading.reset();
      this.page = 1;
      this.complete = false;
      this.invoices = [];
    },

    async infiniteHandler($state) {
      try {
        if (this.state === null) {
          this.state = 'first-loading';
        } else {
          this.state = 'loading';
        }

        this.$emit('state', 'loading');
        await this.fetchOrgInvoices();
      } catch (error) {
        this.state = 'error';

        this.$emit('state', 'error');
        $state.error();
      } finally {
        this.state = 'loaded';

        this.$emit('state', 'loaded');

        if (this.complete) {
          this.state = 'complete';

          $state.complete();
        } else {
          $state.loaded();
        }
      }
    },

    async fetchOrgInvoices() {
      let perPage = 20;
      let limit = perPage;

      if (this.limit && this.limit - this.invoices.length < perPage) {
        limit = this.limit - this.invoices.length;
      }

      const offset = perPage * (this.page - 1);

      const response = await this.getOrgInvoices({
        organizationUuid: this.$route.params.orgUuid,
        offset,
        limit,
        ordering: this.ordering,
        start_due_date: this.filter.start,
        end_due_date: this.filter.end,
      });
      this.page = this.page + 1;
      this.invoices = [
        ...this.invoices,
        ...response.data.results.map((item) => ({ ...item, selected: false })),
      ];

      if (response.data.count === 0) {
        this.noInvoicesYet = true;
      }

      if (this.limit && this.invoices.length >= this.limit) {
        this.complete = true;
      } else {
        this.complete = response.data.next === null;
      }
    },

    calculateContactCount(details) {
      return details
        .map((item) => item.contact_count)
        .reduce((previous, current) => previous + current, 0);
    },

    localeDate(date) {
      const [year, month, day] = date.split('-');

      return {
        'pt-br': `${day}/${month}/${year}`,
        en: `${month}/${day}/${year}`,
      }[this.$i18n.locale];
    },

    formatNumber(number, type) {
      return Number(number).toLocaleString(this.$i18n.locale, {
        minimumFractionDigits: type === 'money' ? 2 : 0,
        style: type === 'money' ? 'currency' : 'decimal',
        currency: 'BRL',
      });
    },

    sort(name) {
      ['due_date', 'payment_status', 'invoice_amount'].forEach((key) => {
        if (key === name) {
          this.sorts[key] =
            this.sorts[key] === 'default'
              ? 'asc'
              : this.sorts[key] === 'asc'
              ? 'desc'
              : 'default';

          this.ordering = {
            default: '',
            asc: key,
            desc: `-${key}`,
          }[this.sorts[key]];
        } else {
          this.sorts[key] = 'default';
        }
      });

      this.reload();
    },

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
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.filters {
  margin-bottom: $unnnic-spacing-stack-sm;
  display: flex;
  align-items: center;

  .date-picker-label {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
    margin-right: $unnnic-spacing-inline-sm;
  }
}

.no-invoices-yet-container {
  width: 21.625rem;
  margin: 0 auto;
  padding: $unnnic-spacing-stack-sm 0;
  text-align: center;

  .image {
    width: 8.75rem;
    margin-bottom: $unnnic-spacing-stack-sm;
  }

  .title {
    color: $unnnic-color-neutral-black;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    margin-bottom: $unnnic-spacing-stack-nano;
  }

  .description {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}

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

.loading {
  .table-header {
    margin-bottom: 1rem;
  }

  .table-row {
    margin-bottom: 1.5rem;
  }
}
</style>
