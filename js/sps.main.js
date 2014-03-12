(function(window, document, $, undefined) {

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
         * Retain the jQuery sections for quick recall.
         * @var arr sections
         */
        this.sections = [];

        /**
         * The configuration for the class.
         * @var obj config
         */
        this.config = {
            "sectionSelector" : ".js-sps-section"
        };

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
        };

        /**
         * Capture the primary elements used in the class.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.captureElements = function() {
            self.sections = $(self.config.sectionSelector);
        };
    }

    // assign the class to the window
    window.SectionPageScroll = SectionPageScroll;
})(window, document, jQuery, undefined);
