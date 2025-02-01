const URL_REGEX = /^https:\/\/vod\.sooplive\.co\.kr\/player\/.+$/;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && URL_REGEX.test(changeInfo.url)) {
      console.log('change url:', changeInfo.url, URL_REGEX.test(changeInfo.url))
      chrome.tabs.sendMessage( tabId, {
        message: 'change_url',
        url: changeInfo.url
      })
    }
  }
);