# Section Page Scroll

This is a nifty little website scroller that will create page like sections
that slide up/down on scroll or keypress as if moving between pages.

Currently, it supports modern desktop browsers and touch event browsers
(pretty much everything except IE Mobile).

Example: http://johngieselmann.com/section-page-scroll/

## Requirements

- JavaScript (no jQuery... believe it)
- Browser that supports CSS transitions (JS animations not currently working)

## Setup

Clone this repository
```
git clone https://github.com/johngieselmann/section-page-scroll.git
```

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
    "arrowKeys"        : true,
    "jsAnimate"        : false,
    "nav"              : true,
    "navClass"         : "js-sps-nav",
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

- **arrowKeys** bool *(default: true)* Whether or not to allow section
  navigation with the arrow keys.

- **jsAnimate** bool *(default: false)* Force JavaScript animation with bool
  true.

- **nav** bool *(default: true)* Whether or not to include the navigation
  bar.

- **navClass** str *(default: "js-sps-nav")* The class name for the
  sections that act as pages.

- **sectionClass** str *(default: "js-sps-section")* The class name for the
  sections that act as pages.

- **transDelay** int *(default: 200)* The time, in milliseconds, added to the
  duration of the transition to prevent another transition from firing too soon.

- **transDelayScroll** int *(default: 800)* The time, in milliseconds, added
  to the duration of the transition to prevent another transition from
  firing too soon when scrolling on a non-mobile browser.

- **zIndexStart** int *(default: 9999)* The starting point for setting the
  z-index of the sections to layer them properly.
