export default function RateFinder() {
	let iframe
	let results
	let students_map
	let page_index

	async function getStudent(/**@type string*/ student_name) {
		// return getStudentsMap().get(student_name) ?? queryIframeForStudent(student_name)
		if (getStudentsMap().has(student_name)) return getStudentsMap().get(student_name)

		let student_rows
		let student

		iframe= document.querySelector('#wzl_rates_iframe')

		while (!student) {
			console.log(student_rows)
			await queryIframeForStudent(student_name, page_index)
			student_rows = getStudentRows(iframe.contentWindow.document)
			student = convertStudentRowToInfo(findStudentRow(student_rows, student_name))
			updateStudentsMap(student_rows)
		}

		console.log(student_rows)

		return student
	}

	function updateStudentsMap(trs) {
		for (const tr of trs) {
			let student = convertStudentRowToInfo(tr)
			getStudentsMap().set(student.name, student)
		}

		console.log("updateStudentsMap fired")
	}

	function queryIframeForStudent(student_name, /**@type number*/ page_index) {
		if (!iframe) {
			iframe = document.createElement("iframe")
			iframe.setAttribute("width", "300")
			iframe.setAttribute("height", "200")
			iframe.classList.add("iframe")
			iframe.setAttribute("id", "wzl_rates_iframe")

			iframe.setAttribute("src", "https://www.wyzant.com/tutor/students/index")

			document.querySelector(".wzl-container").appendChild(iframe)
		}

		if (page_index) {
			let next_btn_link = [...iframe.contentWindow.document.querySelectorAll(".ui-page-navigation")].at(-2)

			if (!next_btn_link) throw alert("Error: next_btn_link not found")

			next_btn_link.click()
		}

		return new Promise((res, rej) => {
			setInterval(() => {
				if (iframe.contentWindow.document.querySelector("#studentConnectionsList:not(.ui-overlay)")) {
					page_index = (page_index ?? 0) + 1
					res([page_index, iframe])
				}
			}, 400)
		})
	}

	/**@return {Map} */
	function getStudentsMap() {
		students_map = students_map ?? new Map()

		return students_map
	}

	/**@return {trs:Element[]} */
	function getStudentRows(/**@type Document*/ document) {
		return document.querySelectorAll(".SearchTable.wyzTable tr")
	}

	/**@alias {StudentRow} */
	function findStudentRow(/**@type {Element[]} */ trs, /**@type String */ student_name) {
		if (!trs) throw alert("Error: Invalid trs")

		if (!student_name) throw alert("Error:student_name invalid")

		return [...trs].find((tr) => {
			return tr.querySelector("a").textContent.toLowerCase() == student_name.toLowerCase()
		})
	}

	function convertStudentRowToInfo(/**@type {StudentRow}*/ tr) {
		if (!tr) throw alert("Error: tr invalid")

		return {
			name: tr.querySelector("a:nth-of-type(1)").textContent,
			rate_online: tr.querySelector("td:nth-child(4)")?.textContent?.match(/\$\d{2}.\d{2}/)[0],
			rate_inperson: tr.querySelector("td:nth-child(3)")?.textContent?.match(/\$\d{2}.\d{2}/)[0],
		}
	}

	return { getStudent }
}
