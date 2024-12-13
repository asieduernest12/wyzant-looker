import { makeRouteHandlerConfig } from "@src/routing/makeRouteHandlerConfig";
import { insertWZLPlaceholder, showWzlIndicator } from "@src/services/helpers";
import lessonReviewSubmissionTemplateText from "@src/templates/lessonReviewSubmission.tmpl.txt";

export const submitLessonReview = makeRouteHandlerConfig({
    test: /wyzant.com\/tutor\/submitlesson\/detail?.+=.+/i,
    action: () => {
        insertWZLPlaceholder();
        showWzlIndicator();

        const lessonReportTextField = /** @type {HTMLTextAreaElement} */ (document.querySelector("textarea[name=LessonReview][id=LessonReview]"));
        const studentName = document.querySelector('a[href^="/tutor/students/view?suid"]')?.textContent?.replace(/\n|\W{3,}/g, "");
        const studentSubject = /** @type {HTMLSelectElement} */ (document.querySelector("select[name=SubjectID][id=SubjectID]"))?.selectedOptions[0]?.text?.replace(
            /\n|\W{3,}/g,
            ""
        );

        if ([studentName, studentSubject, lessonReportTextField].some(x => !x)) {
            console.log("abort lesson review prefill");
            alert("abort: lesson review prefill");
            return;
        }

        const processedTemplate = ("" + lessonReviewSubmissionTemplateText).replaceAll("[name]", studentName).replaceAll("[subject]", studentSubject);

        lessonReportTextField.value = processedTemplate;

        /**
         * add a mutationObserver
         * on nodes added: find input[name=confirmLesson] and sibling label
         * add [id=confirmLesson] to input[name=confirmLesson]
         * add [for="confirmLesson"] to the label
         */
        const observer = new MutationObserver(mutationsList => {
            const isMutationTypeChildList = mutationsList.some(mutation => mutation.type === "childList");

            if (!isMutationTypeChildList) return;

            const confirmLessonInput = document.querySelector("input[name=confirmLesson]");
            const confirmLessonLabel = confirmLessonInput?.nextElementSibling;

            if (!confirmLessonInput || !confirmLessonLabel) {
                return;
            }

            confirmLessonInput.id = "confirmLesson";
            confirmLessonLabel.setAttribute("for", "confirmLesson");
            observer.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    },
});
