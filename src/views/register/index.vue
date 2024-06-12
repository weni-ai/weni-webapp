<template>
  <div :style="{ width: '100%' }">
    <div class="global-container">
      <div class="global-container__leftside">
        <div class="global-container__leftside__background"></div>

        <img
          class="messages"
          src="../../assets/messages.svg"
          alt="messages"
        />

        <Logo class="logo" />
      </div>

      <div class="global-container__rightside">
        <div class="navbar">
          <unnnic-language-select
            :value="language"
            @input="
              $store.dispatch('updateAccountLanguage', { language: $event })
            "
            class="language-select"
            position="bottom"
            :supported-languages="['pt-br', 'en', 'es']"
          ></unnnic-language-select>
        </div>

        <div class="form-container">
          <navigator
            v-if="pages.length > 1"
            class="navigator"
            :active-page="page"
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

              <personal
                :first-name.sync="userFirstName"
                :last-name.sync="userLastName"
                :whats-app-number.sync="userWhatsAppNumber"
                :position.sync="userPosition"
                :position-other.sync="userPositionOther"
              />
            </div>
          </template>

          <template v-else-if="page === 'company'">
            <div class="form-container">
              <div class="title">
                {{ $t('profile.about_your_company.title') }}
              </div>

              <company
                :name.sync="companyName"
                :phone.sync="companyPhone"
                :size.sync="companySize"
                :segment.sync="companySegment"
              />

              <project
                :name.sync="projectName"
                :description.sync="projectDescription"
                :team.sync="projectTeam"
                :purpose.sync="projectPurpose"
                :date-format.sync="projectDateFormat"
                :time-zone.sync="projectTimeZone"
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
                :projectDescription.sync="projectDescription"
                @set-globals="templateGlobals = $event"
                :isValid.sync="templateFormIsValid"
              />
            </div>
          </template>

          <template v-if="page === 'organization'">
            <section class="form-container">
              <h1 class="title">
                {{ $t('orgs.add_org') }}
              </h1>

              <Organization :isValid.sync="organizationFormIsValid" />
            </section>
          </template>

          <template v-if="page === 'project'">
            <section class="form-container">
              <h1 class="title">
                {{
                  isCreatingProjectView
                    ? lowerCaseButFirst($t('projects.create.create'))
                    : $t('orgs.add_project')
                }}
              </h1>

              <project
                :name.sync="projectName"
                :date-format.sync="projectDateFormat"
                :isValid.sync="projectFormIsValid"
              />
            </section>
          </template>

          <div class="form-container">
            <div class="buttons">
              <unnnic-button-next
                v-if="page === lastPage"
                type="primary"
                size="large"
                :disabled="!!errors[page]"
              >
                {{ $t('finish') }}
              </unnnic-button-next>

              <unnnic-button-next
                v-else
                type="primary"
                size="large"
                iconRight="keyboard-arrow-right-1"
                :disabled="!!errors[page]"
              >
                {{ $t('next') }}
              </unnnic-button-next>

              <unnnic-button-next
                v-if="pages.indexOf(page) !== 0"
                @click.prevent="previousPage"
                type="ghost"
                size="large"
              >
                {{ $t('back') }}
              </unnnic-button-next>
            </div>
          </div>
        </form>
      </div>
    </div>

    <unnnic-modal
      v-if="isModalCreatingProjectOpen"
      ref="modalCreatingProject"
      @close="isModalCreatingProjectOpen = false"
      class="unnnic-modal"
      :close-icon="false"
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
    >
      <img
        slot="icon"
        src="../../assets/IMG-9991.png"
      />

      <div class="separator"></div>

      <div class="checks">
        <div
          v-for="check in checks"
          :key="check.title"
          class="check"
        >
          <unnnic-icon
            icon="check_circle"
            size="sm"
            :scheme="
              check.status === 'checked' ? 'aux-green-500' : 'neutral-cleanest'
            "
          />

          <div>
            {{
              $t(
                `register.modals.${
                  haveBeenInvitedView ? 'entering_project' : 'creating_project'
                }.checks.${check.title}`,
              )
            }}<ellipsis v-if="check.status === 'loading'" /><span
              v-else
              :style="{ visibility: 'hidden' }"
              >...</span
            >
          </div>
        </div>
      </div>
    </unnnic-modal>
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

