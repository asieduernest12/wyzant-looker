// @ts-check
import { routes } from "@src/routing/routes";

function init() {
    console.log("wzl script injected");
    const pageUrl = window.location.href.trim();

    const [key, pageItem] = Object.entries(routes).find(([, { test }]) => test.test(pageUrl));

    console.log("wlz page target", key);

    pageItem?.action();
}

init();
