/**
 * @author Ernest Asare-Asiedu
 * @create date 2021-07-22 15:18:35
 * @modify date 2021-07-22 15:18:35
 */

chrome.runtime.onInstalled.addListener(async function (tab, statusInfo, response) {

  console.log('sw installed',statusInfo)
  
});



//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });