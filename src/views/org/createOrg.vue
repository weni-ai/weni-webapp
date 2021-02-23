<template>
    <div class="weni-create-org">
        <indicator class="weni-create-org__indicator" :steps="3" :current="current+1" :names="['Organização', 'Membros', 'Projeto']" />
        <div v-show="current===0" class="weni-create-org__section">
            <unnnic-input
              :label="$t('orgs.create.org_name')"
              :placeholder="$t('orgs.create.org_name_placeholder')"/>
            <unnnic-input
              :label="$t('orgs.create.org_description')"
              :placeholder="$t('orgs.create.org_description_placeholder')" />
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button
                type="secondary"
                @click="current = current + 1">
                {{ $t('orgs.create.next') }}
              </unnnic-button>
            </div>
        </div>
        <div v-show="current===1" class="weni-create-org__section">
            <h1> {{ $t('orgs.create.title') }} </h1>
            <div class="weni-create-org__group">
              <unnnic-autocomplete
                class="weni-create-org__email-input"
                :placeholder="$t('orgs.create.org_user_email_placeholder')"
                icon-right="keyboard-return-1"
                :label="$t('orgs.create.org_user_email')" />
              <unnnic-select :label="$t('orgs.create.permission')"></unnnic-select>
            </div>
            <div class="weni-create-org__users">
              <org-role
                v-for="index in 5"
                :key="index"
                name="Nome"
                email="email@email.com"
                role="Administrador"/>
            </div>
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" @click="current = current - 1"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button type="secondary" @click="current = current + 1"> {{ $t('orgs.create.next') }} </unnnic-button>
            </div>
        </div>
        <div v-show="current===2" class="weni-create-org__section">
            <unnnic-input
              :label="$t('orgs.create.project_name')"
              :placeholder="$t('orgs.create.project_name_placeholder')"/>
            <unnnic-select :label="$t('orgs.create.date_format')" />
            <unnnic-select :label="$t('orgs.create.time_zone')" />
            <div class="weni-create-org__group weni-create-org__group__buttons">
              <unnnic-button type="terciary" @click="current = current - 1"> {{ $t('orgs.create.back') }} </unnnic-button>
              <unnnic-button type="secondary"> {{ $t('orgs.create.next') }} </unnnic-button>
            </div>
        </div>
        <footer></footer>
    </div>
</template>

<script>
import Indicator from '../../components/orgs/indicator';
import OrgRole from '../../components/orgs/orgRole';
import {
  unnnicInput,
  unnnicButton,
  unnnicSelect,
  unnnicAutocomplete } from 'unnic-system-beta';
export default {
  name: 'CreateOrg',
  components: {
    Indicator,
    unnnicInput,
    unnnicButton,
    unnnicSelect,
    unnnicAutocomplete,
    OrgRole },
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
    padding: 2.5rem 0 0 0;
    height: 100vh;
    box-sizing: border-box;

    h1 {
      font-size: $unnnic-font-size-title-md;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-regular;
      margin: 0 0 $unnnic-spacing-stack-md 0;
      text-align: center;
    }

    &__users {
        max-height: 4*60px;
        overflow-y: auto;
        margin: $unnnic-spacing-stack-md 0 0 0;
        > *:not(:last-child) {
          margin: 0 0 1.25rem 0;
      }
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