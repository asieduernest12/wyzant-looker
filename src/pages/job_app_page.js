import { makeRouteHandlerConfig } from "@src/routing/makeRouteHandlerConfig";
import { setupJobApplicationPage } from "@src/services/setupJobApplicationPage";

export const job_application_submit_page = makeRouteHandlerConfig({
    test: /(https:\/\/www.)?wyzant.com\/tutor\/job(application\/apply|s)\/\d+/,
    action: () => {
        // change hourly-rate input to number
        console.log("wzl job_application_submit_page");
        setupJobApplicationPage();
    },
});
