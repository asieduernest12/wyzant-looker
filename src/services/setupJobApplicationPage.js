import { AlertError } from "@src/services/rate_finder";

const getHourlyRateInput = () => /** @type {HTMLInputElement} */ (document.querySelector("input[name=hourly_rate]"));
const getSubmitButton = () => /** @type {HTMLButtonElement} */ (document.querySelector("input[type=submit]"));

const makeForceSubmitButton = () => {
    const forceSubmitButton = document.createElement("button");
    forceSubmitButton.classList.add("btn", "old-btn-color");
    forceSubmitButton.setAttribute("title", "force submit using current value indicated");
    forceSubmitButton.textContent = ">>";
    return forceSubmitButton;
};

export function setupJobApplicationPage() {
    const hourly_rate_input = getHourlyRateInput();

    if (!hourly_rate_input) throw new AlertError("Error: hourly_rate_input is null");

    hourly_rate_input.setAttribute("type", "number");
    hourly_rate_input.setAttribute("step", "5");

    adjustPriceUpOnJobApplicationPage(document.querySelector(".hourly-rate-label + p"), hourly_rate_input);

    selectDefaultApplicationMessageResponse();

    focusSubmitButton();
    setupForceSubmit();

    makeJobDetailsCardPositionSticky();
}

function setupForceSubmit(/** @type {HTMLButtonElement}*/ submitButton = getSubmitButton(), hourlyRateInput = getHourlyRateInput()) {
    if (!submitButton?.parentNode) return;
    // make force submit
    const forceSubmitButton = makeForceSubmitButton();

    // attach append as next sibling to submit
    submitButton.parentNode.appendChild(forceSubmitButton);

    // setup force submit click
    forceSubmitButton.addEventListener("click", () => {
        // force submit click

        // 1 update value attribute on input to match its actual value
        hourlyRateInput.setAttribute("value", Number(hourlyRateInput.value));

        // 2 trigger submit
        submitButton.click();
    });
}

function focusSubmitButton(button = getSubmitButton()) {
    if (!button) throw new AlertError("Error: input[type=submit] not found");

    button.focus();
}

function adjustPriceUpOnJobApplicationPage(/** @type {HTMLElement} */ hour_rate_label_node, /** @type {HTMLInputElement} */ hourly_rate_input_node) {
    if (!hourly_rate_input_node || !hour_rate_label_node) return;

    const [hour_rate_label_value] = hour_rate_label_node.textContent.match(/\d*$/);

    if (!isJobOfferHigher(hour_rate_label_value, hourly_rate_input_node)) {
        return;
    }

    console.log("high offer present");

    if (Number(hour_rate_label_value) <= 70) {
        console.log("charge exact offer");
        hourly_rate_input_node.value = `${Number(hour_rate_label_value)}`;

        if (Number(hour_rate_label_value) % 5 !== 0) {
            hourly_rate_input_node.removeAttribute("step");
        }
    } else {
        console.log("charging base plus difference");
        const difference = 0.6 * (Number(hour_rate_label_value) - 70);
        hourly_rate_input_node.value = `${Math.ceil((70 + difference) / 5) * 5}`;
    }
}

/**
 * @param {string} hour_rate_label_value
 * @param {HTMLInputElement} hourly_rate_input_node
 */
function isJobOfferHigher(hour_rate_label_value, hourly_rate_input_node) {
    return Number(hour_rate_label_value) > parseInt(hourly_rate_input_node.value);
}

function selectDefaultApplicationMessageResponse() {
    const default_response_option = Array.from(/** @type {NodeListOf<HTMLSelectElement>} */ (document.querySelectorAll("select[name=template_select] > option")).values()).find(
        ({ textContent }) => textContent === "default application"
    );

    if (!default_response_option) return;

    const jobAppTransformers = /** @satisfies {Array<{target:string|RegExp,extract:()=>string|undefined}>} */ ([
        { target: /\[there\]/g, extract: () => document.querySelector("h4.spc-zero-n")?.textContent?.trim() },
        {
            target: /\[challenge\]/g,
            extract: () => document.querySelector("h1.spc-zero-n")?.textContent?.trim() ?? "unspecified",
        },
        { target: /\[job-description\]/g, extract: () => document.querySelector(".job-description")?.textContent?.trim() },
    ]);

    // @ts-ignore
    document.querySelector("select[name=template_select]").value = default_response_option?.value;

    const jobAppTxtArea = /** @type {HTMLTextAreaElement} */ (document.querySelector("textarea#personal_message"));

    jobAppTxtArea.value = jobAppTransformers
        .reduce((txt, { extract, target }) => {
            const [_extracted, target_exists] = [extract(), new RegExp(target).test(txt)];

            if (!_extracted || !target_exists) return txt;

            return txt.replace(target, ["[", _extracted, "]"].join(""));
        }, default_response_option?.value)
        ?.replace(/\n{3,}/g, "\n\n");
}

function makeJobDetailsCardPositionSticky() {
    const /** @type {HTMLElement|null} */ job_details_card = document.querySelector(".columns.medium-4");

    if (!job_details_card) throw new AlertError("Error: job_details_card not found");

    job_details_card.style.position = "sticky";
    job_details_card.style.top = "10px";
}
