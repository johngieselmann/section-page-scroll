(function(window, document, undefined) {

    /**
     * The section page scroller class that handles the scrolling between
     * sections as if they are pages.
     *
     * @author JohnG <john.gieselmann@gmail.com>
     */
    function SectionPageScroll() {

        // retain scope
        var self = this;

        /**
         * Get our utility class.
         * @var class util
         */
        this.util = new Util();

        /**
         * Get our mobile helper class.
         * @var class util
         */
        this.mobileHelper = new MobileHelper();

        /**
         * The configuration for the class.
         * @var obj config
         *
         * - activeNavClass str (default: "sps-active") The class applied to
         *   the active navigation link.
         *
         * - activeSectionClass str (default: "sps-active") The class
         *   applied to the active section.
         *
         * - arrowKeys bool (default: true) Whether or not to allow section
         *   navigation with the arrow keys.
         *
         * - nav bool (default: true) Whether or not to include the navigation
         *   bar.
         *
         * - navClass str (default: "js-sps-nav") The class name for the
         *   navigation menu. This is only used as a selector for finding
         *   the nav menu.
         *
         * - sectionClass str *(default: "js-sps-section") The class name
         *   for the sections that are being transitioned. This is only used
         *   as a selector for finding the sections.
         *
         * - transDelay int (default: 200) The time, in milliseconds, added
         *   to the duration of the transition to prevent another transition
         *   from firing too soon.
         *
         * - transDelayScroll int (default: 800) The time, in milliseconds,
         *   added to the duration of the transition to prevent another
         *   transition from firing too soon when scrolling on a non-mobile
         *   browser.
         *
         * - zIndexStart int (default: 9999) The starting point for setting
         *   the z-index of the sections to layer them properly.
         */
        this.config = {
            "arrowKeys"          : true,
            "activeNavClass"     : "sps-active",
            "activeSectionClass" : "sps-active",
            "nav"                : true,
            "navClass"           : "js-sps-nav",
            "sectionClass"       : "js-sps-section",
            "transDelay"         : 200,
            "transDelayScroll"   : 800,
            "zIndexStart"        : 9999
        };

        /**
         * The navigation bar element.
         * @var obj nav
         */
        this.nav = null;

        /**
         * All of the navigation link elements.
         * @var arr navLinks
         */
        this.navLinks = null;

        /**
         * The current navigation link element.
         * @var obj curNavLink
         */
        this.curNavLink = null;

        /**
         * Retain the sections elements for quick recall.
         * @var arr sections
         */
        this.sections = [];

        /**
         * Keep track of the current section.
         * @var obj curSection
         */
        this.curSection = null;

        /**
         * The current section's index in the sections array.
         * @var int curIndex
         */
        this.curIndex = 0;

        /**
         * The proper mousewheel event to be bound to the document. This is
         * initially set in bindEvents and checked for each time we need it.
         * @var str mwEvent
         */
        this.mwEvent = false;

        /**
         * Flag for whether or not the browser supports CSS transitions.
         * @var bool transSupported
         */
        this.transSupported = false;

        /**
         * The duration of the transition in milliseconds. If relying on CSS
         * transitions, this MUST match the transition length to work properly.
         * @var int transDur
         */
        this.transDur = 500;

        /**
         * A flag that is set while we are moving between sections.
         * @var bool transActive
         */
        this.transActive = false;

        /**
         * Initialize the class.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj options An object of options that are assigned to the
         * config property.
         *
         * @return void
         */
        this.init = function(options) {

            // set the config
            options = options || {};
            for (var i in options) {
                self.config[i] = options[i];
            }

            // capture the elements for the class
            self.captureElements();

            // add the classes to the sections for identification
            for (var i = 0; i < self.sections.length; i++) {
                var section = self.sections[i];
                section.className = section.className += " sps-sec-" + (i + 1);
            }

            // now set the navigation... or destroy it
            if (self.config.nav) {
                self.buildNav();
            } else if (!self.config.nav && self.nav) {
                self.nav.parentElement.removeChild(self.nav);
            }

            // reverse the sections first if config is set to do so
            if (self.config.reverseSections) {
                self.reverseSections();
            } else {
                self.setZIndex();
            }

            // bind the events for the class
            self.bindEvents();

            // check for css transition support
            self.transSupported = self.util.supportsCssProp("transition");

            // finally, set the current section and navigation
            self.setCurrent(0);
        };

        /**
         * Capture the primary elements used in the class.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.captureElements = function() {

            // get the navigation, and if we can't find it, update the config
            var nav = document.getElementsByClassName(self.config.navClass);
            if (!nav.length) {
                self.config.nav = false;
            } else {
                self.nav = nav[0];
            }

            // get the sections to scroll as pages
            self.sections = document
                .getElementsByClassName(self.config.sectionClass);

        };

        /**
         * Build the navigation for each section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.buildNav = function() {

            // get the nav unordered list and it's html
            var ul = self.nav.getElementsByTagName("ul");
            var navLink = ul[0].innerHTML;

            // create the new links as a string
            var newLinks = "";
            for (var i = 0; i < self.sections.length; i++) {

                // relate this link to its ordered section
                newLinks += navLink.replace(
                    "{%section%}",
                    "sps-sec-" + (i + 1)
                );
            }

            // reassign the html of the unordered list
            ul[0].innerHTML = newLinks;

            // set the navigation links property
            self.navLinks = ul[0].getElementsByTagName("a");
        };

        /**
         * Bind the events necessary to make the scrolling work.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.bindEvents = function() {

            // nav bar navigation links
            var links = self.config.nav
                ? self.nav.getElementsByTagName("a")
                : false;

            // bind the events based on the device/supported event types
            if (self.util.touch) {

                // set the default touch events
                var touch = {
                    "start" : "touchstart",
                    "move"  : "touchmove",
                    "end"   : "touchend"
                };

                // now set the IE touch events based on which browser version
                // IE 11+ changed event types
                if (self.util.ieTouch && self.util.ie10) {
                    touch.start = "MSPointerDown";
                    touch.move = "MSPointerMove";
                    touch.end = "MSPointerUp";
                } else if (self.util.ieTouch) {
                    touch.start = "pointerstart";
                    touch.move = "pointermove";
                    touch.end = "pointerend";
                }
                //jam

                // swipe navigation
                document.addEventListener(
                    touch.start,
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    touch.move,
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    touch.end,
                    self.detectSwipe,
                    false
                );

                // bind the nav bar
                if (links) {
                    self.bindEventTags(links, touch.end, self.gotoSection);
                }

            } else {

                // mousewheel is not supported in FF 3.x+
                if (!self.mwEvent) {
                    self.mwEvent = (/Firefox/i.test(navigator.userAgent))
                        ? "DOMMouseScroll"
                        : "mousewheel";
                }

                if (document.attachEvent) {

                    // if IE (and Opera depending on user setting)
                    document.attachEvent(
                        "on" + self.mwEvent,
                        self.handleBrowserEvent
                    );

                    if (self.config.arrowKeys) {
                        document.attachEvent(
                            "onkeydown",self.handleBrowserEvent
                        );
                    }

                } else if (document.addEventListener) {

                    // WC3 browsers
                    document.addEventListener(
                        self.mwEvent,
                        self.handleBrowserEvent,
                        false
                    );
                    document.addEventListener(
                        "keydown",
                        self.handleBrowserEvent,
                        false
                    );
                }

                // bind the nav bar
                if (links) {
                    self.bindEventTags(links, "click", self.gotoSection);
                }

            }

        };

        /**
         * Bind an event to an array of tags.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param arr tags The array of DOM elements.
         *
         * @param str type The type of event to bind. If using attachEvent,
         * "on" is prepended to the type.
         *
         * @param obj listener The listener that receives the event.
         *
         * @param bool useCapture Googleable... we default to false.
         *
         * @return void
         */
        this.bindEventTags = function(tags, type, listener, useCapture) {

            // set the useCapture
            useCapture = useCapture || false;

            // loop through the tags and bind the event
            for (var i = 0; i < tags.length; i++) {
                if (document.attachEvent) {
                    tags[i].attachEvent("on" + type, listener, useCapture);
                } else {
                    tags[i].addEventListener(type, listener, useCapture);
                }
            }
        };

        /**
         * Unbind the event listeners to prevent unnecessary scrolling.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.unbindEvents = function() {

            // mousewheel is not supported in FF 3.x+
            if (!self.mwEvent) {
                self.mwEvent = (/Firefox/i.test(navigator.userAgent))
                    ? "DOMMouseScroll"
                    : "mousewheel";
            }

            if (document.detachEvent) {

                // if IE (and Opera depending on user setting)
                document.detachEvent(
                    "on" + self.mwEvent,
                    self.handleBrowserEvent
                );

                if (self.config.arrowKeys) {
                    document.detachEvent(
                        "onkeydown",self.handleBrowserEvent
                    );
                }

            } else if (document.removeEventListener) {

                // WC3 browsers
                document.removeEventListener(
                    self.mwEvent,
                    self.handleBrowserEvent,
                    false
                );
                document.removeEventListener(
                    "keydown",
                    self.handleBrowserEvent,
                    false
                );

            }
        };

        /**
         * Detect a swipe via the mobile helper and fire any necessary events.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj e The touch event.
         *
         * @return void
         */
        this.detectSwipe = function(e) {

            //jam
            // prevent the default event
            e.preventDefault();

            // we are currently transitioning, give it a second
            if (self.transActive) {
                return false;
            }

            // get the swipe info
            var swipe = self.mobileHelper.detectSwipe(e);

            // we have a swipe, to go the correct section
            if (swipe && swipe.dir) {
                switch (swipe.dir) {
                    case "up":
                        self.nextSection();
                        break;

                    case "down":
                        self.prevSection();
                        break;
                }
            }
        };

        /**
         * Set the z-index of the sections so they are layered in reverse
         * of their DOM position.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return arr sections
         */
        this.setZIndex = function() {

            // get the number of sections and the z-index starting point
            var len = self.sections.length;
            var zCount = parseInt(self.config.zIndexStart);

            // loop through the sections backwards and assign the z-index
            // so that the last section on the page ends up with the lowest
            // z-index
            for (var i = (len - 1); i >= 0; i--) {
                var section = self.sections[i];
                section.style.zIndex = zCount;

                // increment the z-index
                zCount++;
            }

            // set the z-index of the nav now that we have all the sections
            // set
            if (self.config.nav) {
                self.nav.style.zIndex = zCount;
            }
        };

        /**
         * Evaluate the events that can trigger section changes and act
         * appropriately.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj e The event.
         *
         * @return void
         */
        this.handleBrowserEvent = function(e) {

            // make sure we have the right event
            e = window.event || e;

            // if we are currently transitioning between sections stop progress
            if (self.transActive) {
                return false;
            }

            // trigger the movement based on the event type
            switch (e.type) {

                // up or down key
                case "keydown":

                    // down = go to next, up = go to previous
                    if (e.keyCode === 40 || e.keyIdentifier === "Down") {
                        self.nextSection();
                    } else if (e.keyCode === 38 || e.keyIdentifier === "Up") {
                        self.prevSection();
                    }
                    break;

                // default to scroll
                default:

                    // check for detail first so Opera uses that instead of
                    // wheelDelta
                    var delta = e.detail
                        ? e.detail * (-120)
                        : e.wheelDelta

                    // scroll down = go to next, scroll up = go to previous
                    if (delta <= 0) {
                        self.nextSection(self.config.transDelayScroll);
                    } else if (delta >= 0) {
                        self.prevSection(self.config.transDelayScroll);
                    }
                    break;
            }
        };

        /**
         * Go to the next section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param int delay The amount of time, in milliseconds, to delay
         * another transition from firing.
         *
         * @return void
         */
        this.nextSection = function(delay) {

            // do not move to a non-existent next section
            if ((self.curIndex + 1) === self.sections.length) {
                return false;
            }

            // default to the class defined value
            delay = delay || self.config.transDelay;

            // flag that we are starting the transition and add the class
            // that will move the section up
            self.startTransition();
            self.curSection.className = self.curSection.className + " sps-up";

            // clear transitioning status when it's done
            setTimeout(self.doneTransition, self.transDur + delay);

            // update the current elements
            self.setCurrent(self.curIndex + 1);
        };

        /**
         * Go to the previous section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param int delay The amount of time, in milliseconds, to delay
         * another transition from firing.
         *
         * @return void
         */
        this.prevSection = function(delay) {

            // do not move to a non-existent previous section
            if (self.curIndex === 0) {
                return false;
            }

            // default to the class defined value
            delay = delay || self.config.transDelay;

            // flag that we are starting the transition and remove the class
            // that will bring down the previous section
            self.startTransition();
            var prevSection = self.sections[self.curIndex - 1];
            prevSection.className = prevSection.className
                .replace(/\s*sps-up/, "");

            // clear transitioning status when it's done
            setTimeout(self.doneTransition, self.transDur + delay);

            // update the current elements
            self.setCurrent(self.curIndex - 1);
        };

        /**
         * Navigate to a specific section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj e The event object.
         *
         * @return void
         */
        this.gotoSection = function(e) {

            // avoid stacking events
            if (self.transActive) {
                return false;
            }

            // start the transition process
            self.startTransition();

            var targetClass = e.target.getAttribute("rel");

            // keep track of the sections before and after the targeted
            // section
            var secBefore = [];
            var secAfter = [];

            // keep track of the section index so we can properly set the
            // before and after, start obnoxiously high to avoid collision
            var secIndex = 99999999;

            // loop through all the sections and find our target and all of
            // its preceding and proceeding sections
            for (var i = 0; i < self.sections.length; i++) {
                var section = self.sections[i];

                // this section matches the nav rel attribute, gotcha
                if (self.sections[i].className.match(targetClass)) {
                    var targSection = self.sections[i];
                    secIndex = i;

                    // check that this is not the current section
                    if (secIndex === self.curIndex) {
                        self.doneTransition();
                        return false;
                    } else {
                        continue;
                    }
                }

                // not our target, flag as before or after
                if (i < secIndex) {
                    secBefore.push(section);
                } else {
                    secAfter.push(section);
                }
            }

            // if the new section is above the current section, remove all
            // the transition classes below the target
            if (secIndex < self.curIndex) {

                // go through the sections after in reverse order so it is
                // the natural progression
                for (var j = (secAfter.length - 1); j >= 0; j--) {
                    secAfter[j].className = secAfter[j].className
                        .replace(/\s*sps-up/, "");
                }

                // now remove the target section name
                targSection.className = targSection.className
                    .replace(/\s*sps-up/, "");

            } else {

                for (var k = 0; k < secBefore.length; k++) {
                    if (secBefore[k].className.match("sps-up")) {
                        continue;
                    } else {
                        secBefore[k].className += " sps-up";
                    }
                }
            }

            // allow transitioning again after the transition is complete
            setTimeout(self.doneTransition, self.transDelay);

            // update the current elements
            self.setCurrent(secIndex);
        };

        /**
         * Set the current section and nav by the passed in index.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param int index The index of the current section and nav.
         *
         * @return void
         */
        this.setCurrent = function(index) {
            self.curIndex = index;
            self.curSection = self.sections[index];

            // remove the "current" class from the sections
            var secRE = new RegExp("\\s*" + self.config.activeSectionClass);
            for (var i = 0; i < self.sections.length; i++) {
                self.sections[i].className = self.sections[i].className
                    .replace(secRE, "");
            }

            // set the "current" class to the current section
            self.curSection.className = self.curSection.className
                + " " + self.config.activeSectionClass;

            if (self.config.nav) {
                self.curNavLink = self.navLinks[index];

                var navRE = new RegExp("\\s*" + self.config.activeNavClass);
                for (var i = 0; i < self.navLinks.length; i++) {
                    self.navLinks[i].className = self.navLinks[i].className
                        .replace(navRE, "");
                }

                // set the "current" class to the current section
                self.curNavLink.className = self.curNavLink.className
                    + " " + self.config.activeNavClass;
            }
        };

        /**
         * Called when the transition process has begun.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.startTransition = function() {
            self.transActive = true;
            self.unbindEvents();
        };

        /**
         * Called when the transition between sections is complete.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.doneTransition = function() {
            self.transActive = false;
            self.bindEvents();
        };

    }

    /**
     * The MobileHelper class is used adapt the scrolling to mobile.
     *
     * @author JohnG <john.gieselmann@gmail.com>
     */
    function MobileHelper(caller) {

        // retain scope
        var self = this;

        /**
         * The minimum percentage of the window height to consider this a swipe.
         * @var float deltaMin
         */
        this.deltaMin = .15;

        /**
         * Retain the starting point of a touch movement on the X and Y axis.
         * @var int startX
         * @var int startY
         */
        this.startX = 0;
        this.startY = 0;

        /**
         * Retain the distance of a touch movement.
         * @var int deltaX
         * @var int deltaY
         */
        this.deltaX = 0;
        this.deltaY = 0;

        /**
         * Keep track of the plane on which the touch is moving.
         * @var str plane
         */
        this.plane = null;

        /**
         * Detect the direction of a swipe.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param e obj The touch event.
         *
         * @return obj|bool out If a seemingly intentional swipe has been detected,
         * return an object with the swipe info, otherwise false.
         *   out = {
         *       "dir"    : ["up"|"down"|"left"|"right"|false],
         *       "startX" : // the starting X axis point
         *       "startY" : // the starting Y axis point
         *       "deltaX" : // the distance traveled for X
         *       "deltaY" : // the distance traveled for Y
         *       "endX"   : // the ending X axis point
         *       "endY"   : // the ending Y axis point
         *   }
         */
        this.detectSwipe = function(e) {
            //jam

            // get the touch changes
            var touchObj = e.changedTouches[0];

            // set the default output to false
            var out = false;

            switch (e.type) {
                case "touchstart":
                    self.startX = touchObj.clientX;
                    self.startY = touchObj.clientY;
                    break;

                case "touchmove":
                    self.deltaX = parseInt(touchObj.clientX) - self.startX;
                    self.deltaY = parseInt(touchObj.clientY) - self.startY;

                    // on which plane are we scrolling?
                    if (Math.abs(self.deltaX) > Math.abs(self.deltaY)) {
                        // keep track on the horizontal plane
                        self.plane = "horizontal";
                    } else {
                        // keep track on the vertical plane
                        self.plane = "vertical";
                    }

                    break;

                case "touchend":

                    // update the output since we are at the end of our movement
                    out = {
                        "dir"    : false,
                        "startx" : self.startX,
                        "starty" : self.startY,
                        "deltax" : self.deltaX,
                        "deltay" : self.deltaY,
                        "endx"   : touchObj.clientX,
                        "endy"   : touchObj.clientY
                    };

                    // check for intentional distance traveled on the swipe
                    // and return whether or not this should count
                    switch (self.plane) {

                        case "horizontal":

                            // check distance first and get out early if not
                            // far enough
                            if (  Math.abs(self.deltaX)
                                < (self.deltaMin * window.innerWidth)
                            ) {
                                return out;
                            }

                            // return the direction
                            if (self.deltaX > 0) {
                                out.dir = "right";
                            } else {
                                out.dir = "left";
                            }

                            break;

                        case "vertical":

                            // check distance first and get out early if not
                            // far enough
                            if (  Math.abs(self.deltaY)
                                < (self.deltaMin * window.innerHeight)
                            ) {
                                return out;
                            }

                            // return the direction
                            if (self.deltaY > 0) {
                                out.dir = "down";
                            } else {
                                out.dir = "up";
                            }

                            break;
                    }

                    // reset the values
                    self.startX = 0;
                    self.startY = 0;
                    self.deltaX = 0;
                    self.deltaY = 0;

                    break;
            }

            // return the output
            return out;

        };

        this.touchStart = function(e) {
            console.log(e.type);
            self.startY = e.changedTouches[0];
            e.preventDefault();
        };

        this.touchMove = function(e) {

        };

        this.touchEnd = function(e) {

        };
    }

    /**
     * A utility class to help out our scrolling class.
     *
     * @author JohnG <john.gieselmann@gmail.com>
     */
    function Util() {

        // retain scope
        var self = this;

        /**
         * Check if this browser supports a CSS property.
         *
         * Adapted from <https://gist.github.com/jackfuchs/556448>
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param str p The property name.
         *
         * @return bool Whether or not the property is supported
         */
        this.supportsCssProp = function(prop) {

            // get a testable element and the style attribute
            var b = document.body || document.documentElement;
            var s = b.style;

            // No css support detected
            if (typeof s === "undefined") {
                return false;
            }

            // Tests for standard prop
            if (typeof s[prop] === "string") {
                return true;
            }

            // Tests for vendor specific prop
            var v = ["Moz", "Webkit", "Khtml", "O", "ms", "Icab"];
            prop = prop.charAt(0).toUpperCase() + prop.substr(1);

            for (var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + prop] === "string") { 
                    return true;
                }
            }

            // no support found
            return false;
        };

        /**
         * Test for IE browsers.
         * @var bool ieTouch
         * @var bool ie10
         */
        this.ieTouch = /MSIE.*Touch/.test(navigator.userAgent);
        this.ie10 = /MSIE 10/.test(navigator.userAgent);

        /**
         * Test whether or not this is a touch event compatible device.
         * @var bool touch
         */
        this.touch = /Android|BlackBerry|iPad|iPhone|iPod|Opera Mini/
            .test(navigator.userAgent) || self.ieTouch;

    }

    // assign the class to the window for availability elsewhere
    window.SectionPageScroll = SectionPageScroll;

})(window, document, undefined);
