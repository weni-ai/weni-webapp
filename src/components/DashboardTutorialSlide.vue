<template>
  <div class="dashboard-tutorial-slide">
    <div class="slide" ref="slide">
      <div
        :style="{ width: `${100 * pages}%` }"
        class="pages"
        ref="pages"
        @mouseenter.self="cancelAutoSkip"
        @mouseleave.self="startAutoSkip"
      >
        <div class="page">
          <router-link
            :to="{
              name: 'push',
              params: {
                projectUuid: currentProject.uuid,
                internal: ['flow', 'editor', currentProject.flow_uuid],
              },
            }"
          >
            <img src="@/assets/tutorial/26cc1e0dfa69ae05d7702e0c8fac4124.gif" />
          </router-link>

          <div class="title">
            {{ $t('home.started.know_the_project.title') }}
          </div>

          <div class="description">
            {{ $t('home.started.know_the_project.description') }}

            <a :href="urls.waDemoIntegration" target="_blank">
              {{ $t('know_more') }}
            </a>
          </div>
        </div>

        <div class="page">
          <a :href="currentProject.redirect_url" target="_blank">
            <img src="@/assets/tutorial/0751c8d5aa810887af7a259847a9ef76.gif" />
          </a>

          <div class="title">
            {{ $t('home.started.whatsapp.title') }}
          </div>

          <div class="whatsapp">
            <qr-code
              class="qr-code-whatsapp-link"
              :text="currentProject.redirect_url"
            ></qr-code>

            <div class="input">
              {{ currentProject.redirect_url }}

              <unnnic-button-icon
                type="secondary"
                size="small"
                icon="export-1"
                @click="open(currentProject.redirect_url)"
              />
            </div>
          </div>
        </div>

        <div class="page">
          <router-link
            :to="{
              name: 'push',
              params: {
                projectUuid: currentProject.uuid,
                internal: ['flow', 'editor', currentProject.flow_uuid],
              },
            }"
          >
            <img src="@/assets/tutorial/ce4a1085efff76433c5a0942e2f2d813.gif" />
          </router-link>

          <div class="title">
            {{ $t('home.started.flows.title') }}
          </div>

          <div class="description">
            {{ $t('home.started.flows.description') }}

            <a :href="urls.flows" target="_blank">{{ $t('know_more') }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="controlers">
      <unnnic-icon
        icon="arrow-left-1-1"
        size="sm"
        scheme="neutral-clean"
        clickable
        @click="
          resetAutoSkip();
          previous();
        "
      />

      <div class="pages">
        <div
          v-for="page in pages"
          :key="page"
          :class="['page', { active: currentPage === page - 1 }]"
          @click="
            resetAutoSkip();
            goToSpecificPage(page - 1);
          "
        ></div>
      </div>

      <unnnic-icon
        icon="arrow-right-1-1"
        size="sm"
        scheme="neutral-clean"
        clickable
        @click="
          resetAutoSkip();
          next();
        "
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { get } from 'lodash';

export default {
  data() {
    return {
      pages: 3,
      currentPage: 0,
      autoSkip: null,
    };
  },

  computed: {
    ...mapGetters(['currentProject']),

    urls() {
      const urls = {
        waDemoIntegration: {
          en: 'https://docs.weni.ai/l/en/weni-integrations/how-to-create-a-channel-with-whats-app-demo',
          'pt-br':
            'https://docs.weni.ai/l/pt/m-dulo-integra-es/como-criar-um-canal-no-whats-app-demo',
        },
        flows: {
          en: 'https://docs.weni.ai/l/en/flows-category',
          'pt-br': 'https://docs.weni.ai/l/pt/fluxos',
        },
      };

      return {
        waDemoIntegration: get(
          urls,
          `waDemoIntegration.${this.$i18n.locale}`,
          urls.waDemoIntegration.en,
        ),
        flows: get(urls, `flows.${this.$i18n.locale}`, urls.flows.en),
      };
    },
  },

  mounted() {
    this.startAutoSkip();
  },

  methods: {
    open(src) {
      window.open(src);
    },

    scroll(index) {
      this.$refs.slide.scroll({
        top: 0,
        left: (this.$refs.slide.scrollWidth / this.pages) * index,
        behavior: 'smooth',
      });
    },

    next() {
      this.currentPage = (this.currentPage + 1) % this.pages;

      this.scroll(this.currentPage);
    },

    previous() {
      this.currentPage = this.currentPage - 1;

      if (this.currentPage < 0) {
        this.currentPage = this.pages - 1;
      }

      this.scroll(this.currentPage);
    },

    goToSpecificPage(page) {
      this.currentPage = page;

      this.scroll(this.currentPage);
    },

    cancelAutoSkip() {
      clearInterval(this.autoSkip);
    },

    startAutoSkip() {
      this.autoSkip = setInterval(this.next, 7000);
    },

    resetAutoSkip() {
      this.cancelAutoSkip();
      this.startAutoSkip();
    },
  },

  beforeDestroy() {
    this.cancelAutoSkip();
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.dashboard-tutorial-slide {
  .slide {
    width: 100%;
    overflow: hidden;

    .pages {
      display: flex;

      .page {
        flex: 1;

        img {
          width: 100%;
          border-radius: $unnnic-border-radius-sm;
          margin-bottom: $unnnic-spacing-stack-sm;
          aspect-ratio: 660 / 281;
          object-fit: cover;
        }

        .title {
          font-family: $unnnic-font-family-secondary;
          color: $unnnic-color-neutral-dark;
          font-weight: $unnnic-font-weight-bold;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          margin-bottom: $unnnic-spacing-stack-xs;
        }

        .description {
          font-family: $unnnic-font-family-secondary;
          color: $unnnic-color-neutral-dark;
          font-weight: $unnnic-font-weight-regular;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

          a {
            font-family: $unnnic-font-family-secondary;
            color: $unnnic-color-neutral-darkest;
            font-weight: $unnnic-font-weight-regular;
            font-size: $unnnic-font-size-body-gt;
            line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
            text-decoration: underline;
          }
        }

        .whatsapp {
          display: flex;
          align-items: center;
          column-gap: $unnnic-spacing-inline-xs;

          .qr-code-whatsapp-link {
            width: 75px;

            ::v-deep img {
              width: 75px;
              border: 3px solid #ffffff;
              box-sizing: border-box;
            }
          }

          .input {
            flex: 1;
            display: flex;
            align-items: center;
            column-gap: $unnnic-spacing-inline-xs;
            justify-content: space-between;
            padding: $unnnic-squish-xs;
            border-radius: $unnnic-border-radius-sm;
            outline-style: solid;
            outline-color: $unnnic-color-neutral-soft;
            outline-width: $unnnic-border-width-thinner;
            outline-offset: -$unnnic-border-width-thinner;
            font-family: $unnnic-font-family-secondary;
            color: $unnnic-color-neutral-cloudy;
            font-weight: $unnnic-font-weight-regular;
            font-size: $unnnic-font-size-body-gt;
            line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
          }
        }
      }
    }
  }

  .controlers {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $unnnic-spacing-stack-sm;

    .pages {
      margin: 0 $unnnic-spacing-inline-sm;
      display: flex;
      column-gap: $unnnic-spacing-inline-xs;

      .page {
        cursor: pointer;
        width: 0.25rem;
        height: 0.25rem;
        border-radius: 0.25rem;
        background-color: rgba(
          $unnnic-color-neutral-clean,
          $unnnic-opacity-level-overlay
        );
        transition: all 0.5s;

        &.active {
          width: 1rem;
          background-color: $unnnic-color-neutral-clean;
        }
      }
    }
  }
}
</style>
