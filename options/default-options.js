const DEFAULT_OPTIONS = {
  forceNewUIHardLinks: true,
  fixHeaders: true,
  redirectUrlPath: 'results?search_query=%22%22',
  redirectParamName: '_ot_redir',
  restoreShowMoreButton: true,
  enableLogging: false,
  // pages:
  pageHome: 'headers',
  pageFeed: 'headers',
  pageVideo: 'headers',
  pagePlaylist: 'headers',
  pageChannel: 'headers',
  pageGaming: 'headers',
  pageOthers: 'headers',
};

const bg = chrome.extension.getBackgroundPage();
if (!bg._options) { 
  bg._options = Object.assign({}, DEFAULT_OPTIONS);
}

const _options = bg._options;

function getOptions(main) {
  chrome.storage.local.get(({ options }) => {
    Object.assign(_options, options);
    main(_options);
  });
};

function setOption(key, value) {
  if (value === DEFAULT_OPTIONS[key]) {
    return resetOption(key);
  }
  chrome.storage.local.get(({ options }) => {
    _options[key] = value;
    chrome.storage.local.set({ 
      options: Object.assign({}, options, { [key]: value }),
    });
  });
}

function resetOption(key) {
  _options[key] = DEFAULT_OPTIONS[key];
  chrome.storage.local.get(({ options = {} }) => {
    delete options[key];
    chrome.storage.local.set({
      options: Object.assign({}, options),
    });
  });
}

function resetOptions() {
  Object.assign(_options, DEFAULT_OPTIONS);
  chrome.storage.local.set({ options: {} });
}
