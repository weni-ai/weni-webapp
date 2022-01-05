<template>
  <div>
    <unnnic-table :items="projects" class="active-contacts-table">
      <template v-slot:header>
        <unnnic-table-row :headers="headers">
          <template v-slot:checkarea>
            <unnnic-checkbox
              :value="generalValue(projects)"
              @change="changeGeneralCheckbox($event, 'projects')"
              class="checkbox"
            />
          </template>

          <template v-slot:active_contacts>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div class="break-text" :style="{ marginRight: '0.25rem' }">
                {{ $t('billing.active_contacts.number_of_contacts') }}
              </div>

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
                    v-if="showCalendarFilter"
                    clearLabel="Limpar"
                    actionLabel="Filtrar"
                    :months="months"
                    :days="days"
                    :options="options"
                    @submit="changeDate"
                    :initial-start-date="initialStartDate"
                    :initial-end-date="initialEndDate"
                  />
                </div>
              </span>
            </div>
          </template>
        </unnnic-table-row>
      </template>

      <template v-slot:item="{ item }">
        <unnnic-table-row :headers="headers">
          <template v-slot:checkarea>
            <unnnic-checkbox v-model="item.selected" class="checkbox" />
          </template>

          <template v-slot:name>
            <span :title="item.name">
              {{ item.name }}
            </span>
          </template>

          <template v-slot:active_contacts>
            <span :title="item.active_contacts">
              {{ formatNumber(item.active_contacts) }}
            </span>
          </template>

          <template v-slot:export>
            <div class="action">
              <unnnic-button
                size="small"
                type="secondary"
                iconCenter="upload-bottom-1"
                @click="exportCSVByProject(item.uuid)"
                :loading="loadingExportContacts.includes(item.uuid)"
              />
            </div>
          </template>
        </unnnic-table-row>
      </template>
    </unnnic-table>
    <infinite-loading
      loading-icon
      hide-error-slot
      ref="infiniteLoading"
      @infinite="infiniteHandler"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { csvExport } from '@/utils/plugins/csvExport';
import InfiniteLoading from '../../../components/InfiniteLoading.vue';

export default {
  components: {
    InfiniteLoading,
  },
  data() {
    const ref = new Date();

    const startDate = `${ref.getFullYear()}-${ref.getMonth() + 1}-1`;

    ref.setMonth(ref.getMonth() + 1);
    ref.setDate(0);

    const endDate = [ref.getFullYear(), ref.getMonth() + 1, ref.getDate()].join(
      '-',
    );

    return {
      projects: [],

      filter: {
        startDate,
        endDate,
      },

      loadingExportContacts: [],

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
    };
  },

  mounted() {
    this.reload();
  },

  computed: {
    headers() {
      return [
        /*{
          id: 'checkarea',
          text: '',
          width: '32px',
        },*/
        {
          id: 'name',
          text: this.$t('billing.active_contacts.project'),
          flex: 1,
        },
        {
          id: 'active_contacts',
          text: this.$t('billing.active_contacts.number_of_contacts'),
          flex: 1,
        },
        {
          id: 'export',
          text: this.$t('billing.active_contacts.export'),
          width: '55px',
        },
      ];
    },

    initialStartDate() {
      return this.filter.startDate.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');
    },

    initialEndDate() {
      return this.filter.endDate.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');
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
    async infiniteHandler($state) {
      try {
        this.$emit('state', 'loading');
        await this.fetchActiveContacts();
      } catch (error) {
        this.$emit('state', 'error');
        $state.error();
      } finally {
        this.$emit('state', 'loaded');
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    csvExport,
    ...mapActions(['getActiveContacts', 'getContactActiveDetailed']),

    reload() {
      this.projects = [];
      this.$refs.infiniteLoading.reset();
      // this.fetchActiveContacts();
    },

    async exportCSVByProject(projectUUID) {
      this.loadingExportContacts.push(projectUUID);
      const response = await this.getContactActiveDetailed({
        projectUUID,
        after: this.filter.startDate,
        before: this.filter.endDate,
      });
      this.loadingExportContacts.splice(
        this.loadingExportContacts.indexOf(projectUUID),
        1,
      );

      csvExport(response.data.projects);
    },

    async fetchActiveContacts() {
      const response = await this.getActiveContacts({
        organizationUuid: this.$route.params.orgUuid,
        after: this.filter.startDate,
        before: this.filter.endDate,
      });

      this.projects = [
        ...response.data.projects.map((item) => ({ ...item, selected: false })),
      ];
      this.complete = true;
    },

    formatNumber(number, type) {
      return Number(number).toLocaleString(this.$i18n.locale, {
        minimumFractionDigits: type === 'money' ? 2 : 0,
        style: type === 'money' ? 'currency' : 'decimal',
        currency: 'USD',
      });
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

    changeDate(value) {
      const startDate = value.startDate.replace(
        /(\d+)-(\d+)-(\d+)/,
        '$3-$1-$2',
      );

      const endDate = value.endDate.replace(/(\d+)-(\d+)-(\d+)/, '$3-$1-$2');

      this.filter.startDate = startDate;
      this.filter.endDate = endDate;

      this.showCalendarFilter = false;
      this.reload();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.active-contacts-table {
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
      right: 100%;
      top: 100%;
    }

    &.active .dropdown-data {
      pointer-events: auto;
      display: block;
    }
  }
}
</style>
