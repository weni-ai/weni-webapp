<template>
  <div class="container">
    <span class="label">{{ label }}</span>

    <div :class="['dropdown', { active: showCalendarFilter }]">
      <unnnic-input
        class="input"
        size="sm"
        icon-left="notes-1"
        @focus="showCalendarFilter = true"
        readonly
        :value="filterText"
      ></unnnic-input>

      <div class="dropdown-data">
        <unnnic-date-picker
          v-if="showCalendarFilter"
          :clearLabel="$t('billing.date_picker_options.clear')"
          :actionLabel="$t('billing.date_picker_options.action')"
          :months="months"
          :days="days"
          :options="options"
          @submit="changeDate"
          :initial-start-date="initialStartDate"
          :initial-end-date="initialEndDate"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    months: Array,
    days: Array,
    options: Array,
    startDate: String,
    endDate: String,
    showMode: {
      type: String,
      default: 'full-date',
    },
  },

  data() {
    return {
      showCalendarFilter: false,
    };
  },

  computed: {
    filterText() {
      const dates = [];

      if (this.startDate) {
        dates.push(this.mountDate(this.startDate));
      }

      if (this.endDate) {
        dates.push(this.mountDate(this.endDate));
      }

      if (!dates.length) {
        return '—';
      }

      return dates.join(' ~ ');
    },

    initialStartDate() {
      return this.startDate.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');
    },

    initialEndDate() {
      return this.endDate.replace(/(\d+)-(\d+)-(\d+)/, '$2-$3-$1');
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
    mountDate(date) {
      if (this.showMode === 'full-date') {
        return date.replace(
          /(\d+)-(\d+)-(\d+)/,
          function (all, year, month, date) {
            return `${date.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          },
        );
      } else if (this.showMode === 'month-and-year') {
        return date.replace(/(\d+)-(\d+)-(\d+)/, function (all, year, month) {
          return `${month.padStart(2, '0')}/${year}`;
        });
      }
    },

    changeDate(value) {
      const startDate = value.startDate.replace(
        /(\d+)-(\d+)-(\d+)/,
        '$3-$1-$2',
      );

      const endDate = value.endDate.replace(/(\d+)-(\d+)-(\d+)/, '$3-$1-$2');

      this.$emit('update:startDate', startDate);
      this.$emit('update:endDate', endDate);

      this.showCalendarFilter = false;
      this.$emit('changed');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.container {
  display: inline-block;
}

.label {
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  color: $unnnic-color-neutral-darkest;
  margin-right: $unnnic-spacing-inline-sm;
}

.dropdown {
  position: relative;
  display: inline-block;

  .dropdown-data {
    position: absolute;
    pointer-events: none;
    display: none;
    left: 0%;
    top: 100%;
    z-index: 2;
    margin-top: $unnnic-spacing-stack-nano;
  }

  &.active .dropdown-data {
    pointer-events: auto;
    display: block;
  }

  .input {
    display: inline-block;
  }
}
</style>
