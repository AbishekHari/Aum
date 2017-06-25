'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./tracksList');
var constants = require('./constants');

var stateHandlers = {
    audioInitHandler : Alexa.CreateStateHandler(constants.state.AUDIO_INIT, {
        'LaunchRequest' : function () {
            this.attributes['offsetInMilliseconds'] = 0;
	    // Play prayer song based on the day of the week
            //this.attributes['nowPlayingIndex'] = new Date().getDay();

            this.handler.state = constants.state.AUDIO_INIT;

            this.response.speak(WELCOME_MESSAGE).listen(REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'PlayAudio' : function () {
            this.attributes['offsetInMilliseconds'] = 0;
	    // Play prayer song based on the day of the week
            //this.attributes['nowPlayingIndex'] = new Date().getDay();
            this.handler.state = constants.state.AUIDO_INIT;
            controller.play.call(this);
        },
        'AMAZON.HelpIntent' : function () {
            this.response.speak(WELCOME_MESSAGE).listen(REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
        },
        'Unhandled' : function () {
            this.response.speak(UNKNOWN_INTENT_MESSAGE).listen(UNKNOWN_INTENT_MESSAGE);
            this.emit(':responseReady');
        }
    }),
    audioPlayHandler : Alexa.CreateStateHandler(constants.state.AUDIO_PLAY, {
        'LaunchRequest' : function () {
            var message;
            var reprompt;
            if (this.attributes['offsetInMilliseconds'] === 0) {
                this.handler.state = constants.state.AUDIO_START;
                message = WELCOME_MESSAGE;
                reprompt = REPROMPT_MESSAGE;
            } else {
                this.handler.state = constants.state.AUDIO_RESUME;
                message = 'You were listening to ' + audioData[this.attributes['nowPlayingIndex']].title + RESUME_MESSAGE;
                reprompt = RESUME_REPROMPT_MESSAGE;
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayAudio' : function () { controller.play.call(this) },
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
            var message = 'You are listening to Hindu Prayer. You can say, Next or Previous to navigate through the playlist. ' +
                'At any time, you can say Pause to pause the audio and Resume to resume.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    audioResumeHandler : Alexa.CreateStateHandler(constants.state.AUDIO_RESUME, {
        'LaunchRequest' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['nowPlayingIndex']].title + RESUME_MESSAGE;
            this.response.speak(message).listen(RESUME_REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['nowPlayingIndex']].title + RESUME_MESSAGE;
            this.response.speak(message).listen(RESUME_REPROMPT_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            this.response.speak(STOP_MESSAGE);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            this.response.speak(STOP_MESSAGE);
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

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            this.handler.state = constants.state.AUDIO_PLAY;

            var token = String(this.attributes['nowPlayingIndex']);
            var playBehavior = 'REPLACE_ALL';
            var track = audioData[this.attributes['nowPlayingIndex']];
            var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];

            var cardTitle = 'Playing ' + track.title;
            var cardContent = 'Playing ' + track.title;
            this.response.cardRenderer(cardTitle, cardContent, null);

            this.response.audioPlayerPlay(playBehavior, track.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        stop: function () {
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            var index = this.attributes['nowPlayingIndex'];
            index += 1;
            // Check for last audio file.
            if (index === audioData.length) {
                if (this.attributes['loop']) {
                    index = 0;
                } else {
                    this.handler.state = constants.state.AUDIO_INIT;

                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;

            controller.play.call(this);
        },
        playPrevious: function () {
            var index = this.attributes['nowPlayingIndex'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes['loop']) {
                    index = audioData.length - 1;
                } else {
                    this.handler.state = constants.state.AUDIO_INIT;

                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes['loop'] = true;
	    sendResponse.call(this, 'Loop turned on.');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes['loop'] = false;
	    sendResponse.call(this, 'Loop turned off.');
        },
        shuffleOn: function () {
	    sendResponse.call(this, 'Sorry, I can’t shuffle music yet.');
        },
        shuffleOff: function () {
	    sendResponse.call(this, 'Sorry, I can’t shuffle music yet.');
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        }
    }
}();

function sendResponse(var message) {
    this.response.speak(message);
    this.emit(':responseReady');
} 
