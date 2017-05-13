var processUtterance = require('./processUtterance')

module.exports = {
	"ResetStateIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "reset skill" )
	},
	"RestoreStateIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "resume skill" )
	},
	"RepeatOptionsIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "repeat options" )
	},
	"RepeatSceneIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "repeat scene" )
	},
	"GoBackIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "go back" )
	},
	"AMAZON.HelpIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "help" )
	},
	"AMAZON.StopIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "exit skill" )
	},
	"AMAZON.CancelIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "exit skill" )
	},
	"AMAZON.PauseIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "pause skill" )
	},
	"AMAZON.ResumeIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "resume skill" )
	},
	"MoreBackgroundIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "more background" )
	},
	"StayInSquareIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "stay in square" )
	},
	"GoOnCampusIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "go on campus" )
	},
	"PatronIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "patron" )
	},
	"BartenderIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "bartender" )
	},
	"LongIslandIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "long island" )
	},
	"SouthIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "South" )
	},
	"BarIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "bar" )
	},
	"BookstoreIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "bookstore" )
	},
	"VisitorsIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "visitors" )
	},
	"FacultyIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "faculty" )
	},
	"HistoryIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "history" )
	},
	"BooksellerIntent": function ( intent, session, request, response ) {
		processUtterance( intent, session, request, response, "bookseller" )
	},
}