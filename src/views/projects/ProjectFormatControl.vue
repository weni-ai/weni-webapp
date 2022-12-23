<template>
  <div class="project-format-control">
    <div class="label">
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

    <div
      class="formats"
      :style="{
        display: 'grid',
        alignItems: 'center',
        columnGap: '24px',
        rowGap: '24px',
        gridTemplateColumns: '[left] 24px [content] 1fr [right] 24px',
        width: 'calc(100% + 48px + 48px)',
        marginLeft: '-48px',
      }"
    >
      <unnnic-icon
        v-if="showLeftArrow"
        @click.native="goToCard('previous')"
        size="md"
        icon="arrow-left-1-1"
        scheme="neutral-darkest"
        clickable
      />

      <div
        :style="{
          overflowX: 'hidden',
          display: 'grid',
          columnGap: '16px',
          scrollSnapType: 'x mandatory',
          gridTemplateColumns: 'repeat(2, 100%)',
          gridColumn: 'content',
          scrollBehavior: 'smooth',
        }"
        @scroll="scroll"
      >
        <div
          v-for="(group, index) in join(formats)"
          :style="{
            scrollSnapAlign: 'center',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            columnGap: '16px',
          }"
          :ref="`card-${group[0].value}`"
          :key="index"
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

      <unnnic-icon
        v-if="showRightArrow"
        @click.native="goToCard('next')"
        size="md"
        icon="arrow-right-1-1"
        scheme="neutral-darkest"
        clickable
      />

      <div
        :style="{
          gridColumn: 'content',
          display: 'flex',
          justifyContent: 'center',
          columnGap: '8px',
        }"
      >
        <div
          v-for="(format, index) in join(formats)"
          :key="index"
          :style="{
            width: `${4 + 12 * modification(index)}px`,
            height: '4px',
            backgroundColor: '#D0D3D9',
            opacity: (modification(index) / 1) * 0.6 + 0.4,
            borderRadius: '2px',
            cursor: 'pointer',
          }"
          @click="goToCard(format[0].value)"
        ></div>
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
      positionX: 0,
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
    showLeftArrow() {
      const options = this.join(this.formats).map(([format]) => format.value);
      const index = options.findIndex((option) => this.visibles[option]);

      return index;
    },

    showRightArrow() {
      const options = this.join(this.formats).map(([format]) => format.value);
      const index = options.findLastIndex((option) => this.visibles[option]);

      return index !== options.length - 1;
    },

    formats() {
      return [
        {
          title: this.$t('projects.create.format.blank.title'),
          description: this.$t('projects.create.format.blank.description'),
          icon: 'task-checklist-1',
          value: 'blank',
        },
        {
          title: this.$t('projects.create.format.lead_capture.title'),
          description: this.$t(
            'projects.create.format.lead_capture.description',
          ),
          icon: 'pie-line-graph-1',
          value: 'lead-capture',
        },
        {
          title: this.$t('projects.create.format.support.title'),
          description: this.$t('projects.create.format.support.description'),
          icon: 'headphones-customer-support-human-1-1',
          value: 'support',
        },
      ];
    },
  },

  methods: {
    modification(index) {
      const factor = 1 - Math.abs(this.positionX - index);

      if (factor < 0) {
        return 0;
      }

      return factor;
    },

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

    scroll(event) {
      this.positionX =
        event.srcElement.scrollLeft / (event.srcElement.offsetWidth + 16);
    },

    goToCard(action) {
      if (action === 'previous') {
        const options = this.join(this.formats).map(([format]) => format.value);
        const index = options.findIndex((option) => this.visibles[option]);

        this.$refs[`card-${options[index - 1]}`][0].scrollIntoViewIfNeeded();
      } else if (action === 'next') {
        const options = this.join(this.formats).map(([format]) => format.value);
        const index = options.findLastIndex((option) => this.visibles[option]);

        console.log(options[index + 1]);

        this.$refs[`card-${options[index + 1]}`][0].scrollIntoViewIfNeeded();
      } else {
        this.$refs[`card-${action}`][0].scrollIntoViewIfNeeded();
      }
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

    .info {
      cursor: help;
    }
  }

  .formats {
    display: flex;
    column-gap: $unnnic-spacing-inline-sm;

    .unnnic-card-content {
      user-select: none;
      flex: 1;

      &:hover ::v-deep .unnnic-card-content__content__title {
        font-weight: $unnnic-font-weight-regular;
      }
    }
  }
}
</style>
