import { AlertError } from "./rate_finder"

export default function Lessons() {
	let lesson_map

	function renderEarningStats(/**@type Document*/ document, /**@type string */ url) {
		if (!url.includes("https://www.wyzant.com/tutor/lessons")) throw new AlertError("Error: invalid page url")

		let lessons = [document.querySelectorAll('[id="LessonsList"]').values()].map(makeLesson)
	}

	function renderLessonStats(/**@type [] */ parsed_lesson) {}

	function makeLesson(/**@type Element*/ lesson_row_el) {
		const PROPS = { Date: 0, Length: 1, Entered: 2, Online: 3, Student: 4, Subject: 5, Rating: 6, Rate: 7, Pay: 8, Earned: 9, Mileage: 10, Payment: 11, Status: 12 }

		return {
			student: lesson_row_el.querySelector(`td:nth-of-type(${PROPS.Student})`).textContent.trim().replace(/(\t\n)/gi,''),
			length: lesson_row_el.querySelector(`td:nth-of-type(${PROPS.Length})`).textContent.trim().replace(/(\t\n)/gi,''),
			entered: lesson_row_el.querySelector(`td:nth-of-type(${PROPS.Entered})`).textContent.trim().replace(/(\t\n)/gi,''),
			earned: lesson_row_el.querySelector(`td:nth-of-type(${PROPS.Earned})`).textContent.trim().replace(/(\t\n)/gi,''),
			rate: lesson_row_el.querySelector(`td:nth-of-type(${PROPS.Rate})`).textContent.trim().replace(/(\t\n)/gi,''),
		}
	}
}
