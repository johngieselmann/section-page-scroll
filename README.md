# Section Page Scroll

This is a nifty little website scroller that will create page like sections
that slide up/down on scroll or keypress as if moving between pages.

Currently, it supports modern desktop browsers and touch event browsers...
Essentially, pretty much everything except IE Mobile, but that is coming.

Example: http://johngieselmann.com/section-page-scroll/

## Setup
Clone this repository

Include the sps.main.js file in your HTML page.
```
<script type="text/javascript" src="/path/to/sps.main.js"></script>
```

Include the sps.main.css file in your HTML page.
```
<link rel="stylesheet" type="text/css" href="/path/to/sps.main.css" />
```

Add the "section-page-scroller" class to the body tag.
```
<body class="section-page-scroller">
    <!-- content -->
</body>
```

Add the "sps-section" and "js-sps-section" classes to the elements that
will act as the pages to be scrolled between.
```
<body class="section-page-scroller">
    <section class="sps-section js-sps-section">
        <!-- section 1 -->
    </section>

    <section class="sps-section js-sps-section">
        <!-- section 2 -->
    </section>
</body>
```

Instantiate and initialize the class in your JavaScript with the configuration.
```
// this is the default configuration, if you do not plan on changing things
// this is not necessary to pass in
var config = {
    "jsAnimate"        : false,
    "sectionClass"     : "js-sps-section",
    "transDelay"       : 200,
    "transDelayScroll" : 800,
    "zIndexStart"      : 9999
};

// instantiate and initialize
var sps = new window.SectionPageScroll();
sps.init(config);
```

## Configuration

- **jsAnimate** *bool* - Force JavaScript animation with bool true.
    - *Default* = false

- **sectionClass** *str* - The class name for the sections that act as
  pages.
    - *Default* = "js-sps-section"

- **transDelay** *int* - The time, in milliseconds, added to the duration
  of the transition to prevent another transition from firing too
  soon.
    - *Default* = 200

- **transDelayScroll** *int* - The time, in milliseconds, added to the
  duration of the transition to prevent another transition from
  firing too soon when scrolling on a non-mobile browser.
    - *Default* = 800

- **zIndexStart** *int* - The starting point for setting the z-index
  of the sections to layer them properly.
    - *Default* = 9999
