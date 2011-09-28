goog.provide('appjs.events.Publisher');

/**
 * A class for publishing of events using a publisher subscriber model
 * @constructor
 */
appjs.events.Publisher = function() {
    this.subscribers = [];
};

/**
 * Subscribe to the publisher with a callback and context.
 * @param {Function} callback The callback that should be called.
 * @param {Object} context The context under the callback should be called.
 */
appjs.events.Publisher.prototype.subscribe = function(callback, context) {
    var index = -1;
    for (var i = 0, len = this.subscribers.length; i < len; i++) {
        if (this.subscribers[i] == callback) {
            index = i;
            break;
        }
    }
    if (index == -1) {
        this.subscribers.push({callback: callback, context: context});
    }
};

/**
 * Unsubscribe a callback from this publisher.
 * @param {Function} callback The callback to unsubscribe.
 */
appjs.events.Publisher.prototype.unsubscribe = function(callback) {
    var index = -1;
    for (var i = 0, len = this.subscribers.length; i < len; i++) {
        if (this.subscribers[i].callback === callback) {
            index = i;
            break;
        }
    }
    if (index == -1) {
        throw 'Trying to unsubscribe a listener thats not listening.';
    }
    else {
        this.subscribers.splice(index, 1);
    }
};

/**
 * Publish an event to subscribers
 * @param {Object=} data The data to push to subscribers.
 */
appjs.events.Publisher.prototype.publish = function(data) {
    if (data === undefined) {
        data = {};
    }
    for (var i = 0, len = this.subscribers.length; i < len; i++) {
        var sub = this.subscribers[i];
        sub.callback.call(sub.context, data);
    }
};

goog.exportSymbol('appjs.events.Publisher', appjs.events.Publisher);
goog.exportProperty(appjs.events.Publisher.prototype, 'subscribe', appjs.events.Publisher.prototype.subscribe);
goog.exportProperty(appjs.events.Publisher.prototype, 'unsubscribe', appjs.events.Publisher.prototype.unsubscribe);
goog.exportProperty(appjs.events.Publisher.prototype, 'publish', appjs.events.Publisher.prototype.publish);