<template>
    <div class="unnnic-grid-lg">
        <div class="weni-orgs__left unnnic-grid-span-3">
            <unnnic-icon class="weni-orgs__left__icon" icon="building-2-1" size="xl" scheme="aux-blue" has-background />
            <h1> {{ $t('orgs.orgs') }} </h1>
            <p> {{ $t('orgs.orgs_description') }} </p>
            <unnnic-button type="secondary" icon-left="add-1"> {{ $t('orgs.add_org') }} </unnnic-button>
        </div>
        <div class="unnnic-grid-span-3"/>
        <div class="unnnic-grid-span-5 weni-orgs__right">
            <div class="weni-orgs__list">
                <org-list-item v-for="index in 25" :key="index" />
            </div>
        </div>
    </div>
</template>

<script>
import OrgListItem from '../../components/orgs/orgListItem.vue';
export default {
    name: 'Orgs',
    components: { OrgListItem },
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';

    .weni-orgs {
        &__right {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;

            &::-webkit-scrollbar {
                display:none;
            }
        }

        &__list {
            // align-items: flex-start;
            overflow-y: scroll;
            // overflow: hidden;
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;
            max-height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;

            > * {
                margin-bottom: $unnnic-spacing-stack-xs;
            }
        }

        &__left {
            font-family: $unnnic-font-family-primary;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            height: 100%;

            &__icon {
                margin: 0 0 $unnnic-spacing-stack-md 0;
            }

            h1 {
                font-size: $unnnic-font-size-title-lg;
                font-weight: $unnnic-font-weight-regular;
                margin: 0 0 $unnnic-spacing-stack-xs 0;
            }

            p {
                font-size: $unnnic-font-size-body-lg;
                margin: 0 0 $unnnic-spacing-stack-md 0;
            }
        }
    }
</style>