$(document).ready(function(){

    module("Filtrr2");

    asyncTest("Initialize from image id.", function() {
        Filtrr2("#test-img", function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Initialize from image css class.", function() {
        Filtrr2(".test-img1", function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Initialize from jq image.", function() {
        Filtrr2($("#test-img2"), function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Initialize from canvas id.", function() {
        Filtrr2("#test-canvas", function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Initialize from canvas css class.", function() {
        Filtrr2(".test-canvas1", function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Initialize from jq canvas.", function() {
        Filtrr2($("#test-canvas2"), function() {
           ok(true);
           start(); 
        });
    });

    asyncTest("Non existing DOM object.", function() {
        raises(function() {
            Filtrr2(undefined, function() {});
        });
        start();
    });
    
    asyncTest("Non existing DOM object.", function() {
        raises(function() {
            Filtrr2(null, function() {});
        });
        start();
    });

    asyncTest("Non existing DOM object.", function() {
        raises(function() {
            Filtrr2($("#asfafa"), function() {});
        });
        start();
    });

    test("Re-initialize from image id.", function() {
        var f = Filtrr2("#test-img");
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    test("Re-initialize from image css class.", function() {
        var f = Filtrr2(".test-img1");
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    test("Re-initialize from jq image.", function() {
        var f = Filtrr2($("#test-img2"));
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    test("Re-initialize from canvas id.", function() {
        var f = Filtrr2("#test-canvas");
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    test("Re-initialize from canvas css class.", function() {
        var f = Filtrr2(".test-canvas1");
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    test("Re-initialize from jq canvas.", function() {
        var f = Filtrr2($("#test-canvas2"));
        ok(f.ready());
        ok(new Date().getTime() > f.created);
    });

    // Check no-store.
    test("Initialize instances with no-store.", function() {
        var f1 = Filtrr2("#test-img-ns", function(){}, {
            store: false
        });
        var f2 = Filtrr2("#test-img-ns", function(){});

        // Stored once so always in store.
        var f3 = Filtrr2("#test-img-ns", function(){}, {
            store: false
        });
        var f4 = Filtrr2("#test-img-ns", function(){});
        
        ok(f1 != f2);
        ok(f2 == f3);
        ok(f3 == f4);
    });

    function check(f) {
        var c = f.canvas, e = f.el;
        ok(f.on);
        ok(f.off);
        ok(f.trigger);
        ok(f.el);
        ok(f.canvas);
        ok(f.canvas[0].nodeName.toLowerCase() === "canvas");
        ok(f.processor);
        equal(c.height(), e.height());
        equal(c.width(), e.width());
        equal(c.css("position"), e.css("position"));
    }

    asyncTest("Image id.", function() {
        var f = Filtrr2("#test-img11");
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("Image css class.", function() {
        var f = Filtrr2(".test-img11");
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("jQuery image.", function() {
        var f = Filtrr2($("#test-img21"));
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("Re-initialize from canvas id.", function() {
        var f = Filtrr2("#test-canvas111");
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("Re-initialize from canvas css class.", function() {
        var f = Filtrr2(".test-canvas1111");
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("Re-initialize from canvas css class.", function() {
        var f = Filtrr2(".test-canvas1111");
        f.ready(function (){
            check(f);
            start();
        });
    });

    asyncTest("Re-initialize from jq canvas.", function() {
        var f = Filtrr2($("#test-canvas2111"));
        f.ready(function (){
            check(f);
            start();
        });
    });

    test("Returns _ready without callback.", function() {
        var f = Filtrr2("#test-img211231"),
            ready = f.ready();
        ok(typeof ready === 'boolean', "ready() returns boolean.");
    });

    asyncTest("Ready() overrides callback passed in constructor.", function() {
        var f = Filtrr2("#test-img2112312", function() {
            ok(false, "Incorred callback called.");
            start();
        });

        f.ready(function() {
           ok(true, "Correct callback called.");
           start();
        });
    });

    asyncTest("Update() not called when not ready.", function() {
        var f = Filtrr2("#test-img21123123");

        f.update(function() {
            ok(false, "this should not get called.");
            start();
        });

        ok(true, "update() callback not called");
        start();
    });
            
});