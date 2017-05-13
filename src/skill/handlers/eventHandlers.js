'use strict'

var dynamo = require('./dynamoDB')
var respond = require('./respond')
var skill = require('../index').skill
var utils = require('./utils')

var eventHandlers = {

  onSessionStarted: function ( sessionStartedRequest, session ) {
    // Overriden to show that a subclass can override
    // this function to initialize session state.
    // Any session init logic would go here.
  },

  onLaunch: function ( request, session, response ) {
    dynamo.getUserState( session, function ( data ) {
      console.log('getUserState', JSON.stringify(data));
      if ( false && data.item && data.item.breadcrumbs.length ) {
        Object.assign( session.attributes, data.item )
        session.attributes.isAskingToRestoreState = true
        var scene = utils.findResponseByType('askToRestoreState')
        respond.readSceneWithCard( scene, session, response )
      }
      else {
        // no previous game
        request.intent = { name: "LaunchIntent", slots: {} }
        eventHandlers.onIntent( request, session, response )
      }
    })

  },

  onPlaybackStopped: function ( offsetMs, session, context ) {
    console.log('getting user state', JSON.stringify(session))
    dynamo.getUserState( session, function ( data ) {
      session.attributes = session.attributes || {};
      Object.assign( session.attributes, data.item )
      session.attributes.offsetMs = offsetMs;
      console.log('saving state:', JSON.stringify(session.attributes));
      dynamo.putUserState(session, function( data ) {
        console.log('saved state!');
        context.succeed({version: '1.0', response: {shouldEndSession: true}});
      });
    });
  },

  onAudioFinish: function ( request, session, response ) {
    dynamo.getUserState( session, function ( data ) {
      session.attributes = {};
      Object.assign( session.attributes, data.item )
      var scene = utils.findResponseBySceneId( session.attributes.currentSceneId )
      respond.promptSceneWithCard( scene, session, response )
    });
  },

  onIntent: function ( request, session, response ) {

    var intentName = request.intent.name
    var intentHandler = skill.intentHandlers[ intentName ]

    if ( session.attributes.isAskingToRestoreState
    && intentName !== "AMAZON.HelpIntent"
    && intentName !== "AMAZON.StopIntent"
    && intentName !== "AMAZON.CancelIntent"
    && intentName !== "AMAZON.PauseIntent"
    && intentName !== "AMAZON.ResumeIntent"
    && intentName !== "ResetStateIntent"
    && intentName !== "RepeatSceneIntent"
    && intentName !== "RepeatOptionsIntent"
    && intentName !== "RestoreStateIntent" ) {
      intentHandler = skill.intentHandlers["UnrecognizedIntent"]
    }

    if ( intentHandler ) {
      console.log('dispatch intent = ' + intentName )
      intentHandler.call( skill, request.intent, session, request, response )
    }
    else {
      console.log('--- ERROR >>>')
      console.log('Unsupported intent = ' + intentName )
      console.log('<<< ERROR ---')
    }

  },

  onSessionEnded: function (sessionEndedRequest, session) {
    // Overriden to show that a subclass can override
    // this function to teardown session state.
    // Any session cleanup logic would go here.
  }

}

module.exports = eventHandlers
