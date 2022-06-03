<template>
  <unnnic-tab initialTab="first" :tabs="tabs">
    <template slot="tab-head-first"> {{ $t('orgs.change_name') }} </template>
    <template slot="tab-panel-first">
      <h2 class="weni-update-org__title">{{ $t('orgs.change_name') }}</h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.change_name_description') }}
      </p>

      <div class="weni-update-org__separator"></div>

      <div class="weni-update-org">
        <unnnic-input
          :label="$t('orgs.create.org_name')"
          v-model="formData.name"
        />
        <unnnic-input
          :label="$t('orgs.create.org_description')"
          v-model="formData.description"
        />
        <div class="weni-update-org__separator" />
        <unnnic-button
          :disabled="isSaveButtonDisabled()"
          class="weni-update-org__button"
          type="secondary"
          :loading="loading"
          @click="updateOrg"
        >
          {{ $t('orgs.save') }}
        </unnnic-button>
      </div>
    </template>
    <template slot="tab-head-second"> {{ $t('orgs.security') }} </template>
    <template slot="tab-panel-second">
      <h2 class="weni-update-org__title">
        {{ $t('orgs.2fa_title') }}
        <unnnic-tag
          scheme="aux-baby-blue"
          :text="$t('orgs.recommended')"
          type="default"
        />
      </h2>
      <p class="weni-update-org__description">
        {{ $t('orgs.2fa_description') }}
      </p>

      <unnnic-switch textRight="Habilitar autentificação" v-model="enable2FA" />

      <unnnic-button type="secondary" class="weni-update-org__button">
        {{ $t('orgs.save') }}
      </unnnic-button>
    </template>
  </unnnic-tab>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'UpdateOrg',

  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        name: null,
        description: null,
      },
      tabs: ['first', 'second'],
      enable2FA: true,

      loading: false,
    };
  },
  mounted() {
    const { name, description } = this.org;
    console.log(this.org);
    this.formData = { name, description };
  },
  methods: {
    ...mapActions(['editOrg', 'openModal']),
    isSaveButtonDisabled() {
      if (!this.formData.name || !this.formData.description) return true;
      return (
        this.formData.name === this.org.name &&
        this.formData.description === this.org.description
      );
    },
    async updateOrg() {
      const { name, description } = this.formData;
      this.loading = true;
      try {
        await this.editOrg({
          uuid: this.org.uuid,
          name,
          description,
        });
        this.showConfirmation();
        this.$emit('finish', { uuid: this.org.uuid, ...this.formData });
      } finally {
        this.loading = false;
      }
    },
    showConfirmation() {
      this.openModal({
        type: 'alert',
        data: {
          icon: 'check-circle-1-1',
          scheme: 'feedback-green',
          title: this.$t('orgs.save_success'),
          description: this.$t('orgs.save_success_text'),
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.tab {
  margin-top: $unnnic-spacing-stack-sm;
}
.weni-update-org {
  &__button {
    width: 100%;
  }

  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-stack-md 0;
  }
}

.weni-update-org__title {
  display: flex;
  font-size: $unnnic-font-size-title-sm;
  font-weight: $unnnic-font-weight-bold;
  line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-xs;
  color: $unnnic-color-neutral-black;

  .unnnic-tag {
    margin-left: $unnnic-spacing-stack-sm;
  }
}

.weni-update-org__description {
  font-size: $unnnic-font-size-body-gt;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  margin: 0;
  color: $unnnic-color-neutral-cloudy;
}

.unnnic-switch {
  margin: $unnnic-spacing-stack-md 0 $unnnic-spacing-stack-xl;
}
</style>
