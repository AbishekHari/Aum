'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = 'amzn1.ask.skill.862865b7-0035-418a-b670-0d846021bcc9';

var audioTracks = require('./tracksList');
var offsetInMilliseconds = 0;

var audioState = {
    AUDIO_INIT    : '',
    ADUIO_PLAY    : '_PLAY_',
    AUDIO_RESUME  : '_RESUME_'
};

var SKILL_NAME  = 'Hindu Devotional Hymns';
var WELCOME_MESSAGE = 'Welcome to Hindu Devotional Hymns. You can say, play the audio, to begin streaming.';
var REPROMPT_MESSAGE = 'You can say, play the audio, to begin.';
var RESUME_MESSAGE = 'Would you like to resume?';
var RESUME_REPROMPT_MESSAGE = 'You can say yes to resume or no to play from beginning.';
var UNKNOWN_INTENT_MESSAGE = 'Sorry, I could not understand. Please say play the audio, or, you can say exit... What can I help you with?';
var STOP_MESSAGE = 'Goodbye!';

var stateHandlers = {
    audioInitHandler : Alexa.CreateStateHandler(audioState.AUDIO_INIT, {
        'LaunchRequest' : function () {
            offsetInMilliseconds = 0;
	    // Play prayer song based on the day of the week
            //nowPlayingIndex = new Date().getDay();

            this.handler.state = audioState.AUDIO_INIT;

            this.response.speak(WELCOME_MESSAGE).listen(REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'PlayHymn' : function () {
            offsetInMilliseconds = 0;
	    // Play prayer song based on the day of the week
            //nowPlayingIndex = new Date().getDay();
            controller.play.call(this);
        },
        'AMAZON.HelpIntent' : function () {
            this.response.speak(WELCOME_MESSAGE).listen(REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
	    sendResponse.call(this, STOP_MESSAGE);
        },
        'AMAZON.CancelIntent' : function () {
	    sendResponse.call(this, STOP_MESSAGE);
        },
        'SessionEndedRequest' : function () {
        },
        'Unhandled' : function () {
            this.response.speak(UNKNOWN_INTENT_MESSAGE).listen(UNKNOWN_INTENT_MESSAGE);
            this.emit(':responseReady');
        }
    }),
    audioPlayHandler : Alexa.CreateStateHandler(audioState.AUDIO_PLAY, {
        'LaunchRequest' : function () {
            var message;
            var reprompt;
            if (offsetInMilliseconds === 0) {
                this.handler.state = audioState.AUDIO_START;
                message = WELCOME_MESSAGE;
                reprompt = REPROMPT_MESSAGE;
            } else {
                this.handler.state = audioState.AUDIO_RESUME;
                message = 'You were listening to ' + audioTracks[0].title + RESUME_MESSAGE;
                reprompt = RESUME_REPROMPT_MESSAGE;
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayHymn' : function () { controller.play.call(this) },
        'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () { controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
        'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
        'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
        'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
        'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
        'AMAZON.HelpIntent' : function () {
	    limitedFunctionalityMessage.call(this);
        },
        'SessionEndedRequest' : function () {
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. ';
            var reprompt = 'At any time, you can say Pause to pause the audio or say Loop to repeat and say Resume to resume.';
 
            this.response.speak(message + reprompt).listen(reprompt);
            this.emit(':responseReady');
        }
    }),
    audioResumeHandler : Alexa.CreateStateHandler(audioState.AUDIO_RESUME, {
        'LaunchRequest' : function () {
            var message = 'You were listening to ' + audioTracks[0].title + RESUME_MESSAGE;
            this.response.speak(message).listen(RESUME_REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = 'You were listening to ' + audioTracks[0].title + RESUME_MESSAGE;
            this.response.speak(message).listen(RESUME_REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
	    sendResponse.call(this, STOP_MESSAGE);
        },
        'AMAZON.CancelIntent' : function () {
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
        },
        'Unhandled' : function () {
            this.response.speak(UNKNOWN_INTENT_MESSAGE).listen(UNKNOWN_INTENT_MESSAGE);
            this.emit(':responseReady');
        }
    })
};

var controller = function () {
    return {
        play: function () {
            this.handler.state = audioState.AUDIO_PLAY;

            var token = String('mahaGanapathim');
            var playBehavior = 'REPLACE_ALL';
            var track = audioTracks[0];

            var cardTitle = 'Playing ' + track.title;
            var cardContent = 'Playing ' + track.title;
	    this.response.speak(cardTitle);
            this.response.cardRenderer(cardTitle, cardContent, null);

            this.response.audioPlayerPlay(playBehavior, track.url, token, null, offsetInMilliseconds);
	    //this.attributes['trackUrl'] = track.url;
            this.emit(':responseReady');
        },
        stop: function () {
            this.response.audioPlayerStop();
	    sendResponse.call(this, STOP_MESSAGE);
        },
        playNext: function () {
	    limitedFunctionalityMessage.call(this);
        },
        playPrevious: function () {
	    limitedFunctionalityMessage.call(this);
        },
        loopOn: function () {
	    limitedFunctionalityMessage.call(this);
        },
        loopOff: function () {
	    limitedFunctionalityMessage.call(this);
        },
        shuffleOn: function () {
	    sendResponse.call(this, 'Sorry, I can’t shuffle music yet.');
        },
        shuffleOff: function () {
	    sendResponse.call(this, 'Sorry, I can’t shuffle music yet.');
        },
        startOver: function () {
            // Start over the current audio file.
            offsetInMilliseconds = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            offsetInMilliseconds = 0;
            controller.play.call(this);
        }
    }
}();

function sendResponse(message) {
    this.response.speak(message);
    this.emit(':responseReady');
}

function limitedFunctionalityMessage() {
    var message = 'You are listening to Maha Ganapathim Nadaswaram. Currently, there is only one track avaiable on this version of skill. ';
    var reprompt = 'At any time, you can say Pause to pause the audio and say Resume to resume.';
    this.response.speak(message + reprompt).listen(reprompt);
    this.emit(':responseReady');
}

var playBackHandler = Alexa.CreateStateHandler(audioState.AUDIO_PLAY, {
    'PlaybackStarted' : function () {
        // Sent when Alexa begins playing the audio stream previously sent in a Play directive. This lets your skill verify that playback began successfully.

	// should check if the correct audio is playing?

	//this.attributes['started'] = true;
        //offsetInMilliseconds = 0;
        this.emit(':saveState', true);
    },
    'PlaybackFinished' : function () {
	// Sent when the stream Alexa is playing comes to an end on its own.
        // reset offset
        //offsetInMilliseconds = 0;

	// ask user if they would like to queue up next song. If play all is not active

        this.emit(':saveState', true);
    },
    'PlaybackStopped' : function () {
	// Sent when Alexa stops playing an audio stream in response to a voice request or an AudioPlayer directive.
	// may be because of Pause / Stop Intent

        // Save the current audio offset to initiate resume
        offsetInMilliseconds = this.event.request.offsetInMilliseconds;
        //nowPlayingIndex = this.event.request.token;
        this.emit(':saveState', true);
    },
    'PlaybackNearlyFinished' : function () {
        this.context.succeed(true);
    },
    'PlaybackFailed' : function () {
        // Sent when Alexa encounters an error when attempting to play a stream. 
	//this.attributes['fail'] = true;
        console.log("Playback Failed : %j", this.event.request.error);

	// Inform user that we are unable to play? Something went wrong?
        this.context.succeed(true);
    }
});

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.dynamoDBTableName = 'AudioPlayerHymns';
    alexa.registerHandlers(
        stateHandlers.audioInitHandler,
        stateHandlers.audioPlayHandler,
        stateHandlers.audioResumeHandler,
        playBackHandler
    );
    alexa.execute();
};
