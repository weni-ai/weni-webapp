<template>
    <div class="weni-create-org">
        <indicator class="weni-create-org__indicator" :steps="3" :current="current+1" :names="['Organização', 'Membros', 'Projeto']" />
        <div v-show="current===0" class="weni-create-org__section">
            <unnnic-input label="Nome da organização" placeholder="Defina o nome da organização"/>
            <unnnic-input label="Descrição" placeholder="Descreva brevemente as suas atividades" />
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary"> Voltar </unnnic-button>
              <unnnic-button type="secondary" @click="current = current + 1"> Avançar </unnnic-button>
            </div>
        </div>
        <div v-show="current===1" class="weni-create-org__section">
            <h1> Aproveite este momento para convidar membros para sua organização, caso deseje. </h1>
            <div class="weni-create-org__group">
              <unnnic-autocomplete class="weni-create-org__email-input" placeholder="Insira um e-mail para convidar" icon-right="keyboard-return-1" label="E-mail do convidado" />
              <unnnic-select label="Permissão"></unnnic-select>
            </div>
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" @click="current = current - 1"> Voltar </unnnic-button>
              <unnnic-button type="secondary" @click="current = current + 1"> Avançar </unnnic-button>
            </div>
        </div>
        <div v-show="current===2" class="weni-create-org__section">
            <unnnic-input label="Nome do projeto" placeholder="Defina um nome fácil de ser entendido"/>
            <unnnic-select label="Formato da data" />
            <unnnic-select label="Fuso horário" />
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" @click="current = current - 1"> Voltar </unnnic-button>
              <unnnic-button type="secondary"> Avançar </unnnic-button>
            </div>
        </div>
        <footer></footer>
    </div>
</template>

<script>
import Indicator from '../../components/orgs/indicator';
import { unnnicInput, unnnicButton, unnnicSelect, unnnicAutocomplete } from 'unnic-system-beta';
export default {
  name: 'CreateOrg',
  components: { Indicator, unnnicInput, unnnicButton, unnnicSelect, unnnicAutocomplete },
  data() {
    return {
      current: 0,
    };
  }
}
</script>

<style lang="scss" >
 @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-create-org {
    max-width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: auto;
    padding: 40px 0 0 0;
    height: 100vh;
    box-sizing: border-box;

    h1 {
      font-size: $unnnic-font-size-title-md;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }

    &__indicator {
      margin-bottom: 22px + 40px;
      max-width: 50%;
    }

    &__email-input {
      flex: 1;
    }

    &__group {
      display: flex;
      > *:not(:last-child) {
        margin-right: $unnnic-spacing-stack-sm;
      }

      &__buttons {
        margin-top: $unnnic-spacing-stack-md;
        > * {
          flex: 1;
        }
      }
    }

    &__section {
      width: 100%;
    }

    footer {
      flex: 1;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      &::before {
        content: '';
        height: 8px;
        display: block;
        background-color: $unnnic-color-brand-weni;
      }
    }
  }
</style>