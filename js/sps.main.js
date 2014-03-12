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
         * - sectionClass str: The class name for the sections that act as
         *   pages.
         *   - Default: js-sps-section
         */
        this.config = {
            "sectionClass" : "js-sps-section"
        };

        /**
         * Retain the jQuery sections for quick recall.
         * @var arr sections
         */
        this.sections = [];

        /**
         * Flag for whether or not the browser supports CSS transitions.
         * @var bool transSupported
         */
        this.transSupported = false;

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

            // check for css transition support
            self.transSupported = self.util.supportsCssProp("transition");

            // capture the elements for the class
            self.captureElements();

            // bind the events for the class
            self.bindEvents();
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

            console.log(self.sections);
        };

        /**
         * Bind the events necessary to make the scrolling work.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.bindEvents = function() {
            window.onscroll = self.sectionChange;
            document.body.onkeypress = self.sectionChange;
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
