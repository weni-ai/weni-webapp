<template>
  <div class="user-list-item">
    <avatar :imageUrl="photo" size="sm" />

    <div class="user-details">
      <div v-if="name" class="name">
        <span :title="name">{{ name }}</span>
      </div>

      <div class="email">
        <span :title="email">{{ email }}</span>
      </div>
    </div>

    <unnnic-tag
      v-if="status"
      :text="status"
      scheme="feedback-yellow"
      class="status"
    />

    <div class="actions">
      <unnnic-multi-select
        v-model="groups"
        :input-title="inputTitle"
        :disabled="deleting"
      />

      <unnnic-tool-tip
        side="left"
        enabled
        :text="isMe ? $t('orgs.users.leave') : $t('orgs.users.remove')"
        class="delete-button"
      >
        <unnnic-icon-svg
          scheme="neutral-clean"
          size="sm"
          icon="delete-1-1"
          clickable
          @click="onDelete"
        />
      </unnnic-tool-tip>
    </div>
  </div>
</template>

<script>
import Avatar from '../Avatar.vue';
import { mapActions } from 'vuex';

export default {
  components: {
    Avatar,
  },

  props: {
    projectName: String,
    projectUuid: String,
    photo: String,
    name: String,
    email: String,
    status: String,
    isMe: Boolean,
    hasChat: Boolean,
    deleting: Boolean,
    role: Number,
  },

  data() {
    return {
      groups: [],
    };
  },

  created() {
    this.groups = [
      {
        id: 'general',
        title: 'Permissões Gerais',
        selected: 0,
        items: [
          {
            value: 3,
            title: 'Moderador',
            description: 'Gerencia membros do projeto e administra o rocket',
          },
          {
            value: 2,
            title: 'Contribuidor',
            description: 'Consegue editar o projeto',
          },
          {
            value: 1,
            title: 'Vizualizador',
            description: 'Apenas vizualiza o projeto',
          },
        ],
      },
    ];

    if (this.hasChat) {
      this.groups.push({
        title: 'Permissões do módulo chat',
        selected: 0,
        items: [
          {
            title: 'Gerente de Atendimento',
            description:
              'Consegue responder mensagens e criar grupos no Rocket',
          },
          {
            title: 'Agente',
            description: 'Consegue responder mensagens no Rocket',
          },
        ],
      });
    }

    const generalPermissionGroup = this.groups.find(
      (group) => group.id === 'general',
    );

    generalPermissionGroup.selected = generalPermissionGroup.items.findIndex(
      (item) => item.value === this.role,
    );
  },

  computed: {
    inputTitle() {
      return this.groups
        .map(
          (group) =>
            group.items.find((item, index) => group.selected === index)?.title,
        )
        .join(', ');
    },
  },

  watch: {
    groups(groupsAfter, groupsBefore) {
      groupsAfter.forEach((groupAfter) => {
        groupsBefore.forEach(async (groupBefore) => {
          if (
            groupAfter.id == groupBefore.id &&
            groupAfter.selected !== groupBefore.selected
          ) {
            try {
              const { data } = await this.createOrUpdateProjectAuthorization({
                email: this.email,
                projectUuid: this.projectUuid,
                role: groupAfter.items[groupAfter.selected].value,
              });
            } catch (error) {
              console.log(error);
            }
          }
        });
      });
    },
  },

  methods: {
    ...mapActions([
      'createOrUpdateProjectAuthorization',
      'removeProjectAuthorization',
      'openModal',
    ]),

    async onDelete() {
      let title = '';
      let description = '';
      let validate = null;

      if (this.isMe) {
        title = this.$t('orgs.leave.title');
        description = this.$t('orgs.leave_description');
        validate = {
          label: this.$t('orgs.leave.confirm_with_name', {
            name: this.projectName,
          }),
          placeholder: this.$t('orgs.leave.confirm_with_name_placeholder'),
          text: this.projectName,
        };
      } else {
        title = this.$t('orgs.remove_member');
        description = this.$t('orgs.remove_member_description', {
          user: this.name,
          org: this.projectName,
        });
      }

      this.openModal({
        type: 'confirm',
        data: {
          persistent: true,
          icon: 'alert-circle-1',
          scheme: 'feedback-red',
          title,
          description,
          validate,
          cancelText: this.$t('cancel'),
          confirmText: title,
          onConfirm: async (justClose, { setLoading }) => {
            setLoading(true);

            try {
              await this.removeProjectAuthorization({
                email: this.email,
                projectUuid: this.projectUuid,
              });

              console.log('done!');
            } catch (error) {
              // show error
              console.log(error);
            }

            this.$emit('delete');

            setLoading(false);

            justClose();
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.user-list-item {
  display: flex;
  align-items: center;

  ::v-deep .weni-avatar {
    margin-right: $unnnic-spacing-inline-xs;
    min-width: $unnnic-icon-size-xl;
  }

  .user-details {
    overflow: hidden;
    flex: 1;
    min-width: 3rem;

    .name,
    .email {
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-medium;
    }

    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-darkest;
    }

    .email {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: $unnnic-font-weight-regular;
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .status {
    margin: $unnnic-spacing-inline-xs;
    user-select: none;
  }

  .actions {
    display: flex;
    align-items: center;
    margin-left: $unnnic-spacing-inline-xs;

    .delete-button {
      margin-left: $unnnic-spacing-inline-xs;
    }
  }
}
</style>