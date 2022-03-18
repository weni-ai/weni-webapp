<template>
  <div>
    <div v-show="state === 'first-loading'" class="loading">
      <div class="filters">
        <unnnic-skeleton-loading
          tag="div"
          height="2.375rem"
          style="max-width: 18rem"
        />
      </div>

      <div class="table-header">
        <unnnic-skeleton-loading tag="div" height="2.875rem" />
      </div>
    </div>

    <div v-if="state !== 'first-loading'" class="filters">
      <date-picker
        :label="$t('billing.filter_by')"
        :months="$t('common.months')"
        :days="$t('common.days')"
        :options="options"
        :start-date.sync="filter.startDate"
        :endDate.sync="filter.endDate"
        @changed="reload"
      ></date-picker>
    </div>

    <unnnic-table
      v-show="state !== 'first-loading'"
      :items="projects"
      class="active-contacts-table"
    >
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
                @click="openAlertDownloadingData(item)"
                :loading="loadingExportContacts.includes(item.uuid)"
              />
            </div>
          </template>
        </unnnic-table-row>
      </template>
    </unnnic-table>
    <infinite-loading
      empty
      hide-error-slot
      ref="infiniteLoading"
      @infinite="infiniteHandler"
    >
      <div class="loading" slot="loading">
        <div v-for="i in 4" :key="i" class="table-row">
          <unnnic-skeleton-loading tag="div" height="2.25rem" />
        </div>
      </div>
    </infinite-loading>

    <div
      v-if="isAlertDownloadingDataOpen"
      :style="{
        position: 'fixed',
        bottom: 0,
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        left: 0,
        bottom: '1rem',
      }"
    >
      <alert
        v-if="alertDownloadingStep === 'loading'"
        :title="$t('billing.active_contacts.exporting.downloading.title')"
        :description="
          $t('billing.active_contacts.exporting.downloading.description')
        "
        icon="button-refresh-arrow-1"
        icon-spin
        scheme="feedback-yellow"
        @close="isAlertDownloadingDataOpen = false"
      ></alert>

      <alert
        clickable
        v-if="alertDownloadingStep === 'loaded'"
        :title="$t('billing.active_contacts.exporting.loaded.title')"
        :description="
          $t('billing.active_contacts.exporting.loaded.description')
        "
        icon="download-bottom-1"
        scheme="feedback-blue"
        @close="isAlertDownloadingDataOpen = false"
        @click="download"
      ></alert>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { csvExport } from '@/utils/plugins/csvExport';
import InfiniteLoading from '../../../components/InfiniteLoading.vue';
import DatePicker from '../../../components/billing/DatePicker.vue';
import Alert from '../../../components/Alert.vue';

export default {
  components: {
    InfiniteLoading,
    DatePicker,
    Alert,
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
      state: null,

      projects: [],

      filter: {
        startDate,
        endDate,
      },

      isAlertDownloadingDataOpen: false,
      alertDownloadingStep: '',

      toDownload: {},

      loadingExportContacts: [],

      options: [
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 7 }),
          id: 'last-7-days',
        },
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 14 }),
          id: 'last-14-days',
        },
        {
          name: this.$t('billing.date_picker_options.last_x_days', { x: 30 }),
          id: 'last-30-days',
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
  },

  methods: {
    async infiniteHandler($state) {
      try {
        if (this.state === null) {
          this.state = 'first-loading';
        } else {
          this.state = 'loading';
        }

        this.$emit('state', 'loading');
        await this.fetchActiveContacts();
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
    csvExport,
    ...mapActions([
      'getActiveContacts',
      'getContactActiveDetailed',
      'openModal',
    ]),

    async openAlertDownloadingData({ uuid, name }) {
      this.isAlertDownloadingDataOpen = true;
      this.alertDownloadingStep = 'loading';
      this.toDownload = await this.exportCSVByProject(uuid, name);
      this.alertDownloadingStep = 'loaded';
    },

    download() {
      csvExport(this.toDownload.filename, this.toDownload.data);
      this.isAlertDownloadingDataOpen = false;

      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('billing.active_contacts.exporting.exported.title'),
          description: this.$t(
            'billing.active_contacts.exporting.exported.description',
          ),
        },
      });
    },

    reload() {
      this.projects = [];
      this.$refs.infiniteLoading.reset();
      // this.fetchActiveContacts();
    },

    async exportCSVByProject(projectUUID, projectName) {
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

      const now = new Date();

      const date = [
        String(now.getUTCFullYear()),
        String(now.getUTCMonth() + 1).padStart(2, '0'),
        String(now.getUTCDate()).padStart(2, '0'),
      ].join('-');

      const time = [
        String(now.getUTCHours()).padStart(2, '0'),
        String(now.getUTCMinutes()).padStart(2, '0'),
      ].join('_');

      return {
        filename: this.$t('billing.active_contacts.sheet.filename', {
          project: projectName.replace(/[^a-z ]/gi, '_'),
          date,
          time,
        }),
        data: [
          [
            this.$t('billing.active_contacts.sheet.columns.project'),
            this.$t('billing.active_contacts.sheet.columns.active_contacts'),
            this.$t('billing.active_contacts.sheet.columns.contacts_names'),
            this.$t('billing.active_contacts.sheet.columns.contacts_uuids'),
          ],
        ].concat(
          response.data.projects.map(
            ({ project_name, active_contacts, contacts_info = [] }) => [
              project_name,
              active_contacts,
              contacts_info.map(({ name }) => name).join(','),
              contacts_info.map(({ uuid }) => uuid).join(','),
            ],
          ),
        ),
      };
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
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.filters {
  margin-bottom: $unnnic-spacing-stack-sm;
}

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
