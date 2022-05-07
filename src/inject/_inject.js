// @ts-check
import Lessons from "./lessons"
import RateFinder from "./rate_finder"
import { setupJobApplicationPage } from "./setupJobApplicationPage"

/**@typedef {{title,time,description,rate:Number}} StudentInfo */

function init() {
	console.log("wzl script injected")
	let page_url = window.location.href.trim()

	const LOCATION_TRIGGER_TOKENS = {
		job_application_submit_page: /https:\/\/www.wyzant.com\/tutor\/jobs\/\d+/,
		message_page: /https:\/\/www.wyzant.com\/tutor\/messaging/,
		lessons_page: /https:\/\/www.wyzant.com\/tutor\/lessons/,
		// students_info_page: /https:\/\/www.wyzant.com\/tutor\/students\/index/,
	}

	let [page] = Object.entries(LOCATION_TRIGGER_TOKENS)
		.filter(([key, value]) => page_url.match(value))
		.map(([key]) => key)

	console.log("wlz page target", page)

	switch (page) {
		case "students_info_page":
		case "message_page": {
			console.log("wzl message_page")
			insertWZLPlaceholder()
			showWzlIndicator().addEventListener("click", wzlConvoClickHandler)
			break
		}
		case "job_application_submit_page": {
			//change hourly-rate input to number
			console.log("wzl job_application_submit_page")
			setupJobApplicationPage()
			break
		}
		case "lessons_page": {
			insertWZLPlaceholder()
			showWzlIndicator().addEventListener("click", () => {
				showSpinner()
				Lessons(makeProfileElement(), window.location.href)
				hideSpinner()
			})
			break
		}
		default:
			break
	}
}

function isConvoPage(_url) {
	return ["", _url].join("").includes("conversation")
}

const RenderJobPostDetails = (student_result_info) => {
	let wzl_profile = makeProfileElement()
	wzl_profile.innerHTML = makeWzlStudentCard(makeStudentAdapter(student_result_info))

	//add close and reset listeners
	document.querySelector(".wzl-card--close").addEventListener("click", () => closeWzlCard(false))
	document.querySelector(".wzl-card--reset").addEventListener("click", () => closeWzlCard(true))
	console.log("%c job post details ready", "background:lightyellow")
	return
}
function makeProfileElement() {
	let wzl_profile = document.querySelector(".wzl-profile")

	if (!wzl_profile) {
		wzl_profile = document.createElement("div")
		document.querySelector(".wzl-container").appendChild(wzl_profile)
	}

	wzl_profile.classList.add("wzl-profile")
	return wzl_profile
}

//check for document readystate
// document.querySelector("#messaging-app").addEventListener("click", messageDocumentClickHandler);

function messageDocumentClickHandler(event) {
	let previous_card = document.querySelector(".wzl-profile")

	if (previous_card) previous_card.remove()

	showSpinner()

	console.log("messageDocumentClickHandler fired")
	let _convo = getConversationSummary(event.currentTarget)

	if (!_convo) {
		console.log("target is not a .conversation-summary-wrap")
		return
	}

	let selected_student = document.querySelector(".selected p.username")

	if (!selected_student) return

	let [student_first_name] = selected_student.textContent.trim().split(" ")

	let { iframe, is_new } = addIFrame()

	console.log({ selected_student })

	Promise.all([getStudentJobPostPromise(is_new, iframe, student_first_name), getStudentRatePromise(selected_student)]).catch(() => alert("Error while fetching job info and hourly rate info"))
}

function getStudentJobPostPromise(/**@type Boolean*/ isIframeNew, /**@type HTMLIFrameElement */ iframe, student_first_name) {
	return new Promise((res) => {
		if (false && !isIframeNew) {
			return res(findStudentResult(iframe, student_first_name))
		}

		let _interval = setInterval(() => {
			//resolve if job-results are found
			console.log("interval running")
			// @ts-ignore
			if (Array.from(iframe.contentWindow.document.querySelectorAll(".job-result")).length) {
				clearInterval(_interval)

				return res(findStudentResult(iframe, student_first_name))
			}
		}, 400)
	})
		.then(RenderJobPostDetails)
		.finally(() => hideSpinner())
}

function getStudentRatePromise(selected_student) {
	let rendererFn = renderStudentRate()

	return RateFinder()
		.getStudent(selected_student.textContent.trim())
		.then(rendererFn, () => rendererFn({ name: "", rate_online: "NA", rate_inperson: "NA" }))
}

function renderStudentRate() {
	console.log("renderStudentRate fired")
	let rate_p_element

	return (student_rate_info) => {
		console.log("rate render interval fired")
		let rate_interval = setInterval(() => {
			if ((rate_p_element = document.querySelector("p.wzl-student--rate"))) {
				clearInterval(rate_interval)
				console.log("%c rate ready", "background:lightblue")
				return (rate_p_element.innerHTML = ` Online: <strong>${student_rate_info.rate_online}</strong>, Inperson: <strong>${student_rate_info.rate_inperson}</strong>`)
			}
		}, 200)
	}
}

function getConversationSummary(element) {
	return element.closest(".conversation-summary-wrap")
}

