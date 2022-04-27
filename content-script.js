function cleanup(){const url=new URL(location.href);const params=new URLSearchParams(url.search.replace('?',''));['spf','pbj','spfreload','disable_polymer'].forEach(name=>params.delete(name));url.search=params.toString();history.replaceState(history.state,document.title,url.toString());}
function insertMenuItemAfter(el,id,text,url,icon){if(el){el.insertAdjacentHTML('afterEnd',`
      <li class="guide-channel guide-notification-item overflowable-list-item" id="${id}" role="menuitem">
        <a class="guide-item yt-uix-sessionlink yt-valign spf-link" href="${url}" title="${text}">
          <span class="yt-valign-container">
              <span class="thumb ${icon} yt-sprite"></span>
              <span class="display-name no-count"><span>${text}</span></span>
          </span>
        </a>
      </li>`);return true;}}
function restoreHistory(){const history=document.querySelector('#history-guide-item');const donor=document.querySelector('.footer-history[href="/feed/history"]');if(history||!donor){return;}
const linkText=donor.textContent||'History';['trending-guide-item','what_to_watch-guide-item'].some(id=>insertMenuItemAfter(document.querySelector(`#${id}`),'history-guide-item',linkText,'https://www.youtube.com/feed/history','guide-history-icon'));}
function restoreMyChannel(){const donor=document.querySelector('#creation-live-menu-item');if(document.querySelector('#my-channel-guide-item')||!donor){return;}
const url=donor.href.replace('studio.youtube.com','youtube.com').replace('/livestreaming','');if(url.indexOf('create_channel')>=0){return;}
const linkText=chrome.i18n.getMessage('my_channel_menu_title');['what_to_watch-guide-item','trending-guide-item'].some(id=>insertMenuItemAfter(document.querySelector(`#${id}`),'my-channel-guide-item',linkText,url,'guide-my-channel-icon'));}
chrome.runtime.sendMessage({type:'getOptions'},(options)=>{function restoreShowMoreButton(){const actionPanel=document.getElementById('action-panel-details');const showMore=document.querySelector('button[data-gen204="feature=watch-show-more-metadata"]');if(!actionPanel||showMore){return;}
actionPanel.insertAdjacentHTML('beforeend','<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-expander yt-uix-expander-head yt-uix-expander-collapsed-body yt-uix-gen204" type="button" onclick="return false;" data-gen204="feature=watch-show-more-metadata"><span class="yt-uix-button-content">Show more</span></button>'+'<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-expander yt-uix-expander-head yt-uix-expander-body" type="button" onclick="return false;"><span class="yt-uix-button-content">Show less</span></button>');}
document.documentElement.addEventListener('click',e=>{let node=e.target;const anchor=node.closest('a');if(!anchor){return;}
const isOldInterface=document.body.hasAttribute('data-spf-name');const currentPageFixMethod=isOldInterface?getPageFixMethod(location.href,options):'off';const method=getPageFixMethod(anchor.href,options);if(method===currentPageFixMethod){return;}
const spLinkSelector=isOldInterface?'spf-link':'yt-simple-endpoint';while(node&&node.parentElement){node.classList.remove(spLinkSelector);node=node.parentElement;}},true);const cleanupAndRestore=()=>{cleanup();restoreShowMoreButton();restoreHistory();restoreMyChannel();}
window.addEventListener('spfdone',cleanupAndRestore);window.addEventListener('DOMContentLoaded',cleanupAndRestore);});cleanup();