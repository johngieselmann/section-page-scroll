# Section Page Scroller

## Setup
Clone this repository

Include the sps.main.js file in your HTML page.
```
<script type="text/javascript" src="/path/to/sps.main.js"></script>
```

Add the `section-page-scroller` class to the `<body>` tag.
```
<body class="section-page-scroller">
    <!-- content -->
</body>
```

Add the `sps-section` and `js-sps-section` classes to the elements that
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
