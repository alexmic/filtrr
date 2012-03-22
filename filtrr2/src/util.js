// 
// Copyright (C) 2012 Alex Michael
//
// ### Licence 

// Permission is hereby granted, free of charge, to any person 
// obtaining a copy of this software and associated documentation 
// files (the "Software"), to deal in the Software without restriction, 
// including without limitation the rights to use, copy, modify, 
// merge, publish, distribute, sublicense, and/or sell copies of 
// the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:
//  
// The above copyright notice and this permission notice shall be included 
// in all copies or substantial portions of the Software.
//  
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR 
// ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 

// ### Documentation

// #### Filtrr2.Util

// Common toolkit amongst modules. Exports 3 methods and 1 class.
//         
// ``` clamp(val, min, max) ```
// 
// Ensures a value is between min and max.
// 
// ``` dist(x1, x2) ```
//
// Calculates the absolute distance between two values.
//
// ``` normalize(val, dmin, dmax, smin, smax) ```
//
// Projects a value in the source range into the corresponding
// value in the destination range.
//
// ``` Bezier(C1, C2, C3, C4) ```
//
// A Bezier curve implementation.
Filtrr2.Util = (function()
{
    
    var exports = {},
        
        clamp = function(val, min, max) 
        {
            min = min || 0;
            max = max || 255;
            return Math.min(max, Math.max(min, val));
        },

        dist = function(x1, x2) 
        {
            return Math.sqrt(Math.pow(x2 - x1, 2));
        },

        normalize = function(val, dmin, dmax, smin, smax)
        {
            var sdist = dist(smin, smax),
                ddist = dist(dmin, dmax),
                ratio = ddist / sdist,
                val   = clamp(val, smin, smax);
            return dmin + (val-smin) * ratio;
        },

        // **Adapted from (with special thanks)** <br>
        // 13thParallel.org Beziér Curve Code <br>
        // *by Dan Pupius (www.pupius.net)*
        Bezier = function(C1, C2, C3, C4)
        {
            var C1 = C1, C2 = C2, C3 = C3, C4 = C4;
            var B1 = function(t){ return t*t*t; }
            var B2 = function(t){ return 3*t*t*(1-t); }
            var B3 = function(t){ return 3*t*(1-t)*(1-t); }
            var B4 = function(t){ return (1-t)*(1-t)*(1-t); }

            var getPoint = function(t)
            {
                return {
                    x: C1.x*B1(t) + C2.x*B2(t) + C3.x*B3(t) + C4.x*B4(t),
                    y: C1.y*B1(t) + C2.y*B2(t) + C3.y*B3(t) + C4.y*B4(t)
                }
            };

            // Creates a color table for 1024 points. To create the table
            // 1024 bezier points are calculated with t = i/1024 in every
            // loop iteration and map is created for [x] = y. This is then
            // used to project a color RGB value (x) to another color RGB
            // value (y).
            this.genColorTable = function() 
            {
                var points = {};
                var i; for (i = 0; i < 1024; i++)
                {
                    var point = getPoint(i/1024);
                    points[parseInt(point.x)] = parseInt(point.y);
                };
                return points;
            };
        };
    
    exports.clamp = clamp;
    exports.dist  = dist;
    exports.normalize = normalize;
    exports.Bezier = Bezier;

    return exports;

}());
     