function addPbj(requestUrl) {
  const url = new URL(requestUrl);
  const params = new URLSearchParams(url.search.replace('?', ''));
  if (params.get('pbj') !== null) {
    return {};
  }
  if (params.get('spf') !== 'navigate') {
    params.delete('spf');
  }
  params.set('pbj', '1');
  params.delete('disable_polymer');
  url.search = params.toString();
  return {
    redirectUrl: url.toString(),
  };
}

function replaceParam(redirectUrl, paramName, paramValue) {
  const url = new URL(redirectUrl);
  const params = new URLSearchParams(url.search.replace('?', ''));
  if (params.get(paramName) === paramValue) {
    return {};
  }
  params.set(paramName, paramValue);
  url.search = params.toString();

  return {
    redirectUrl: url.toString(),
  };
}

const ON_BEFORE_SEND_HEADERS_EXTRA = ['blocking', 'requestHeaders'];
if (!IS_FIREFOX) {
  ON_BEFORE_SEND_HEADERS_EXTRA.push('extraHeaders');
}
const MAX_COOKIE_REGENERATION_ATTEMPTS = 20; // 10

function main(options) {
  chrome.webRequest.onBeforeRequest.addListener((request) => {
    const { url, type } = request;
    const method = getPageFixMethod(url, options);

    if (method === 'headers') {
      return addPbj(url);
    }

    if (type === 'xmlhttprequest' && method === 'reconstruct' && url.includes('spf=navigate')) {
      return rewriteResponse(request);
    }

    if (type !== 'main_frame' || !method || method === 'off' || method === 'user-agent') {
      return {};
    }

    const [redirectUrl, paramName, paramValue] = (method === 'redirect' || method === 'reconstruct')
      ? [`https://www.youtube.com/${options.redirectUrlPath}`, options.redirectParamName, url]
      : [url, 'disable_polymer', '1'];
    return replaceParam(redirectUrl, paramName, paramValue);
  }, {
    urls: ['https://www.youtube.com/*'],
    types: ['main_frame', 'xmlhttprequest'],
  }, ['blocking']);

  chrome.webRequest.onBeforeSendHeaders.addListener(({ url, type, requestHeaders }) => {
    const method = getPageFixMethod(url, options);
    if (type === 'xmlhttprequest' || method === 'headers') {
      return {
        requestHeaders: requestHeaders
          .reduce((headers, header) => {
            const headerName = header.name.toLowerCase();
            if (!headerName.startsWith('x-youtube-client-')) {
              if (headerName === 'cookie' && url.includes("spfreload=")) {
                header.value = header.value.replace(/VISITOR_INFO1_LIVE=[^;]+/, '');
              }
              headers.push(header);
            }
            return headers;
          }, [
            { name: 'X-YouTube-Client-Name', value: '1' },
            { name: 'X-YouTube-Client-Version', value: '1.20200731.02.01' },
          ]),
      }
    }

    if (type !== 'main_frame' || method === 'off' || method === 'polymer') {
      return {};
    }

    const uaHeader = requestHeaders
      .find(header => header.name.toLowerCase() === 'user-agent');
    uaHeader.value = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

    return {
      requestHeaders,
    };
  }, {
    urls: ['https://www.youtube.com/*'],
    types: ['main_frame', 'xmlhttprequest'],
  }, ON_BEFORE_SEND_HEADERS_EXTRA);

  chrome.webRequest.onHeadersReceived.addListener(({ url, responseHeaders }) => {
    const isBadCookie = responseHeaders
      .some(h => h.name.toLowerCase() === 'content-disposition' && h.value.toLowerCase().includes('json.txt'));

    if (isBadCookie) {
      let [, currentAttempt] = url.match(/spfreload=(\d+)/i) || [0, '10'];
      currentAttempt = Math.min(parseInt(currentAttempt), MAX_COOKIE_REGENERATION_ATTEMPTS);
      let x = replaceParam(url, 'spfreload', `${currentAttempt + 1}`);
      return x;
    }
  }, {
    urls: ['https://www.youtube.com/*'],
    types: ['main_frame'],
  }, ['blocking', 'responseHeaders']);

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

chrome.runtime.onInstalled && chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
  if (reason === 'update' && versionToFloat(previousVersion) < 1.14) {
    getOptions(() => resetOptions());
  }
});

getOptions(main);
