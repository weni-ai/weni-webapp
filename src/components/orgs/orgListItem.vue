<template>
  <unnnic-card-company
    :title="name"
    :tag="plan === 'trial' ? $t(`billing.${plan}.title`) : undefined"
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

export const ORG_ROLE_CONTRIBUTOR = 2;
export const ORG_ROLE_ADMIN = 3;
export const ORG_ROLE_FINANCIAL = 4;

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
    canEditBilling: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Number,
    },
    org: {
      type: Object,
    },
  },
  data() {
    return {
      highlighted: false,
      confirmOrganizationName: '',
    };
  },
  computed: {
    plan() {
      return this.org.organization_billing?.plan;
    },

    displayMembers() {
      if (!this.members) return [];

      return this.members.map((member) => ({
        name: this.getName(member),
        photo: member.photo_user || image,
      }));
    },
    remainingMembers() {
      if (!this.members || this.members.length <= 3) return 0;
      return this.members.length - 3;
    },

    options() {
      const billingArray = [
        {
          icon: 'currency-dollar-circle-1',
          title: this.$t('orgs.billing'),
          click: this.onSelectBilling,
        },
      ];

      if (this.role === ORG_ROLE_CONTRIBUTOR) {
        return [
          {
            icon: 'view-1-1',
            title: this.$t('orgs.view_members'),
            click: this.onView,
          },
        ];
      } else if (this.role === ORG_ROLE_FINANCIAL) {
        return billingArray;
      } else if (this.role === ORG_ROLE_ADMIN) {
        return [
          {
            icon: 'single-neutral-actions-1',
            title: this.$t('orgs.manage_members'),
            click: this.onManage,
          },
        ]
          .concat(billingArray)
          .concat([
            {
              icon: 'cog-1',
              title: this.$t('orgs.config'),
              click: this.onEdit,
            },
            {
              icon: 'delete-1-1',
              title: this.$t('orgs.leave.title'),
              click: this.openDeleteModal,
              scheme: 'feedback-red',
            },
          ]);
      }

      return [];
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
      if (this.role === ORG_ROLE_FINANCIAL) {
        this.onSelectBilling();
      } else {
        this.$emit('select');
      }
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
