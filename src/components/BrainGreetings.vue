<template>
  <section class="brain-greetings">
    <header class="brain-greetings__header">
      <img src="../assets/IMG-9959-with-background.png" />

      <h1>{{ $t('home.brain_greetings.title') }}</h1>
      <p>{{ $t('home.brain_greetings.description') }}</p>

      <UnnnicButton
        size="small"
        class="button-go"
        @click="$router.push({ name: 'brain', params: { internal: ['init'] } })"
      >
        {{ $t('home.brain_greetings.take_me_there') }}
      </UnnnicButton>
    </header>

    <footer class="brain-greetings__footer">
      <section
        v-for="{ name, icon } in tabs"
        :key="name"
        class="brain-greetings__footer__tab"
      >
        <UnnnicAvatarIcon
          :icon="icon"
          scheme="weni-600"
          size="md"
          class="icon"
        />

        <h2>{{ $t(`home.brain_greetings.${name}`) }}</h2>
        <p>{{ $t(`home.brain_greetings.${name}_description`) }}</p>
      </section>
    </footer>
  </section>
</template>

<script>
export default {
  data() {
    return {
      tabs: [
        { name: 'personalization', icon: 'person' },
        { name: 'content', icon: 'article' },
        { name: 'actions', icon: 'bolt' },
        { name: 'tunings', icon: 'settings' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.brain-greetings {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $unnnic-spacing-lg;
  background-color: $unnnic-color-weni-50;
  border-radius: $unnnic-border-radius-sm;
  box-shadow: $unnnic-shadow-level-separated;

  &__header {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    img {
      width: 5 * $unnnic-font-size;
      margin-bottom: $unnnic-spacing-sm;
    }

    h1 {
      margin: 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

      margin-bottom: $unnnic-spacing-xs;
    }

    p {
      margin: 0;

      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-regular;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

      margin-bottom: $unnnic-spacing-sm;
    }

    .button-go {
      width: 11 * $unnnic-font-size;
    }
  }

  &__footer {
    display: grid;
    grid-gap: $unnnic-spacing-xs;
    grid-template-columns: repeat(auto-fit, minmax(6 * $unnnic-font-size, 1fr));

    border-top: $unnnic-border-width-thinner solid $unnnic-color-weni-200;
    margin-top: $unnnic-spacing-lg - $unnnic-border-width-thinner;
    padding-top: $unnnic-spacing-lg;

    &__tab {
      text-align: center;

      .icon {
        margin-bottom: $unnnic-spacing-ant;
      }

      h2 {
        margin: 0;

        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-bold;
        font-size: $unnnic-font-size-body-gt;
        line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;

        margin-bottom: $unnnic-spacing-nano;
      }

      p {
        margin: 0;

        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-weight: $unnnic-font-weight-regular;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
      }
    }
  }
}
</style>
