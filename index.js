'use strict';

// Skill name Hindu Prayer

var Alexa = require('alexa-sdk');
var APP_ID = '';  // TODO replace with your app ID (OPTIONAL).

var stateHandlers = require('./stateHandlers');
var constants = require('./constants');

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Hindu Prayer',
            WELCOME_MESSAGE: 'Welcome to Hindu Prayer. You can say, play the audio, to begin streaming.',
            REPROMPT_MESSAGE: 'You can say, play the audio, to begin.',
            RESUME_MESSAGE: 'Would you like to resume?',
            RESUME_REPROMPT_MESSAGE: 'You can say yes to resume or no to play from beginning.',
            UNKNOWN_INTENT_MESSAGE: 'Sorry, I could not understand. Please say play the audio, or, you can say exit... What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

var audioPlayerHandler = Alexa.CreateStateHandler(constants.state.AUDIO_PLAY, {
    'PlaybackStarted' : function () {
        // Sent when Alexa begins playing the audio stream previously sent in a Play directive. This lets your skill verify that playback began successfully.

	// should check if the correct audio is playing?

        this.attributes['offsetInMilliseconds'] = 0;
        this.emit(':saveState', true);
    },
    'PlaybackFinished' : function () {
	// Sent when the stream Alexa is playing comes to an end on its own.
        // reset offset
        this.attributes['offsetInMilliseconds'] = 0;

	// ask user if they would like to queue up next song. If play all is not active

        this.emit(':saveState', true);
    },
    'PlaybackStopped' : function () {
	// Sent when Alexa stops playing an audio stream in response to a voice request or an AudioPlayer directive.
	// may be because of Pause / Stop Intent

        // Save the current audio offset to initiate resume
        this.attributes['offsetInMilliseconds'] = this.event.request.offsetInMilliseconds;
        this.attributes['nowPlayingIndex'] = this.event.request.token;
        this.emit(':saveState', true);
    },
    'PlaybackNearlyFinished' : function () {
        this.context.succeed(true);
    },
    'PlaybackFailed' : function () {
        // Sent when Alexa encounters an error when attempting to play a stream. 
        console.log("Playback Failed : %j", this.event.request.error);

	// Inform user that we are unable to play? Something went wrong?
        this.context.succeed(true);
    }
});

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.resources = languageStrings;
    alexa.registerHandlers(
        stateHandlers.audioInitHandler,
        stateHandlers.audioPlayHandler,
        stateHandlers.audioResumeHandler,
        audioPlayerHandler
    );
    alexa.execute();
};
