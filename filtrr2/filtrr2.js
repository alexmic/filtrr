/**
 * filtrr2.js - Javascript Image Processing Library
 * 
 * Copyright (C) 2012 Alex Michael
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/
 

// ========================= Util ========================= //


var Util = (function()
{
    var exports = {};
    
    var clamp = function(val, min, max) 
    {
        min = min || 0;
        max = max || 255;
        return Math.min(max, Math.max(min, val));
    };

    var dist = function(x1, x2) 
    {
        return Math.sqrt(Math.pow(x2 - x1, 2));
    };

    var normalize = function(val, dmin, dmax, smin, smax)
    {
        var sdist = dist(smin, smax),
            ddist = dist(dmin, dmax),
            ratio = ddist / sdist,
            val   = clamp(val, smin, smax);
        return dmin + (val-smin) * ratio;
    };

    // Adapted from (with special thanks)

    //====================================\\
    // 13thParallel.org Beziér Curve Code \\
    //   by Dan Pupius (www.pupius.net)   \\
    //====================================\\
    var Bezier = function(C1, C2, C3, C4)
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
     
  
// ========================= CoreEffects ========================= //


var CoreEffects = function($canvas)
{
    if (!$canvas || $canvas.length === 0 || !$canvas[0]) {
        throw "Canvas supplied to Manipulation object was undefined";
    }
 
    var $canvas = $canvas, 
        canvas  = $canvas[0];
 
    var w   = canvas.width,
        h   = canvas.height,
        ctx = canvas.getContext("2d");
    
    // Shortcuts
    var clamp = Util.clamp,
        dist  = Util.dist,
        normalize = Util.normalize;

    // Canvas image data buffer - all manipulations are applied
    // here. Rendering the Manipulation object will save the buffer
    // back to the canvas.
    var buffer = ctx.getImageData(0, 0, w, h);
    
    // == Public API
    
    this.clone = function()
    {
        //
    };

    this.render = function()
    {
        ctx.putImageData(buffer, 0, 0);
    };

    this.process = function(procfn) 
    {    
        var data = buffer.data;
        var i = 0, j = 0;
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                
                var index = (i*w*4) + (j*4);
                
                // Pass an rgba objects to the processing function.
                var rgba  = {
                    r: data[index],
                    g: data[index + 1],
                    b: data[index + 2],
                    a: data[index + 3]
                };
                
                // Process the tuple.
                procfn(rgba);

                // Put back the data.
                data[index]     = parseInt(clamp(rgba.r));
                data[index + 1] = parseInt(clamp(rgba.g));
                data[index + 2] = parseInt(clamp(rgba.b));  
                data[index + 3] = parseInt(clamp(rgba.a));  

            }
        }
        return this;
    };


    this.convolve = function(kernel) 
    {    
        if (!ctx.createImageData) {
            throw "createImageData is not supported."
        }

        var temp  = ctx.createImageData(buffer.width, buffer.height),
            tempd = temp.data,
            bufferData = buffer.data,
            kh = parseInt(kernel.length / 2),
            kw = parseInt(kernel[0].length / 2),
            i = 0, j = 0, n = 0, m = 0;
        
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                var outIndex = (i*w*4) + (j*4);
                var r = 0, g = 0, b = 0;
                for (n = -kh; n <= kh; n++) {
                    for (m = -kw; m <= kw; m++) {
                        if (i + n >= 0 && i + n < h) {
                            if (j + m >= 0 && j + m < w) {
                                var f = kernel[n + kh][m + kw];
                                if (f === 0) {continue;}
                                var inIndex = ((i+n)*w*4) + ((j+m)*4);
                                r += bufferData[inIndex] * f;
                                g += bufferData[inIndex + 1] * f;
                                b += bufferData[inIndex + 2] * f;
                            }
                        }
                    }
                }
                tempd[outIndex]     = clamp(r);
                tempd[outIndex + 1] = clamp(g);
                tempd[outIndex + 2] = clamp(b);
                tempd[outIndex + 3] = 255;
            }
        }
        buffer = temp;
        return this;
    };

    this.adjust = function(pr, pg, pb)
    {   
        this.apply(function(rgba) {
            rgba.r *= 1 + pr;
            rgba.g *= 1 + pg;
            rgba.b *= 1 + pb;
        });
        return this;
    };

    // [-100, 100]
    this.brighten = function(p) 
    {
        p = normalize(p, -255, 255, -100, 100);
        this.apply(function(rgba) {
            rgba.r += p;
            rgba.g += p;
            rgba.b += p;
        });
        return this;
    };

    // [-100, 100]
    this.alpha = function(p) 
    {
        p = normalize(p, 0, 255, -100, 100);
        this.apply(function(rgba) {
            rgba.a = p;
        });
        return this;
    };

    // [-100, 100]
    this.saturate = function(p) 
    {    
        p = normalize(p, 0, 2, -100, 100);
        this.apply(function(rgba) {
            var avg = (rgba.r + rgba.g + rgba.b) / 3;
            rgba.r = avg + p * (rgba.r - avg);
            rgba.g = avg + p * (rgba.g - avg);
            rgba.b = avg + p * (rgba.b - avg);
        });
        return this;   
    };

    this.invert = function() 
    {
        this.apply(function(rgba) {
            rgba.r = 255 - rgba.r;
            rgba.g = 255 - rgba.g;
            rgba.b = 255 - rgba.b;
        });
        return this;
    };

    // [1, 255]
    this.posterize = function(p) 
    {    
        p = clamp(p, 1, 255);
        var step = Math.floor(255 / p);
        this.apply(function(rgba) {
            rgba.r = Math.floor(rgba.r / step) * step;
            rgba.g = Math.floor(rgba.g / step) * step;
            rgba.b = Math.floor(rgba.b / step) * step;
        });
        return this;
    };

    // [-100, 100]
    this.gamma = function(p) 
    {    
        p = normalize(p, 0, 2, -100, 100);
        this.apply(function(rgba) {
            rgba.r = Math.pow(rgba.r, p);
            rgba.g = Math.pow(rgba.g, p);
            rgba.b = Math.pow(rgba.b, p);
        });
        return this;
    };

    // [-100, 100]
    this.contrast = function(p) 
    {    
        p = normalize(p, 0, 2, -100, 100);
        function c(f, c){
            return (f - 0.5) * c + 0.5;
        }
        this.apply(function(rgba) {
            rgba.r = 255 * c(rgba.r / 255, p);
            rgba.g = 255 * c(rgba.g / 255, p);
            rgba.b = 255 * c(rgba.b / 255, p);
        });
        return this;
    };

    this.sepia = function() 
    {
        this.apply(function(rgba) {
            var r = rgba.r, g = rgba.g, b = rgba.b;
            rgba.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
            rgba.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
            rgba.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
        });
        return this;
    };

    this.subtract = function(r, g, b) 
    {
        this.apply(function(rgba)
        {        
            rgba.r -= r;
            rgba.g -= g;
            rgba.b -= b;
        });
        return this;
    };

    this.fill = function(r, g, b)
    {
        this.apply(function(rgba)
        {
            rgba.r = r;
            rgba.g = g;
            rgba.b = b;
        });
        return this;
    };

    this.blur = function(t)
    {
        t = t || "simple";
        if (t === "simple") {
            this.convolve([
                [1/9, 1/9, 1/9],
                [1/9, 1/9, 1/9],
                [1/9, 1/9, 1/9]
            ]);
        } else if (t === "gaussian") {
            this.convolve([
                [1/273, 4/273, 7/273, 4/273, 1/273],
                [4/273, 16/273, 26/273, 16/273, 4/273],
                [7/273, 26/273, 41/273, 26/273, 7/273],
                [4/273, 16/273, 26/273, 16/273, 4/273],             
                [1/273, 4/273, 7/273, 4/273, 1/273]
            ]); 
        }
        return this;
    };
    
    this.sharpen = function()
    {
        this.convolve([
            [0.0, -0.2,  0.0],
            [-0.2, 1.8, -0.2],
            [0.0, -0.2,  0.0]
        ]);
        return this;
    };

    this.curves = function(s, c1, c2, e)
    {
        var bezier = new Bezier(s, c1, c2, e),
            points = bezier.genColorTable();
        this.apply(function(rgba) 
        {
            rgba.r = points[rgba.r];
            rgba.g = points[rgba.g];
            rgba.b = points[rgba.b];
        });
        return this;
    };

    this.expose = function(p)
    {
        var p  = normalize(p, 0, 100) / 100,
            c1 = {x: 0, y: 255 * p},
            c2 = {x: 255 - (255 * p), y: 255};
    
        this.curves(
            {x: 0, y: 0}, 
            c1,
            c2, 
            {x: 255, y: 255}
        );
        return this;
    };
};


// ========================= Blender ========================= //


var Blender = function(mode)
{
    var mode = mode || "multiply";
    
    // == Private API

    var apply = function(procfn, top, botton) 
    {
        var blendData = topFiltr.getCurrentImageData();
        var blendDArray = blendData.data;
        var imageDArray = imageData.data;
        var i = 0, j = 0;
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                var index = (i*w*4) + (j*4);
                var rgba = fn(
                    {r: blendDArray[index],
                     g: blendDArray[index + 1],
                     b: blendDArray[index + 2],
                     a: blendDArray[index + 3]},
                     {r: imageDArray[index],
                      g: imageDArray[index + 1],
                      b: imageDArray[index + 2],
                      a: imageDArray[index + 3]}
                );
                imageDArray[index] = rgba.r;
                imageDArray[index + 1] = rgba.g;
                imageDArray[index + 2] = rgba.b;
                imageDArray[index + 3] = rgba.a;
            }
        }
    };
    
    var modes = {
        
        multiply: function(topFiltr) 
        { 
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe((top.r * bottom.r) / 255),
                    g: safe((top.g * bottom.g) / 255),
                    b: safe((top.b * bottom.b) / 255),
                    a: bottom.a 
                };
            });
            return this;
        }, 

        screen : function(topFiltr) 
        {
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe(255 - (((255 - top.r) * (255 - bottom.r)) / 255)),
                    g: safe(255 - (((255 - top.g) * (255 - bottom.g)) / 255)),
                    b: safe(255 - (((255 - top.b) * (255 - bottom.b)) / 255)),
                    a: bottom.a 
                };
            });
            return this;    
        },

        overlay : function(topFiltr) 
        {
            function calc(b, t) {
                return (b > 128) ? 255 - 2 * (255 - t) * (255 - b) / 255: (b * t * 2) / 255;
            }
            
            this.apply(topFiltr, function(top, bottom)
            { 
                return {
                    r: safe(calc(bottom.r, top.r)),
                    g: safe(calc(bottom.g, top.g)),
                    b: safe(calc(bottom.b, top.b)),
                    a: bottom.a
                };
            });
            return this;
        },

        difference : function(topFiltr) 
        {
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe(Math.abs(top.r - bottom.r)),
                    g: safe(Math.abs(top.g - bottom.g)),
                    b: safe(Math.abs(top.b - bottom.b)),
                    a: bottom.a 
                };
            });
            return this;
        },

        addition : function(topFiltr) 
        {
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe(top.r + bottom.r),
                    g: safe(top.g + bottom.g),
                    b: safe(top.b + bottom.b),
                    a: bottom.a 
                };
            });
            return this;
        },

        exclusion : function(topFiltr) 
        {
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe(128 - 2 * (bottom.r - 128) * (top.r - 128) / 255),
                    g: safe(128 - 2 * (bottom.g - 128) * (top.g - 128) / 255),
                    b: safe(128 - 2 * (bottom.b - 128) * (top.b - 128) / 255),
                    a: bottom.a
                                
                };
            });
            return this;
        },

        softLight : function(topFiltr) 
        {
            function calc(b, t) {
                return (b > 128) ? 255 - ((255 - b) * (255 - (t - 128))) / 255 : (b * (t + 128)) / 255;
            }
            
            this.apply(topFiltr, function(top, bottom)
            {
                return {
                    r: safe(calc(bottom.r, top.r)),
                    g: safe(calc(bottom.g, top.g)),
                    b: safe(calc(bottom.b, top.b)),
                    a: bottom.a
                };
            });
            return this;
        }
    };

    // == Public API

    return {
        
        mode: function(m) {
            if (m) {
                mode = m;
            } else {
                return mode;
            }
        },

        blend: function()
        {
            if (arguments.length === 1) {
                return arguments[0];
            }

            var fn = modes[mode];
            if (!fn) {
                throw "Unknown blend mode '" + mode + "'";
            }

            var stack = [];
            var i; for (i = arguments.length - 1; i > -1; i--) {
                stack.push(arguments[i]);
            }    
            
            while (stack.length > 1) {
                var first   = stack.pop(),
                    second  = stack.pop(),
                    blended = _blend(fn, first, second);
                stack.push(blended);
            }
            
            return stack[0];
        }

    };

};


// ========================= Filtrr ========================= //


var Filtrr = function(pic, keepFlag, callback) 
{     
    var $pic   = $(pic),
        offset = $pic.offset();
    
    var repl = function(pic) 
    {
        var img = new Image();
        img.onload = function()
        {
            var c = $("<canvas>").css({
                width   : img.width,
                height  : img.height,
                top     : offset.top,
                left    : offset.left,
                position: "absolute" 
            });
            var el = c[0];
            el.width  = img.width;
            el.height = img.height;
            el.getContext("2d").drawImage(img, 0, 0);
            
            if (keepFlag === "keep") {
                pic.hide();
                $("body").append(c);
            } else if (keepFlag === "replace") {
                pic.replaceWith(c);
            } else {
                throw "Unknown flag '" + keepFlag + "'";
            }

            // all done - call callback with this as a new 
            // Manipulation object.
            callback.call(new Manipulation(c));
        }
        img.src = pic.attr("src");
    };

    if ($pic.length > 0) {
        repl($pic);
    } else {
        throw "Uhm, undefined pic.";
    }
};
