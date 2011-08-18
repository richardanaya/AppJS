AppLayout = {};

endsWith = function(str, suffix) {
    var l = str.length - suffix.length;
    return l >= 0 && str.indexOf(suffix, l) == l;
};


AppLayout.isStyleLoaded = false;

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
    this.width = "100%";
    this.height = "100%";

    if ("content" in settings) {
        this.contentHolder = $('<div class="appLayoutDiv"></div>').get(0);
        $(this.element).append(this.contentHolder);
        if (typeof(settings.content) == "string") {
            $(this.contentHolder).html(settings.content)
        }
        else {
            $(this.contentHolder).append(settings.contentElement)
        }
    }

    if ("id" in settings) {
        $(this.element).attr('id', settings.id);
    }

    if ("width" in settings) {
        this.width = settings.width;
    }

    if ("height" in settings) {
        this.height = settings.height;
    }

    if ("hidden" in settings) {
        this.hidden = settings.hidden;
    }

    if ("cls" in settings) {
        $(this.element).addClass(settings.cls);
    }

    if ("dock" in settings) {
        this.dock = settings.dock;
    }

    if ("children" in settings) {
        for (var i = 0,len = settings.children.length; i < len; i++) {
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

AppLayout.Panel.prototype.addChild = function(panel) {
    if (panel.parent != null) {
        panel.parent.removeChild(panel);
    }

    this.children.push(panel);
    $(this.element).append(panel.getElement());
    panel.parent = this;
};

AppLayout.Panel.prototype.removeChild = function(panel) {
    for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i] === panel) {
            this.children.splice(0, 1);
        }
    }
    $(this.element).remove(panel.getElement());
    panel.parent = null;
};

AppLayout.Panel.prototype.getElement = function() {
    return this.element
};

AppLayout.Panel.prototype.update = function() {
    var topMostParent = this;
    while (topMostParent.parent != null) {
        topMostParent = topMostParent.parent;
    }

    //determine topmost parent size
    $(topMostParent.element).toggleClass("appLayoutHidden", topMostParent.hidden);
    if (!topMostParent.hidden) {
        $(topMostParent.element).width(topMostParent.width);
        $(topMostParent.element).height(topMostParent.height);
        $(topMostParent.getElement()).css("position", "relative");

        topMostParent.resizeAllChildren($(topMostParent.element).width(), $(topMostParent.element).height());
    }
};

AppLayout.Panel.prototype.convertChildSizeDimensionBasedOnParentDimension = function(childDimension, parentDimension) {
    if (endsWith(childDimension, "px")) {
        return parseFloat(childDimension.substr(0, childDimension.length - 2));
    }
    else if (endsWith(childDimension, "%")) {
        return parentDimension * (parseFloat(childDimension.substr(0, childDimension.length - 1)) / 100);
    }
    else {
        return childDimension;
    }
};

AppLayout.Panel.prototype.resizeAllChildren = function(parentWidth, parentHeight) {
    var currentPanel = this;

    var currentLeft = 0;
    var currentTop = 0;
    var containerWidth = parentWidth;
    var containerHeight = parentHeight;
    var remainingWidth = containerWidth;
    var remainingHeight = containerHeight;

    for (var i = 0, len = currentPanel.children.length; i < len; i++) {
        var child = currentPanel.children[i];
        $(child.getElement()).toggleClass("appLayoutHidden", child.hidden);
        $(child.getElement()).css("position", "absolute");
        if (!child.hidden) {
            var childConvertedWidth = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.width, containerWidth);
            var childConvertedHeight = currentPanel.convertChildSizeDimensionBasedOnParentDimension(child.height, containerHeight);
            if (child.dock == "top") {
                $(child.getElement()).css("top", currentTop);
                $(child.getElement()).css("left", currentLeft);
                $(child.getElement()).width(remainingWidth);
                $(child.getElement()).height(childConvertedHeight);
                currentTop += childConvertedHeight;
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == "bottom") {
                $(child.getElement()).css("top", remainingHeight + currentTop - childConvertedHeight);
                $(child.getElement()).css("left", currentLeft);
                $(child.getElement()).width(remainingWidth);
                $(child.getElement()).height(childConvertedHeight);
                remainingHeight -= childConvertedHeight;
            }
            else if (child.dock == "left") {
                $(child.getElement()).css("top", currentTop);
                $(child.getElement()).css("left", currentLeft);
                $(child.getElement()).width(childConvertedWidth);
                $(child.getElement()).height(remainingHeight);
                currentLeft += childConvertedWidth;
                remainingWidth -= childConvertedWidth;
            }
            else if (child.dock == "right") {
                $(child.getElement()).css("top", currentTop);
                $(child.getElement()).css("left", remainingWidth + currentLeft - childConvertedHeight);
                $(child.getElement()).width(childConvertedWidth);
                $(child.getElement()).height(remainingHeight);
                remainingWidth -= childConvertedWidth;
            }
            else {
                $(child.getElement()).width(child.width);
                $(child.getElement()).height(child.height);
            }
            child.resizeAllChildren($(child.getElement()).width(), $(child.getElement()).height())
        }
    }

    if (this.contentHolder) {
        $(currentPanel.contentHolder).css("position", "absolute");
        $(currentPanel.contentHolder).css("top", currentTop);
        $(currentPanel.contentHolder).css("left", currentLeft);
        $(currentPanel.contentHolder).width(remainingWidth);
        $(currentPanel.contentHolder).height(remainingHeight);
    }
};

AppLayout.Panel.prototype.makeFullScreen = function() {
    if (this.parent != null) {
        throw "Cannot make a panel full screen that has a parent.  Please detach first.";
    }
    var maxZ = Math.max.apply(null,$.map($('body > *'), function(e,n){
           if($(e).css('position')=='absolute')
                return parseInt($(e).css('z-index'))||1 ;
           })
    );
    this.fullScreenContainer = $('<div class="appLayoutDiv" style="position: absolute; top: 0px; left:0px; z-index: '+maxZ+'"></div>').get(0);
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
    $('body').addClass("appFullScreenBody");
};