<template>
  <section class="champion">
    <header class="champion__header">
      <h3>{{ $t('champion_chatbot.title') }}</h3>

      <UnnnicSkeletonLoading
        v-if="championChatbot.status === 'loading'"
        class="champion__header__progress"
        width="150px"
        height="20px"
      />

      <section
        v-else
        class="champion__header__progress"
      >
        <section class="champion__header__progress__bar">
          <section
            class="champion__header__progress__bar__filled"
            :style="{
              width: `${(completedLength / totalLength) * 100}%`,
            }"
          />
        </section>

        {{ completedLength }}/{{ totalLength }}
      </section>
    </header>

    <section class="steps">
      <section
        v-for="(step, index) in steps"
        :key="index"
        class="step"
        :class="{ 'step--completed': isCompleted(step.linkedTo) }"
      >
        <header
          class="step__header"
          @click="step.isOpen = !step.isOpen"
        >
          <span class="step__header__title">
            {{ step.title }}
          </span>

          <UnnnicIcon
            icon="keyboard_arrow_down"
            scheme="inherit"
            class="step__header__right-icon"
            :class="{
              'step__header__right-icon--rotate-180deg': step.isOpen,
            }"
          />
        </header>

        <Transition
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
          @enter="enter"
          @before-leave="beforeLeave"
          @leave="leave"
        >
          <section
            v-show="step.isOpen"
            class="step__content"
          >
            <template
              v-for="(element, index) in getElementsFromContent(step.content)"
            >
              <p
                v-if="element.type === 'text'"
                :key="`text-${index}`"
              >
                {{ element.content }}
              </p>

              <a
                v-else-if="element.type === 'youtube'"
                :key="`youtube-${index}`"
                :href="`https://www.youtube.com/watch?v=${element.videoId}`"
                target="_blank"
              >
                <YoutubePreview :videoId="element.videoId" />
              </a>

              <a
                v-else-if="element.type === 'button-link'"
                :key="`link-${index}`"
                :href="element.link"
                target="_blank"
              >
                <UnnnicButton
                  class="step__content__button-link"
                  type="secondary"
                  size="small"
                >
                  {{ element.text }}
                </UnnnicButton>
              </a>
            </template>
          </section>
        </Transition>
      </section>
    </section>
  </section>
</template>

<script>
export default { name: 'LearningCenterChampionChatbot' };
</script>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue';
import i18n from '../../../utils/plugins/i18n';
import YoutubePreview from './LearningCenterChampionChatbotYoutubePreview.vue';

const instance = getCurrentInstance();

function use(name) {
  return computed(() => {
    const { proxy } = instance;
    const item = proxy[`$${name}`];
    return item;
  });
}

const store = use('store');
const route = use('route');

const steps = ref([
  {
    linkedTo: 'createdFlow',
    title: i18n.global.t('champion_chatbot.create_a_flow.title'),
    isOpen: false,
    content:
      '#text Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco\n#youtube TkXOJGjTHvE\n#button-link https://unnnic.dev.cloud.weni.ai/?path=/story/tabs-tabsexpanded--default Ler documentação',
  },
  {
    linkedTo: 'addedTestChannel',
    title: i18n.global.t('champion_chatbot.add_test_channel.title'),
    isOpen: false,
    content: '',
  },
  {
    linkedTo: 'addedChannelToTheProject',
    title: i18n.global.t('champion_chatbot.add_channel_to_the_project.title'),
    isOpen: false,
    content: '',
  },
  {
    linkedTo: 'createdOrIntegratedAI',
    title: i18n.global.t('champion_chatbot.create_or_integrate_ai.title'),
    isOpen: false,
    content: '',
  },
  {
    linkedTo: 'addedToOwnChannel',
    title: i18n.global.t('champion_chatbot.add_to_own_channel.title'),
    isOpen: false,
    content: '',
  },
]);

