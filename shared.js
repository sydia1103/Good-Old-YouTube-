const PAGES = {
  pageHome: {
    pathnameRe: /^\/(index)?$/g,
    name: 'home',
    methods: ['reconstruct'],
  },
  pageFeed: {
    pathnameRe: /^\/feed\//g,
    name: 'feed',
    methods: ['reconstruct'],
  },
  pageChannel: {
    pathnameRe: /^\/(channel|c|user)\//g,
    name: 'channel',
    methods: ['polymer', 'redirect'],
  },
  pageVideo: {
    pathnameRe: /^\/watch$/g,
    name: 'video',
    methods: ['user-agent', 'redirect'],
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
  const { pathname } = new URL(urlStr);
  for (let [key, page] of Object.entries(PAGES)) {
    if (pathname.match(page.pathnameRe)) {
      return options[key];
    }
  }
  return null;
}
