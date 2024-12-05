import { job_application_submit_page } from "@src/pages/job_app_page";
import { lessons_page } from "@src/pages/lessons_page";
import { message_page } from "@src/pages/message_page";
import { statistics_page } from "@src/pages/statistics_page";
import { submitLessonReview } from "@src/pages/submitLessonReview";
import { makeRoutes } from "@src/routing/makeRouteHandlerConfig";

const routes = makeRoutes({
    job_application_submit_page,
    message_page,
    lessons_page,
    statistics_page,
    submitLessonReview,
});

export { routes };
