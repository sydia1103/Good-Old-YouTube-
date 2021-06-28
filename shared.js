const IS_FIREFOX = window.browser;
const RECONSTRUCT_POSSIBLE = !IS_FIREFOX || browser.webRequest.filterResponseData;
const PAGES = {
  pageHome: {
    pathnameRe: /^\/(index)?$/g,
    name: 'home',
    methods: ['headers'],
  },
  pageFeed: {
    pathnameRe: /^\/feed\//g,
    name: 'feed',
    methods: ['headers'],
  },
  pageChannel: {
    pathnameRe: /^\/(channel|c|user|sports|news|live|learning|360)(\/|$)/g,
    name: 'channel',
    methods: ['headers'],
  },
  pageVideo: {
    pathnameRe: /^\/watch$/g,
    name: 'video',
    methods: ['headers'],
  },
  pageResults: {
    pathnameRe: /^\/results$/g,
    name: 'search',
    methods: [],
  },
  pagePlaylist: {
    pathnameRe: /^\/playlist$/g,
    name: 'playlist',
    methods: ['headers'],
  },
  pageGaming: {
    pathnameRe: /^\/gaming$/g,
    name: 'gaming',
    methods: ['headers'],
  },
  pageOthers: {
    name: 'other pages',
    methods: ['headers'],
  }
}

function getPageFixMethod(urlStr, options) {
  try {
    const { pathname } = new URL(urlStr);
    for (let key in PAGES) {
      const page = PAGES[key];
      if (page.pathnameRe && pathname.match(page.pathnameRe)) {
        return options[key];
      }
    }
  } catch (o_O)
           { }
  return options.pageOthers;
}
