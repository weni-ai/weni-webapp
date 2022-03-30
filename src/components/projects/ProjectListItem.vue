<template>
  <div class="weni-project-list-item">
    <div class="weni-project-list-item__header">
      <div class="weni-project-list-item__header__title">
        <span
          class="weni-project-list-item__header__name"
          :title="name.length > 25 ? name : null"
        >
          {{ name }}
        </span>
        <unnnic-tool-tip
          style="display: none"
          class="weni-project-list-item__header__time__wrapper"
          :text="$t('projects.created_at_tooltip')"
          side="left"
          :enabled="true"
        >
          <span class="weni-project-list-item__header__time">
            <unnnic-icon-svg size="xs" icon="time-clock-circle-1" />
            {{ time }}
          </span>
        </unnnic-tool-tip>
      </div>
      <div class="weni-project-list-item__header__buttons">
        <unnnic-tag
          @click.native="
            onClick({ name: 'home', params: { projectUuid: uuid } })
          "
          clickable
          :text="$t('projects.join')"
          scheme="aux-blue"
        />
        <unnnic-dropdown
          :open="false"
          position="bottom-left"
          class="projects-actions"
        >
          <unnnic-icon-svg
            slot="trigger"
            size="sm"
            icon="navigation-menu-vertical-1"
            clickable
            scheme="neutral-cleanest"
          />
          <unnnic-dropdown-item
            @click="
              onClick({
                name: 'project',
                params: { projectUuid: uuid, internal: ['init'] },
              })
            "
          >
            <unnnic-icon-svg size="sm" icon="cog-1" />
            {{ $t('projects.config') }}
          </unnnic-dropdown-item>

          <unnnic-dropdown-item
            @click="isMemberManagementBarOpen = !isMemberManagementBarOpen"
          >
            <unnnic-icon-svg size="sm" icon="single-neutral-actions-1" />
            {{ $t('orgs.manage_members') }}
          </unnnic-dropdown-item>
        </unnnic-dropdown>
      </div>
    </div>
    <div class="weni-project-list-item__separator" />
    <div class="weni-project-list-item__status__list">
      <div
        class="weni-project-list-item__status"
        v-for="(status, index) in statusList"
        :key="index"
      >
        {{ status.title }}

        <div class="content">
          <div :class="['box', status.scheme]">
            <unnnic-icon-svg
              size="sm"
              :scheme="status.scheme"
              :icon="status.icon"
            />
          </div>

          <span class="weni-project-list-item__status__number">
            {{ status.count }}
          </span>
        </div>
      </div>
    </div>

    <container-right-sidebar
      max-width="43.125rem"
      type="manage-members"
      v-model="isMemberManagementBarOpen"
      :title="$t('orgs.manage_members')"
      :description="$t('orgs.manage_members_description')"
      class="manage-members"
    >
      <div class="manage-members__header">
        <unnnicInput size="md" label="teste" />

        <div>
          Permissão
          <unnnicMultiSelect
            label="teste"
            v-model="groups"
            :input-title="inputTitle"
          />
        </div>

        <unnnicButton type="primary" size="large">Adicionar</unnnicButton>
      </div>

      <div class="user-list">
        <user-list-item
          v-for="user in users"
          :key="user.uuid"
          class="user-item"
          :photo="user.photo"
          :name="user.username"
          :email="user.email"
          :is-me="user.isMe"
          :status="user.status"
        ></user-list-item>
      </div>
    </container-right-sidebar>
  </div>
</template>

