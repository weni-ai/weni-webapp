<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :style="{ width: '100%' }">
    <div class="global-container">
      <div class="global-container__leftside">
        <div class="global-container__leftside__background"></div>

        <Logo class="logo" />
      </div>

      <div class="global-container__rightside">
        <div class="navbar">
          <UnnnicLanguageSelect
            :modelValue="language"
            class="language-select"
            position="bottom"
            :supportedLanguages="['pt-br', 'en', 'es']"
            @update:model-value="
              $store.dispatch('updateAccountLanguage', { language: $event })
            "
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

        <form @submit.prevent="goToNextPageOrSubmit">
          <template v-if="page === 'personal'">
            <div class="form-container">
              <div class="title">
                <span
                  v-html="
                    $t(
                      `profile.about_you.pre_title_${
                        haveBeenInvitedView ? 'invited' : 'new'
                      }`,
                      { organization: savedOrgName },
                    )
                  "
                ></span>

                {{ $t('profile.about_you.title') }}
              </div>

              <Personal
                v-model:firstName="userFirstName"
                v-model:lastName="userLastName"
                v-model:whatsAppNumber="userWhatsAppNumber"
                v-model:position="userPosition"
                v-model:positionOther="userPositionOther"
              />
            </div>
          </template>

          <template v-else-if="page === 'company'">
            <div class="form-container">
              <div class="title">
                {{ $t('profile.about_your_company.title') }}
              </div>

              <Company
                v-model:name="companyName"
                v-model:phone="companyPhone"
                v-model:size="companySize"
                v-model:segment="companySegment"
              />

              <Project
                v-model:name="projectName"
                v-model:description="projectDescription"
                v-model:team="projectTeam"
                v-model:purpose="projectPurpose"
                v-model:dateFormat="projectDateFormat"
                v-model:timeZone="projectTimeZone"
              />
            </div>
          </template>

          <template v-if="page === 'templates'">
            <div class="form-container">
              <div class="title">
                {{ $t('template_gallery.about.title') }}
              </div>

              <TemplateGallery
                v-model:template="template"
                v-model:projectDescription="projectDescription"
                @update:is-valid="templateFormIsValid = $event"
                @set-globals="templateGlobals = $event"
              />
            </div>
          </template>

          <template v-if="page === 'organization'">
            <section class="form-container">
              <h1 class="title">
                {{ $t('orgs.add_org_and_project') }}
              </h1>

              <Organization v-model:isValid="organizationFormIsValid" />

              <Project
                v-model:name="projectName"
                v-model:isValid="projectFormIsValid"
              />
            </section>
          </template>

          <template v-if="page === 'project'">
            <section class="form-container">
              <h1 class="title">
                {{
                  isCreatingProjectView
                    ? lowerCaseExceptTheFirstLetter(
                        $t('projects.create.create'),
                      )
                    : $t('orgs.add_project')
                }}
              </h1>

              <Project
                v-model:name="projectName"
                v-model:isValid="projectFormIsValid"
              />
            </section>
          </template>

          <div class="form-container">
            <div class="buttons">
              <UnnnicButton
                v-if="page === lastPage"
                type="primary"
                size="large"
                :disabled="!!errors[page]"
              >
                {{ $t('finish') }}
              </UnnnicButton>

              <UnnnicButton
                v-else
                type="primary"
                size="large"
                iconRight="keyboard-arrow-right-1"
                :disabled="!!errors[page]"
              >
                {{ $t('next') }}
              </UnnnicButton>

              <UnnnicButton
                v-if="showPreviousPageButton"
                type="tertiary"
                size="large"
                @click.prevent="goToPreviousPage"
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
      class="unnnic-modal"
      :closeIcon="false"
      :text="
        $t(
          `register.modals.${
            haveBeenInvitedView ? 'entering_project' : 'creating_project'
          }.title`,
        )
      "
      :description="
        $t(
          `register.modals.${
            haveBeenInvitedView ? 'entering_project' : 'creating_project'
          }.description`,
        )
      "
      persistent
      @close="isModalCreatingProjectOpen = false"
    >
      <template #icon>
        <img src="../../assets/IMG-9991.png" />
      </template>

      <div class="separator"></div>

      <div class="checks">
        <div
          v-for="check in checks"
          :key="check.title"
          class="check"
        >
          <UnnnicIcon
            icon="check_circle"
            size="sm"
            :scheme="
              check.status === 'checked' ? 'aux-green-500' : 'neutral-cleanest'
            "
          />

          <div>
            {{ $t(`register.modals.checks.${check.title}`)
            }}<Ellipsis v-if="check.status === 'loading'" /><span
              v-else
              :style="{ visibility: 'hidden' }"
              >...</span
            >
          </div>
        </div>
      </div>
    </UnnnicModal>

    <ModalCreateProjectError
      v-if="isModalCreateProjectErrorOpen"
      :error="projectErrorMessage"
      @close="
        () => {
          isModalCreateProjectErrorOpen = false;
          projectErrorMessage = '';
        }
      "
    />

    <ModalCreateProjectSuccess
      v-if="isModalCreateProjectSuccessOpen"
      :projectUuid="createdProject?.uuid"
      :createdBrain="createdBrain"
      :hasBrainError="hasBrainError"
      @close="closeModalCreateProjectSuccess"
    />
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
import Organization from './forms/Organization.vue';
import account from '../../api/account';
import orgs from '../../api/orgs';
import projects from '../../api/projects';
import brainAPI from '../../api/brain';
import { fetchFlowOrganization } from '../../store/org/actions';
import ModalCreateProjectError from './ModalCreateProjectError.vue';
import ModalCreateProjectSuccess from './ModalCreateProjectSuccess.vue';

