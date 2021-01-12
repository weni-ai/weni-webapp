<template>
  <div class="unnic-grid-giant weni-account">
    <div class="unnic-grid-span-4 weni-account__card">
        <unnic-card class="weni-account__card__item"
        type="account"
        icon="single-neutral-2"
        title="Seu perfil"
        description="Altere suas informações como foto de perfil, nome de usuário ou exclua sua conta." />
    </div>
    <div class="unnic-grid-span-8">
        <div class="weni-account__header">
            <div class="weni-account__header__text">
                <div class="weni-account__header__text__title"> Nome </div>
                <div class="weni-account__header__text__subtitle"> @Username </div>
            </div>
            <div class="weni-account__field__group">
                <unnic-button size="small" type="terciary" icon-left="delete-1" > Remover Alterações </unnic-button>
                <unnic-button size="small" type="terciary"> Alterar foto de perfil </unnic-button>
            </div>
        </div>
        <div class="weni-account__header__info"> 
            <div class="weni-account__header__info__separator" /> 
            <div> Images by Coisinha </div> 
        </div>
        <div class="weni-account__field">
            <unnic-input icon-left="single-neutral-actions-1" label="Nome" v-model="profile.first_name" @input="onInput($event)"/>
            <unnic-input icon-left="single-neutral-actions-1" label="Sobrenome" v-model="profile.last_name"/>
            <unnic-input icon-left="email-action-unread-1" label="Email" v-model="profile.email"/>
            <div class="weni-account__field__group">
                <unnic-input icon-left="read-email-at-1" label="Nome de usuário" v-model="profile.username"/>
                <unnic-input icon-left="single-neutral-actions-1" label="Nova senha" native-type="password" toggle-password />
            </div>
        </div>
        <div class="weni-account__field__group">
            <unnic-button @click="update()"> Salvar alterações </unnic-button>
            <unnic-button class="weni-account__danger" type="terciary"> Excluir conta </unnic-button>
        </div>
    </div>
  </div>
</template>

<script>
import unnic from 'unnic-system-beta';
import account from '../api/account.js';

export default {
  name: 'Account',
  data() {
    return {
      profile: {
        email: '',
        first_name: '',
        last_name: '',
        username: '',
        photo: null,
      },
    };
  },
  components: { 
    unnicCard: unnic.UnnicCard, 
    unnicInput: unnic.UnnicInput,
   unnicButton: unnic.UnnicButton, 
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    async getProfile() {
      const response = await account.profile();
      this.profile = response.data;
      console.log(this.profile);
    },
    async update() {
        const response = await account.updateProfile(this.profile);
        console.log(response.data);
    },
    onInput(value) {
        console.log('value', value);
    },
  }

}
</script>

<style lang="scss">
@import '~unnic-system-beta/src/assets/scss/unnic.scss';

    .weni-account {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        &__card {
            border-right: 2px $unnic-color-neutral-soft solid;
            padding-right: 16px;
        }

        &__field {
            margin-bottom: $unnic-spacing-stack-md !important;
            &__group {
                display: flex;

                button {
                    width: 100%;
                }

                > * {
                    flex: 1;
                }

                > :not(:last-child) {
                    margin-right: 1rem;
                }
            }
        }

        &__danger {
            color: $unnic-color-feedback-red !important;
        }
        
        &__header {
            display: flex;
            font-family: $unnic-font-family-primary;
            border-radius: $unnic-border-radius-sm;
            padding: $unnic-squish-lg;
            background-color: red;
            overflow: hidden;
            &__text {
                flex: 1;
                &__title {
                    font-size: $unnic-font-size-title-sm;
                }
                &__subtitle {
                    font-size: $unnic-font-size-body-lg;
                    color: $unnic-color-neutral-dark;
                }
            }

            &__info {
                display: flex;
                align-items: center;
                color: $unnic-color-neutral-clean;
                font-size: $unnic-font-size-body-sm;
                &__separator {
                    flex: 1;
                    border: 1px solid $unnic-color-neutral-soft;
                    margin-right: $unnic-inline-nano;
                }
            }
            
        }
    }
</style>