function insertWZLPlaceholder() {
	let wzl_container

	if (!(wzl_container = document.querySelector(".wzl-container"))) {
		wzl_container = document.createElement("div")
		wzl_container.classList.add("wzl", "wzl-container")
		wzl_container.appendChild(makeSpinner())
		document.body.appendChild(wzl_container)
		console.log("wzl-container appended to body")
	}
	return wzl_container
}

function makeWzlStudentCard(student_info) {
	if (!student_info) return

	return `
	<div class="wzl-card bg-hue">
		<span class="wzl-card--close">X</span>
		<span class="wzl-card--reset">Close & Reset</span>
		<div class="wzl-card--avatar"></div>
		<div class="wzl-card--body wzl-student">
			<p class="wzl-student--username">${student_info.title}</p>
			<div class="wzl-student--subject">
				<p>${student_info.time}</p>
				<p class="wzl-student--rate">Online: NA Inperson: NA</p>
			</div>
			<p class="wzl-student--description">${student_info.description}</p>
		</div>
	</div>
	`
}

function closeWzlCard(reset) {
	//remove
	document.querySelector(".wzl-card").remove()

	if (reset ?? false) {
		let { iframe } = addIFrame()
		iframe.remove()

		//remove wzl from messages\
		Array.from(document.querySelectorAll(".conversation-summary-wrap"))
			.filter((convo) => convo.classList.contains("wzl-listener-active"))
			.forEach((convo) => {
				convo.classList.remove("wzl-listener-active")
				convo.removeEventListener("click", messageDocumentClickHandler)
			})

		document.querySelector(".show-more a.btn").removeEventListener("click", showMoreConvoBtnClick)

		deActivateWzlIndicator()
	}
}

function makeSpinner() {
	let spinner_html = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`
	let spinner_container = document.createElement("div")
	spinner_container.classList.add("wzl-spinner-container")
	spinner_container.innerHTML = spinner_html
	return spinner_container
}

/**
 *
 * @returns {{iframe: HTMLIFrameElement, is_new: Boolean} }
 */
function addIFrame() {
	//remove existing iframe element
	let /**@type HTMLIFrameElement */ wzl_iframe = document.querySelector("#wzl_iframe")

	let is_new = !wzl_iframe

	if (is_new) {
		wzl_iframe = document.createElement("iframe")

		wzl_iframe.setAttribute("width", "300")
		wzl_iframe.setAttribute("height", "200")
		wzl_iframe.classList.add("wzl_iframe")
		wzl_iframe.setAttribute("id", "wzl_iframe")

		wzl_iframe.setAttribute("src", "https://www.wyzant.com/tutor/jobapplication/history?sort=1&pagenumber=0&pagesize=100")

		document.querySelector(".wzl-container").appendChild(wzl_iframe)
	}

	return { iframe: wzl_iframe, is_new }
}

function showWzlIndicator() {
	let wzl_cont = document.querySelector(".wzl-container")
	let ready_indicator = document.createElement("button")
	ready_indicator.textContent = "Wzl Ready"
	ready_indicator.classList.add("wzl_indicator")
	ready_indicator.setAttribute("tooltip", "Click to enable profile lookup of students (underlined)")
	wzl_cont.appendChild(ready_indicator)
	return ready_indicator
}

function wzlConvoClickHandler(event) {
	//add event lister to all conversation summary items
	let convos = Array.from(document.querySelectorAll(".conversation-summary-wrap")).filter((convo) => !convo.classList.contains("wzl-listener-active"))
	if (convos.length) {
		convos.forEach((convo) => {
			convo.classList.add("wzl-listener-active")
			convo.addEventListener("click", messageDocumentClickHandler)
		})

		activateWzlIndicator()
	}

	//dont assign the listener twice
	document.querySelector(".show-more a.btn").removeEventListener("click", showMoreConvoBtnClick)
	document.querySelector(".show-more a.btn").addEventListener("click", showMoreConvoBtnClick)
}

function showMoreConvoBtnClick(event) {
	deActivateWzlIndicator()
}

function activateWzlIndicator() {
	document.querySelector(".wzl_indicator").classList.add("wzl_indicator_active")
}
function deActivateWzlIndicator() {
	document.querySelector(".wzl_indicator").classList.remove("wzl_indicator_active")
}

function findStudentResult(iframe, student_first_name) {
	console.log("findStudentResult called")
	let job_nodes = iframe.contentWindow.document.querySelectorAll(".job-result")
	let jobs = Array.from(job_nodes)
	let first_found = jobs.find((job) => job.textContent.includes(student_first_name))
	return first_found
}

/**@return StudentInfo */
function makeStudentAdapter(job_result) {
	let result = {
		title: "Info not found",
		time: "Info not found",
		description: "Info not found in recent 100 submitted job applications",
		rate: -1,
	}

	if (job_result) {
		result = {
			title: job_result.querySelector(".job-result h4").textContent,
			time: `${job_result.querySelectorAll(".job-result p")[2].textContent}`,
			description: job_result.querySelectorAll(".job-result p")[0].textContent,
			rate: 0,
		}
	}

	return result
}

function wzlProfile(event) {
	event.target.closest(".wzl-profile").remove()
}

function showSpinner() {
	document.querySelector(".wzl-spinner-container").classList.add("show")
}

function hideSpinner() {
	document.querySelector(".wzl-spinner-container").classList.remove("show")
}

init()
