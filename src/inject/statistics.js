import { AlertError } from "./rate_finder"

export default function StatisticsPage(/**@type string*/ url) {
	if (!url.includes("https://www.wyzant.com/tutor/statistics")) {
		throw new AlertError("Error: url does not match expected statistics sequence")
	}

	let time_period_select = document.querySelector('select#timePeriod')

	if (!time_period_select) throw new AlertError("Error time_period select not found")

	time_period_select.click()

	let this_month_option = time_period_select.querySelector('option[value="1"]')

	if (!this_month_option) throw new AlertError("Error this month element not found")

	// @ts-ignore
	setTimeout(() => {
		this_month_option.setAttribute("selected", "")
		this_month_option.click()
	}, 2000)
}
