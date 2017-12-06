function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    console.log("url", url);

    var clipboard = new Clipboard('.button-clipboard');
    var mainInput = document.querySelector('#mainInput');
    var hint = document.querySelector('#hint');
    var longUrl = document.querySelector('#long-url');

    longUrl.textContent = url;

    clipboard.on('success', function(e) {
      hint.style.display = 'block';
      setTimeout(function() {
        hint.style.display = 'none';
      }, 1000);
    });

    fetch('http://localhost:1323/api/shorten/' + b64EncodeUnicode(url) , {
      mode: 'cors',
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(text) {
        mainInput.value = "https://short.gg/" + text;
      })
      .catch(function(error) {
        console.log('Request failed', error)
      });

  });
});
