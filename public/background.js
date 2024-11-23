// import browser from "webextension-polyfill";
console.log("Background script loaded.");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractData") {
        console.log("Message received in background:", message);
        console.log("Forwarding to content script...");

        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            browser.tabs.sendMessage(tabs[0].id, message, (response) => {
                sendResponse(response);
            });
        });
        return true; // Required to use async sendResponse
    }

    if (message.action === "updateData") {
        console.log("Output received in background:", message);
        // console.log("Forwarding to content script...");

        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            browser.tabs.sendMessage(tabs[0].id, message, (response) => {
                sendResponse(response);
            });
        });
        return true; // Required to use async sendResponse
    }
});