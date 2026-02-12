<template>
  <UnnnicDialog :open="open">
    <UnnnicDialogContent class="modal-registered">
      <img
        class="modal-registered__image"
        src="../../assets/IMG-9959-with-background.png"
      />

      <UnnnicDialogTitle>
        {{
          $t(
            `register.modals.${
              haveBeenInvited ? 'entered_project' : 'created_project'
            }.title`,
            { organization: savedOrgName },
          )
        }}
      </UnnnicDialogTitle>

      <div
        v-if="haveBeenInvited && [2, 3, 4].includes(savedOrgAuthorization)"
        class="modal-registered__description"
        v-html="$t(`register.modals.entered_project.description.role_${savedOrgAuthorization}`)"
      ></div>

      <UnnnicButton
        type="primary"
        class="modal-registered__start-button"
        @click="$emit('update:open', false)"
      >
        {{ $t('register.modals.created_project.button_start') }}
      </UnnnicButton>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:open'],

  computed: {
    ...mapGetters(['currentProject']),

    haveBeenInvited() {
      return !!this.$store.state.Account.additionalInformation.data?.company
        ?.company_name;
    },

    savedOrgAuthorization() {
      return this.$store.state.Account.additionalInformation.data?.organization
        ?.authorization;
    },

    savedOrgName() {
      return this.$store.state.Account.additionalInformation.data?.organization
        ?.name;
    },

    savedOrgUuid() {
      return this.$store.state.Account.additionalInformation.data?.organization
        ?.uuid;
    },

    currentProjectUuid() {
      return this.currentProject?.uuid;
    },
  },
};
</script>

<style lang="scss">
.modal-registered {
  padding: $unnnic-space-6;

  display: flex;
  gap: $unnnic-space-4;
  align-items: center;
}
</style>

<style lang="scss" scoped>
.modal-registered {
  &__image {
    height: 150px;
    object-fit: none;
  }

  &__description {
    text-align: center;
    color: $unnnic-color-fg-base;
  }

  &__start-button {
    width: 100%;
  }
}
</style>
