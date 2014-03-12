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
         * Flag for whether or not the browser supports CSS transitions.
         * @var bool transSupported
         */
        this.transSupported = false;

        /**
         * Retain the scroll top to determine which direction the user has
         * scrolled.
         * @var int scrollTop
         */
        this.scrollTop = 0;

        /**
         * A flag that is set while we are moving between sections.
         * @var bool animating
         */
        this.animating = false;

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
            var mwEvent = (/Firefox/i.test(navigator.userAgent))
                ? "DOMMouseScroll"
                : "mousewheel";

            if (document.attachEvent) {
                // if IE (and Opera depending on user setting)
                document.attachEvent("on" + mwEvent, self.handleEvent);
            } else if (document.addEventListener) {
                // WC3 browsers
                document.addEventListener(mwEvent, self.handleEvent, false);
            }

//            window.onmousewheel = self.handleEvent;
            document.body.onkeydown = self.handleEvent;
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

            // check for up or down key press
            if (e.type === "keydown") {

                if (e.keyCode === 40 || e.keyIdentifier === "Down") {
                    // down key = go to next section
                    self.nextSection(e);
                } else if (e.keyCode === 38 || e.keyIdentifier === "Up") {
                    // up key = go to next section
                    self.prevSection(e);
                }

            } else {
                // must be scrolling

                // check for detail first so Opera uses that instead of wheelDelta
                var delta = e.detail
                    ? e.detail * (-120)
                    : e.wheelDelta

                if (delta <= 0) {
                    self.nextSection(e);
                } else if (delta >= 0) {
                    self.prevSection(e);
                }

                // set the new scroll top
                self.scrollTop = window.scrollTop;

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
            console.log("next section");
            if (self.transSupported) {
                
            }
        };

        /**
         * Go to the previous section.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.prevSection = function() {
            console.log("prev section");
        };

        /**
         * Handle the scrolling even on the page.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj e The scroll event.
         *
         * @return void
         */
        this.sectionChange = function(e) {
            console.log(e);

            // get the direction of the scrolling
            var dir = "down";
            switch (dir) {
                case "up":

                    break;

                case "down":

                    break;
            }
        };

        /**
         * Use CSS transitions to animate the scroll/section change.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj e The triggered event.
         *
         * @param str dir The direction in which to scroll the sections.
         *
         * @return void
         */
        this.transitionScroll = function(e) {
            switch (dir) {
                case "up":

                    break;

                case "down":

                    break;
            }
        };

        this.animateScroll = function(e) {

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
