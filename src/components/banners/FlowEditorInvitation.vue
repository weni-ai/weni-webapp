<template>
  <div class="floweditor-invitation">
    <header>
      <div class="u font body-lg bold color-neutral-snow">
        {{ $t('banners.floweditor_invitation.title') }}
      </div>
    </header>

    <main class="u font secondary body-md color-neutral-snow">
      {{ $t('banners.floweditor_invitation.description') }}

      <a
        href="https://comunidade.weni.ai/t/800"
        target="_blank"
      >
        {{ $t('banners.floweditor_invitation.know_more') }}</a
      >.
    </main>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.floweditor-invitation {
  border-radius: $unnnic-border-radius-md;
  box-sizing: border-box;
  background-color: $unnnic-color-background-snow;
  background-image: url('../../assets/banner/floweditor-invitation-banner-background.svg');
  background-position: right center;
  background-size: cover;
  height: 100%;
  align-items: start;
  justify-content: center;
  padding: $unnnic-spacing-stack-sm;
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
