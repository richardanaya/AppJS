goog.provide('AppLayout');
goog.require('goog.string');

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
        $('head').append($('<style>' +
            '.appFullScreenBody { overflow: hidden }' +
            '.appLayoutDiv { margin: 0; padding: 0; border: 0; }' +
            '.appLayoutHidden { display: none; height: 0px; width: 0px}' +
            '</style>'));
        AppLayout.isStyleLoaded = true;
    }

    this.parent = null;
    this.children = [];
    this.dock = null;
    this.element = $('<div class="appLayoutDiv"></div>').get(0);
    this.contentHolder = null;
    this.hidden = false;
    this.width = '100%';
    this.height = '100%';

    if ('content' in settings) {
        this.contentHolder = $('<div class="appLayoutDiv"></div>').get(0);
        $(this.element).append(this.contentHolder);
        if (typeof(settings.content) == 'string') {
            $(this.contentHolder).html(settings.content);
        }
        else {
            $(this.contentHolder).append(settings.contentElement);
        }
    }

    if ('id' in settings) {
        $(this.element).attr('id', settings.id);
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
        $(this.element).addClass(settings.cls);
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
    $(this.element).append(panel.getElement());
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
    $(this.element).remove(panel.getElement());
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
    $(topMostParent.element).toggleClass('appLayoutHidden', topMostParent.hidden);
    if (!topMostParent.hidden) {
        $(topMostParent.element).width(topMostParent.width);
        $(topMostParent.element).height(topMostParent.height);
        $(topMostParent.getElement()).css('position', 'relative');

        topMostParent.resizeAllChildren($(topMostParent.element).width(), $(topMostParent.element).height());
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
        $(childElement).toggleClass('appLayoutHidden', child.hidden);
        $(childElement).css('position', 'absolute');
        if (!child.hidden) {
            var childConvertedWidth = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.width, containerWidth);
            var childConvertedHeight = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.height, containerHeight);
            if (child.dock == 'top') {
                $(childElement).css('top', currentTop);
                $(childElement).css('left', currentLeft);
                $(childElement).width(remainingWidth);
                $(childElement).height(childConvertedHeight);
                currentTop += childConvertedHeight;
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == 'bottom') {
                $(childElement).css('top', remainingHeight + currentTop - childConvertedHeight);
                $(childElement).css('left', currentLeft);
                $(childElement).width(remainingWidth);
                $(childElement).height(childConvertedHeight);
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == 'left') {
                $(childElement).css('top', currentTop);
                $(childElement).css('left', currentLeft);
                $(childElement).width(childConvertedWidth);
                $(childElement).height(remainingHeight);
                currentLeft += childConvertedWidth;
                remainingWidth -= childConvertedWidth;
            }
            else if (child.dock == 'right') {
                $(childElement).css('top', currentTop);
                $(childElement).css('left', remainingWidth + currentLeft - childConvertedWidth);
                $(childElement).width(childConvertedWidth);
                $(childElement).height(remainingHeight);
                remainingWidth -= childConvertedWidth;
            }
            else {
                $(childElement).width(child.width);
                $(childElement).height(child.height);
            }
            child.resizeAllChildren($(childElement).width(), $(childElement).height());
        }
    }

    if (this.contentHolder) {
        $(currentPanel.contentHolder).css('position', 'absolute');
        $(currentPanel.contentHolder).css('top', currentTop);
        $(currentPanel.contentHolder).css('left', currentLeft);
        $(currentPanel.contentHolder).width(remainingWidth);
        $(currentPanel.contentHolder).height(remainingHeight);
    }
};

/**
 * Make a panel full screen at the highest z-index.
 */
AppLayout.Panel.prototype.makeFullScreen = function() {
    if (this.parent != null) {
        throw 'Cannot make a panel full screen that has a parent.  Please detach first.';
    }
    var maxZ = Math.max.apply(null, $.map($('body > *'), function(e, n) {
        if ($(e).css('position') == 'absolute')
            return parseInt($(e).css('z-index')) || 1;
    })
    );
    this.fullScreenContainer = $('<div class="appLayoutDiv" style="position: absolute; top: 0px; left:0px; z-index: ' + maxZ + '"></div>').get(0);
    $('body').append(this.fullScreenContainer);
    $(this.fullScreenContainer).append(this.getElement());

    var context = this;
    var updateSize = function() {
        var screenWidth = $(window).width();
        var screenHeight = $(window).height();
        $(context.fullScreenContainer).width(screenWidth);
        $(context.fullScreenContainer).height(screenHeight);
        context.width = screenWidth;
        context.height = screenHeight;
        context.update();
    };

    updateSize();
    $(window).resize(function() {
        updateSize();
    });
    $('body').addClass('appFullScreenBody');
};
