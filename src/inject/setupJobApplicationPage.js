

export function setupJobApplicationPage() {
	let hourly_rate_input = document.querySelector("input[name=hourly_rate]")

	if (!hourly_rate_input) throw alert("hourly_rate_input is null")

	hourly_rate_input.setAttribute("type", "number")
	hourly_rate_input.setAttribute("step", "5")

	adjustPriceUpOnJobApplicationPage(document.querySelector(".hourly-rate-label + p"), hourly_rate_input)

	selectDefaultApplicationMessageResponse()

	focusSubmitButton()
}

function focusSubmitButton() {
	let /**@type HTMLElement */ button = document.querySelector("input[type=submit]")

	if (!button) throw alert("input[type=submit] not found")

	button.focus()
}

function adjustPriceUpOnJobApplicationPage(/**@type HTMLElement*/ hour_rate_label_node, /**@type HTMLInputElement*/ hourly_rate_input_node) {
	if (!hourly_rate_input_node || !hour_rate_label_node) return

	let [hour_rate_label_value] = hour_rate_label_node.textContent.match(/\d*$/)

	if (!isJobOfferHigher(hour_rate_label_value, hourly_rate_input_node)) {
		return
	}

	console.log("high offer present")

	if (Number(hour_rate_label_value) <= 70) {
		console.log("charge exact offer")
		hourly_rate_input_node.value = "" + Number(hour_rate_label_value)
	} else {
		console.log("charging base plus difference")
		let difference = 0.6 * (Number(hour_rate_label_value) - 70)
		hourly_rate_input_node.value = "" + Math.ceil((70 + difference) / 5) * 5
	}
}

function isJobOfferHigher(hour_rate_label_value, hourly_rate_input_node) {
	return Number(hour_rate_label_value) > parseInt(hourly_rate_input_node.value)
}

function selectDefaultApplicationMessageResponse(){
	let default_response_option = Array.from(document.querySelectorAll("select[name=template_select] > option").values()).find(({ textContent }) => textContent === "default application")

	if (!default_response_option) return

	// @ts-ignore
	document.querySelector("select[name=template_select]").value = default_response_option.value

	document.querySelector("textarea#personal_message").value = default_response_option.value
}
