<template>
  <div
    :style="{
      width: '100%',
    }"
    class="champion-chatbot"
  >
    <template v-if="loading">
      <unnnic-skeleton-loading height="22px" width="50%" />
      <unnnic-skeleton-loading height="24px" width="100%" />
      <unnnic-skeleton-loading height="28px" width="50%" />
    </template>

    <template v-else>
      <div class="title">
        {{ $t('home.champion_chatbot.title') }}

        <unnnic-tool-tip
          :text="$t('home.champion_chatbot.info')"
          enabled
          side="right"
          maxWidth="14rem"
          class="tooltip"
        >
          <unnnic-icon-svg
            icon="information-circle-4"
            size="sm"
            scheme="neutral-clean"
          />
        </unnnic-tool-tip>
      </div>

      <div class="form-control">
        <div v-if="level === 0" class="icon-container color-brand-weni-soft">
          <unnnic-icon icon="check-double" size="sm" scheme="brand-weni-soft" />
        </div>

        <template v-for="i in 5">
          <unnnic-tool-tip
            :text="infosForLabel[i]"
            enabled
            side="top"
            :key="`level-${i}`"
          >
            <div
              :class="[
                'level',
                {
                  'color-brand-weni-soft': i < level,
                  'color-brand-weni-dark': level === i,
                },
              ]"
            ></div>
          </unnnic-tool-tip>

          <div
            v-if="level === i && level !== 5"
            class="icon-container color-brand-weni-dark"
            :key="`icon-${i}`"
          >
            <unnnic-icon
              icon="check-double"
              size="sm"
              scheme="brand-weni-dark"
            />
          </div>
        </template>

        <div class="icon-container">
          <unnnic-icon
            icon="rating-star-1-1"
            size="sm"
            scheme="feedback-yellow"
          />
        </div>
      </div>

      <div
        class="description"
        v-html="$t('home.champion_chatbot.profile', { profile })"
      ></div>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import getEnv from '../../utils/env';
import projects from '../../api/projects';

export default {
  data() {
    return {
      level: 0,
      loading: true,
      has_own_channel: false,
    };
  },

  async created() {
    try {
      this.loading = true;

      const { has_ia, has_flows, has_channel, has_msg } =
        await this.$store.dispatch('getSuccessOrgStatusByFlowUuid', {
          flowUuid: this.$store.getters.currentProject.flow_organization,
        });

      this.level =
        [has_flows, has_channel, has_msg, has_ia].lastIndexOf(true) + 1;

      const { data } = await projects.latestActivities({
        projectUuid: this.$store.getters.currentProject.uuid,
      });

      this.has_own_channel = data.some(
        (item) =>
          item.action === 'created-channel' &&
          item.name !== 'WhatsApp: +558231420933',
      );
    } finally {
      if (this.has_own_channel) this.level = 5;
      this.loading = false;
    }
  },

  computed: {
    infosForLabel() {
      return {
        1: this.$t('home.champion_chatbot.levels.one'),
        2: this.$t('home.champion_chatbot.levels.two'),
        3: this.$t('home.champion_chatbot.levels.three'),
        4: this.$t('home.champion_chatbot.levels.four'),
        5: this.$t('home.champion_chatbot.levels.five'),
      };
    },

    profile() {
      return this.$t(`home.champion_chatbot.level.${this.level}`);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

$colors: (
  'brand-weni-soft': $unnnic-color-brand-weni-soft,
  'brand-weni-dark': $unnnic-color-brand-weni-dark,
);

.champion-chatbot {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-nano;
  padding: $unnnic-squish-nano;
  background-color: $unnnic-color-background-sky;
  border-radius: $unnnic-border-radius-md;
  height: 100%;
  box-sizing: border-box;
  justify-content: center;
}

.title {
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-bold;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  color: $unnnic-color-neutral-darkest;
}

.description {
  font-family: $unnnic-font-family-primary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-title-sm;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  color: $unnnic-color-neutral-darkest;

  ::v-deep b {
    font-weight: $unnnic-font-weight-bold;
  }
}

.form-control {
  display: flex;
  column-gap: 1px;
  width: 100%;
  align-items: center;

  .icon-container {
    width: $unnnic-icon-size-md;
    height: $unnnic-icon-size-md;
    display: flex;
    align-items: center;
    justify-content: center;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
    box-sizing: border-box;
    border-radius: 50%;
    background-color: $unnnic-color-background-snow;

    @each $name, $color in $colors {
      &.color-#{$name} {
        border-color: $color;
        background-color: rgba($color, $unnnic-opacity-level-extra-light);
      }
    }
  }

  .unnnic-tooltip {
    flex: 1;
  }

  .level {
    height: 0.5rem;
    background-color: $unnnic-color-neutral-cleanest;
    flex: 1;
    border-radius: $unnnic-border-radius-sm;

    @each $name, $color in $colors {
      &.color-#{$name} {
        background-color: $color;
      }
    }
  }
}
</style>
