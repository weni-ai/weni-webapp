<template>
  <section
    v-show="systems.includes($route.name)"
    class="container"
  >
    <img
      v-if="loading"
      class="logo"
      src="../assets/LogoWeniAnimada4.svg"
    />

    <iframe
      ref="iframe"
      @load="load"
      v-show="!loading"
      class="container container--full-height"
      allow="clipboard-read; clipboard-write;"
      frameborder="0"
    ></iframe>
  </section>
</template>

<script>
import { debounce } from 'lodash';
import { mapGetters } from 'vuex';
import getEnv from '../utils/env';

export default {
  data() {
    return {
      firstAccess: true,
      loading: false,

      urls: getEnv('MODULES_YAML'),

      src: '',

      lastSystem: null,

      paths: {
        bothub: 'init',
        brain: 'init',
      },

      baseSrc: '',

      systems: ['bothub', 'brain'],
    };
  },

  mounted() {
    this.pathChanged();

    window.addEventListener('message', (event) => {
      if (!this.src) {
        return;
      }

      if (event.origin !== new URL(this.src).origin) {
        return;
      }

      if (event.data?.event === 'changePathname') {
        this.lastSystem = this.whatSystem(event.data.pathname);
        this.paths[this.lastSystem] = event.data.pathname
          .split('/')
          .slice(1)
          .filter((item) => item);

        const paramsInternal =
          this.$route.params.internal.join?.('/') ||
          this.$route.params.internal;

        if (paramsInternal !== this.paths[this.lastSystem].join('/')) {
          this.$router.replace({
            name: this.lastSystem,
            params: {
              internal: this.paths[this.lastSystem],
            },
          });
        }
      }
    });
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    params() {
      const internal =
        typeof this.$route.params.internal === 'string'
          ? this.$route.params.internal.split('/').filter((v) => v)
          : this.$route.params.internal;

      let next = '';

      if (internal[0] === 'init') {
        if (this.$route.name === 'brain') {
          next = 'router';
        }

        if (this.paths[this.$route.name] !== 'init') {
          next = this.paths[this.$route.name].join('/');
        }
      } else {
        next = internal.join('/');
      }

      return {
        org_uuid: this.currentOrg.uuid,
        project_uuid: this.currentProject.uuid,
        next,
      };
    },
  },

  methods: {
    whatSystem(pathname) {
      return pathname.startsWith('/router/') || pathname === '/router'
        ? 'brain'
        : 'bothub';
    },

    load(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    setSrc(src, params) {
      this.loading = true;

      this.src = `${src}?${new URLSearchParams(params).toString()}`;

      this.$refs.iframe.src = this.src;
    },

    reload() {
      this.setSrc(this.baseSrc, this.params);
    },

    loadIframe() {
      const accessToken = this.$keycloak.token;

      try {
        const { inteligence_organization } = this.currentOrg;
        const { uuid } = this.currentProject;

        const apiUrl = this.urls.intelligence;
        if (!apiUrl) return null;

        const { owner, slug } = this.$route.params;

        if (owner && slug) {
          this.setSrc(`${apiUrl}dashboard/${owner}/${slug}/`);
        } else {
          const token = `Bearer+${accessToken}`;

          this.baseSrc = `${apiUrl}loginexternal/${token}/${inteligence_organization}/${uuid}/`;

          this.reload();
        }
      } catch (e) {
        return e;
      }
    },

    pathChanged() {
      if (
        this.systems.includes(this.$route.name) &&
        (this.firstAccess || this.lastSystem !== this.$route.name)
      ) {
        this.firstAccess = false;
        this.$nextTick(this.loadIframe);
      }
    },
  },

  watch: {
    '$route.fullPath': {
      handler() {
        this.pathChanged();
      },
    },

    '$route.params.projectUuid'() {
      if (!this.firstAccess) {
        this.reload();
      }
    },

    '$i18n.locale': debounce(function () {
      if (!this.firstAccess) {
        this.reload();
      }
    }, 5000),
  },
};
</script>

<style lang="scss" scoped>
@import '~@weni/unnnic-system/src/assets/scss/unnnic.scss';

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  height: auto;

  &--full-height {
    height: 100%;
  }

  .logo {
    max-width: 4 * $unnnic-font-size;
    max-height: 4 * $unnnic-font-size;
  }
}
</style>
