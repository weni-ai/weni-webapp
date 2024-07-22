<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :style="{ width: '100%' }">
    <div class="global-container">
      <div class="global-container__leftside">
        <div class="global-container__leftside__background"></div>

        <img
          class="robot"
          src="../../assets/IA.svg"
          alt="robot"
        />

        <img
          class="messages"
          src="../../assets/messages.svg"
          alt="messages"
        />

        <Logo class="logo" />
      </div>

      <div class="global-container__rightside">
        <div class="navbar">
          <UnnnicLanguageSelect
            :value="language"
            @input="
              $store.dispatch('updateAccountLanguage', { language: $event })
            "
            class="language-select"
            position="bottom"
            :supportedLanguages="['pt-br', 'en', 'es']"
          ></UnnnicLanguageSelect>
        </div>

        <div class="form-container">
          <Navigator
            v-if="pages.length > 1"
            class="navigator"
            :activePage="page"
            :pages="pages"
          />
        </div>

        <form @submit.prevent="nextPage">
          <template v-if="page === 'personal'">
            <div class="form-container">
              <div class="title">
                <span
                  v-html="
                    $t(
                      `profile.about_you.pre_title_${
                        haveBeenInvited ? 'invited' : 'new'
                      }`,
                      { organization: savedOrgName },
                    )
                  "
                ></span>

                {{ $t('profile.about_you.title') }}
              </div>

              <Personal
                :firstName.sync="userFirstName"
                :lastName.sync="userLastName"
                :whatsAppNumber.sync="userWhatsAppNumber"
                :position.sync="userPosition"
                :positionOther.sync="userPositionOther"
              />
            </div>
          </template>

          <template v-else-if="page === 'company'">
            <div class="form-container">
              <div class="title">
                {{ $t('profile.about_your_company.title') }}
              </div>

              <Company
                :name.sync="companyName"
                :phone.sync="companyPhone"
                :size.sync="companySize"
                :segment.sync="companySegment"
              />

              <Project
                :name.sync="projectName"
                :description.sync="projectDescription"
                :team.sync="projectTeam"
                :purpose.sync="projectPurpose"
                :dateFormat.sync="projectDateFormat"
                :timeZone.sync="projectTimeZone"
              />
            </div>
          </template>

          <template v-if="page === 'templates'">
            <div class="form-container">
              <div class="title">
                {{ $t('template_gallery.about.title') }}
              </div>

              <TemplateGallery
                :template.sync="template"
                @set-globals="templateGlobals = $event"
              />
            </div>
          </template>

          <div class="form-container">
            <div class="buttons">
              <UnnnicButton
                type="primary"
                size="large"
                iconRight="keyboard-arrow-right-1"
                :disabled="!!errors[page]"
              >
                {{ $t('next') }}
              </UnnnicButton>

              <UnnnicButton
                v-if="pages.indexOf(page) !== 0"
                @click.prevent="previousPage"
                type="tertiary"
                size="large"
              >
                {{ $t('back') }}
              </UnnnicButton>
            </div>
          </div>
        </form>
      </div>
    </div>

    <UnnnicModal
      v-if="isModalCreatingProjectOpen"
      ref="modalCreatingProject"
      @close="isModalCreatingProjectOpen = false"
      class="unnnic-modal"
      :closeIcon="false"
      :text="
        $t(
          `register.modals.${
            haveBeenInvited ? 'entering_project' : 'creating_project'
          }.title`,
        )
      "
      :description="
        $t(
          `register.modals.${
            haveBeenInvited ? 'entering_project' : 'creating_project'
          }.description`,
        )
      "
      persistent
    >
      <img
        slot="icon"
        src="../../assets/IMG-9991.png"
      />

      <div class="separator"></div>

      <div class="checks">
        <div
          v-for="check in checksFiltered"
          :key="check.title"
          class="check"
        >
          <UnnnicIcon
            icon="check_circle"
            size="sm"
            :scheme="check.checked ? 'aux-green-500' : 'neutral-cleanest'"
          />

          <div>
            {{
              $t(
                `register.modals.${
                  haveBeenInvited ? 'entering_project' : 'creating_project'
                }.checks.${check.title}`,
              )
            }}<Ellipsis v-if="check.loading" /><span
              v-else
              :style="{ visibility: 'hidden' }"
              >...</span
            >
          </div>
        </div>
      </div>
    </UnnnicModal>
  </div>
</template>

<script>
import { filter } from 'lodash';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import Logo from '../../components/Logo.vue';
import Navigator from './Navigator.vue';
import Personal from './forms/Personal.vue';
import Company from './forms/Company.vue';
import Project from './forms/Project.vue';
import TemplateGallery from './forms/TemplateGallery.vue';
import Ellipsis from '../../components/EllipsisAnimation.vue';
import { mapActions } from 'vuex';
import { ORG_ROLE_FINANCIAL } from '../../components/orgs/orgListItem.vue';