function getElementsFromContent(content) {
  const lines = content.split('\n');

  const elements = [];

  lines.forEach((line) => {
    if (line.startsWith('#text ')) {
      elements.push({ type: 'text', content: line.slice('#text '.length) });
    } else if (line.startsWith('#youtube ')) {
      elements.push({
        type: 'youtube',
        videoId: line.slice('#youtube '.length),
      });
    } else if (line.startsWith('#button-link ')) {
      const args = line.slice('#button-link '.length);

      const firstSpaceIndex = args.indexOf(' ');
      const link = args.slice(0, firstSpaceIndex).trim();
      const text = args.slice(firstSpaceIndex).trim();

      elements.push({
        type: 'button-link',
        text,
        link,
      });
    }
  });

  return elements;
}

const projectSelected = computed(() => {
  return route.value.params?.projectUuid;
});

const championChatbot = computed(() => {
  if (!projectSelected.value) {
    return {
      status: null,
      data: {},
    };
  }

  const allProjects = store.value.state.Project.projects
    .map(({ data }) => data)
    .flat();

  const project =
    allProjects.find(({ uuid }) => uuid === projectSelected.value) ||
    store.value.getters.currentProject;

  return store.value.state.Project.championChatbots2[project.uuid];
});

const completedLength = computed(
  () =>
    Object.values(championChatbot.value.data).filter((value) => value).length,
);

const totalLength = computed(
  () => Object.keys(championChatbot.value.data).length,
);

function isCompleted(link) {
  return championChatbot.value.data[link];
}

function beforeEnter(el) {
  el.style.height = '0px';
}

function enter(el, done) {
  el.style.overflow = 'hidden';
  el.style.transition = 'height 200ms';
  el.style.height = `${el.scrollHeight}px`;

  el.addEventListener('transitionend', done, { once: true });
}

function afterEnter(el) {
  el.style.height = null;
}

function beforeLeave(el) {
  el.style.height = `${el.scrollHeight}px`;
  el.scrollHeight;
}

function leave(el, done) {
  el.style.overflow = 'hidden';
  el.style.transition = 'height 200ms';
  el.style.height = '0px';

  el.addEventListener('transitionend', done, { once: true });
}
</script>

<style lang="scss" scoped>
.steps {
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-sm;

  .step {
    &__header {
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-xs;

      color: $unnnic-color-neutral-dark;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

      &__right-icon {
        $icon-size: 1.375 * $unnnic-font-size;

        margin-left: auto;

        font-size: $icon-size;
        transition: transform 200ms;

        &--rotate-180deg {
          transform: rotate(180deg);
        }
      }
    }

    &__content {
      display: flex;
      flex-direction: column;

      p {
        margin: 0;
      }

      > * {
        margin-top: $unnnic-spacing-xs;
      }

      p {
        margin: 0;
        margin-top: $unnnic-spacing-xs;
        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      }

      &__button-link {
        width: 100%;
      }
    }

    &--completed {
      .step__header {
        color: $unnnic-color-neutral-clean;

        &__title {
          text-decoration: line-through;
        }
      }
    }
  }
}

.champion {
  &__header {
    display: flex;
    column-gap: $unnnic-spacing-sm;
    margin-bottom: $unnnic-spacing-sm;

    h3 {
      margin: 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }

    &__progress {
      display: flex;
      align-items: center;
      column-gap: $unnnic-spacing-xs;
      margin-left: auto;

      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

      &__bar {
        $bar-width: 7.75 * $unnnic-font-size;
        $bar-height: 0.25 * $unnnic-font-size;

        width: $bar-width;
        height: $bar-height;
        border-radius: $unnnic-border-radius-sm;
        background-color: $unnnic-color-weni-100;

        &__filled {
          height: $bar-height;
          border-radius: $unnnic-border-radius-sm;
          background-color: $unnnic-color-weni-600;
        }
      }
    }
  }
}
</style>
