const NAVIGATION_JSON_TEMPLATE = {
  "foot": "",
  "head": "<script >yt.www.masthead.sizing.runBeforeBodyIsReady(true,true,true);</script>\n  \n    <link rel=\"stylesheet\" href=\"/yts/cssbin/www-core-webp-vflywcVYf.css\" name=\"www-core\">\n      <link rel=\"stylesheet\" href=\"/s/player/f82a8c37/www-player-webp.css\" name=\"player/www-player\">\n\n\n\n        <link rel=\"stylesheet\" href=\"/yts/cssbin/www-home-c4-webp-vfls3PsJQ.css\" name=\"www-home-c4\">",
  "body": {
    "content": "",
    "early-body": "",
    "player-unavailable": "",
    "appbar-content": "",
    "header": "",
    "ticker-content": "",
    "alerts": "",
    "debug": "",
    "player-playlist": ""
  },
  "name": "other",
  "url": "/",
  "attr": {
    "content": {
      "class": "content-alignment"
    },
    "page": {
      "class": "not-fixed-width-tab-widescreen"
    },
    "body": {
      "class": "appbar-hidden exp-invert-logo exp-kevlar-settings exp-mouseover-img exp-responsive exp-search-big-thumbs site-center-aligned site-as-giant-card guide-pinning-enabled not-nirvana-dogfood flex-width-enabled flex-width-enabled-snap"
    },
    "player-unavailable": {
      "class": "hid"
    },
    "player": {
      "class": "off-screen"
    },
    "player-playlist": {
      "class": "hid"
    }
  },
  "title": ""
}

const CHANNEL_TEMPLATE_HEADER = `
  <div
    class="branded-page-v2-container branded-page-base-bold-titles branded-page-v2-container-flex-width branded-page-v2-has-top-row branded-page-v2-secondary-column-hidden"
  >
    <div class="branded-page-v2-col-container">
      <div class="branded-page-v2-col-container-inner">
        <div class="branded-page-v2-primary-col">
          <div class="yt-card clearfix">
            <div
              class="branded-page-v2-body branded-page-v2-primary-column-content"
              id=""
            >
              <ul id="browse-items-primary">`;

