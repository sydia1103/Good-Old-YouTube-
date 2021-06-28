const RECONSTRUCT_POSSIBLE = !window.browser || browser.webRequest.filterResponseData;
const PAGES = {
  pageHome: {
    pathnameRe: /^\/(index)?$/g,
    name: 'home',
    methods: RECONSTRUCT_POSSIBLE ? ['reconstruct'] : [],
  },
  pageFeed: {
    pathnameRe: /^\/feed\//g,
    name: 'feed',
    methods: RECONSTRUCT_POSSIBLE ? ['reconstruct'] : [],
  },
  pageChannel: {
    pathnameRe: /^\/(channel|c|user)\//g,
    name: 'channel',
    methods: ['polymer', 'redirect'],
  },
  pageVideo: {
    pathnameRe: /^\/watch$/g,
    name: 'video',
    methods: [],
  },
  pagePlaylist: {
    pathnameRe: /^\/playlist$/g,
    name: 'playlist',
    methods: ['polymer', 'redirect'],
  },
  pageGaming: {
    pathnameRe: /^\/gaming/g,
    name: 'gaming',
    methods: ['polymer', 'redirect'],
  },
}

function getPageFixMethod(urlStr, options) {
  try {
    const { pathname } = new URL(urlStr);
    for (let key in PAGES) {
      const page = PAGES[key];
      if (pathname.match(page.pathnameRe)) {
        return options[key];
      }
    }
  } catch (e) {}
  return null;
}
