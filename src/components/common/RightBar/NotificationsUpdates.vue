<template>
  <section
    v-if="platformNews.status === 'loading'"
    class="updates"
  >
    <UnnnicSkeletonLoading
      tag="h3"
      width="80%"
      height="24px"
    />

    <UnnnicSkeletonLoading
      tag="h4"
      width="60%"
      height="22px"
    />

    <UnnnicSkeletonLoading
      tag="p"
      height="44px"
    />

    <UnnnicSkeletonLoading
      tag="p"
      height="44px"
    />

    <UnnnicSkeletonLoading
      tag="p"
      height="44px"
    />
  </section>

  <section v-else>
    <header class="banner">
      <img
        class="banner__image"
        src="@/assets/amazoninha-making-a-korean-heart-symbol-with-her-hand.png"
        alt="Amazoninha making a Korean heart symbol with her hand"
      />

      <section class="banner__content">
        <h3>{{ $t('platform_updates.title') }}</h3>

        <p>{{ month }}</p>
      </section>
    </header>

    <span
      class="updates"
      v-html="readMarkdown(content)"
    ></span>
  </section>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeMount } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import AppleEmoji from '../../../utils/plugins/AppleEmoji';
import i18n from '../../../utils/plugins/i18n';
import moment from 'moment';

moment.updateLocale('en', {
  longDateFormat: {
    L: 'MMMM YYYY',
  },
});

moment.updateLocale('pt-br', {
  longDateFormat: {
    L: 'MMMM [de] YYYY',
  },
});

moment.updateLocale('es', {
  longDateFormat: {
    L: 'MMMM [de] YYYY',
  },
});

const instance = getCurrentInstance();

function use(name) {
  return computed(() => {
    const { proxy } = instance;
    const item = proxy[`$${name}`];
    return item;
  });
}

const store = use('store');

const platformNews = computed(() => {
  return store.value.state.News.platformNews;
});

const renderer = new marked.Renderer();

renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" title="${title || ''}" target="_blank">${text}</a>`;
};

const options = {
  renderer: renderer,
};

onBeforeMount(() => {
  if (platformNews.value.mostRecentMonth) {
    const mostRecentMonth = platformNews.value.mostRecentMonth;

    store.value.state.News.lastViewedNews = mostRecentMonth;
    localStorage.setItem('lastViewedNews', mostRecentMonth);
  }
});

const month = computed(() => {
  const month = moment(platformNews.value.mostRecentMonth)
    .locale(i18n.locale)
    .format('L');

  return month.slice(0, 1).toUpperCase() + month.slice(1);
});

const content = computed(() => {
  const reg = (country) => new RegExp(`(^|\n) *# +:${country}: *\n`, 'i');

  const languages = {
    'pt-br': reg('brazil'),
    en: reg('us'),
    es: reg('es'),
  };

  const cont = platformNews.value.data
    .split(languages[i18n.locale])
    .at(-1)
    .split(reg('[a-z]+'))
    .at(0);

  return cont;
});

DOMPurify.sanitize(marked.parse(''));

function readMarkdown(content) {
  return marked(
    AppleEmoji.replace(
      DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [],
      }),
    ),
    options,
  );
}
</script>

<style lang="scss" scoped>
.banner {
  margin-block: $unnnic-spacing-md;
  background-color: $unnnic-color-weni-100;
  border: $unnnic-border-width-thinner solid $unnnic-color-weni-300;
  border-radius: $unnnic-border-radius-lg;
  box-sizing: border-box;
  display: flex;
  column-gap: $unnnic-spacing-sm;
  justify-content: center;

  &__image {
    margin-top: -$unnnic-spacing-sm;
  }

  &__content {
    padding-block: $unnnic-spacing-sm - $unnnic-border-width-thinner;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 11.875 * $unnnic-font-size;

    h3,
    p {
      margin: 0;
    }

    h3 {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }

    p {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-md;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }
}

.updates {
  color: $unnnic-color-neutral-dark;
  font-family: $unnnic-font-family-secondary;
  font-weight: $unnnic-font-weight-regular;
  font-size: $unnnic-font-size-body-gt;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

  :deep(h3) {
    margin-block: $unnnic-spacing-md $unnnic-spacing-sm;

    color: $unnnic-color-neutral-darkest;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
  }

  :deep(h4) {
    margin-block: $unnnic-spacing-ant $unnnic-spacing-nano;

    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  :deep(p) {
    margin-block: 0;

    + p {
      margin-block-start: $unnnic-spacing-xs;
    }
  }

  :deep(a) {
    text-decoration: none;
    color: $unnnic-color-weni-600;
    font-weight: $unnnic-font-weight-bold;

    &:hover {
      color: $unnnic-color-weni-700;
    }
  }
}
</style>
