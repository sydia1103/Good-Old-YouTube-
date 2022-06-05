function addPbj(requestUrl) {
    const url = new URL(requestUrl);
    const params = new URLSearchParams(url.search.replace('?', ''));
    if (params.get('pbj') !== null) { return {}; }
    if (params.get('spf') !== 'navigate') { params.delete('spf'); }
    params.set('pbj', '1');
    url.search = params.toString();
    return { redirectUrl: url.toString(), };
}

function replaceParam(redirectUrl, paramName, paramValue) {
    const url = new URL(redirectUrl);
    const params = new URLSearchParams(url.search.replace('?', ''));
    if (params.get(paramName) === paramValue) { return {}; }
    params.set(paramName, paramValue);
    url.search = params.toString();
    return { redirectUrl: url.toString(), };
}
const ON_BEFORE_SEND_HEADERS_EXTRA = ['blocking', 'requestHeaders'];
if (!IS_FIREFOX) { ON_BEFORE_SEND_HEADERS_EXTRA.push('extraHeaders'); }
const MAX_COOKIE_REGENERATION_ATTEMPTS = 20;
const CHANNELS = new Set(['channel', 'user', 'c']);

function main(options) {
    chrome.webRequest.onBeforeRequest.addListener((request) => {
        const { type } = request;
        const method = getPageFixMethod(request.url, options);
        if (method !== 'headers') { return; }
        let url = new URL(request.url);
        if (url.pathname.match(PAGES.pageChannel.pathnameRe)) { const path = url.pathname.split('/'); const i = CHANNELS.has(path[1]) ? 3 : 2;
            path[i] = !path[i] ? 'Featured' : (path[i].charAt(0).toUpperCase() + path[i].slice(1));
            url.pathname = path.join('/'); }
        return addPbj(url.toString());
    }, { urls: ['https://www.youtube.com/*'], types: ['main_frame', 'xmlhttprequest', 'other'], }, ['blocking']);
    chrome.webRequest.onBeforeSendHeaders.addListener(({ url, type, requestHeaders }) => {
        const method = getPageFixMethod(url, options);
        const uaHeader = requestHeaders.find(header => header.name.toLowerCase() === 'user-agent');
        uaHeader.value = 'archive.org_bot';
        if (type === 'xmlhttprequest' || method === 'headers') {
            return {
                requestHeaders: requestHeaders.reduce((headers, header) => {
                    const headerName = header.name.toLowerCase();
                    if (!headerName.startsWith('x-youtube-client-')) {
                        if (headerName === 'cookie' && url.includes("spfreload=")) { header.value = header.value.replace(/VISITOR_INFO1_LIVE=[^;]+;?/, ''); }
                        headers.push(header);
                    }
                    return headers;
                }, [{ name: 'X-YouTube-Client-Name', value: '1' }, { name: 'X-YouTube-Client-Version', value: '1.20200731.02.01' }, ]),
            }
        }
    }, { urls: ['https://www.youtube.com/*'], types: ['main_frame', 'xmlhttprequest'], }, ON_BEFORE_SEND_HEADERS_EXTRA);
    chrome.webRequest.onHeadersReceived.addListener(({ url, responseHeaders }) => { const isBadCookie = responseHeaders.some(h => h.name.toLowerCase() === 'content-disposition' && h.value.toLowerCase().includes('json.txt')); if (isBadCookie) { let [, currentAttempt] = url.match(/spfreload=(\d+)/i) || [0, '10'];
            currentAttempt = Math.min(parseInt(currentAttempt), MAX_COOKIE_REGENERATION_ATTEMPTS); return replaceParam(url, 'spfreload', `${currentAttempt + 1}`); } }, { urls: ['https://www.youtube.com/*'], types: ['main_frame'], }, ['blocking', 'responseHeaders']);
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case 'getOptions':
                sendResponse(options); break;
            case 'resetOption':
                resetOption(message.name);
                sendResponse(options); break; }
        if (message.type === 'getOptions') { sendResponse(options); }
    });
}

function versionToFloat(version) { const [major = '00', minor = '00', patch = '00'] = version.split('.').map(v => ('00' + v).slice(-2)); return parseFloat(`${major}.${minor}${patch}`); }
chrome.runtime.onInstalled && chrome.runtime.onInstalled.addListener(({ reason, previousVersion }) => { if (reason === 'update' && versionToFloat(previousVersion) < 1.16) { getOptions(() => resetOptions()); } });
getOptions(main);