import { AlertError } from "@src/services/rate_finder";

export default function Lessons(/** @type Element */ container_element, /** @type string */ url) {
    function renderEarningStats() {
        if (!url.includes("https://www.wyzant.com/tutor/lessons")) throw new AlertError("Error: invalid page url");

        const lessons = [...document.querySelectorAll('[id="LessonsList"] tbody tr').values()].map(makeLesson);

        const stat_values = [...getDateStats(lessons).values()];

        const avg_earned = parseFloat(`${stat_values.map(({ earned }) => earned).reduce((acc, earned) => acc + earned) / stat_values.length}`).toFixed(2);
        const avg_tutored = parseFloat(
            `${stat_values.map(({ tutored_minutes }) => tutored_minutes).reduce((acc, tutored_minutes) => acc + tutored_minutes) / stat_values.length}`
        ).toFixed(2);

        const stats_row_html = stat_values.map(makeDateStatElement).join("");

        const stats_table_html = `
		<div class="wzl-card bg-hue">
			<table class="wzl_date_stats_table ">
				<thead>
					<th>Date</th>
					<th>Earned Avg: ${avg_earned}</th>
					<th>Tutored Avg: ${avg_tutored}</th>
				</thead>

				<tbody>
					${stats_row_html}
				</tbody>
			</table>
		</div
		`;

        container_element.innerHTML = stats_table_html;
    }

    function makeDateStatElement(/** @type Lesson */ date_stat) {
        return `
			<tr>
				<td>${date_stat.date}</td>
				<td>$${date_stat.earned}</td>
				<td>${date_stat.tutored_minutes} mins</td>
			</tr>
		`;
    }

    /** @return { Map<string,LessonEntry>} */
    function getDateStats(lessons) {
        const /** @type Map<string,LessonEntry> */ daily_stats = new Map();

        for (const day of lessons) {
            const /** @type {DateStat} */ date_stat = daily_stats.get(day.date.replace("*", "")) ?? makeDateStat(day);

            date_stat.earned += parseFloat(day.earned.replace("$", "").trim());
            date_stat.tutored_minutes += parseFloat(day.length.replace("min", "").trim());

            daily_stats.set(date_stat.date, date_stat);
        }

        return daily_stats;
    }

    /** @alias DateStat */
    function makeDateStat(day) {
        /** @lends */
        return {
            earned: 0,
            tutored_minutes: 0,
            payed: day.date.includes("*"),
            date: day.date.replace("*", ""),
        };
    }

    /** @alias Lesson */
    function makeLesson(/** @type Element */ lesson_row_el) {
        const PROPS = {
            Date: 0,
            Length: 1,
            Entered: 2,
            Online: 3,
            Student: 4,
            Subject: 5,
            Rating: 6,
            Rate: 7,
            Pay: 8,
            Earned: 9,
            Mileage: 10,
            Payment: 11,
            Status: 12,
        };

        /** @lends */
        return {
            date: grabValue(lesson_row_el, PROPS.Date).match(/\d+\/\d+\/\d+/)[0],
            student: grabValue(lesson_row_el, PROPS.Student),
            length: grabValue(lesson_row_el, PROPS.Length).match(/\d+/)[0],
            entered: grabValue(lesson_row_el, PROPS.Entered).match(/\d+\/\d+\/\d+/)[0],
            earned: grabValue(lesson_row_el, PROPS.Earned).match(/\d+(.\d+)?/)[0],
            rate: (grabValue(lesson_row_el, PROPS.Rate)?.match(/\d+(.\d+)?/) ?? ["--"])[0],
        };
    }

    function grabValue(/** @type Element */ element, value_index) {
        return element
            .querySelectorAll("td")
            [value_index].textContent.trim()
            .replace(/[\t\n]*/gi, "")
            .replace(/[ ]+/, " ");
    }

    renderEarningStats();
}
