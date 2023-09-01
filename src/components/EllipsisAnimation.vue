<template>
  <div>
    <div class="first">.</div>
    <div class="second">.</div>
    <div class="third">.</div>
  </div>
</template>

<style lang="scss" scoped>
* {
  display: inline-block;
}

.first,
.second,
.third {
  animation-name: example;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

.second {
  animation-delay: 0.2s;
}

.third {
  animation-delay: 0.4s;
}

@keyframes example {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-0.15em);
  }
  50% {
    transform: translateY(0);
  }
}
</style>
