import { assign } from 'xstate'

export default {
  guards: {
    是否已登入: (context) => context.isLoggedIn,
    是否已同意服務條款: (context) => context.isTosAgreed,
    是否已驗證信箱: (context) => context.isEmailVerified,

    是單篇付款過的會員: (context) => context.subscription === '解鎖這篇報導',
    是月訂閱的會員: (context) => context.subscription === '月訂閱',
    是年訂閱的會員: (context) => context.subscription === '年訂閱',
    是訂閱但取消下期的會員: (context) =>
      context.subscription === '訂閱但取消下期',

    是否已確認訂購方案: (context) => context.subscriptionOrder,

    是否從會員文章頁來的: (context) => context.isFromPost,

    訂購: (context) => context.redirectDestination === 'purchaseForm',
    方案: (context) => context.redirectDestination === 'sub',
  },
  actions: {
    login: assign({
      isLoggedIn: true,
    }),
    agreeTos: assign({
      isTosAgreed: true,
    }),
    orderSubscribe: assign({
      subscriptionOrder: (context, event) => {
        return event.type
      },
    }),
    subscribe: assign({
      subscription: (context) => {
        mockPostSubscription(context.subscriptionOrder)
        return context.subscriptionOrder
      },
      subscriptionOrder: null,
    }),
    cancelSubscribe: assign({
      subscription: () => {
        mockRemoveSubscription()
        return null
      },
    }),
    setFromPost: assign({
      isFromPost: true,
    }),
    setRedirectToForm: assign({
      redirectDestination: 'purchaseForm',
    }),
    setRedirectToSub: assign({
      redirectDestination: 'sub',
    }),
  },
}

function mockPostSubscription(subscription) {
  localStorage.setItem('subscription', subscription)
}

function mockRemoveSubscription() {
  localStorage.setItem('subscription', '訂閱但取消下期')
}
