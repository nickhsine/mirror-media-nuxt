<template>
  <div class="service-rule">
    <div class="service-rule__title">服務條款</div>
    <div class="service-rule__description">
      歡迎加入鏡週刊會員！繼續使用前，請先詳閱鏡週刊服務條款。
    </div>
    <div class="service-rule__wrapper">
      <div v-for="paragraph in paragraphList" :key="paragraph.id">
        <UiStoryContentHandler :paragraph="filterHTML(paragraph)" />
      </div>
    </div>
    <div class="service-rule__agree">
      <label>
        <input v-model="isChecked" type="checkbox" :checked="isChecked" />
        <span>我同意以上條款</span>
      </label>
      <UiMembershipButtonPrimary
        :disabled="!isChecked"
        @click.native="handleSubmit"
        >繼續</UiMembershipButtonPrimary
      >
    </div>
  </div>
</template>

<script>
import errors from '@twreporter/errors'
import UiMembershipButtonPrimary from '~/components/UiMembershipButtonPrimary.vue'
import UiStoryContentHandler from '~/components/UiStoryContentHandler.vue'
import redirectDestination from '~/utils/redirect-destination'

export default {
  components: {
    UiMembershipButtonPrimary,
    UiStoryContentHandler,
  },
  async fetch() {
    try {
      const postResponse = await this.$fetchPostsFromMembershipGateway({
        slug: 'service-rule',
        isAudioSiteOnly: false,
        clean: 'content',
        related: 'article',
      })
      this.story = postResponse?.items?.[0] ?? {}

      const isTitleExist = this.story.title
      const isContentExist = (this.story?.content?.apiData ?? []).length > 0
      if (!isTitleExist || !isContentExist) {
        if (process.server) {
          this.$nuxt.context.res.statusCode = 404
        }
        throw new Error('not found')
      }
    } catch (e) {
      console.log(
        JSON.stringify({
          severity: 'ERROR',
          message: errors.helpers.printAll(e, {
            withStack: true,
            withPayload: true,
          }),
        })
      )
      this.$nuxt.error({ statusCode: 404 })
    }
  },
  data() {
    return {
      story: {},
      isChecked: false,
    }
  },
  computed: {
    paragraphList() {
      return this.story.content?.apiData
    },
  },
  async beforeMount() {
    await redirectDestination.set(this.$route, 'mm-service-rule-destination')
  },
  methods: {
    filterHTML(paragraph) {
      const content = paragraph.content[0]
      const newContent = []
      if (typeof content === 'string') {
        newContent.push(content.replace(/(<([^>]+)>)/gi, ''))
      } else {
        newContent.push(
          content.map((item) => item.replace(/(<([^>]+)>)/gi, ''))
        )
      }
      return { ...paragraph, content: newContent }
    },
    async handleSubmit(e) {
      e.preventDefault()
      try {
        await this.$setMemberServiceRuleStatusToTrue()
        localStorage.setItem('read-service-rule', 'true')
        redirectDestination.redirect('mm-service-rule-destination')
      } catch (error) {
        console.error(error)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.service-rule {
  max-width: 680px;
  margin: 24px auto;
  padding: 20px;

  &__title {
    font-size: 20px;
    line-height: 32px;
    color: rgba(0, 0, 0, 0.87);
  }

  &__description {
    font-size: 18px;
    line-height: 150%;
    color: rgba(0, 0, 0, 0.66);
    margin-top: 4px;
  }

  &__wrapper {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 21px 12px;
    height: calc(100vh - 500px);
    overflow-y: scroll;
    margin-top: 12px;
    font-size: 13px;
    line-height: 18px;
    color: rgba(0, 0, 0, 0.87);
    @include media-breakpoint-up(md) {
      padding: 40px 35px 40px 40px;
    }

    * + * {
      margin-top: 1.5rem;
    }

    h2 {
      margin-top: 0px;
    }

    ul {
      li {
        list-style-type: disc;
        margin-left: 20px;
        &::marker {
          font-size: 15px;
        }
      }
    }
  }

  &__agree {
    font-size: 18px;
    line-height: 25px;
    color: rgba(0, 0, 0, 0.87);
    margin-top: 32px;
    display: flex;
    align-items: center;
    flex-direction: column;

    label {
      display: flex;
      align-items: center;

      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    }
  }

  .button {
    width: 240px;
    margin-top: 24px;
  }
}
</style>
