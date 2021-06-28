const DEFAULT_OPTIONS = {
  forceNewUIHardLinks: true,
  redirectUrlPath: "results?search_query=%22%22",
  redirectParamName: "_ot_redir",
  restoreShowMoreButton: true,
  // pages:
  pageHome: "reconstruct",
  pageFeed: "reconstruct",
  pageVideo: "user-agent",
  pagePlaylist: "polymer",
  pageChannel: "polymer",
  pageGaming: "polymer",
};

const bg = chrome.extension.getBackgroundPage();
if (!bg._options) { 
  bg._options = DEFAULT_OPTIONS;
}

const _options = bg._options;

function getOptions(main) {
  chrome.storage.local.get(({ options }) => {
    Object.assign(_options, options);
    main(_options);
  });
};

function setOption(key, value) {
  chrome.storage.local.get(({ options }) => {
    _options[key] = value;
    chrome.storage.local.set({ 
      options: Object.assign({}, options, { [key]: value }),
    });
  });
}

function resetOption(key) {
  _options[key] = DEFAULT_OPTIONS[key];
  chrome.storage.local.get(({ options }) => {
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
