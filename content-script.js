let redirElement = null;
function redirect(url) {
  if (!redirElement) {
    redirElement = document.createElement('a');
    redirElement.className = 'spf-link';
    document.body.appendChild(redirElement);
  }
  redirElement.href = url;
  redirElement.click();
}

function highlightNavLink() {
  const menu = document.getElementById('appbar-guide-menu');
  if (!menu) {
    return;
  }
  const link = menu.querySelector(`a[href="${location.pathname}"]`);
  if (link) {
    link.classList.add('guide-item-selected');
  }
}

function cleanup() {
  const url = new URL(location.href);
  const params = new URLSearchParams(url.search.replace('?', ''));
  ['spf', 'pbj', 'spfreload', 'disable_polymer'].forEach(name => params.delete(name));
  url.search = params.toString();
  history.replaceState(history.state, document.title, url.toString());
}

chrome.runtime.sendMessage({ type: 'getOptions' }, (options) => {
  // Restore "show more" button
  function restoreShowMoreButton() {
    if (!options.restoreShowMoreButton) {
      return;
    }

    const actionPanel = document.getElementById('action-panel-details');
    const showMore = document.querySelector('button[data-gen204="feature=watch-show-more-metadata"]');

    if (!actionPanel || showMore) {
      return;
    }

    actionPanel.insertAdjacentHTML('beforeend',
      '<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-expander yt-uix-expander-head yt-uix-expander-collapsed-body yt-uix-gen204" type="button" onclick="return false;" data-gen204="feature=watch-show-more-metadata"><span class="yt-uix-button-content">Show more</span></button>' +
      '<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-expander yt-uix-expander-head yt-uix-expander-body" type="button" onclick="return false;"><span class="yt-uix-button-content">Show less</span></button>'
    );
  }

  // Force page reload when navigating between old/new interfaces or different page fixes
  document.documentElement.addEventListener('click', e => {
    let node = e.target;
    const anchor = node.closest('a');
    if (!anchor) {
      return;
    }

    const isOldInterface = document.body.hasAttribute('data-spf-name');
    const currentPageFixMethod = isOldInterface ? getPageFixMethod(location.href, options) : 'off';
    const method = getPageFixMethod(anchor.href, options);
    if (method === currentPageFixMethod) {
      return;
    }

    const spLinkSelector = isOldInterface ? 'spf-link' : 'yt-simple-endpoint';
    while (node && node.parentElement) {
      node.classList.remove(spLinkSelector);
      node = node.parentElement;
    }
  }, true);

  const redir = new URLSearchParams(location.search.replace('?', ''))
    .get(options.redirectParamName);

  window.addEventListener('spfdone', ({ detail }) => {
    cleanup();
    restoreShowMoreButton();
    if (!detail || !detail.response || !detail.response._redirecting) {
      document.documentElement.classList.remove('oldtube_redirecting');
      setTimeout(highlightNavLink, 0);
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    cleanup();
    restoreShowMoreButton();

    if (redir) {
      const searchInput = document.getElementById("masthead-search-term");
      if (searchInput && searchInput.value === '""') {
        searchInput.value = "";
      }
      document.documentElement.classList.add("oldtube_redirecting");
      redirect(redir);
    }
  });
});

cleanup();

chrome.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
  if (action === "go") {
    redirect(payload);
  }
  sendResponse();
});