<script>
import ContainerRightSidebar from '@/components/ContainerRightSidebar.vue';
import UserListItem from '../users/UserListItem.vue';
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'ProjectListItem',

  components: {
    ContainerRightSidebar,
    UserListItem,
  },

  props: {
    uuid: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
    owner: {
      type: String,
      default: null,
    },
    aiCount: {
      type: Number,
    },
    contactCount: {
      type: Number,
    },
    flowsCount: {
      type: Number,
    },
  },

  data() {
    return {
      isMemberManagementBarOpen: true,

      users: [],

      groups: [
        {
          title: 'Permissões Gerais',
          selected: 0,
          items: [
            {
              title: 'Moderador',
              description: 'Gerencia membros do projeto e administra o rocket',
            },
            { title: 'Contribuidor', description: 'Consegue editar o projeto' },
            {
              title: 'Vizualizador',
              description: 'Apenas vizualiza o projeto',
            },
          ],
        },
        {
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
        },
      ],
    };
  },

  computed: {
    ...mapGetters(['currentOrg']),

    inputTitle() {
      return this.groups
        .map(
          (group) =>
            group.items.find((item, index) => group.selected === index)?.title,
        )
        .join(', ');
    },

    statusList() {
      return [
        {
          title: this.$t('projects.ai'),
          icon: 'science-fiction-robot-2',
          scheme: 'aux-blue',
          count: this.aiCount,
        },
        {
          title: this.$t('projects.flows'),
          icon: 'hierarchy-3-2',
          scheme: 'aux-purple',
          count: this.flowsCount,
        },
        {
          title: this.$t('projects.contacts'),
          icon: 'single-neutral-actions-1',
          scheme: 'aux-lemon',
          count: this.contactCount,
        },
      ];
    },
  },

  watch: {
    isMemberManagementBarOpen: {
      immediate: true,

      async handler() {
        const response = await this.getMembers({
          uuid: this.currentOrg.uuid,
          page: 1,
        });

        this.users = response.data.results.map((user) => ({
          id: user.user__id,
          uuid: user.uuid,
          username:
            user.user__username === this.$store.state.Account.profile.username
              ? this.$t('orgs.you')
              : user.user__username,
          email: user.user__email,
          photo: user.user__photo,
          role: user.role,
          isMe:
            user.user__username === this.$store.state.Account.profile.username,
          status: null,
        }));
      },
    },
  },

  methods: {
    ...mapActions(['getMembers']),

    onClick(route) {
      this.$emit('click', route);
    },
    onClickBtn() {
      console.log('teste');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';
.weni-project-list-item {
  padding: $unnnic-inset-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-md;
  font-family: $unnnic-font-family-secondary;
  min-height: 9.125rem;

  &__separator {
    margin: $unnnic-spacing-stack-sm 0;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-lightest;
  }

  &--highlighted {
    color: $unnnic-color-brand-weni;
    font-weight: $unnnic-font-weight-bold;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-md;

    &__buttons {
      display: flex;
      align-items: center;

      .unnnic-icon {
        margin-left: $unnnic-spacing-inline-xs;
      }

      .unnnic-dropdown .unnnic-dropdown__content > a {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        min-width: max-content;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
        width: 100%;

        & + a {
          margin-top: $unnnic-spacing-stack-sm;
        }

        > .unnnic-icon {
          margin-right: $unnnic-spacing-inline-xs;
          margin-left: 0;
        }
      }
    }

    &__title {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: calc(100% - 80px);
      margin-right: $unnnic-spacing-inline-xs;
    }

    &__time {
      text-align: right;
      flex: 1;

      &__wrapper {
        display: inline-flex;
        align-items: center;
      }
    }
    &__name {
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-body-lg;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  }

  &__status {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    flex: 1;

    .box {
      border-radius: $unnnic-border-radius-sm;
      padding: $unnnic-spacing-inset-nano / 2;
      display: inline-block;
      margin-right: $unnnic-spacing-inline-xs;

      &.aux-blue {
        background-color: rgba(
          $unnnic-color-aux-blue,
          $unnnic-opacity-level-extra-light
        );
      }

      &.aux-purple {
        background-color: rgba(
          $unnnic-color-aux-purple,
          $unnnic-opacity-level-extra-light
        );
      }

      &.aux-lemon {
        background-color: rgba(
          $unnnic-color-aux-lemon,
          $unnnic-opacity-level-extra-light
        );
      }
    }

    .content {
      margin: $unnnic-spacing-stack-xs 0 0 0;
    }

    &__number {
      color: $unnnic-color-neutral-darkest;
      font-weight: $unnnic-font-weight-black;
    }

    &__list {
      display: flex;
      justify-content: space-between;
    }
  }
}

.projects-actions {
  user-select: none;

  ::v-deep .unnnic-dropdown__content {
    align-items: flex-start;
  }
}

::v-deep .unnnic-dropdown-item + .unnnic-dropdown-item:before {
  content: none;
}

.manage-members {
  &__header {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    align-items: flex-end;
  }

  .user-list {
    .user-item + .user-item {
      margin-top: $unnnic-spacing-stack-sm;
    }
  }
}
</style>