export default {
  components: {
    Logo,
    Navigator,
    Personal,
    Company,
    Project,
    TemplateGallery,
    Ellipsis,
    Organization,
    ModalCreateProjectError,
    ModalCreateProjectSuccess,
  },
  props: {
    isNewUser: Boolean,
  },

  data() {
    return {
      isModalCreatingProjectOpen: false,
      isModalCreateProjectErrorOpen: false,
      projectErrorMessage: '',
      isModalCreateProjectSuccessOpen: false,

      hasBrainError: false,

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

      checks: [],

      organizationFormIsValid: false,
      projectFormIsValid: false,
      templateFormIsValid: false,

      createdProject: null,
      createdBrain: false,
    };
  },

  computed: {
    showPreviousPageButton() {
      this.pages.indexOf(this.page) !== 0;
      const isFirstPage = this.pages.indexOf(this.page) === 0;

      return (
        (isFirstPage && !this.isHaveBeenInvitedOrIsNewUserView) || !isFirstPage
      );
    },

    isHaveBeenInvitedOrIsNewUserView() {
      return this.haveBeenInvitedView || this.isNewUserView;
    },

    isCreatingOrgView() {
      return this.$route.name === 'create_org';
    },

    isCreatingProjectView() {
      return this.$route.name === 'project_create';
    },

    isNewUserView() {
      return this.isNewUser;
    },

    haveBeenInvitedView() {
      return (
        this.isNewUserView &&
        this.$store.state.Account.additionalInformation.data?.company
          ?.company_name
      );
    },

    needToCreateOrg() {
      return this.isCreatingOrgView || this.isNewUserView;
    },

    needToCreateAgent() {
      return (
        !this.template &&
        (this.isCreatingOrgView ||
          this.isCreatingProjectView ||
          this.isNewUserView)
      );
    },

    needToAddAgentContent() {
      return {
        files: !!this.$store.state.Brain.content.files.length,
        sites: !!this.$store.state.Brain.content.sites.length,
        text: !!this.$store.state.Brain.content.text,
      };
    },

    lastPage() {
      return this.pages.at(-1);
    },

    savedOrgName() {
      return this.$store.state.Account.additionalInformation.data?.organization
        ?.name;
    },

    pages() {
      if (this.isCreatingProjectView) {
        return ['project', 'templates'];
      }

      if (this.isCreatingOrgView) {
        return ['organization', 'templates'];
      }

      if (this.haveBeenInvitedView) {
        return ['personal'];
      }

      return ['personal', 'company', 'templates'];
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
          !this.projectDateFormat,
        ]).length,

        templates: !this.templateFormIsValid,

        organization: !(
          this.organizationFormIsValid && this.projectFormIsValid
        ),

        project: !this.projectFormIsValid,
      };
    },
  },

  created() {
    if (this.isCreatingOrgView) {
      this.page = 'organization';
    } else if (this.isCreatingProjectView) {
      this.page = 'project';
    }

    this.$store.state.BillingSteps.org.name = '';
    this.$store.state.BillingSteps.org.description = '';

    this.$store.commit('brainFormReset');
  },

  methods: {
    ...mapActions(['updateProfile', 'addInitialInfo']),

    filter,

    closeModalCreateProjectSuccess() {
      this.updateLastUpdateProfile();
      this.isModalCreateProjectSuccessOpen = false;
    },

    lowerCaseExceptTheFirstLetter(sentence) {
      return sentence.slice(0, 1) + sentence.slice(1).toLowerCase();
    },

    goToNextPageOrSubmit() {
      if (this.page === this.lastPage) {
        this.isModalCreatingProjectOpen = true;

        this.setupChecks();

        this.submit();
      } else {
        const nextPage = this.pages[this.pages.indexOf(this.page) + 1];
        this.page = nextPage;
      }
    },

    goToPreviousPage() {
      const pageIndex = this.pages.indexOf(this.page);
      const isFirstPage = pageIndex === 0;

      if (isFirstPage && this.isCreatingOrgView) {
        this.$router.push({ name: 'orgs' });
      } else if (isFirstPage && this.isCreatingProjectView) {
        this.$router.push({
          name: 'projects',
          params: { orgUuid: this.$route.params.orgUuid },
        });
      } else if (!isFirstPage) {
        this.page = this.pages[pageIndex - 1];
      }
    },

    setupChecks() {
      this.checks = [];

      if (this.haveBeenInvitedView) {
        this.checks.push({
          title: 'personal_fields',
          status: 'waiting',
        });
      } else {
        if (this.isHaveBeenInvitedOrIsNewUserView) {
          this.checks.push({
            title: 'personal_fields',
            status: 'waiting',
          });
        }

        if (this.needToCreateOrg) {
          this.checks.push({
            title: 'organization',
            status: 'waiting',
          });
        }

        if (this.isCreatingProjectView) {
          this.checks.push({
            title: 'project',
            status: 'waiting',
          });
        }

        if (this.needToCreateAgent) {
          this.checks.push({
            title: 'agent',
            status: 'waiting',
          });

          ['files', 'sites', 'text'].forEach((contentType) => {
            if (this.needToAddAgentContent[contentType]) {
              this.checks.push({
                title: contentType,
                status: 'waiting',
              });
            }
          });
        }
      }
    },

    async submit() {
      if (this.haveBeenInvitedView) {
        await this.updateUserInformation();

        this.$refs.modalCreatingProject.onCloseClick();

        this.openWelcomeModal();

        this.redirectAccordingUserRole();

        this.updateLastUpdateProfile();

        return;
      } else if (this.isNewUserView) {
        await this.updateUserInformation();
      }

      const project = {
        uuid: null,
        organization: this.$route.params.orgUuid,
        name: this.projectName,
        description: this.template
          ? this.projectDescription
          : this.$store.state.Brain.goal,
        dateFormat: this.projectDateFormat,
        timezone: this.projectTimeZone,
        templateUuid: this.template,
        globals: this.templateGlobals,
        brainOn: this.needToCreateAgent,
      };

      try {
        if (this.needToCreateOrg) {
          const org = {
            name: this.$store.state.BillingSteps.org.name || this.companyName,
            description:
              this.$store.state.BillingSteps.org.description ||
              this.companyName,
            project,
            organization_billing_plan: 'trial',
            authorizations: [],
            stripeCustomer: '',
          };

          const { project: createdProject } = await this.createOrg(org);

          project.uuid = createdProject.uuid;
        } else if (this.isCreatingProjectView) {
          const createdProject = await this.createProject(project);

          project.uuid = createdProject.uuid;
        }
      } catch (error) {
        const response = error?.response;

        if (response && response.data) {
          const { data } = response;
          const hasOrgError = !!data.organization;
          const hasProjectError = !!data.project;

          if (hasOrgError || hasProjectError) {
            const field = hasOrgError
              ? this.$t('orgs.create.org_name')
              : this.$t('orgs.create.project_name');

            this.projectErrorMessage =
              `${field}: ` +
              (hasOrgError
                ? data.organization.name?.[0]
                : data.project.name?.[0]);
          }
        }

        if (this.$refs?.modalCreatingProject) {
          this.$refs.modalCreatingProject.onCloseClick();
        }

        this.isModalCreateProjectErrorOpen = true;
        return;
      }

      try {
        if (this.needToCreateAgent) {
          await this.createAgent(project, this.$store.state.Brain);

          this.createdBrain = true;
        }
      } catch (e) {
        this.hasBrainError = true;
      }

      this.$refs.modalCreatingProject.onCloseClick();
      this.isModalCreateProjectSuccessOpen = true;
    },

    updateLastUpdateProfile() {
      this.$store.commit('UPDATE_PROFILE_INITIAL_INFO_SUCCESS', 'now');
    },

    async createOrg(org) {
      this.updateCheckStatus('organization', 'loading');

      const { data } = await orgs.createOrg(org);

      this.$store.commit('ORG_CREATE_SUCCESS', data.organization);
      this.$store.state.Org.orgs.data.push(data.organization);

      this.$root.$emit('set-sidebar-expanded');

      await this.setAsCurrentProject(data.project);

      this.updateCheckStatus('organization', 'checked');

      return data;
    },

    async createProject(project) {
      this.updateCheckStatus('project', 'loading');

      const { data } = await projects.createReadyMadeProject(project);

      this.$root.$emit('set-sidebar-expanded');

      await this.setAsCurrentProject(data);

      this.updateCheckStatus('project', 'checked');

      return data;
    },

    async setAsCurrentProject(project) {
      this.$store.commit('PROJECT_CREATE_SUCCESS', project);
    },

    async updateUserInformation() {
      this.updateCheckStatus('personal_fields', 'loading');

      const actions = [];

      actions.push(
        this.updateProfile({
          first_name: this.userFirstName,
          last_name: this.userLastName,
        }),
      );

      actions.push(account.addInitialData(this.formInitialInformation));

      await Promise.all(actions);

      this.updateCheckStatus('personal_fields', 'checked');
    },

    async createAgent(project, { name, goal, content }) {
      this.updateCheckStatus('agent', 'loading');

      await Promise.all([
        brainAPI.customization.edit({
          projectUuid: project.uuid,
          name,
          goal,
        }),
      ]);

      this.updateCheckStatus('agent', 'checked');

      const contents = [];

      const { data: contentBase } = await brainAPI.contentBase.get({
        projectUuid: project.uuid,
      });

      if (this.needToAddAgentContent.text) {
        this.updateCheckStatus('text', 'loading');

        contents.push(
          brainAPI.content.texts
            .create({
              contentBaseUuid: contentBase.uuid,
              text: content.text,
            })
            .then(() => {
              this.updateCheckStatus('text', 'checked');
            }),
        );
      }

      if (this.needToAddAgentContent.sites) {
        const sites = [];

        content.sites.forEach((link) => {
          sites.push(
            brainAPI.content.sites.create({
              contentBaseUuid: contentBase.uuid,
              link,
            }),
          );
        });

        this.updateCheckStatus('sites', 'loading');

        contents.push(
          Promise.all(sites).then(() => {
            this.updateCheckStatus('sites', 'checked');
          }),
        );
      }

      if (this.needToAddAgentContent.files) {
        const files = [];

        content.files.forEach((file) => {
          files.push(
            brainAPI.content.files.create({
              contentBaseUuid: contentBase.uuid,
              file,
            }),
          );
        });

        this.updateCheckStatus('files', 'loading');

        contents.push(
          Promise.all(files).then(() => {
            this.updateCheckStatus('files', 'checked');
          }),
        );
      }

      await Promise.all(contents);
    },

    updateCheckStatus(title, status) {
      const check = this.checks.find((check) => check.title === title);

      if (check) {
        check.status = status;
      }
    },

    redirectAccordingUserRole() {
      const role =
        this.$store.state.Account.additionalInformation.data?.organization
          ?.authorization;

      const orgUuid =
        this.$store.state.Account.additionalInformation.data?.organization
          ?.uuid;

      if (role === ORG_ROLE_FINANCIAL) {
        this.$router.push({
          name: 'billing',
          params: {
            orgUuid,
          },
        });
      } else {
        this.$router.push({
          name: 'projects',
          params: {
            orgUuid,
          },
        });
      }
    },

    openWelcomeModal() {
      window.dispatchEvent(new CustomEvent('openModalAddedFirstInfos'));
    },
  },
};
</script>

<style lang="scss" scoped>
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
      padding: -$unnnic-spacing-lg (-$unnnic-spacing-sm);
      padding: $unnnic-spacing-lg $unnnic-spacing-sm;

      background-image: url('../../assets/message-bubbles.svg');
      background-position: top right;
      background-repeat: repeat-y;
    }

    .logo :deep(.logo-fill) {
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
    margin: 0;
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

  :deep {
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

  :deep(.unnnic-modal-container-background-body-title) {
    padding-bottom: $unnnic-spacing-xs;
  }
}
</style>
