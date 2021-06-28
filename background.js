chrome.webRequest.onBeforeSendHeaders.addListener(({ requestHeaders }) => {
  let cookieHeader = requestHeaders
    .find(header => header.name.toLowerCase() === "cookie");

  const uaHeader = requestHeaders
    .find(header => header.name.toLowerCase() === "user-agent");

  uaHeader.value = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

  if (!cookieHeader) {
    cookieHeader = {
      name: 'Cookie',
      value: '',
    };
    requestHeaders.push(cookieHeader);
  }

  let prefCookie = 'PREF=f1=50000000';

  cookieHeader.value = cookieHeader.value
    .split(';')
    .filter(cookie => {
      cookie = cookie.trim();
      if (cookie.startsWith('PREF=')) {
        prefCookie = cookie;
        return false;
      }

      return cookie !== '';
    })
    .concat((() => {
      return prefCookie
        .split('&')
        .filter(cookieValue => !cookieValue.startsWith('f6=') || !cookieValue.startsWith('f5='))
        .concat('f6=18')
        .concat('f5=30')
        .join('&');
    })())
    .join(';');

  return {
    requestHeaders,
  };
}, {
  urls: ["*://www.youtube.com/*"],
  types: ["main_frame"],
}, ['blocking', 'requestHeaders']);
