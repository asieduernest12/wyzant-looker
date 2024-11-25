import { makeRouteHandlerConfig } from "@src/routing/makeRouteHandlerConfig";
import { insertWZLPlaceholder, showWzlIndicator } from "@src/services/helpers";
import { getDate, getDayOfYear, getDaysInMonth, getDaysInYear, subMonths, subYears } from "date-fns";

export const statistics_page = makeRouteHandlerConfig({
    test: /(https:\/\/www.)?wyzant.com\/tutor\/statistics/,
    action: () => {
        insertWZLPlaceholder();
        showWzlIndicator();
        //grab the table
        const statTable = document.querySelector("table.SearchTable");

        if (!statTable) return;

        const isStatTable = /your stats/i.test(statTable.closest(".row").querySelector(".gray-header").textContent);
        console.log({
            isStatTable,
            statTable,
        });
        if (!isStatTable) {
            return;
        }

        const statTableRows = [...statTable.querySelectorAll("tr")];
        console.log({
            statTableRows,
        });

        const loggable = statTableRows.map((tr, index) => {
            console.log({ tr });
            let hrsDaily, $daily, daysCount, earnings, totalHours, $hourly, daysTd;
            const rowLabel = tr.querySelectorAll("td")[0]?.textContent?.toLowerCase();

            if (index === 0) {
                // for header row add hrs/daily, $/daily
                [hrsDaily, $daily, $hourly, daysTd] = ["th", "th", "th", "th"].map(i => document.createElement(i));
                hrsDaily.textContent = "Hrs/Daily";
                $daily.textContent = "$/Daily";
                $hourly.textContent = "$/Hr";
                daysTd.textContent = "Days";
            } else {
                [hrsDaily, $daily, $hourly, daysTd] = ["td", "td", "td", "td"].map(i => document.createElement(i));
                daysCount = {
                    "this month": getDate(new Date()),
                    "last month": getDaysInMonth(subMonths(new Date(), 1)),
                    "year to date": getDayOfYear(new Date()),
                    "last year": getDaysInYear(subYears(new Date(), 1)),
                }[rowLabel.toLocaleLowerCase()];
                earnings = Number(tr.querySelectorAll("td")[2]?.textContent?.replace(/\$/, "").replace(",", ""));
                totalHours = Number(tr.querySelectorAll("td")[1]?.textContent?.replace(/,/, ""));

                hrsDaily.textContent = Number(totalHours / daysCount).toFixed(2) + "";
                $daily.textContent = "$" + Number(earnings / daysCount).toFixed(2);
                daysTd.textContent = daysCount;
                $hourly.textContent = Number(earnings / totalHours).toFixed(2);
            }
            [hrsDaily, $daily, $hourly, daysTd].forEach(el => tr.append(el));
            return {
                rowLabel,
                index,
                earnings,
                totalHours,
                daysCount,
                $hourly,
            };
        });

        console.table(loggable);
        // for each row hours/ title.includes('month')?31:365 , earned/hours
    },
});
