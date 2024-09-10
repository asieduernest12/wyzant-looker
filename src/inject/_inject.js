// @ts-check
import Lessons from './lessons';
import RateFinder from './rate_finder';
import { setupJobApplicationPage } from './setupJobApplicationPage';

/** @typedef {{title,time,description,rate:Number}} StudentInfo */

/** @type MutationObserver */
let convosObserver = null;

function makeProfileElement() {
	let localWzlProfile = document.querySelector('.wzl-profile');

	if (!localWzlProfile) {
		localWzlProfile = document.createElement('div');
		document.querySelector('.wzl-container').appendChild(localWzlProfile);
	}

	localWzlProfile.classList.add('wzl-profile');
	return localWzlProfile;
}

// check for document readystate
// document.querySelector("#messaging-app").addEventListener("click", messageDocumentClickHandler);

function getConversationSummary(element) {
	return element.closest('.conversation-summary-wrap');
}

function renderStudentRate() {
	console.log('renderStudentRate fired');
	let ratePElement;

	return (studentRateInfo) => {
		console.log('rate render interval fired');
		const rateInterval = setInterval(() => {
			ratePElement = document.querySelector('p.wzl-student--rate');
			if (ratePElement) {
				clearInterval(rateInterval);
				console.log('%c rate ready', 'background:lightblue');

				ratePElement.innerHTML = ` Online: <strong>${studentRateInfo.rate_online}</strong>, Inperson: <strong>${studentRateInfo.rate_inperson}</strong>`;
			}
		}, 200);
	};
}

function getStudentRatePromise(selectedStudent) {
	const rendererFn = renderStudentRate();

	return RateFinder()
		.getStudent(selectedStudent.textContent.trim())
		.then(rendererFn, () => rendererFn({ name: '', rate_online: 'NA', rate_inperson: 'NA' }));
}

function makeWzlStudentCard(studentInfo) {
	return !studentInfo
		? ''
		: `
      <div class="wzl-card bg-hue">
        <span class="wzl-card--close">X</span>
        <span class="wzl-card--reset">Close & Reset</span>
        <div class="wzl-card--avatar"></div>
        <div class="wzl-card--body wzl-student">
          <p class="wzl-student--username">${studentInfo.title}</p>
          <div class="wzl-student--subject">
            <p>${studentInfo.time}</p>
            <p class="wzl-student--rate">Online: NA Inperson: NA</p>
          </div>
          <p class="wzl-student--description">${studentInfo.description}</p>
        </div>
      </div>
	`;
}

function makeSpinner() {
	const spinnerHtml = '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
	const spinnerContainer = document.createElement('div');
	spinnerContainer.classList.add('wzl-spinner-container');
	spinnerContainer.innerHTML = spinnerHtml;
	return spinnerContainer;
}

function insertWZLPlaceholder() {
	let wzlContainer = document.querySelector('.wzl-container');

	if (!wzlContainer) {
		wzlContainer = document.createElement('div');
		wzlContainer.classList.add('wzl', 'wzl-container');
		wzlContainer.appendChild(makeSpinner());
		document.body.appendChild(wzlContainer);
		console.log('wzl-container appended to body');
	}
	return wzlContainer;
}

/**
 *
 * @returns {{iframe: HTMLIFrameElement, isNew: Boolean} }
 */
function addIFrame() {
	// remove existing iframe element
	let /** @type HTMLIFrameElement */ wzlIfram = document.querySelector('#wzl_iframe');

	const isNew = !wzlIfram;

	if (isNew) {
		wzlIfram = document.createElement('iframe');

		wzlIfram.setAttribute('width', '300');
		wzlIfram.setAttribute('height', '200');
		wzlIfram.classList.add('wzl_iframe');
		wzlIfram.setAttribute('id', 'wzl_iframe');

		wzlIfram.setAttribute('src', 'https://www.wyzant.com/tutor/jobapplication/history?sort=1&pagenumber=0&pagesize=100');

		document.querySelector('.wzl-container').appendChild(wzlIfram);
	}

	return { iframe: wzlIfram, isNew };
}

