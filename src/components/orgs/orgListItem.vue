<template>
  <unnnic-card-company
    :title="name"
    :description="description"
    :join-label="$t('orgs.join')"
    :options="options"
    :members="displayMembers"
    :members-description="
      remainingMembers ? $tc('orgs.remaining_members', remainingMembers) : null
    "
    @join="onSelectOrg"
  />
</template>

<script>
import image from '../../../src/assets/default-avatar.svg';

export default {
  name: 'OrgListItem',
  props: {
    name: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    members: {
      type: Array,
      default: () => [],
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      highlighted: false,
      confirmOrganizationName: '',
    };
  },
  computed: {
    displayMembers() {
      if (!this.members) return [];

      return this.members.map((member) => ({
        name: this.getName(member),
        photo: member.photo_user || image,
      }));
    },
    remainingMembers() {
      if (!this.members || this.members.length <= 4) return 0;
      return this.members.length - 4;
    },

    options() {
      if (this.canEdit) {
        return [
          {
            icon: 'button-refresh-arrows-1',
            title: this.$t('orgs.change_name'),
            click: this.onEdit,
          },
          {
            icon: 'single-neutral-actions-1',
            title: this.$t('orgs.manage_members'),
            click: this.onManage,
          },
          {
            icon: 'currency-dollar-circle-1',
            title: this.$t('orgs.billing'),
            click: this.onSelectBilling,
          },
          {
            icon: 'delete-1-1',
            title: this.$t('orgs.delete.title'),
            click: this.openDeleteModal,
            scheme: 'feedback-red',
          },
        ];
      }

      return [
        {
          icon: 'view-1-1',
          title: this.$t('orgs.view_members'),
          click: this.onView,
        },
      ];
    },
  },
  methods: {
    openDeleteModal() {
      this.$emit('open-delete-confirmation');
    },

    getName(user) {
      const name = [user.first_name, user.last_name]
        .filter((name) => name)
        .join(' ');
      return name ? name : user.username;
    },

    onSelectOrg() {
      this.$emit('select');
    },
    onSelectBilling() {
      this.$emit('billing');
    },
    onEdit() {
      this.$emit('edit');
    },
    onManage() {
      this.$emit('manage');
    },
    onView() {
      this.$emit('view');
    },
  },
};
</script>
