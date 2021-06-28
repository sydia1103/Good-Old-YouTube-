function main(options) {
  chrome.webRequest.onBeforeRequest.addListener((request) => {
    const { url, type } = request;
    const method = getPageFixMethod(url, options);

    if (type === 'xmlhttprequest' && method === 'reconstruct' && url.includes('spf=navigate')) {
      return rewriteResponse(request);
    }

    if (type !== 'main_frame' || !method || method === 'off' || method === 'user-agent') {
      return {};
    }

    const [redirectUrl, paramName, paramValue] = (method === 'redirect' || method === 'reconstruct')
      ? [`https://www.youtube.com/${options.redirectUrlPath}`, options.redirectParamName, url]
      : [url, 'disable_polymer', '1'];

    const u = new URL(redirectUrl);
    const params = new URLSearchParams(u.search.replace('?', ''));
    if (params.get(paramName) === paramValue) {
      return {};
    }
    params.set(paramName, paramValue);
    u.search = params.toString();

    return {
      redirectUrl: u.toString(),
    };
  }, {
    urls: ["https://www.youtube.com/*"],
    types: ["main_frame", "xmlhttprequest"],
  }, ['blocking']);

  chrome.webRequest.onBeforeSendHeaders.addListener(({ url, type, requestHeaders }) => {
    if (type === 'xmlhttprequest' && url.includes('/browse_ajax?')) {
      return {
        requestHeaders: requestHeaders
          .filter(header => !header.name.toLowerCase().startsWith('x-youtube-client-'))
          .concat([
            { name: 'X-YouTube-Client-Name', value: '1' },
            { name: 'X-YouTube-Client-Version', value: '1.20200731.02.01' },
          ]),
      }
    }

    const method = getPageFixMethod(url, options);
    if (type !== 'main_frame' || method === 'off' || method === 'polymer') {
      return {};
    }

    const uaHeader = requestHeaders
      .find(header => header.name.toLowerCase() === "user-agent");
    uaHeader.value = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

    return {
      requestHeaders,
    };
  }, {
    urls: ["https://www.youtube.com/*"],
    types: ["main_frame", "xmlhttprequest"],
  }, ['blocking', 'requestHeaders']);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'getOptions':
        sendResponse(options);
        break;
      case 'resetOption':
        resetOption(message.name);
        sendResponse(options);
        break;
    }

    if (message.type === 'getOptions') {
      sendResponse(options);
    }
  });
}

function versionToFloat(version) {
  const [major = '00', minor = '00', patch = '00'] = version
    .split('.').map(v => ('00' + v).slice(-2));
  return parseFloat(`${major}.${minor}${patch}`);
}

chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'update' && versionToFloat(previousVersion) < 1.1304) {
    getOptions(() => resetOption("pageVideo"));
  }
});

getOptions(main);
