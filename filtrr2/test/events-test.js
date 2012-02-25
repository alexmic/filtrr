$(document).ready(function(){ 
    
    module("Events")

    test("Registering events.", function() {
        var events = new Filtrr2.Events(),
            ev1c = 0,
            ev2c = 0;
        events.on("ev1", function() {
             ev1c++; 
        });
        events.on("ev1", function() {
             ev1c++;
        });
        events.on("ev2", function() {
             ev2c++;
        });
        events.on("ev2", function() {
             ev2c++;
        });
        events.on("ev2", function() {
             ev2c++;
        });
        events.on("ev2", function() {
             ev2c++;
        });
        events.trigger("ev1");
        events.trigger("ev2");
        equal(ev1c, 2);
        equal(ev2c, 4);
    });

    test("Registering events with attributes.", function() {
        var events = new Filtrr2.Events();
        events.on("ev1", function(a) {
            equal(a, 1);
        });
        events.on("ev1", function(a) {
            equal(a, 1);
        });
        events.on("ev2", function(b, c) {
            equal(b, 2);
            equal(c, 3);
        });
        events.on("ev2", function(b, c) {
            equal(b, 2);
            equal(c, 3);
        });
        events.trigger("ev1", 1);
        events.trigger("ev2", 2, 3);
    });

    test("Registering events with context.", function() {
        var events = new Filtrr2.Events();
        var ctxa = {
            a: 1
        };

        var ctxb = {
            b: 2
        };
        events.on("ev1", function(ev) {
            equal(this.a, 1);
        }, ctxa);
        events.on("ev2", function(ev) {
            equal(this.b, 2);
        }, ctxb);
        events.trigger("ev1");
        events.trigger("ev2");
    });

    test("Unregistering events.", function() {
        var events = new Filtrr2.Events(),
            ev1c = 0,
            ev2c = 0;
        var cb1 = function() {
            ev1c++; 
        };
        var cb2 = function() {
            ev1c++;
        }
        var cb3 = function() {
            ev1c++;
        }
        var cb4 = function() {
            ev2c++;
        }
        var cb5 = function() {
            ev2c++;
        }
        var cb6 = function() {
            ev2c++;
        }
        
        events.on("ev1", cb1);
        events.on("ev1", cb2);
        events.on("ev1", cb3);
        events.on("ev2", cb4);
        events.on("ev2", cb5);
        events.on("ev2", cb6);

        events.trigger("ev1");
        events.trigger("ev2");
        
        equal(ev1c, 3);
        equal(ev2c, 3);
        
        events.off("ev1", cb1);
        events.off("ev2", cb4);
        
        events.trigger("ev1");
        events.trigger("ev2");
        
        equal(ev1c, 5);
        equal(ev2c, 5);

        events.off("ev1");
        events.off("ev2");

        events.trigger("ev1");
        events.trigger("ev2");

        equal(ev1c, 5);
        equal(ev2c, 5);
    });

    test("Filtrr2 events context is F instance.", function() {
        var my = Filtrr2("#events-img");
        my.on("hello", function() {
            ok(typeof this == 'object');
            ok(this.constructor.toString().indexOf("F") > -1);
            ok(this.el);
            ok(this.ready);
        });
        my.trigger("hello");
    });

});