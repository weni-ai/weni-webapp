<template>
  <UnnnicModal
    :closeIcon="false"
    :text="
      $t(
        `register.modals.${
          haveBeenInvited ? 'entered_project' : 'created_project'
        }.title`,
        { organization: savedOrgName },
      )
    "
    persistent
    @close="$emit('close')"
  >
    <template #icon>
      <img src="../../assets/IMG-9959-with-background.png" />
    </template>

    <div
      v-if="haveBeenInvited && [2, 3, 4].includes(savedOrgAuthorization)"
      v-html="
        $t(
          `register.modals.entered_project.description.role_${savedOrgAuthorization}`,
        )
      "
    ></div>

    <UnnnicButton @click.prevent="$emit('close')">
      {{ $t('register.modals.created_project.button_start') }}
    </UnnnicButton>
  </UnnnicModal>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
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
