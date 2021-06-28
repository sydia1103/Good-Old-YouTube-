const OPTIONS = [
  'pageHome', 'pageFeed', 'pageVideo', 'pagePlaylist', 'pageChannel', 'pageGaming', 'pageResults', 'pageOthers'
];

function showCurrentOptions(options) {
  OPTIONS.forEach(id => {
    const input = document.getElementById(id);
    if (input.type === 'checkbox') {
      input[options[id] ? 'setAttribute' : 'removeAttribute']('checked', true);
    } else {
      input.value = options[id];
    }
  });
}

getOptions((options) => {
  function generatePageFixOptions() {
    const html = Object.keys(PAGES).map((key) => {
      const { name, methods } = PAGES[key];
      const optNames = [...new Set(methods.concat(['headers', 'off']))];
      const opts = optNames.map(n => {
        return `<option value="${n}" ${options[key] === n ? 'selected' : ''}>
          ${n} ${(n === 'off' || methods.includes(n)) ? '' : '(broken)'}
        </option>`
      }).join('');
      return `
      <div>
        <label for="${key}">${name}</label>
        <select id="${key}">${opts}</select>
      </div>
    `;
    }).join('');

    document.getElementById('pageFixes').innerHTML = html;
  }

  generatePageFixOptions();

  showCurrentOptions(options);

  OPTIONS.forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('change', () => setOption(id,
      input[input.type === 'checkbox' ? 'checked' : 'value']
    ));
  });

  document.body.addEventListener('click', (ev) => {
    if (ev.target.id === 'resetAll') {
      resetOptions();
      showCurrentOptions(options);
    }
  });
});
