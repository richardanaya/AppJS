goog.provide('AppLayout');
goog.require('goog.string');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.style');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');

/**
 * A global variable that represents of our pagewide styles have been added
 * @type {boolean}
 */
AppLayout.isStyleLoaded = false;

/**
 * A class that represents a panel.
 * @constructor
 * @param {object} settings A json representation of this panels settings and/or children.
 */
AppLayout.Panel = function(settings) {
    if (!AppLayout.isStyleLoaded) {
        var appLayoutStyles = goog.dom.htmlToDocumentFragment('<style>' +
            '.appFullScreenBody { overflow: hidden }' +
            '.appLayoutDiv { margin: 0; padding: 0; border: 0; }' +
            '.appLayoutHidden { display: none; height: 0px; width: 0px}' +
            '</style>');
        goog.dom.appendChild(document.head, appLayoutStyles);
        AppLayout.isStyleLoaded = true;
    }

    this.parent = null;
    this.children = [];
    this.dock = null;
    this.element = goog.dom.htmlToDocumentFragment('<div class="appLayoutDiv"></div>');
    this.contentHolder = null;
    this.hidden = false;
    this.width = '100%';
    this.height = '100%';

    if ('content' in settings) {
        this.contentHolder = goog.dom.htmlToDocumentFragment('<div class="appLayoutDiv"></div>');
        goog.dom.append(this.element, this.contentHolder);
        if (typeof(settings.content) == 'string') {
            var htmlContent = goog.dom.htmlToDocumentFragment(settings.content);
            goog.dom.append(this.contentHolder, htmlContent);
        }
        else {
            goog.dom.append(this.contentHolder, settings.contentElement);
        }
    }

    if ('id' in settings) {
        goog.dom.setProperties(this.element, {'id':settings.id});
    }

    if ('width' in settings) {
        this.width = settings.width;
    }

    if ('height' in settings) {
        this.height = settings.height;
    }

    if ('hidden' in settings) {
        this.hidden = settings.hidden;
    }

    if ('cls' in settings) {
        goog.dom.classes.add(this.element, settings.cls);
    }

    if ('dock' in settings) {
        this.dock = settings.dock;
    }

    if ('children' in settings) {
        for (var i = 0, len = settings.children.length; i < len; i++) {
            var child = settings.children[i];
            if (child instanceof AppLayout.Panel) {
                this.addChild(child);
            }
            else {
                this.addChild(new AppLayout.Panel(child));
            }
        }
    }
};

/**
 * Add a panel as a child.
 * @param {AppPanel.Panel} panel The panel to add.
 */
AppLayout.Panel.prototype.addChild = function(panel) {
    if (panel.parent != null) {
        panel.parent.removeChild(panel);
    }

    this.children.push(panel);
    goog.dom.append(this.element, panel.getElement());
    panel.parent = this;
};

/**
 * Remove a child panel.
 * @param {AppPanel.Panel} panel The child panel to remove.
 */
AppLayout.Panel.prototype.removeChild = function(panel) {
    for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i] === panel) {
            this.children.splice(0, 1);
        }
    }
    goog.dom.removeNode(panel.getElement());
    panel.parent = null;
};

/**
 * Get the element of this panel.
 * @return {Node} The element of this panel.
 */
AppLayout.Panel.prototype.getElement = function() {
    return this.element;
};

/**
 * Update the panel and resize all children appropriately.
 */
AppLayout.Panel.prototype.update = function() {
    var topMostParent = this;
    while (topMostParent.parent != null) {
        topMostParent = topMostParent.parent;
    }

    //determine topmost parent size
    if (topMostParent.hidden) {
        goog.dom.classes.add(topMostParent.element, 'appLayoutHidden');
    }
    else {
        goog.dom.classes.remove(topMostParent.element, 'appLayoutHidden');
    }
    if (!topMostParent.hidden) {
        goog.style.setWidth(topMostParent.element, topMostParent.width);
        goog.style.setHeight(topMostParent.element, topMostParent.height);
        goog.style.setStyle(topMostParent.getElement(), 'position', 'relative');

        var size = goog.style.getSize(topMostParent.element);
        topMostParent.resizeAllChildren(size.width, size.height);
    }
};

/**
 * Calculate a childs dimension based on container dimension.
 * @param {string} childDimension The child dimension string.
 * @param {number} parentDimension The container dimension.
 * @return {number} The size of the child dimension in pixels.
 */
AppLayout.Panel.prototype.convertChildSizeDimensionBasedOnParentDimension = function(childDimension, parentDimension) {
    if (goog.string.endsWith(childDimension, 'px')) {
        return parseFloat(childDimension.substr(0, childDimension.length - 2));
    }
    else if (goog.string.endsWith(childDimension, '%')) {
        return parentDimension * (parseFloat(childDimension.substr(0, childDimension.length - 1)) / 100);
    }
    else {
        return childDimension;
    }
};

