chrome.action.onClicked.addListener((tab) => {
    
  console.log("on action click")
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['inject.js']
  });
});
