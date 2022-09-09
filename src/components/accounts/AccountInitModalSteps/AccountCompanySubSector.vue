<template>
  <div class="account-company-sector">
    <select-tag v-model="selectedItem" :options="sector.options"></select-tag>

    {{ selectedItem }}

    <div class="navigation">
      <unnnic-button
        type="terciary"
        size="small"
        @click="$emit('handleBackToCompanySector', {})"
      >
        {{ $t('orgs.create.next') }}
      </unnnic-button>
      <unnnic-button
        type="secondary"
        size="small"
        @click="$emit('handleFinishProcess', {})"
        :disabled="
          !selectedItem || (selectedItem.insert && !selectedItem.other)
        "
      >
        {{ $t('orgs.create.next') }}
      </unnnic-button>
    </div>
  </div>
</template>

<script>
import { AccountInitOptions } from '../AccountInitOptions';
import SelectTag from './SelectTag.vue';

export default {
  components: {
    SelectTag,
  },

  props: {
    sector: {
      type: Object,
    },
  },

  data() {
    return {
      isInputVisible: false,
      services: [],
      selectedItem: null,
    };
  },
  computed: {},
  created() {
    this.services = AccountInitOptions;
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.account-company-sector {
  display: flex;
  flex-direction: column;

  .navigation {
    display: flex;
    gap: 32px;
    width: 100%;
    max-width: 356px;
    align-self: center;

    margin-top: 16px;

    button {
      width: 100%;
    }
  }
}
</style>