const CHANNEL_TEMPLATE_FOOTER = `
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

function getValue(obj, key, defaultValue = '') {
  if (key === "") {
    return obj;
  }

  const path = key.split(".");
  let prop, result = obj;
  while (path.length > 0) {
    prop = path.shift();
    if (!(prop in result)) {
      return defaultValue;
    }
    result = result[prop];
  }
  return result;
}

function extractValueSafe(obj, [...keys]) {
  return keys.map((k) => {
    const defaultValue = k.pop();
    for (let i = 0; i < k.length; ++i) {
      const value = getValue(obj, k[i], null);
      if (value !== null) {
        return value;
      }
    }
    return defaultValue;
  });
}

function getText(t) {
  if ('simpleText' in t) {
    return t.simpleText;
  }
  if ('runs' in t) {
    return t.runs.map(runs => runs.text).join(' ');
  }
  return '';
}

function defaultComponent(data) {
  const contents = data.content ? [data.content] : data.contents || data.items;
  return (contents && contents.map(renderComponent).join('')) || '';
}

function videoComponent(data) {
  const [
    videoId,
    thumbURL,
    lengthText,
    durationA11yText,
    url,
    publishedTime,
    viewCountText,
    titleText,
    titleA11yText,
    ownerText,
    ownerURL,
    upcomingEventText,
    upcomingEventStartTime,
    ownerBadges,
    badges,
  ] = extractValueSafe(data, [
    ['videoId', 'dQw4w9WgXcQ'],
    ['thumbnail.thumbnails.0.url', 'about:blank'],
    ['lengthText', 'thumbnailOverlays.0.thumbnailOverlayTimeStatusRenderer.text', {}],
    [
        'lengthText.accessibility.accessibilityData.label',
        'thumbnailOverlays.0.thumbnailOverlayTimeStatusRenderer.accessibility.accessibilityData.label',
        ''
    ],
    ['navigationEndpoint.commandMetadata.webCommandMetadata.url', '/'],
    ['publishedTimeText.simpleText', ''],
    ['viewCountText', {}],
    ['title', {}],
    ['title.accessibility.accessibilityData.label', ''],
    ['ownerText.runs.0.text', 'shortBylineText.runs.0.text', ''],
    [
      'ownerText.runs.0.navigationEndpoint.commandMetadata.webCommandMetadata.url',
      'ownerText.runs.0.navigationEndpoint.browseEndpoint.canonicalBaseUrl',
      'shortBylineText.runs.0.navigationEndpoint.webCommandMetadata.commandMetadata.url',
      'shortBylineText.runs.0.navigationEndpoint.browseEndpoint.canonicalBaseUrl',
      '/'
    ],
    ['upcomingEventData.upcomingEventText.runs.0.text', ''],
    ['upcomingEventData.startTime', ''],
    ['ownerBadges', []],
    ['badges', []],
  ]);

  const viewCount = getText(viewCountText);
  const durationSimpleText = getText(lengthText);
  const title = getText(titleText);

  function getVerifiedHTML() {
    const verifiedBadge = ownerBadges.find(({ metadataBadgeRenderer: { style } }) => style === "BADGE_STYLE_TYPE_VERIFIED");
    if (verifiedBadge) {
      const { tooltip } = verifiedBadge.metadataBadgeRenderer;
      return `<span class="yt-channel-title-icon-verified yt-uix-tooltip yt-sprite" data-tooltip-text="${tooltip}" aria-label="${tooltip}" style="margin-left: 2px"></span>`;
    }
    return '';
  }
  
  function getBadgesHTML() {
    if (badges.length === 0) {
      return '';
    }
    return '<div class="yt-lockup-badges"><ul class="yt-badge-list">'
      + badges.map(({ metadataBadgeRenderer: { label, style }}) => `
        <li class="yt-badge-item"><span class="yt-badge ${style === 'BADGE_STYLE_TYPE_LIVE_NOW' ? 'yt-badge-live' : ''}">${label}</span></li>
      `).join('')
      + '</ul></div>';
  }

  function getMetaInfoHTML() {
    const info = [
      viewCount,
      publishedTime,
      upcomingEventText + (upcomingEventStartTime ? new Date(+upcomingEventStartTime).toLocaleString() : ''),
    ].filter(s => s !== '').map(s => `<li>${s}</li>`).join('');
    return `
      <div class="yt-lockup-meta">
        <ul class="yt-lockup-meta-info">
          ${info}
        </ul>
      </div>`;
  }

  return `
    <li class="channels-content-item yt-shelf-grid-item">
      <div
        class="yt-lockup clearfix yt-lockup-video yt-lockup-grid"
        data-context-item-id="${videoId}"
      >
        <div class="yt-lockup-dismissable">
          <div class="yt-lockup-thumbnail">
            <span class="spf-link ux-thumb-wrap contains-addto"
              ><a
                href="${url}"
                class="yt-uix-sessionlink"
                aria-hidden="true"
              >
                <span class="video-thumb yt-thumb yt-thumb-196">
                  <span class="yt-thumb-default">
                    <span class="yt-thumb-clip">
                      <img
                        aria-hidden="true"
                        alt=""
                        data-ytimg="1"
                        src="${thumbURL}"
                        loading="lazy"
                        width="196"
                      />

                      <span class="vertical-align"></span>
                    </span>
                  </span>
                </span>
              </a>
              <span class="video-time" aria-hidden="true"
                ><span aria-label="${durationA11yText}">${durationSimpleText}</span></span
              >
              <span
                class="thumb-menu dark-overflow-action-menu video-actions"
              >
              </span>

              <button
                class="yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button video-actions spf-nolink hide-until-delayloaded addto-watch-later-button-sign-in yt-uix-tooltip"
                type="button"
                onclick=";return false;"
                role="button"
                title="Watch later"
                data-button-menu-id="shared-addto-watch-later-login"
                data-video-ids="${videoId}"
              >
                <span
                  class="yt-uix-button-arrow yt-sprite"
                ></span>
              </button>
            </span>
          </div>
          <div class="yt-lockup-content">
            <h3 class="yt-lockup-title">
              <a
                class="yt-uix-sessionlink yt-uix-tile-link spf-link yt-ui-ellipsis yt-ui-ellipsis-2"
                dir="ltr"
                title="${title}"
                aria-describedby="description-id-${url}"
                href="${url}"
                rel="nofollow"
                >${title}</a
              ><span
                class="accessible-description"
                id="description-id-${url}"
              >
                - ${durationA11yText}.</span
              >
            </h3>
            <div class="yt-lockup-byline">
              <a
                href="${ownerURL}"
                class="yt-uix-sessionlink yt-user-name spf-link"
                aria-label="Go to the user page for ${ownerText}"
                dir="ltr"
                >${ownerText}</a
              >
              ${getVerifiedHTML()}
            </div>
            ${getMetaInfoHTML()}
            ${getBadgesHTML()}
          </div>
        </div>
        <div
          class="yt-lockup-notifications-container hid"
          style="height: 110px;"
        ></div>
      </div>
    </li>
  `;
}

function movieComponent(data) {
  const [
    videoId,
    thumbURL,
    lengthText,
    durationA11yText,
    url,
    titleText,
    titleA11yText,
    badges,
  ] = extractValueSafe(data, [
    ['videoId', 'dQw4w9WgXcQ'],
    ['thumbnail.thumbnails.0.url', 'about:blank'],
    ['lengthText', 'thumbnailOverlays.0.thumbnailOverlayTimeStatusRenderer.text', {}],
    [
        'lengthText.accessibility.accessibilityData.label',
        'thumbnailOverlays.0.thumbnailOverlayTimeStatusRenderer.accessibility.accessibilityData.label',
        ''
    ],
    ['navigationEndpoint.commandMetadata.webCommandMetadata.url', '/'],
    ['title', {}],
    ['title.accessibility.accessibilityData.label', ''],
    ['badges', []],
  ]);

  const durationSimpleText = getText(lengthText);
  const title = getText(titleText);

  function getBadgesHTML() {
    return badges.length === 0 ? '' : badges.map(({ metadataBadgeRenderer: { label, style }}) => `
        <span class="standalone-ypc-badge-renderer">
          ${style === 'BADGE_STYLE_TYPE_YPC'
            ? '<span class="yt-badge standalone-ypc-badge-renderer-icon standalone-ypc-badge-renderer-icon-available">$</span>'
            : ''
          }          
          <span class="standalone-ypc-badge-renderer-label">
            ${label}
          </span>
        </span>
      `).join('');
  }

  return `
    <li
      class="channels-content-item yt-shelf-grid-item yt-uix-shelfslider-item movie-shelf-item"
    >
      <div
        class="yt-lockup clearfix yt-lockup-movie yt-lockup-grid"
        data-context-item-id="${videoId}"
      >
        <div class="yt-lockup-thumbnail">
          <a
            href="${url}&amp;feature=g-high-tsf"
            class="ux-thumb-wrap movie-poster yt-uix-sessionlink contains-addto"
          >
            <span class="video-thumb yt-thumb yt-thumb-196">
              <span class="yt-thumb-poster">
                <span class="yt-thumb-clip">
                  <img
                    src="${thumbURL}"
                    loading="lazy"
                    alt=""
                    data-ytimg="1"
                    aria-hidden="true"
                    width="196"
                  />
                  <span class="vertical-align"></span>
                </span>
              </span>
            </span>

            <span class="video-time"
              ><span aria-label="${durationA11yText}"
                >${durationSimpleText}</span
              ></span
            >
            <span class="thumb-menu dark-overflow-action-menu video-actions">
            </span>

            <button
              class="yt-uix-button yt-uix-button-size-small yt-uix-button-default yt-uix-button-empty yt-uix-button-has-icon no-icon-markup addto-button video-actions spf-nolink hide-until-delayloaded addto-watch-later-button-sign-in yt-uix-tooltip"
              type="button"
              onclick=";return false;"
              role="button"
              title="Watch later"
              data-button-menu-id="shared-addto-watch-later-login"
              data-video-ids="${videoId}"
            >
              <span class="yt-uix-button-arrow yt-sprite"></span>
            </button>
          </a>
        </div>
        <div class="yt-lockup-content">
          <h3 class="yt-lockup-title">
            <a
              class="yt-uix-sessionlink yt-uix-tile-link spf-link yt-ui-ellipsis yt-ui-ellipsis-2"
              dir="ltr"
              title="${title}"
              aria-describedby="description-id-${videoId}"
              href="${url}"
              rel="nofollow"
              >${title}</a
            ><span class="accessible-description" id="description-id-${videoId}">
              - ${titleA11yText}.</span
            >
          </h3>
          ${getBadgesHTML()}
          <div class="yt-lockup-meta">
            <ul class="yt-lockup-meta-info"></ul>
          </div>
        </div>
      </div>
    </li>
  `;
}

function channelComponent(data) {
  const [
    channelId,
    thumbURL,
    subscriberCountText,
    url,
    titleText,
  ] = extractValueSafe(data, [
    ['channelId', ''],
    ['thumbnail.thumbnails.2.url', 'thumbnail.thumbnails.1.url', 'thumbnail.thumbnails.0.url', 'about:blank'],
    ['subscriberCountText', {}],
    ['navigationEndpoint.commandMetadata.webCommandMetadata.url', '/'],
    ['title', {}],
  ]);

  const title = getText(titleText);
  const subscriberCount = getText(subscriberCountText);

  return `
    <li class="channels-content-item yt-shelf-grid-item">
      <div
        class="yt-lockup clearfix yt-lockup-video yt-lockup-grid"
        data-context-item-id="${channelId}"
      >
        <div class="yt-lockup-dismissable">
          <div class="yt-lockup-thumbnail">
            <span class="spf-link ux-thumb-wrap contains-addto"
              ><a
                href="${url}"
                class="yt-uix-sessionlink"
                aria-hidden="true"
              >
                <span class="video-thumb yt-thumb yt-thumb-196">
                  <span class="yt-thumb-default">
                    <span class="yt-thumb-clip">
                      <img
                        aria-hidden="true"
                        alt=""
                        data-ytimg="1"
                        src="${thumbURL}"
                        loading="lazy"
                        width="196"
                      />
                      <span class="vertical-align"></span>
                    </span>
                  </span>
                </span>
              </a>
            </span>
          </div>
          <div class="yt-lockup-content">
            <div class="yt-lockup-byline">
              <a
                href="${title}"
                class="yt-uix-sessionlink yt-user-name spf-link"
                aria-label="Go to the user page for ${title}"
                dir="ltr"
                style="font-weight: bold"
                >${title}</a
              >
            </div>
          </div>
          <div class="yt-lockup-meta">
            <ul class="yt-lockup-meta-info">
              <li>${subscriberCount}</li>
            </ul>
          </div>          
        </div>
        <div
          class="yt-lockup-notifications-container hid"
          style="height: 110px;"
        ></div>
      </div>
    </li>
  `;
}

function gridSectionComponent(data) {
  const contents = defaultComponent(data);
  return !contents ? '' : `
    <li>
      <ul
        id="channels-browse-content-grid"
        class="channels-browse-content-grid branded-page-gutter-padding grid-lockups-container"
        style="border-bottom: 1px solid #e8e8e8;"
      >
      ${contents}
      </ul>
    </li>`;
}

function feedContainerComponent(data) {
  const title = getText(getValue(data, 'title', {}));
  const titleHTML = title
    ? `<div class="shelf-title-table">
        <div class="shelf-title-row">
          <h2 class="branded-page-module-title shelf-title-cell">
            <span class="branded-page-module-title-text">${title}</span>
          </h2>
          <div class="menu-container shelf-title-cell"></div>
        </div>
      </div>`
    : '';
  const contents = defaultComponent(data);
  return !contents ? '' : `
    <li>
      <div
        class="feed-item-container browse-list-item-container yt-section-hover-container compact-shelf shelf-item branded-page-box clearfix"
        style="border-bottom: 1px solid #e8e8e8;"
      >
        <div class="feed-item-dismissable">
          ${titleHTML}
          <div class="multirow-shelf">
            <div class="yt-uix-expander yt-uix-expander-collapsed">
              <ul class="shelf-content yt-uix-expander-body">
              ${contents}
              </ul>
              <div class="yt-uix-expander-head">
                <span class="multirow-shelf-expander">Show more</span
                ><span class="multirow-shelf-collapser">Show fewer</span>
              </div>
            </div>
          </div>
        </div>
        <div class="feed-item-dismissal-notices"></div>
      </div>
    </li>`;
}

function messageComponent(data) {
  const [subtext] = extractValueSafe(data, [
    ['subtext.messageSubtextRenderer.text', 'text', { runs: [] }]
  ]);
  const messageHTML = subtext.runs.map(({ text, navigationEndpoint }) => {
    if (navigationEndpoint) {
      const { urlEndpoint: { url }} = navigationEndpoint;
      return `<a href="${url}" class=" yt-uix-sessionlink " data-url="${url}">${text}</a>`;
    } else {
      return text;
    }
  }).join('');

  return `<li>
      <div class="display-message">${messageHTML}</div>
    </li>`;
}

function renderComponent(data) {
  const componentName = Object.keys(data)[0];
  const componentProps = data[componentName];
  let component = defaultComponent;
  switch (componentName) {
    case 'gridVideoRenderer':
    case 'videoRenderer':
      component = videoComponent;
      break;
    case 'movieRenderer':
      component = movieComponent;
      break;
    case 'messageRenderer':
      component = messageComponent;
      break;
    case 'gridChannelRenderer':
      component = channelComponent;
      break;
    case 'shelfRenderer':
    case 'richShelfRenderer':
      component = feedContainerComponent;
      break;
    case 'gridSectionRenderer':
      component = gridSectionComponent;
      break;
  }
  let content = component(componentProps);
  return content;
}

function normalizePbj(pbj) {
  const leafComponents = new Set(['gridVideoRenderer', 'videoRenderer', 'messageRenderer', 'movieRenderer', 'gridChannelRenderer']);
  const wrapperComponents = new Set(['shelfRenderer', 'richShelfRenderer']);

  const wrappers = [];
  let currentWrapper = null;

  function walk(root) {
    const rendererName = Object.keys(root)[0];
    const props = root[rendererName];
    const contents = props.content ? [props.content] : (props.contents || props.items || props.tabs);

    if (wrapperComponents.has(rendererName)) {
      wrappers.push(root);
      currentWrapper = null;
      return;
    }
    
    if (leafComponents.has(rendererName)) {
      if (currentWrapper === null) {
        const gridWrapper = {
          gridSectionRenderer: {
            contents: [root],
          },
        };
        wrappers.push(gridWrapper);
        currentWrapper = gridWrapper;
      } else {
        currentWrapper.gridSectionRenderer.contents.push(root);
      }
      return;
    }

    if (contents) {
      contents.forEach(walk);
    }
  }

  walk(pbj.contents);
  return {
    transformedPbj: {
      contents: wrappers,
    },
  };
}

function reconstructJSON(pbj, url) {
  const data = normalizePbj(pbj);
  const content = CHANNEL_TEMPLATE_HEADER
    + renderComponent(data)
    + CHANNEL_TEMPLATE_FOOTER;

  url = url
      .replace('https://www.youtube.com', '')
      .replace(/(&|\?)spf=navigate/, '');

  const lastWord = url.split("/").pop().split('?').shift();
  const titleParts = ['YouTube'];
  if (lastWord) {
    titleParts.unshift(lastWord[0].toUpperCase() + lastWord.slice(1));
  }
  const title = titleParts.join(' – ');
  const json = Object.assign({}, NAVIGATION_JSON_TEMPLATE, {
    url,
    title,
  });
  json.body.content = content;
  return json;
}

const rewriteResponse = (() => {
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();
  const re = /ytInitialData"\] = ([^<]+);\s*window\["ytInitialPlayerResponse/;
  const responseCache = new Map();

  function extractParseAndReconstruct(text, url) {
    const jsonText = text.match(re)[1];
    const ytInitialData = JSON.parse(jsonText);
    const reconstructedJSON = reconstructJSON(ytInitialData, url);
    return JSON.stringify(reconstructedJSON);
  }

  function rewriteResponseFirefox({ url, requestId }) {
    const data = [];
    const filter = browser.webRequest.filterResponseData(requestId);
    filter.ondata = (event) => data.push(event.data);
    filter.onstop = () => {
      let str = '';
      if (data.length == 1) {
        str = decoder.decode(data[0]);
      } else {
        for (let i = 0; i < data.length; i++) {
          let stream = (i == data.length - 1) ? false : true;
          str += decoder.decode(data[i], { stream });
        }
      }

      try {
        const json = extractParseAndReconstruct(str, url);
        filter.write(encoder.encode(json));
      } catch (e) {
        console.warn('Could not reconstruct JSON:', e);
      }
      filter.close();
    };

    return {};
  }

  function rewriteResponseChromium({ url, tabId }) {
    const xhrURL = new URL(url);
    const params = new URLSearchParams(xhrURL.search);
    params.delete("spf");
    params.delete("spfreload");
    xhrURL.search = params.toString();

    let cachedJSON = responseCache.get(xhrURL.pathname);

    fetch(xhrURL.toString())
      .then((r) => r.text())
      .then((str) => {
        const json = extractParseAndReconstruct(str, url);
        responseCache.set(xhrURL.pathname, json);
        if (!cachedJSON) {
          chrome.tabs.sendMessage(tabId, {
            action: 'go',
            payload: url.replace('https://www.youtube.com', ''),
          });
          chrome.tabs.reload(tabId);
        }
      })
      .catch((e) => console.warn('Could not reconstruct JSON:', e));

    return {
      redirectUrl: cachedJSON ? `data:;charset=utf-8,${encodeURIComponent(cachedJSON)}` : `data:,{}`,
    };
  }

  return window.browser ? rewriteResponseFirefox : rewriteResponseChromium;
})();
