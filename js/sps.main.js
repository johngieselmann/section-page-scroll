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
         * The configuration for the class.
         * @var obj config
         *
         * - jsAnimate bool: Force JavaScript animation with bool true.
         *   Default: false
         *
         * - reverseSections bool: Whether or not to detach and reattach the
         *   sections in reverse order. If false, we assign a z-index to
         *   visually order them without manipulating the DOM.
         *   NOTE: Leave this false if there are other events and/or
         *   dependencies on the original order.
         *   - Default: false
         *
         * - sectionClass str: The class name for the sections that act as
         *   pages.
         *   - Default: js-sps-section
         *
         * - zIndexStart int: The starting point for setting the z-index
         *   of the sections to layer them properly.
         *   - Default: 9999
         */
        this.config = {
            "jsAnimate"       : false,
            "reverseSections" : false,
            "sectionClass"    : "js-sps-section",
            "zIndexStart"     : 9999
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
         * Padding added to the animation duration to make sure we aren't
         * firing the next animation too soon.
         * @var int animDurPad
         */
        this.animDurPad = 800;

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

            // mousewheel is not supported in FF 3.x+
            if (!self.mwEvent) {
                self.mwEvent = (/Firefox/i.test(navigator.userAgent))
                    ? "DOMMouseScroll"
                    : "mousewheel";
            }

            if (document.attachEvent) {
                // if IE (and Opera depending on user setting)
                document.attachEvent("on" + self.mwEvent, self.handleEvent);
                document.attachEvent("onkeydown", self.handleEvent);
            } else if (document.addEventListener) {
                // WC3 browsers
                document.addEventListener(self.mwEvent, self.handleEvent, false);
                document.addEventListener("keydown", self.handleEvent);
            }

//            window.onmousewheel = self.handleEvent;
//            document.onkeydown = self.handleEvent;
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

            if (document.attachEvent) {
                // if IE (and Opera depending on user setting)
                document.detachEvent("on" + self.mwEvent, self.handleEvent);
                document.detachEvent("onkeydown", self.handleEvent);
            } else if (document.addEventListener) {
                // WC3 browsers
                document.removeEventListener(self.mwEvent, self.handleEvent, false);
                document.removeEventListener("keydown", self.handleEvent);
            }
        };

        /**
         * Detach and reattach the sections to the DOM in reverse order.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.reverseSections = function() {

            self.captureElements();
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
        this.handleEvent = function(e) {

            e = window.event || e;

            // if we are currently animating between sections stop progress
            if (self.animating) {
                return false;
            }

            // trigger the movement based on the event type
            switch (e.type) {

                // up or down key
                case "keydown":

                    if (e.keyCode === 40 || e.keyIdentifier === "Down") {
                        // down key = go to next section
                        self.nextSection(e);
                    } else if (e.keyCode === 38 || e.keyIdentifier === "Up") {
                        // up key = go to next section
                        self.prevSection(e);
                    }
                    break;

                // default to scroll
                default:

                    // check for detail first so Opera uses that instead of wheelDelta
                    var delta = e.detail
                        ? e.detail * (-120)
                        : e.wheelDelta

                    if (delta <= 0) {
                        self.nextSection(e);
                    } else if (delta >= 0) {
                        self.prevSection(e);
                    }
                    break;
            }
        };

        /**
         * Go to the next section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.nextSection = function() {

            // do not move to a non-existent next section
            if ((self.curIndex + 1) === self.sections.length) {
                return false;
            }

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
                setTimeout(self.doneAnimating, self.animDur + self.animDurPad);
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
         * @return void
         */
        this.prevSection = function() {

            // do not move to a non-existent previous section
            if (self.curIndex === 0) {
                return false;
            }

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
                setTimeout(self.doneAnimating, self.animDur + self.animDurPad);
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
    }

    // assign the class to the window
    window.SectionPageScroll = SectionPageScroll;
})(window, document, undefined);
