function init() {
	console.log("wzl script injected")
	let page_url = window.location.href.trim()

	const LOCATION_TRIGGER_TOKENS = { job_application_submit_page: /https:\/\/www.wyzant.com\/tutor\/jobs\/\d+/, message_page: /https:\/\/www.wyzant.com\/tutor\/messaging/ }

	let [page] = Object.entries(LOCATION_TRIGGER_TOKENS).filter(([key, value]) => page_url.match(value)).map(([key]) => key)

	console.log('wlz page target', page)

	switch (page) {
		case 'message_page':
			console.log("wzl message_page");
			insertWZLPlaceholder();
			showWzlIndicator();

			break;
		case 'job_application_submit_page': {
			//change hourly-rate input to number
			console.log("wzl job_application_submit_page");
			setupJobApplicationPage()
			break
		}

		default:
			break;
	}
}

function setupJobApplicationPage() {
	let hourly_rate_input = document.querySelector('input[name=hourly_rate]')
	hourly_rate_input.setAttribute('type', 'number')
	hourly_rate_input.setAttribute('step', '5')
}

function isConvoPage(_url) {
	return ["", _url].join("").includes("conversation");
}

//check for document readystate
// document.querySelector("#messaging-app").addEventListener("click", messageDocumentClickHandler);

async function messageDocumentClickHandler(event) {
	let previous_card = document.querySelector(".wzl-profile");
	if (!!previous_card) previous_card.remove();

	showSpinner();

	console.log("messageDocumentClickHandler fired");
	let _convo = !getConversationSummary(event.currentTarget);

	if (_convo) {
		console.log("target is not a .conversation-summary-wrap");
		return;
	}

	let selected_student = document.querySelector(".selected p.username");

	if (!selected_student) return;

	let [student_first_name] = selected_student.textContent.trim().split(" ");

	let iframe = addIFrame();
	document.querySelector(".wzl-container").appendChild(iframe);
	console.log({ selected_student });

	setTimeout(() => {
		hideSpinner();
		let job_result = findStudentResult(iframe, student_first_name);
		let student_info = makeStudentAdapter(job_result);
		console.log({ job_result });
		iframe.remove();

		let wzl_profile = document.createElement("div");
		wzl_profile.classList.add("wzl-profile");
		wzl_profile.innerHTML = makeWzlStudentCard(student_info);
		document.querySelector(".wzl-container").appendChild(wzl_profile);
	}, 9000);
}

function getConversationSummary(element) {
	return element.closest(".conversation-summary-wrap");
}

function insertWZLPlaceholder() {
	if (!document.querySelector(".wzl-container")) {
		let wzl = document.createElement("div");
		wzl.classList.add("wzl", "wzl-container");
		wzl.appendChild(makeSpinner());
		document.body.appendChild(wzl);
		console.log("wzl-container appended to body");
	}
}

function makeWzlStudentCard(student_info) {
	return `
	<div class="wzl-card">
		<span class="wzl-card--close" onClick="document.querySelector('.wzl-card').remove()">X</span>
		<div class="wzl-card--avatar"></div>
		<div class="wzl-card--body wzl-student">
			<p class="wzl-student--username">${student_info.title}</p>
			<p class="wzl-student--subject">${student_info.time}</p>
			<p class="wzl-student--description">${student_info.description}</p>
		</div>
	</div>
	`;
}

function makeSpinner() {
	let spinner_html = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
	let spinner_container = document.createElement("div");
	spinner_container.classList.add("wzl-spinner-container");
	spinner_container.innerHTML = spinner_html;
	return spinner_container;
}

function addIFrame() {
	//remove existing iframe element
	let previous_iframe = document.querySelector("#wzl_iframe");
	if (!!previous_iframe) previous_iframe.remove();

	let wzl_iframe = document.createElement("iframe");
	wzl_iframe.setAttribute("src", "https://www.wyzant.com/tutor/jobapplication/history?sort=1&pagenumber=0&pagesize=100");
	wzl_iframe.setAttribute("width", "300");
	wzl_iframe.setAttribute("height", "200");
	wzl_iframe.classList.add("wzl_iframe");
	wzl_iframe.setAttribute("id", "wzl_iframe");
	return wzl_iframe;
}

function showWzlIndicator() {
	let wzl_cont = document.querySelector(".wzl-container");
	let ready_indicator = document.createElement("button");
	ready_indicator.textContent = "Wzl Ready";
	ready_indicator.classList.add("wzl_indicator");
	ready_indicator.setAttribute("tooltip", "Click to enable profile lookup of students (underlined)");
	wzl_cont.appendChild(ready_indicator);
	ready_indicator.addEventListener("click", wzlConvoClickHandler);
}

function wzlConvoClickHandler(event) {
	//add event lister to all conversation summary items
	let convos = Array.from(document.querySelectorAll(".conversation-summary-wrap")).filter((convo) => !convo.classList.contains("wzl-listener-active"));
	if (convos.length) {
		convos.forEach((convo) => {
			convo.classList.add("wzl-listener-active");
			convo.addEventListener("click", messageDocumentClickHandler);
		});

		activateWzlIndicator();
	}

	//dont assign the listener twice
	document.querySelector(".show-more a.btn").removeEventListener("click", showMoreConvoBtnClick);
	document.querySelector(".show-more a.btn").addEventListener("click", showMoreConvoBtnClick);
}

function showMoreConvoBtnClick(event) {
	deActivateWzlIndicator();
}

function activateWzlIndicator() {
	document.querySelector(".wzl_indicator").classList.add("wzl_indicator_active");
}
function deActivateWzlIndicator() {
	document.querySelector(".wzl_indicator").classList.remove("wzl_indicator_active");
}

function findStudentResult(iframe, student_first_name) {
	console.log("findStudentResult called");
	let job_nodes = iframe.contentWindow.document.querySelectorAll(".job-result");
	let jobs = Array.from(job_nodes);
	let [first_found] = jobs.filter((job) => job.textContent.includes(student_first_name));
	return first_found;
}

function makeStudentAdapter(job_result) {
	if (!!job_result) {
		return {
			title: job_result.querySelector(".job-result h4").textContent,
			time: job_result.querySelectorAll(".job-result p")[2].textContent,
			description: job_result.querySelectorAll(".job-result p")[0].textContent,
		};
	}

	return {
		title: "Info not found",
		time: "Info not found",
		description: "Info not found in recent 100 submitted job applications",
	};
	//h4 p1,p3
}

function wzlProfile(event) {
	event.target.closest(".wzl-profile").remove();
}

function showSpinner() {
	document.querySelector(".wzl-spinner-container").classList.add("show");
}

function hideSpinner() {
	document.querySelector(".wzl-spinner-container").classList.remove("show");
}

init()