/**
 * Resize all children of this panel with size constraints.
 * @param {number} containerWidth The width constraint.
 * @param {number} containerHeight The height constraint.
 */
AppLayout.Panel.prototype.resizeAllChildren = function(containerWidth, containerHeight) {
    var currentPanel = this;

    var currentLeft = 0;
    var currentTop = 0;
    var remainingWidth = containerWidth;
    var remainingHeight = containerHeight;

    for (var i = 0, len = currentPanel.children.length; i < len; i++) {
        var child = currentPanel.children[i];
        var childElement = child.getElement();

        if (child.hidden) {
            goog.dom.classes.add(childElement, 'appLayoutHidden');
        }
        else {
            goog.dom.classes.remove(childElement, 'appLayoutHidden');
        }

        goog.style.setStyle(childElement, 'position', 'absolute');
        if (!child.hidden) {
            var childConvertedWidth = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.width, containerWidth);
            var childConvertedHeight = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.height, containerHeight);
            if (child.dock == 'top') {
                goog.style.setStyle(childElement, 'top', currentTop);
                goog.style.setStyle(childElement, 'left', currentLeft);
                goog.style.setWidth(childElement, remainingWidth);
                goog.style.setHeight(childElement, childConvertedHeight);
                currentTop += childConvertedHeight;
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == 'bottom') {
                goog.style.setStyle(childElement, 'top', remainingHeight + currentTop - childConvertedHeight);
                goog.style.setStyle(childElement, 'left', currentLeft);
                goog.style.setWidth(childElement, remainingWidth);
                goog.style.setHeight(childElement, childConvertedHeight);
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == 'left') {
                goog.style.setStyle(childElement, 'top', currentTop);
                goog.style.setStyle(childElement, 'left', currentLeft);
                goog.style.setWidth(childElement, childConvertedWidth);
                goog.style.setHeight(childElement, remainingHeight);
                currentLeft += childConvertedWidth;
                remainingWidth -= childConvertedWidth;
            }
            else if (child.dock == 'right') {
                goog.style.setStyle(childElement, 'top', currentTop);
                goog.style.setStyle(childElement, 'left', remainingWidth + currentLeft - childConvertedWidth);
                goog.style.setWidth(childElement, childConvertedWidth);
                goog.style.setHeight(childElement, remainingHeight);
                remainingWidth -= childConvertedWidth;
            }
            else {
                goog.style.setWidth(childElement, child.width);
                goog.style.setHeight(childElement, child.height);
            }
            var size = goog.style.getSize(childElement);
            child.resizeAllChildren(size.width, size.height);
        }
    }

    if (this.contentHolder) {
        goog.style.setStyle(currentPanel.contentHolder, 'position', 'absolute');
        goog.style.setStyle(currentPanel.contentHolder, 'top', currentTop);
        goog.style.setStyle(currentPanel.contentHolder, 'left', currentLeft);
        goog.style.setWidth(currentPanel.contentHolder, remainingWidth);
        goog.style.setHeight(currentPanel.contentHolder, remainingHeight);
    }
};

/**
 * Make a panel full screen at the highest z-index.
 */
AppLayout.Panel.prototype.makeFullScreen = function() {
    if (this.parent != null) {
        throw 'Cannot make a panel full screen that has a parent.  Please detach first.';
    }
    var maxZ = 1;

    goog.dom.findNodes(document.body, function(n) {
        if (!(n instanceof Text)) {
            if (goog.style.getStyle(n, 'position') == 'absolute') {
                maxZ = Math.max(maxZ, parseInt(goog.style.getStyle(n, 'z-index')) || 1);
            }
        }
        return false;
    });

    this.fullScreenContainer = goog.dom.htmlToDocumentFragment(
        '<div class="appLayoutDiv" style="position: absolute; top: 0px; left:0px; z-index: ' + maxZ + '"></div>');
    goog.dom.append(document.body, this.fullScreenContainer);
    goog.dom.append(this.fullScreenContainer, this.getElement());

    var context = this;
    var updateSize = function() {
        var screenSize = goog.dom.getViewportSize(window);
        goog.style.setWidth(context.fullScreenContainer, screenSize.width);
        goog.style.setHeight(context.fullScreenContainer, screenSize.height);
        context.width = screenSize.width;
        context.height = screenSize.height;
        context.update();
    };

    updateSize();

    var vsm = new goog.dom.ViewportSizeMonitor();
    goog.events.listen(vsm, goog.events.EventType.RESIZE, function(e) {
        updateSize();
    });
    goog.dom.classes.add(document.body, 'appFullScreenBody');
};