export default {
  props: {
    isNewUser: Boolean,
  },

  components: {
    Logo,
    Navigator,
    Personal,
    Company,
    Project,
    TemplateGallery,
    Ellipsis,
    Organization,
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

      checks: [],

      organizationFormIsValid: false,
      projectFormIsValid: false,
      templateFormIsValid: false,
    };
  },

  created() {
    if (this.isCreatingOrgView) {
      this.page = 'organization';
    } else if (this.isCreatingProjectView) {
      this.page = 'project';
    }
  },

  methods: {
    ...mapActions(['updateProfile', 'addInitialInfo']),

    filter,

    lowerCaseButFirst(sentence) {
      return sentence.slice(0, 1) + sentence.slice(1).toLowerCase();
    },

    goToNextPageOrSubmit() {
      if (this.page === this.lastPage) {
        this.isModalCreatingProjectOpen = true;

        this.checks = [
          {
            title: 'flows',
            status: 'waiting',
            fake: true,
          },
          {
            title: 'AI',
            status: 'waiting',
            fake: true,
          },
        ];

        if (!this.haveBeenInvitedView) {
          this.checks.push({
            title: 'whatsapp_demo',
            status: 'waiting',
            fake: true,
          });
        }

        if (this.needToCreateAgent) {
          this.checks.push({
            title: 'agent',
            status: 'waiting',
          });

          ['files', 'sites', 'text'].forEach((title) => {
            if (this.needToAddAgentContent[title]) {
              this.checks.push({
                title,
                status: 'waiting',
              });
            }
          });
        }

        this.submit();
      } else {
        const nextPage = this.pages[this.pages.indexOf(this.page) + 1];
        this.page = nextPage;
      }
    },

    previousPage() {
      const pageIndex = this.pages.indexOf(this.page);

      if (pageIndex !== 0) {
        this.page = this.pages[pageIndex - 1];
      }
    },

    async submit() {
      const fakeCheckNextItem = () => {
        const check = this.checks
          .filter(({ fake }) => fake)
          .find((check) => check.status === 'waiting');

        if (check) {
          check.status = 'loading';

          setTimeout(() => {
            check.status = 'checked';

            fakeCheckNextItem();
          }, 2000 + Math.random() * 2000);
        }
      };

      fakeCheckNextItem();

      if (this.haveBeenInvitedView) {
        await this.updateUserInformation();

        this.$refs.modalCreatingProject.onCloseClick();

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

        window.dispatchEvent(new CustomEvent('openModalAddedFirstInfos'));

        this.$store.commit('UPDATE_PROFILE_INITIAL_INFO_SUCCESS', 'now');

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
      };

      if (this.isCreatingOrgView || this.isNewUserView) {
        const org = {
          name: this.$store.state.BillingSteps.org.name || this.companyName,
          description:
            this.$store.state.BillingSteps.org.description || this.companyName,
          project,
          organization_billing_plan: 'trial',
          authorizations: [],
          stripeCustomer: '',
        };

        const { project: createdProject } = await this.createOrg(org);

        project.uuid = createdProject.uuid;

        await this.setAsCurrentProject(createdProject);
      } else if (this.isCreatingProjectView) {
        const createdProject = await this.createProject(project);

        project.uuid = createdProject.uuid;

        await this.setAsCurrentProject(createdProject);
      }

      if (this.needToCreateAgent) {
        await this.createAgent(project, this.$store.state.Brain);
      }

      this.$refs.modalCreatingProject.onCloseClick();

      if (this.isNewUserView) {
        window.dispatchEvent(new CustomEvent('openModalAddedFirstInfos'));
        this.$store.commit('UPDATE_PROFILE_INITIAL_INFO_SUCCESS', 'now');
      }

      this.$router.push({
        name: 'home',
        params: {
          projectUuid: project.uuid,
        },
      });
    },

    async createOrg(org) {
      const { data } = await orgs.createOrg(org);

      this.$store.commit('ORG_CREATE_SUCCESS', data.organization);
      this.$store.state.Org.orgs.data.push(data.organization);

      this.$root.$emit('set-sidebar-expanded');

      return data;
    },

    async createProject(project) {
      const { data } = await projects.createReadyMadeProject(project);

      this.$root.$emit('set-sidebar-expanded');

      return data;
    },

    async setAsCurrentProject(project) {
      this.$store.commit(
        'PROJECT_CREATE_SUCCESS',
        await this.orgWithFlowOrgUuid(project),
      );
    },

    async orgWithFlowOrgUuid(project) {
      let flowOrganization = project.flow_organization;

      if (!flowOrganization) {
        flowOrganization = await fetchFlowOrganization(project.uuid);
      }

      return {
        ...project,
        flow_organization: flowOrganization,
      };
    },

    async updateUserInformation() {
      const actions = [];

      actions.push(
        this.updateProfile({
          first_name: this.userFirstName,
          last_name: this.userLastName,
        }),
      );

      actions.push(account.addInitialData(this.formInitialInformation));

      await Promise.all(actions);
    },

    async createAgent(project, { name, goal, content }) {
      this.updateCheckStatus('agent', 'loading');

      await Promise.all([
        brainAPI.edit({ projectUuid: project.uuid, brainOn: true }),
        brainAPI.customization
          .edit({ projectUuid: project.uuid, name, goal })
          .catch(() => {
            console.log('error');
          }),
      ]);

      this.updateCheckStatus('agent', 'checked');

      const contents = [];

      const { data: contentBase } = await brainAPI.contentBase.get({
        projectUuid: project.uuid,
      });

      if (this.needToAddAgentContent.text) {
        const addText = async (text) => {
          await brainAPI.content.texts.create({
            contentBaseUuid: contentBase.uuid,
            text,
          });
        };

        this.updateCheckStatus('text', 'loading');

        contents.push(
          addText(content.text).then(() => {
            this.updateCheckStatus('text', 'checked');
          }),
        );
      }

      if (this.needToAddAgentContent.sites) {
        const addSite = async (link) => {
          await brainAPI.content.sites.create({
            contentBaseUuid: contentBase.uuid,
            link,
          });
        };

        const sites = [];

        content.sites.forEach((link) => {
          sites.push(addSite(link));
        });

        this.updateCheckStatus('sites', 'loading');

        contents.push(
          Promise.all(sites).then(() => {
            this.updateCheckStatus('sites', 'checked');
          }),
        );
      }

      if (this.needToAddAgentContent.files) {
        const addFile = async (file) => {
          await brainAPI.content.files.create({
            contentBaseUuid: contentBase.uuid,
            file,
          });
        };

        const files = [];

        content.files.forEach((file) => {
          files.push(addFile(file));
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
  },

  computed: {
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
        return ['organization', 'project', 'templates'];
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

        organization: !this.organizationFormIsValid,

        project: !this.projectFormIsValid,
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
