<template>
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
            />
          </div>
        </template>
      </unnnic-table-row>
    </template>
  </unnnic-table>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      projects: [],

      filter: {
        startDate: '2021-01-01',
        endDate: '2021-12-01',
      },

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
        /*{
          id: 'export',
          text: this.$t('billing.active_contacts.export'),
          width: '55px',
        },*/
      ];
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
    ...mapActions(['getActiveContacts']),

    reload() {
      this.projects = [];
      this.fetchActiveContacts();
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
