import { makeRouteHandlerConfig } from "@src/routing/makeRouteHandlerConfig";
import { insertWZLPlaceholder, showWzlIndicator, wzlConvoClickHandler } from "@src/services/helpers";

export const message_page = makeRouteHandlerConfig({
    test: /(https:\/\/www.)?wyzant.com\/tutor\/messaging/,
    action: () => {
        console.log("wzl message_page");
        insertWZLPlaceholder();
        showWzlIndicator().addEventListener("click", wzlConvoClickHandler);
    },
});