function showWzlIndicator() {
	const wzlCont = document.querySelector('.wzl-container');
	const readyIndicator = document.createElement('button');
	readyIndicator.textContent = 'Wzl Ready';
	readyIndicator.classList.add('wzl_indicator');
	readyIndicator.setAttribute('tooltip', 'Click to enable profile lookup of students (underlined)');
	wzlCont.appendChild(readyIndicator);
	return readyIndicator;
}

function activateWzlIndicator() {
	document.querySelector('.wzl_indicator').classList.add('wzl_indicator_active');
}
function deActivateWzlIndicator() {
	document.querySelector('.wzl_indicator').classList.remove('wzl_indicator_active');
}

function showMoreConvoBtnClick() {
	deActivateWzlIndicator();
}

function findStudentResult(iframe, studentFirstName) {
	console.log('findStudentResult called');
	const jobNodes = iframe.contentWindow.document.querySelectorAll('.job-result');
	const jobs = Array.from(jobNodes);
	const firstFound = jobs.find((job) => job.textContent.includes(studentFirstName));
	return firstFound;
}

function showSpinner() {
	document.querySelector('.wzl-spinner-container').classList.add('show');
}

function hideSpinner() {
	document.querySelector('.wzl-spinner-container').classList.remove('show');
}

/** @return StudentInfo */
function makeStudentAdapter(jobResult) {
	let result = {
		title: 'Info not found',
		time: 'Info not found',
		description: 'Info not found in recent 100 submitted job applications',
		rate: -1,
	};

	if (jobResult) {
		result = {
			title: jobResult.querySelector('.job-result h4').textContent,
			time: `${jobResult.querySelectorAll('.job-result p')[2].textContent}`,
			description: jobResult.querySelectorAll('.job-result p')[0].textContent,
			rate: 0,
		};
	}

	return result;
}

function closeWzlCard(reset) {
	// remove
	document.querySelector('.wzl-card').remove();

	if (reset ?? false) {
		const { iframe } = addIFrame();
		iframe.remove();

		// remove wzl from messages\
		Array.from(document.querySelectorAll('.conversation-summary-wrap'))
			.filter((convo) => convo.classList.contains('wzl-listener-active'))
			.forEach((convo) => {
				convo.classList.remove('wzl-listener-active');
				// eslint-disable-next-line no-use-before-define
				convo.removeEventListener('click', messageDocumentClickHandler);
			});

		document.querySelector('.show-more a.btn').removeEventListener('click', showMoreConvoBtnClick);

		deActivateWzlIndicator();
	}
}

const RenderJobPostDetails = (studentResultInfo) => {
	const localWzlProfile = makeProfileElement();
	localWzlProfile.innerHTML = makeWzlStudentCard(makeStudentAdapter(studentResultInfo));

	// add close and reset listeners
	document.querySelector('.wzl-card--close').addEventListener('click', () => closeWzlCard(false));
	document.querySelector('.wzl-card--reset').addEventListener('click', () => closeWzlCard(true));
	console.log('%c job post details ready', 'background:lightyellow');
};

function getStudentJobPostPromise(/** @type Boolean */ isIframeNew, /** @type HTMLIFrameElement */ iframe, studentFirstName) {
	return new Promise((res) => {
		if (!isIframeNew) {
			res(findStudentResult(iframe, studentFirstName));
		}

		const localInterval = setInterval(() => {
			// resolve if job-results are found
			console.log('interval running');
			// @ts-ignore
			if (Array.from(iframe.contentWindow.document.querySelectorAll('.job-result')).length) {
				clearInterval(localInterval);

				res(findStudentResult(iframe, studentFirstName));
			}
		}, 400);
	})
		.then(RenderJobPostDetails)
		.finally(() => hideSpinner());
}

function messageDocumentClickHandler(event) {
	const previousCard = document.querySelector('.wzl-profile');

	if (previousCard) previousCard.remove();

	showSpinner();

	console.log('messageDocumentClickHandler fired');
	const localConvo = getConversationSummary(event.currentTarget);

	if (!localConvo) {
		console.log('target is not a .conversation-summary-wrap');
		return;
	}

	const selectedStudent = document.querySelector('.selected p.username');

	if (!selectedStudent) return;

	const [studentFirstName] = selectedStudent.textContent.trim().split(' ');

	const { iframe, isNew } = addIFrame();

	console.log({ selected_student: selectedStudent });

	Promise.all([getStudentJobPostPromise(isNew, iframe, studentFirstName), getStudentRatePromise(selectedStudent)]).catch(() =>
		alert('Error while fetching job info and hourly rate info')
	);
}

