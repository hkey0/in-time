// Open options page when extension icon is clicked
const actionAPI = typeof browser !== "undefined" ? browser.action : chrome.action;
const runtimeAPI = typeof browser !== "undefined" ? browser.runtime : chrome.runtime;

actionAPI.onClicked.addListener(() => {
  runtimeAPI.openOptionsPage();
});


