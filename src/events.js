goog.provide('appjs.events');
goog.require('appjs.events.Publisher');

/**
 * Dictionary of global event bus publishers
 */
appjs.events.eventBusPublishers = {};

/**
 * Subscribe to the global event bus with a callback and context.
 * @param {number} eventType The type of event you want to listen to.
 * @param {Function} callback The callback that should be called.
 * @param {Object} context The context which the callback should be called.
 */
appjs.events.subscribe = function(eventType, callback, context) {
    var exists = (eventType in appjs.events.eventBusPublishers);
    var publisher = null;
    if (!exists) {
        appjs.events.eventBusPublishers[eventType] = new appjs.events.Publisher();
    }
    publisher = appjs.events.eventBusPublishers[eventType];
    publisher.subscribe(callback, context);
};

/**
 * Unsubscribe a callback from the event bus.
 * @param {number} eventType The type of event you want unsubscribe from.
 * @param {Function} callback The callback to unsubscribe.
 */
appjs.events.unsubscribe = function(eventType, callback) {
    var exists = (eventType in appjs.events.eventBusPublishers);
    var publisher = null;
    if (!exists) {
        throw 'Unsubscribing from an empty publisher';
    }
    publisher = appjs.events.eventBusPublishers[eventType];
    publisher.unsubscribe(callback);
};

/**
 * Publish an event to subscribers of an event type on the event bus.
 * @param {number} eventType The type of event you want to send data to.
 * @param {Object=} data The data to push to subscribers.
 */
appjs.events.publish = function(eventType, data) {
    var exists = (eventType in appjs.events.eventBusPublishers);
    var publisher = null;
    if (!exists) {
        return;
    }
    publisher = appjs.events.eventBusPublishers[eventType];
    publisher.publish(data);
};

/**
 * Make a function an observer of a publisher.
 * @param {Function} func The function to make an observer.
 */
appjs.events.makeObserver = function(func) {
    if (func.subscribe == undefined && func.unsubscribe == undefined) {
        func.subscribe = function(publisher, context) {
            publisher.subscribe(func, context);
        };
        func.unsubscribe = function(publisher) {
            publisher.unsubscribe(func);
        };
    }
};

/**
 * Make a function an observer of a publisher of events
 * @param {Function} func The function to be called by the publisher.
 * @param {appjs.events.Publisher} publisher The publisher events we
 * want to listen to.
 * @param {Object} context The context our callback should be called
 * in.
 */
appjs.events.connect = function(func, publisher, context) {
    appjs.events.makeObserver(func);
    func.subscribe(publisher, context);
};

/**
 * Disconnect a function from a publisher of events.
 * @param {Function} func The function that was listening to the publisher.
 * @param {appjs.events.Publisher} publisher The publisher of events we
 * want to stop listening to.
 */
appjs.events.disconnect = function(func, publisher) {
    func.unsubscribe(publisher);
};

goog.exportSymbol('appjs.events.subscribe', appjs.events.subscribe);
goog.exportSymbol('appjs.events.unsubscribe', appjs.events.unsubscribe);
goog.exportSymbol('appjs.events.publish', appjs.events.publish);
goog.exportSymbol('appjs.events.connect', appjs.events.connect);
goog.exportSymbol('appjs.events.disconnect', appjs.events.disconnect);

