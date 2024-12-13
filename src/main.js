// @ts-check
import { routes } from "@src/routing/routes";

function runPageScript() {
    console.log("wzl script injected");
    const pageUrl = window.location.href.trim();

    const [key, pageItem] = Object.entries(routes).find(([, { test }]) => test.test(pageUrl));

    console.log("wlz page target", key);

    pageItem?.action();
}

function runBackgroundScript() {
    const env = process.env.NODE_ENV;
    const isProduction =env === "production"

    console.log("background script", {env,isProduction});

    if (isProduction) return;

    chrome.runtime.onInstalled.addListener(event => {
        if (!/(update)|(install)/.test(event.reason)) return;

        chrome.tabs.query({}, function (tabs) {
            for (let tab of [...tabs]) {
                const isWyzantSite = /wyzant.com\/tutor/i;

                if (!tab?.id || !tab.url || !isWyzantSite.test(tab.url)) {
                    continue;
                }
                chrome.tabs.reload(tab.id);
            }
        });
    });
}

function runScript() {
    // if in window then run pageScript
    // if in background then run backgroundScript
    const contentWindow = typeof window !== "undefined" && window?.location;

    if (!contentWindow) {
        runBackgroundScript();
    } else {
        runPageScript();
    }
}

runScript();
