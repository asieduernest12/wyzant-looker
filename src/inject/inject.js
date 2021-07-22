
console.log('script injected')
insertWZLPlaceholder();

//check for document readystate
document.addEventListener('click', messageDocumentClickHandler)

async function messageDocumentClickHandler(event) {
	console.log("messageDocumentClickHandler fired")

	if (!hasConversationSummary(event.target)) {
		console.log('target is not a .conversation-summary-wrap')
		return
	}

	let selected_student = document.querySelector('.selected p.username')

	if (!selected_student)
		return


	let student_info = studentAdapter(await fetchStudentInfo())
	console.log({ selected_student })

}

function hasConversationSummary(element) {
	return !!element.closest('.conversation-summary-wrap')
}

function insertWZLPlaceholder(){
	if (!document.querySelector('.wzl-container')){
		let wzl = document.createElement('div')
		wzl.classList.add('wzl', 'wzl-container')
		document.body.appendChild(wzl)
		console.log('wzl-container appended to body')
	}
}

function makeWzlStudentCard(student_info){
	return `
	<div class="wzl-profile wzl-card">
		<div class="wzl-card--avatar"></div>
		<div class="wzl-card--body wzl-student">
			<p class="wzl-student--username"></p>
			<p class="wzl-student--subject"></p>
			<p class="wzl-student--description"></p>
		</div>
	</div>
	`
}

function fetchStudentInfo(student_name){
	//make iframe

	// set iframeurl

	//  check iframe IsReady

	//query iframe for student details

	//return name, subject and post description
}