function observeNewConversations() {
	const convoUl = document.getElementsByClassName('ul-wrap').item(0);

	if (convosObserver) return;

	convosObserver = new MutationObserver(() => {
		console.log('mutation fired');
		// eslint-disable-next-line no-use-before-define
		wzlConvoClickHandler();
	});

	convosObserver.observe(convoUl, {
		childList: true,
		subtree: true,
	});
}

function wzlConvoClickHandler() {
	// add event lister to all conversation summary items
	const convos = Array.from(document.querySelectorAll('.conversation-summary-wrap')).filter((convo) => !convo.classList.contains('wzl-listener-active'));
	if (convos.length) {
		convos.forEach((convo) => {
			convo.classList.add('wzl-listener-active');
			convo.addEventListener('click', messageDocumentClickHandler);
		});

		activateWzlIndicator();
	}

	// dont assign the listener twice
	document.querySelector('.show-more a.btn').removeEventListener('click', showMoreConvoBtnClick);
	document.querySelector('.show-more a.btn').addEventListener('click', showMoreConvoBtnClick);

	observeNewConversations();
}

function init() {
	console.log('wzl script injected');
	const pageUrl = window.location.href.trim();

	const LOCATION_TRIGGER_TOKENS = {
		job_application_submit_page: {
			test: /https:\/\/www.wyzant.com\/tutor\/job(application\/apply|s)\/\d+/,
			action: () => {
				// change hourly-rate input to number
				console.log('wzl job_application_submit_page');
				setupJobApplicationPage();
			},
		},
		message_page: {
			test: /https:\/\/www.wyzant.com\/tutor\/messaging/,
			action: () => {
				console.log('wzl message_page');
				insertWZLPlaceholder();
				showWzlIndicator().addEventListener('click', wzlConvoClickHandler);
			},
		},
		lessons_page: {
			test: /https:\/\/www.wyzant.com\/tutor\/lessons/,
			action: () => {
				insertWZLPlaceholder();
				showWzlIndicator().addEventListener('click', () => {
					showSpinner();
					Lessons(makeProfileElement(), window.location.href);
					hideSpinner();
				});
			},
		},
		statistics_page: {
			test: /https:\/\/www.wyzant.com\/tutor\/statistics/,
			action: () => {
				//grab the table
				const statTable = document.querySelector('table.SearchTable');
				if (!/yout stats/i.test(statTable.textContent)) {
					return;
				}

				statTable.querySelectorAll('tr').forEach((tr, index) => {
					if (index === 0) {
						// for header row add hrs/daily, $/daily
						const [hrsDaily, $daily] = ['th', 'th'].map((i) => document.createElement(i));
						hrsDaily.textContent = 'Hrs/Daily';
						$daily.textContent = '$/Daily';
						[hrsDaily, $daily].forEach((el) => tr.append(el));
						return;
					}

					const [hrsDaily, $daily] = ['td', 'td'].map((i) => document.createElement(i));
					const daysCount = /month/i.test(tr.querySelectorAll('td')[0]?.textContent) ? 31 : 365;
					const earnings = Number(tr.querySelectorAll('td')[2]?.textContent?.replace('$', ''));
					const totalHours = Number(tr.querySelectorAll('td')[1]?.textContent?.replace('$', ''));

					hrsDaily.textContent = totalHours / daysCount + '';
					$daily.textContent = '$' + earnings / daysCount;
					[hrsDaily, $daily].forEach((el) => tr.append(el));
					return;
				});
				// for each row hours/ title.includes('month')?31:365 , earned/hours
			},
		},
	};

	const [key, pageItem] = Object.entries(LOCATION_TRIGGER_TOKENS).find(([, { test }]) => test.test(pageUrl));

	console.log('wlz page target', key);

	pageItem?.action();
}

init();
