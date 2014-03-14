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
         * - arrowKeys bool (default: true) Whether or not to allow section
         *   navigation with the arrow keys.
         *
         * - jsAnimate bool: Force JavaScript animation with bool true.
         *   Default: false
         *
         * - sectionClass str: The class name for the sections that act as
         *   pages.
         *   - Default: js-sps-section
         *
         * - transDelay int: The time, in milliseconds, added to the duration
         *   of the transition to prevent another transition from firing too
         *   soon.
         *   - Default: 200
         *
         * - transDelayScroll int: The time, in milliseconds, added to the
         *   duration of the transition to prevent another transition from
         *   firing too soon when scrolling on a non-mobile browser.
         *   - Default: 800
         *
         * - zIndexStart int: The starting point for setting the z-index
         *   of the sections to layer them properly.
         *   - Default: 9999
         */
        this.config = {
            "arrowKeys"        : true,
            "jsAnimate"        : false,
            "sectionClass"     : "js-sps-section",
            "transDelay"       : 200,
            "transDelayScroll" : 800,
            "zIndexStart"      : 9999
        };

        /**
         * Retain the jQuery sections for quick recall.
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
         * The duration of the animation in milliseconds. If relying on CSS
         * transitions, this MUST match the transition length to work properly.
         * @var int animDur
         */
        this.animDur = 500;

        /**
         * The interval duration in milliseconds for the JavaScript animation.
         * @var int jsAnimInterval
         */
        this.jsAnimInterval = 10;

        /**
         * The pixel / millisecond animation rate for JavaScript animation.
         * @var int jsAnimRate
         */
        this.jsAnimRate = false;

        /**
         * A flag that is set while we are moving between sections.
         * @var bool animating
         */
        this.animating = false;

        /**
         * This is the interval used to track the manual JavaScript animation.
         * @var int interval
         */
        this.interval = false;

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

            // reverse the sections first if config is set to do so
            if (self.config.reverseSections) {
                self.reverseSections();
            } else {
                self.setZIndex();
            }

            // calculate the rate of movement for JavaScript animation
            self.jsAnimRate = (window.innerHeight / self.animDur)
                * self.jsAnimInterval;

            // set the current section to the top section in the DOM
            self.curSection = self.sections[0];

            // bind the events for the class
            self.bindEvents();

            // check for css transition support
            self.transSupported = self.util.supportsCssProp("transition");

        };

        /**
         * Capture the primary elements used in the class.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.captureElements = function() {

            // get the sections to scroll as pages
            self.sections = document
                .getElementsByClassName(self.config.sectionClass);

        };

        /**
         * Bind the events necessary to make the scrolling work.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.bindEvents = function() {

            // bind the events based on the device
            if (self.util.touch) {

                document.addEventListener(
                    "touchstart",
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    "touchmove",
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    "touchend",
                    self.detectSwipe,
                    false
                );

            } else if (self.util.ieMobile) {

                // TODO - Get IE Touch events working
                document.addEventListener(
                    "MSPointerDown",
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    "MSPointerMove",
                    self.detectSwipe,
                    false
                );
                document.addEventListener(
                    "MSPointerUp",
                    self.detectSwipe,
                    false
                );

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

            // prevent the default event
            e.preventDefault();

            // we are currently transitioning, give it a second
            if (self.animating) {
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

            // if we are currently animating between sections stop progress
            if (self.animating) {
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
         * @param int padding The amount of time, in milliseconds, to delay
         * another transition from firing.
         *
         * @return void
         */
        this.nextSection = function(padding) {

            // do not move to a non-existent next section
            if ((self.curIndex + 1) === self.sections.length) {
                return false;
            }

            // default to the class defined value
            padding = padding || self.config.transDelay;

            // flag that we are animating and remove that flag with a little
            // padding added onto the animDur property
            self.startAnimating();

            if (!self.transSupported || self.config.jsAnimate === true) {

                var section = self.curSection;
                self.interval = setInterval(function() {
                    self.jsAnimateUp(section);
                }, self.jsAnimInterval);

            } else {
                var classes = self.curSection.className;
                self.curSection.className = classes + " sps-up";

                // clear animating status when it's done
                setTimeout(self.doneAnimating, self.animDur + padding);
            }

            // set the new section index and section
            self.curIndex += 1;
            self.curSection = self.sections[self.curIndex];
        };

        /**
         * Go to the previous section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param int padding The amount of time, in milliseconds, to delay
         * another transition from firing.
         *
         * @return void
         */
        this.prevSection = function(padding) {

            // do not move to a non-existent previous section
            if (self.curIndex === 0) {
                return false;
            }

            // default to the class defined value
            padding = padding || self.config.transDelay;

            // flag that we are animating and remove that flag with a little
            // padding added onto the animDur property
            self.startAnimating();

            // get the previous section to bring down
            var prevSection = self.sections[self.curIndex - 1];

            // remove the class from the previous section off the screen
            if (!self.transSupported || self.config.jsAnimate === true) {

                self.interval = setInterval(function() {
                    self.jsAnimateDown(prevSection);
                }, self.jsAnimInterval);

            } else {
                var prevClasses = prevSection.className;
                prevSection.className = prevClasses.replace(/\s*sps-up/, "");

                // clear animating status when it's done
                setTimeout(
                    self.doneAnimating,
                    self.animDur + self.config.transDelay
                );
            }

            // set the new section index and section
            self.curIndex -= 1;
            self.curSection = self.sections[self.curIndex];
        };

        this.prevTop = 0;

        /**
         * Manually animate the transition to the next section. This is called
         * on an interval until complete.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.jsAnimateUp = function(section) {

            // TODO REPLACE WITH WORKING JS ANIMATION
            section.style.top = "-100%";
            clearInterval(self.interval);
            self.doneAnimating();
            return true;

//            var pos = section.getBoundingClientRect();
//            console.log(section.style.top, pos.bottom);
//            section.style.top = (section.style.top - self.jsAnimRate).toString() + "px";
//
//            if (pos.bottom <= 0) {
//                self.curSection.style.top = "-100%";
//                self.doneAnimating();
//                clearInterval(self.interval);
//            }
        };

        /**
         * Manually animate the transition to the previous section. This is called
         * on an interval until complete.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.jsAnimateDown = function() {
            // TODO REPLACE WITH WORKING JS ANIMATION
            section.style.top = "0px";
            clearInterval(self.interval);
            self.doneAnimating();
            return true;
        };

        /**
         * Called when the animation process has begun.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.startAnimating = function() {
            self.animating = true;
            self.unbindEvents();
        };

        /**
         * Called when the animation between sections is complete.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.doneAnimating = function() {
            self.animating = false;
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
         * Test whether or not this is a touch event compatible device.
         * @var bool touch
         */
        this.touch = /Android|BlackBerry|iPad|iPhone|iPod|Opera Mini/.test(navigator.userAgent);

        /**
         * Test for IE Mobile browser.
         * @var bool ieMobile
         */
        this.ieMobile = /IEMobile/.test(navigator.userAgent);
    }

    // assign the class to the window
    window.SectionPageScroll = SectionPageScroll;
})(window, document, undefined);
