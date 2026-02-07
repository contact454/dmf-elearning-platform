type Messages = typeof import('../../messages/en.json');
declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

export {};
