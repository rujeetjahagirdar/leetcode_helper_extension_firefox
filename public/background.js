// import browser from "webextension-polyfill";
console.log("Background script loaded.");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractData" || message.action === "updateData") {
        console.log("Message received in background:", message);
        console.log("Forwarding to content script...");

        (async () => {
            try {
                let tabs = await browser.tabs.query({ active: true, currentWindow: true });
                let response = await browser.tabs.sendMessage(tabs[0].id, message);
                sendResponse(response);
            });
        });
        return true; // Required to use async sendResponse
    }


    return false; // Default response
});

// Improvement: Add a listener for when extension is installed or updated
browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed or updated:", details.reason);
});