export default {
  components: {
    Logo,
    Navigator,
    Personal,
    Company,
    Project,
    TemplateGallery,
    Ellipsis,
  },

  data() {
    return {
      isModalCreatingProjectOpen: false,

      page: 'personal',

      userFirstName: '',
      userLastName: '',
      userWhatsAppNumber: '',
      userPosition: '',
      userPositionOther: '',

      companyName: '',
      companyPhone: '',
      companySize: '',
      companySegment: '',

      projectName: '',
      projectDescription: '',
      projectTeam: '',
      projectPurpose: '',
      projectDateFormat: 'D',
      projectTimeZone: 'America/Sao_Paulo',

      template: '',
      templateGlobals: {},

      checks: [
        {
          title: 'flows',
          checked: false,
          loading: false,
        },
        {
          title: 'AI',
          checked: false,
          loading: false,
        },
        {
          title: 'whatsapp_demo',
          checked: false,
          loading: false,
        },
      ],
    };
  },

  methods: {
    ...mapActions(['updateProfile', 'addInitialInfo', 'createOrg']),

    filter,

    nextPage() {
      const pageIndex = this.pages.indexOf(this.page);

      if (pageIndex + 1 !== this.pages.length) {
        this.page = this.pages[pageIndex + 1];
      } else {
        this.isModalCreatingProjectOpen = true;

        this.checksFiltered.forEach((check) => {
          check.loading = false;
          check.checked = false;
        });

        this.fakeLoading();
      }
    },

    previousPage() {
      const pageIndex = this.pages.indexOf(this.page);

      if (pageIndex !== 0) {
        this.page = this.pages[pageIndex - 1];
      }
    },

    async fakeLoading() {
      const loadNext = () => {
        const check = this.checksFiltered.find((check) => !check.checked);

        if (check) {
          check.loading = true;

          setTimeout(() => {
            check.loading = false;
            check.checked = true;

            loadNext();
          }, 2000 + Math.random() * 2000);
        }
      };

      loadNext();

      await this.updateProfile(this.formUser);

      this.$store.state.BillingSteps.org = this.formOrg;
      this.$store.state.BillingSteps.project = this.formProject;

      this.addInitialInfo(this.formInitialInformation).catch();

      if (!this.haveBeenInvited) {
        await this.createOrg({
          type: 'trial',
          stripeCustomer: '',
          authorizations: [],
        });
      }

      this.$refs.modalCreatingProject.onCloseClick();

      if (this.haveBeenInvited) {
        const role =
          this.$store.state.Account.additionalInformation.data?.organization
            ?.authorization;

        if (role === ORG_ROLE_FINANCIAL) {
          this.$router.push({
            name: 'billing',
            params: {
              orgUuid:
                this.$store.state.Account.additionalInformation.data
                  ?.organization?.uuid,
            },
          });
        } else {
          this.$router.push({
            name: 'projects',
            params: {
              orgUuid:
                this.$store.state.Account.additionalInformation.data
                  ?.organization?.uuid,
            },
          });
        }
      } else {
        this.$router.push({
          name: 'home',
          params: { projectUuid: this.$store.getters.currentProject?.uuid },
        });
      }

      window.dispatchEvent(new CustomEvent('openModalAddedFirstInfos'));

      this.$store.commit('UPDATE_PROFILE_INITIAL_INFO_SUCCESS', 'now()');
    },
  },

  computed: {
    haveBeenInvited() {
      return (
        !!this.$store.state.Account.additionalInformation.data?.company
          ?.company_name ||
        !!this.$store.state.Account.additionalInformation.data?.organization
          ?.name
      );
    },

    savedOrgName() {
      return this.$store.state.Account.additionalInformation.data?.organization
        ?.name;
    },

    pages() {
      if (this.haveBeenInvited) {
        return ['personal'];
      }

      return ['personal', 'company', 'templates'];
    },

    checksFiltered() {
      if (this.haveBeenInvited) {
        return this.checks.slice(0, 2);
      }

      return this.checks;
    },

    formOrg() {
      return {
        name: this.companyName,
        description: this.companyName,
      };
    },

    formProject() {
      return {
        name: this.projectName,
        description: this.projectDescription,
        dateFormat: this.projectDateFormat,
        timeZone: this.projectTimeZone,
        format: this.template,
        globals: this.templateGlobals,
      };
    },

    formUser() {
      return {
        first_name: this.userFirstName,
        last_name: this.userLastName,
      };
    },

    formInitialInformation() {
      const UTMParams = Array.from(new URLSearchParams(location.search))
        .map(([name, value]) => [name.toLowerCase(), value])
        .filter(([name]) => name.startsWith('utm_'));

      const UTMObject = Object.fromEntries(UTMParams);

      const {
        company_name,
        company_segment,
        company_sector,
        number_people,
        weni_helps,
      } = this.$store.state.Account.additionalInformation.data?.company || {};

      return {
        company: {
          name: company_name || this.companyName,
          number_people: number_people || Number(this.companySize),
          segment: company_segment || this.companySegment,
          sector: company_sector || this.projectTeam,
          weni_helps: weni_helps || this.projectPurpose,
        },
        user: {
          phone: this.userWhatsAppNumber.replaceAll(/[^\d]/g, ''),
          position:
            this.userPosition === 'Other'
              ? this.userPositionOther
              : this.userPosition,
          utm: UTMObject,
        },
      };
    },

    language() {
      return this.$i18n.locale;
    },

    errors() {
      return {
        personal: filter(
          [
            !this.userFirstName,
            !this.userLastName,
            !parsePhoneNumberFromString(this.userWhatsAppNumber)?.isValid(),
            !this.userPosition,
          ].concat(
            this.userPosition === 'Other' ? [!this.userPositionOther] : [],
          ),
        ).length,

        company: filter([
          !this.companyName,
          !this.companySize,
          !this.companySegment,
          !this.projectName,
          !this.projectDescription,
          !this.projectTeam,
          this.projectTeam === 'other' ? false : !this.projectPurpose,
          !this.projectDateFormat,
          !this.projectTimeZone,
        ]).length,

        templates: filter([!this.template]).length,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.global-container {
  width: 100%;
  max-width: 78rem;
  margin: 0 auto;
  display: flex;
  min-height: 100vh;

  &__leftside {
    width: 16.1875rem;
    position: relative;
    box-sizing: border-box;
    padding: $unnnic-spacing-lg $unnnic-spacing-sm;

    @media screen and (max-width: 768px) {
      display: none;
    }

    &__background {
      z-index: -1;
      position: absolute;
      background-color: $unnnic-color-weni-600;
      width: 100vw;
      top: 0;
      right: 0;
      bottom: 0;
      padding: -$unnnic-spacing-lg -$unnnic-spacing-sm;
      padding: $unnnic-spacing-lg $unnnic-spacing-sm;
    }

    .robot {
      position: absolute;
      left: -3.5rem;
      bottom: 0;
      pointer-events: none;
      user-select: none;
    }

    .messages {
      position: absolute;
      right: 0;
      top: 7.125rem;
      pointer-events: none;
      user-select: none;
    }

    .logo ::v-deep .logo-fill {
      fill: $unnnic-color-weni-50;
    }
  }

  &__rightside {
    flex: 1;
    padding: $unnnic-spacing-lg $unnnic-spacing-sm;

    .navbar {
      margin-bottom: $unnnic-spacing-lg;
      display: flex;
      justify-content: right;

      .language-select {
        width: 12.5rem;
      }
    }

    .navigator {
      margin-bottom: $unnnic-spacing-giant;
    }
  }
}

.form-container {
  max-width: 31.625rem;
  margin: 0 auto;
  flex: 1;

  .title {
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-title-md;
    line-height: $unnnic-font-size-title-md + $unnnic-line-height-md;
    color: $unnnic-color-neutral-darkest;
    margin-bottom: $unnnic-spacing-md;

    :deep(.highlighted) {
      color: $unnnic-color-weni-600;
    }
  }

  .description {
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-regular;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
  }

  .title + .description {
    margin-top: -$unnnic-spacing-xs;
  }

  @media screen and (max-width: 480px) {
    .description.plans {
      display: none;
    }
  }

  ::v-deep {
    .section-title {
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      color: $unnnic-color-weni-600;
      margin-top: $unnnic-spacing-md;
      margin-bottom: $unnnic-spacing-sm;
    }

    .form-elements {
      display: flex;
      flex-direction: column;
      row-gap: $unnnic-spacing-sm;

      &__row {
        display: grid;
        gap: $unnnic-spacing-sm;
        grid-template-columns: repeat(auto-fit, minmax(15.3125rem, 1fr));
      }
    }
  }
}

.buttons {
  margin-top: $unnnic-spacing-md;
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-xs + $unnnic-spacing-nano;
}

.unnnic-modal {
  .separator {
    height: $unnnic-border-width-thinner;
    background-color: $unnnic-color-neutral-soft;
    margin: $unnnic-spacing-md 0;
  }

  .checks {
    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-nano;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    width: fit-content;
    margin: 0 auto;

    .check {
      display: flex;
      column-gap: $unnnic-spacing-nano;
      align-items: center;
    }
  }

  ::v-deep .unnnic-modal-container-background-body-title {
    padding-bottom: $unnnic-spacing-xs;
  }
}
</style>
