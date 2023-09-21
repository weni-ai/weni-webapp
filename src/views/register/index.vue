<template>
  <div>
    <div class="global-container">
      <div class="global-container__leftside">
        <div class="global-container__leftside__background"></div>

        <img class="robot" src="../../assets/IA.svg" alt="robot" />

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
          <navigator class="navigator" :active-page="page" :pages="pages" />
        </div>

        <form @submit.prevent="nextPage">
          <template v-if="page === 'personal'">
            <div class="form-container">
              <div class="title">{{ $t('profile.about_you.title') }}</div>

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
                :team.sync="projectTeam"
                :purpose.sync="projectPurpose"
              />
            </div>
          </template>

          <template v-if="page === 'templates'">
            <div class="form-container">
              <div class="title">
                {{ $t('template_gallery.about.title') }}
              </div>

              <template-gallery />
            </div>
          </template>

          <template v-if="page === 'plans'">
            <div class="form-container">
              <div class="title">Conheça nossos planos</div>

              <div class="description plans">
                Para concluir a criação da sua conta, escolha o plano que melhor
                se encaixa com sua necessidade
              </div>
            </div>

            <plans class="plans-container" />
          </template>

          <div class="form-container">
            <div class="buttons">
              <unnnic-button
                type="primary"
                size="large"
                icon-right="keyboard-arrow-right-1"
              >
                {{ $t('next') }}
              </unnnic-button>

              <unnnic-button
                v-if="pages.indexOf(page) !== 0"
                @click.prevent="previousPage"
                type="ghost"
                size="large"
              >
                {{ $t('back') }}
              </unnnic-button>
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
      :text="$t('register.modals.creating_project.title')"
      :description="$t('register.modals.creating_project.description')"
      persistent
    >
      <img slot="icon" src="../../assets/IMG-9991.png" />

      <div class="separator"></div>

      <div class="checks">
        <div v-for="check in checks" :key="check.title" class="check">
          <unnnic-icon
            icon="check-circle-1-1-1"
            size="sm"
            :scheme="check.checked ? 'aux-green-500' : 'neutral-cleanest'"
          />

          <div>
            {{ $t(`register.modals.creating_project.checks.${check.title}`)
            }}<ellipsis v-if="check.loading" /><span
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
import Logo from '../../components/Logo.vue';
import Navigator from './Navigator.vue';
import Personal from './forms/Personal.vue';
import Company from './forms/Company.vue';
import Project from './forms/Project.vue';
import TemplateGallery from './forms/TemplateGallery.vue';
import Ellipsis from '../../components/EllipsisAnimation.vue';
import Plans from './forms/Plans.vue';

export default {
  components: {
    Logo,
    Navigator,
    Personal,
    Company,
    Project,
    TemplateGallery,
    Ellipsis,
    Plans,
  },

  data() {
    return {
      isModalCreatingProjectOpen: false,

      pages: ['personal', 'company', 'templates', 'plans'],
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
      projectTeam: '',
      projectPurpose: '',

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
    filter,

    nextPage() {
      const pageIndex = this.pages.indexOf(this.page);

      if (pageIndex + 1 !== this.pages.length) {
        this.page = this.pages[pageIndex + 1];
      } else {
        this.isModalCreatingProjectOpen = true;

        this.checks.forEach((check) => {
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

    fakeLoading() {
      const loadNext = () => {
        const check = this.checks.find((check) => !check.checked);

        if (check) {
          check.loading = true;

          setTimeout(() => {
            check.loading = false;
            check.checked = true;

            loadNext();
          }, 2000 + Math.random() * 2000);
        } else {
          this.$refs.modalCreatingProject.onCloseClick();
        }
      };

      loadNext();
    },
  },

  computed: {
    language() {
      return this.$i18n.locale;
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
  min-height: -moz-available;
  min-height: -webkit-fill-available;
  min-height: fill-available;

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
