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
      v-if="state !== 'first-loading'"
      class="filters"
    >
      <div class="date-picker-label">
        {{ $t('billing.filter_by') }}
      </div>

      <UnnnicInputDatePicker
        v-model="filter"
        size="sm"
        :options="options"
        :inputFormat="$t('date_format')"
        :clearText="$t('billing.date_picker_options.clear')"
        :actionText="$t('billing.date_picker_options.action')"
        @update:model-value="reload"
      />
    </div>

    <UnnnicTable
      v-show="state !== 'first-loading'"
      :items="projects"
      class="active-contacts-table"
    >
      <template #header>
        <UnnnicTableRow :headers="headers">
          <template #checkarea>
            <UnnnicCheckbox
              :modelValue="generalValue(projects)"
              class="checkbox"
              @change="changeGeneralCheckbox($event, 'projects')"
            />
          </template>

          <template #active_contacts>
            <div :style="{ display: 'flex', alignItems: 'center' }">
              <div
                class="break-text"
                :style="{ marginRight: '0.25rem' }"
              >
                {{
                  $t(
                    `billing.active_contacts.${
                      $store.getters.currentOrg.organization_billing
                        .plan_method === 'attendances'
                        ? 'attendences'
                        : 'number_of_contacts'
                    }`,
                  )
                }}
              </div>
            </div>
          </template>
        </UnnnicTableRow>
      </template>

      <template #item="{ item }">
        <UnnnicTableRow :headers="headers">
          <template #checkarea>
            <UnnnicCheckbox
              v-model="item.selected"
              class="checkbox"
            />
          </template>

          <template #name>
            <span :title="item.name">
              {{ item.name }}
            </span>
          </template>

          <template #active_contacts>
            <span :title="item.active_contacts">
              {{ formatNumber(item.active_contacts) }}
            </span>
          </template>

          <template #export>
            <div class="action">
              <UnnnicButton
                size="small"
                type="secondary"
                iconCenter="upload-bottom-1"
                :loading="loadingExportContacts.includes(item.uuid)"
                @click="openAlertDownloadingData(item)"
              />
            </div>
          </template>
        </UnnnicTableRow>
      </template>
    </UnnnicTable>
    <InfiniteLoading
      ref="infiniteLoading"
      empty
      hideErrorSlot
      @infinite="infiniteHandler"
    >
      <template #loading>
        <div class="loading">
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
      </template>
    </InfiniteLoading>

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
      <Alert
        v-if="alertDownloadingStep === 'loading'"
        :title="$t('billing.active_contacts.exporting.downloading.title')"
        :description="
          $t('billing.active_contacts.exporting.downloading.description')
        "
        icon="button-refresh-arrow-1"
        iconSpin
        scheme="feedback-yellow"
        @close="isAlertDownloadingDataOpen = false"
      ></Alert>

      <Alert
        v-if="alertDownloadingStep === 'loaded'"
        clickable
        :title="$t('billing.active_contacts.exporting.loaded.title')"
        :description="
          $t('billing.active_contacts.exporting.loaded.description')
        "
        icon="download-bottom-1"
        scheme="feedback-blue"
        @close="isAlertDownloadingDataOpen = false"
        @click="download"
      ></Alert>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { csvExport } from '@/utils/plugins/csvExport';
import InfiniteLoading from '../../../components/InfiniteLoading.vue';
import Alert from '../../../components/Alert.vue';

export default {
  components: {
    InfiniteLoading,
    Alert,
  },
  data() {
    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    const start = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`;
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const end = `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(
      endDate.getDate(),
    )}`;
    return {
      state: null,

      projects: [],

      filter: {
        start,
        end,
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

  mounted() {
    this.reload();
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
          icon: 'check_circle',
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
        after: this.filter.start,
        before: this.filter.end,
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

      const rows = [
        [
          this.$t('billing.active_contacts.sheet.columns.project'),
          this.$t('billing.active_contacts.sheet.columns.active_contacts'),
          'URN',
        ],
      ];

      [response.data.projects].forEach(
        ({ project_name, active_contacts, contacts_info = [] }) => {
          const additionalRows = contacts_info.map(({ urn }, index) =>
            index === 0 ? [project_name, active_contacts, urn] : ['', '', urn],
          );

          rows.push(...additionalRows);
        },
      );

      return {
        filename: this.$t('billing.active_contacts.sheet.filename', {
          project: projectName.replace(/[^a-z ]/gi, '_'),
          date,
          time,
        }),
        data: rows,
      };
    },

    async fetchActiveContacts() {
      const response = await this.getActiveContacts({
        organizationUuid: this.$route.params.orgUuid,
        after: this.filter.start,
        before: this.filter.end,
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
        currency: 'BRL',
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

.active-contacts-table {
  :deep(.header) {
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
