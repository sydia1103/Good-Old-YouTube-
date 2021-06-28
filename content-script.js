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

  // Force page reload when navigating between old/new interfaces
  document.documentElement.addEventListener('click', e => {
    let node = e.target;
    const anchor = node.closest('a');
    if (!anchor) {
      return;
    }
    const method = getPageFixMethod(anchor.href, options);
    const isOldInterface = document.body.hasAttribute('data-spf-name');
    const spLinkSelector = isOldInterface ? 'spf-link' : 'yt-simple-endpoint';
    if (
      isOldInterface && method !== 'off' || 
      !isOldInterface && method === 'off'
    ) {
      return;
    }

    while (node && node.parentElement) {
      node.classList.remove(spLinkSelector);
      node = node.parentElement;
    }
  }, true);

  const redir = new URLSearchParams(location.search.replace('?', ''))
    .get(options.redirectParamName);

  if (redir) {
    document.documentElement.classList.add('oldtube_redirecting');
  }

  window.addEventListener('spfdone', () => {
    document.documentElement.classList.remove('oldtube_redirecting');
    restoreShowMoreButton();
    setTimeout(highlightNavLink, 0);
  });

  window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('masthead-search-term');
    if (searchInput && searchInput.value === '""') {
      searchInput.value = '';
    }

    restoreShowMoreButton();

    if (!document.querySelector('.spf-link')) {
      return;
    }

    if (redir) {
      redirect(redir);
    }
  });
});

chrome.runtime.onMessage.addListener(({ action, payload }) => {
  if (action === 'go') {
    redir(payload);
  }
});
