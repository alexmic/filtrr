$(document).ready(function(){

    module("Util")

    var Util = Filtrr2.Util;
    
    test("clamp()", function() {
        
        equal(Util.clamp(0), 0, "Min default value.");
        equal(Util.clamp(255), 255, "Max default value.");
        equal(Util.clamp(150), 150, "Random number with default values.");
        equal(Util.clamp(150, 0, 255), 150, "Random number with set values.");
        equal(Util.clamp(10, 50, 100), 50, "Less than min value.");
        equal(Util.clamp(50, 10, 20), 20, "More than max value.");

    });

    test("dist()", function() {

        equal(Util.dist(0, 0), 0, "Zero distance with 0s.");
        equal(Util.dist(255, 255), 0, "Zero distance with random num.");
        equal(Util.dist(0, 10), 10, "Two positives.");
        equal(Util.dist(-10, -20), 10, "Two negatives.");
        equal(Util.dist(-10, 10), 20, "One positive, one negative.");
        
    });

    test("normalize()", function() {

        equal(Util.normalize(50, 0, 1, 0, 100), 0.5, "src: All ranges positive.");
        equal(Util.normalize(50, 0, 10, 0, 100), 5, "src: All ranges positive.");
        equal(Util.normalize(50, 0, 1, 50, 100), 0, "src: All ranges positive.");
        equal(Util.normalize(100, 0, 1, 50, 100), 1, "src: All ranges positive.");
        equal(Util.normalize(75, 0, 1, 50, 100), 0.5, "src: All ranges positive.");
        equal(Util.normalize(150, 0, 1, 50, 100), 1, "src: All ranges positive.");

        equal(Util.normalize(0, 0, 1, -100, 100), 0.5, "src: Min negative, max positive.");
        equal(Util.normalize(100, 0, 10, -100, 100), 10, "src: Min negative, max positive.");
        equal(Util.normalize(-100, 0, 1, -100, 100), 0, "src: Min negative, max positive.");
        equal(Util.normalize(-1100, 0, 1, -100, 100), 0, "src: Min negative, max positive.");
        equal(Util.normalize(1000, 0, 1, -100, 100), 1, "src: Min negative, max positive.");
        equal(Util.normalize(5, 0, 1, -10, 10), 0.75, "src: Min negative, max positive.");

        equal(Util.normalize(-75, 0, 1, -100, -50), 0.5, "src: All ranges negative.");
        equal(Util.normalize(-100, 0, 10, -100, -50), 0, "src: All ranges negative.");
        equal(Util.normalize(-50, 0, 1, -100, -50), 1, "src: All ranges negative.");
        equal(Util.normalize(-500, 0, 1, -100, -50), 0, "src: All ranges negative.");
        equal(Util.normalize(-40, 0, 1, -100, -50), 1, "src: All ranges negative.");

        equal(Util.normalize(-100, 0, 1, -100, 0), 0, "src: Min negative, max 0.");
        equal(Util.normalize(0, 0, 1, -100, 0), 1, "src: Min negative, max 0");
        equal(Util.normalize(-1, 0, 1, -10, 0), 0.9, "src: Min negative, max 0");

        equal(Util.normalize(-100, -1, 1, -100, 100), -1, "dst: Min negative, max positive.");
        equal(Util.normalize(0, -1, 1, -100, 100), 0, "dst: Min negative, max positive");
        equal(Util.normalize(100, -1, 1, -100, 100), 1, "dst: Min negative, max positive");
        equal(Util.normalize(50, -1, 1, -100, 100), 0.5, "dst: Min negative, max positive");
        equal(Util.normalize(-50, -1, 1, -100, 100), -0.5, "dst: Min negative, max positive");

        equal(Util.normalize(-100, -10, 0, -100, 100), -10, "dst: Min negative, max 0.");
        equal(Util.normalize(0, -10, 0, -100, 100), -5, "dst: Min negative, max 0");
        equal(Util.normalize(100, -10, 0, -100, 100), 0, "dst: Min negative, max 0");
        equal(Util.normalize(50, -10, 0, -100, 100), -2.5, "dst: Min negative, max 0");
        equal(Util.normalize(-50, -10, 0, -100, 100), -7.5, "dst: Min negative, max 0");

    });

});