const RECONSTRUCT_POSSIBLE = !window.browser || browser.webRequest.filterResponseData;
const PAGES = {
  pageHome: {
    pathnameRe: /^\/(index)?$/g,
    name: 'home',
    methods: RECONSTRUCT_POSSIBLE ? ['headers', 'reconstruct'] : ['headers'],
  },
  pageFeed: {
    pathnameRe: /^\/feed\//g,
    name: 'feed',
    methods: RECONSTRUCT_POSSIBLE ? ['headers', 'reconstruct'] : ['headers'],
  },
  pageChannel: {
    pathnameRe: /^\/(channel|c|user)\//g,
    name: 'channel',
    methods: ['headers', 'polymer', 'redirect'],
  },
  pageVideo: {
    pathnameRe: /^\/watch$/g,
    name: 'video',
    methods: ['headers'],
  },
  pagePlaylist: {
    pathnameRe: /^\/playlist$/g,
    name: 'playlist',
    methods: ['headers', 'polymer', 'redirect'],
  },
  pageGaming: {
    pathnameRe: /^\/gaming/g,
    name: 'gaming',
    methods: ['headers', 'polymer', 'redirect'],
  },
  pageOthers: {
    name: 'other pages',
    methods: ['headers', 'polymer', 'user-agent'],
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
