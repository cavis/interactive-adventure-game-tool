/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'

function AlexaSkill( appId ) {
  this._appId = appId
}

AlexaSkill.SPEECH_OUTPUT_TYPE = {
  PLAIN_TEXT: 'PlainText',
  SSML: 'SSML'
}

AlexaSkill.prototype.requestHandlers = {
  LaunchRequest: function ( event, context, response ) {
    this.eventHandlers.onLaunch.call( this, event.request, event.session, response)
  },

  IntentRequest: function ( event, context, response ) {
    this.eventHandlers.onIntent.call( this, event.request, event.session, response)
  },

  'AudioPlayer.PlaybackStarted': function ( event, context, response ) {
    console.log('EVENT me playbackstarted', JSON.stringify(event.context));
    context.succeed({version: '1.0', response: {shouldEndSession: true}});
  },

  'AudioPlayer.PlaybackFinished': function ( event, context, response ) {
    console.log('EVENT me PlaybackFinished', JSON.stringify(event.context));
    context.succeed({version: '1.0', response: {shouldEndSession: true}});
    // this.eventHandlers.onAudioFinish.call( this, event.request, event.context.System, response)
  },

  'AudioPlayer.PlaybackStopped': function ( event, context, response ) {
    console.log('EVENT me playbackstopped', JSON.stringify(event.context));
    context.succeed({version: '1.0', response: {shouldEndSession: true}});
  },

  'AudioPlayer.PlaybackNearlyFinished': function ( event, context, response ) {
    console.log('EVENT me playbacknearlyfinished', JSON.stringify(event.context));
    context.succeed({version: '1.0', response: {shouldEndSession: true}});
  },

  'AudioPlayer.PlaybackFailed': function ( event, context, response ) {
    console.log('EVENT me playbackfailed', JSON.stringify(event.context));
    context.succeed({version: '1.0', response: {shouldEndSession: true}});
  },

  SessionEndedRequest: function ( event, context ) {
    this.eventHandlers.onSessionEnded( event.request, event.session )
    context.succeed()
  }
}

AlexaSkill.prototype.eventHandlers = {
    onSessionStarted: function ( sessionStartedRequest, session ) {},

    onLaunch: function ( launchRequest, session, response ) {
        throw "onLaunch should be overriden by subclass";
    },

    onIntent: function ( intentRequest, session, response ) {
        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        if ( intentHandler ) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
    },

    onAudioFinish: function ( request, session, response ) {},

    onSessionEnded: function ( sessionEndedRequest, session ) {}
};

AlexaSkill.prototype.intentHandlers = {};

AlexaSkill.prototype.execute = function ( event, context ) {
  try {

    // Validate that this request originated from authorized source.
    if (this._appId && event.session.application.applicationId !== this._appId) {
        console.log("The applicationIds don't match : " + event.session.application.applicationId + " and "
            + this._appId)
        throw "Invalid applicationId"
    }

    event.session = event.session || {};
    event.session.attributes = event.session.attributes || {};
    if (event.session.new) {
        this.eventHandlers.onSessionStarted(event.request, event.session)
    }

    // Route the request to the proper handler which may have been overriden.
    var type = event.request.type;
    var json = JSON.stringify(event.request);
    console.log(`HANDLE[${type}]`, JSON.stringify(event.session));
    var requestHandler = this.requestHandlers[ event.request.type ]
    if (requestHandler) {
      requestHandler.call( this, event, context, new Response( context, event.session ))
    } else {
      throw new Error(`Unhandled ${type} request: ${json}`);
    }

  } catch ( e ) {
    console.error("Unexpected exception " + e )
    context.fail( e )
  }
}

var Response = function ( context, session ) {
  this._context = context
  this._session = session
}

function createSpeechObject( optionsParam ) {
  if (optionsParam && optionsParam.type === 'SSML') {
    return {
      type: optionsParam.type,
      ssml: optionsParam.ssml
    }
  } else {
    return {
      type: optionsParam.type || 'PlainText',
      text: optionsParam.speech || optionsParam
    }
  }
}

Response.prototype = (function () {

  return {
    tell: function ( speechOutput, audioOutput ) {
      this._context.succeed( buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        audio: audioOutput,
        shouldEndSession: true
      }))
    },
    tellWithCard: function ( speechOutput, audioOutput, cardTitle, cardContent, cardImage ) {
      this._context.succeed( buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        audio: audioOutput,
        cardTitle: cardTitle,
        cardContent: cardContent,
        cardImage: cardImage,
        shouldEndSession: true
      }))
    },
    ask: function ( speechOutput, audioOutput, repromptSpeech ) {
      this._context.succeed( buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        audio: audioOutput,
        reprompt: repromptSpeech,
        shouldEndSession: false
      }))
    },
    askWithCard: function ( speechOutput, audioOutput, repromptSpeech, cardTitle, cardContent, cardImage ) {
      this._context.succeed( buildSpeechletResponse({
        session: this._session,
        output: speechOutput,
        audio: audioOutput,
        reprompt: repromptSpeech,
        cardTitle: cardTitle,
        cardContent: cardContent,
        cardImage: cardImage,
        shouldEndSession: false
      }))
    },
    stop: function () {
      this._context.succeed({
        version: "1.0",
        response: {
          shouldEndSession: true,
          directives: [{
            type: "AudioPlayer.Stop"
          }]
        }
      });
    }
  }

  function buildSpeechletResponse ( options ) {

    var alexaResponse = {shouldEndSession: options.shouldEndSession};

    if ( options.reprompt ) {
      alexaResponse.reprompt = {
        outputSpeech: createSpeechObject( options.reprompt )
      }
    }
    if ( options.cardTitle && options.cardContent ) {
      var type = "Standard"
      alexaResponse.card = {
        type: type,
        title: options.cardTitle,
        text: options.cardContent
      }
      if ( options.cardImage ) {
        alexaResponse.card.image = options.cardImage
      }
    }

    // at least one of output/audio MUST be set
    if (options.output) {
      alexaResponse.outputSpeech = createSpeechObject(options.output);
    }
    if (options.audio) {
      alexaResponse.directives = [{
        type: 'AudioPlayer.Play',
        playBehavior: 'REPLACE_ALL',
        audioItem: { stream: {
          url: options.audio,
          token: 'current-audio',
          expectedPreviousToken: null,
          offsetInMilliseconds: 0
        }}
      }];
      alexaResponse.shouldEndSession = true; // MUST be true
    }

    var returnResult = {
      version: '1.0',
      response: alexaResponse
    }

    if ( options.session && options.session.attributes ) {
      returnResult.sessionAttributes = options.session.attributes
    }
    console.log('skillResponse:', JSON.stringify(returnResult));
    return returnResult
  }

})()

module.exports = AlexaSkill
