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
      v-show="!loading"
      ref="iframe"
      class="container container--full-height"
      allow="clipboard-read; clipboard-write;"
      frameborder="0"
      data-hj-allow-iframe
      @load="load"
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

      lastSystem: '',

      path: 'init',

      lastProjectUuidLoaded: '',

      baseSrc: '',

      systems: ['commerce'],

      moduleName: 'commerce',
    };
  },

  mounted() {
    this.pathChanged();

    window.addEventListener('message', (event) => {
      if (!this.src) {
        return;
      }

      const isThisModule = event.data?.moduleName === this.moduleName;

      if (!isThisModule) {
        return;
      }

      if (event.data?.event === 'changePathname') {
        this.lastSystem = 'commerce';
        this.path = event.data.pathname
          .split('/')
          .slice(1)
          .filter((item) => item);

        const paramsInternal =
          this.$route.params.internal.join?.('/') ||
          this.$route.params.internal;

        if (paramsInternal !== this.path.join('/')) {
          this.$router.replace({
            name: this.lastSystem,
            params: {
              internal: this.path,
            },
          });
        }
      }
    });
  },

  computed: {
    ...mapGetters(['currentOrg', 'currentProject']),

    paramInternalArray() {
      return typeof this.$route.params.internal === 'string'
        ? this.$route.params.internal.split('/').filter((v) => v)
        : this.$route.params.internal;
    },

    params() {
      const internal = this.paramInternalArray;

      let next = '';

      if (internal[0] === 'init') {
        if (this.path !== 'init') {
          next = this.path.join('/');
        }
      } else {
        next = internal.join('/');
      }

      return {
        org_uuid: this.currentOrg.uuid,
        project_uuid: this.currentProject.uuid,
        locale: this.$i18n.locale,
        next,
      };
    },
  },

  methods: {
    load(event) {
      if (event.srcElement.src === this.src) {
        this.loading = false;
      }
    },

    setSrc(src, params) {
      this.loading = true;

      this.src = `${src}?${new URLSearchParams(params).toString()}`;

      this.lastProjectUuidLoaded = this.params.project_uuid;

      this.$refs.iframe.src = this.src;
    },

    reload() {
      this.setSrc(this.baseSrc, this.params);
    },

    loadIframe() {
      const accessToken = this.$keycloak.token;

      try {
        const apiUrl = this.urls.commerce;

        if (!apiUrl) return null;

        const token = `Bearer+${accessToken}`;

        this.baseSrc = `${apiUrl}loginexternal/${token}/`;

        this.reload();
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
      } else if (
        this.systems.includes(this.$route.name) &&
        this.lastSystem === this.$route.name &&
        this.paramInternalArray.join('/') !== this.path.join('/')
      ) {
        this.$router.replace({
          params: {
            internal: this.path,
          },
        });
      }
    },
  },

  watch: {
    paramInternalArray(internal) {
      if (
        internal?.[0] === 'init' &&
        this.lastProjectUuidLoaded !== this.params.project_uuid &&
        this.systems.includes(this.$route.name)
      ) {
        this.loadIframe();
        return;
      }
    },

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
