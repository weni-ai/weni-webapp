<template>
  <div class="chats-invitation">
    <header>
      <unnnic-icon
        icon="alert-circle-1"
        size="avatar-nano"
        scheme="feedback-yellow"
      ></unnnic-icon>

      <div class="u font body-lg bold color-neutral-darkest">
        {{ $t('banners.chats_invitation.title') }}
      </div>
    </header>

    <main class="u font secondary body-md color-neutral-dark">
      <strong>{{ $t('attention') }}: </strong>

      {{ $t('banners.chats_invitation.description') }}

      <a
        href="https://api.whatsapp.com/message/2FHDI7OC6FS7P1?autoload=1&app_absent=0"
        target="_blank"
      >
        {{ $t('talk_to_our_team') }}</a
      >.
    </main>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.chats-invitation {
  border-radius: $unnnic-border-radius-md;
  box-sizing: border-box;
  background-color: $unnnic-color-background-snow;
  background-image: url('../../assets/banner/chats-invitation-banner-background.svg');
  background-position: right center;
  background-size: cover;
  height: 100%;
  align-items: start;
  justify-content: center;
  padding: $unnnic-squish-nano;
  padding-right: $unnnic-spacing-inline-xl + $unnnic-spacing-inline-md;
  display: flex;
  flex-direction: column;
  row-gap: $unnnic-spacing-stack-nano;

  header {
    display: flex;
    column-gap: $unnnic-spacing-inline-xs;
    align-items: center;
  }

  main {
    strong {
      font-weight: $unnnic-font-weight-bold;
    }

    a {
      font-weight: $unnnic-font-weight-bold;
      text-decoration: underline;
      text-underline-offset: $unnnic-spacing-stack-nano;
      color: inherit;
    }
  }
}
</style>
