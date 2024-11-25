import { makeRouteHandlerConfig } from "@src/routing/makeRouteHandlerConfig";
import { hideSpinner, insertWZLPlaceholder, makeProfileElement, showSpinner, showWzlIndicator } from "@src/services/helpers";
import Lessons from "@src/services/lessons";

export const lessons_page = makeRouteHandlerConfig({
    test: /(https:\/\/www.)?wyzant.com\/tutor\/lessons/,
    action: () => {
        insertWZLPlaceholder();
        showWzlIndicator().addEventListener("click", () => {
            showSpinner();
            Lessons(makeProfileElement(), window.location.href);
            hideSpinner();
        });
    },
});
