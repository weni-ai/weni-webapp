<template>
  <div class="project-format-control">
    <div class="label">
      <div>
        {{ $t('projects.create.format.label') }}
        <unnnic-tool-tip
          :text="$t('projects.create.format.info')"
          side="right"
          enabled
          class="info"
          max-width="20.5rem"
        >
          <unnnic-icon
            icon="alert-circle-1-1"
            scheme="neutral-cleanest"
            size="xs"
          />
        </unnnic-tool-tip>
      </div>
      <div>
        <p>
          {{ $t('projects.create.format.see_all') }}
        </p>
      </div>
    </div>

    <div class="formats">
      <div
        v-for="(group, index) in join(formats)"
        :ref="`card-${group[0].value}`"
        :key="index"
        class="format"
      >
        <unnnic-card
          v-for="format in group"
          :key="format.value"
          type="content"
          :title="format.title"
          :description="format.description"
          :enabled="type === format.value"
          :icon="format.icon"
          clickable
          @click.native="
            $emit('change', type === format.value ? null : format.value)
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'type',
    event: 'change',
  },

  props: {
    type: {
      type: String,
    },
  },

  data() {
    return {
      visibles: {},
    };
  },

  mounted() {
    this.join(this.formats).map(([format]) => {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        let isIntersecting = false;

        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });

        this.$set(this.visibles, format.value, isIntersecting);
      });

      this.intersectionObserver.observe(this.$refs[`card-${format.value}`][0]);
    });
  },

  computed: {
    formats() {
      return [
        {
          title: this.$t('projects.create.format.lead_capture.title'),
          description: this.$t(
            'projects.create.format.lead_capture.description',
          ),
          icon: 'pie-line-graph-1',
          value: 'lead-capture',
        },
        {
          title: this.$t('projects.create.format.omie.title'),
          description: this.$t('projects.create.format.omie.description'),
          icon: 'copy-paste-1',
          value: 'omie',
        },
        {
          title: this.$t('projects.create.format.support.title'),
          description: this.$t('projects.create.format.support.description'),
          icon: 'headphones-customer-support-human-1-1',
          value: 'support',
        },
        {
          title: this.$t('projects.create.format.blank.title'),
          icon: 'add-1',
          value: 'blank',
        },
      ];
    },
  },

  methods: {
    join(elements, amount = 2) {
      return elements.reduce((acc, current) => {
        if (acc.length === 0) {
          acc.push([current]);
        } else if (acc[acc.length - 1].length < amount) {
          acc[acc.length - 1].push(current);
        } else {
          acc.push([current]);
        }

        return acc;
      }, []);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.project-format-control {
  .label {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
    margin-top: $unnnic-spacing-stack-md;
    margin-bottom: $unnnic-spacing-stack-xs;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .info {
      cursor: help;
    }
    p {
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-body-md;
    }
  }

  .formats {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 16px 16px;
    height: 270px;
    
    .format {
      width: 224px;
    }
    .unnnic-card-content {
      user-select: none;
      height: 106px;
      border: none;

      &:hover ::v-deep .unnnic-card-content__content__title {
        font-weight: $unnnic-font-weight-regular;
      }
      ::v-deep .unnnic-card-content__icon {
        background-color: rgba(59, 65, 77, 0.08);
      }
    }
  }
}
</style>
