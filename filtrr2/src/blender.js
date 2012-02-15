/**
 * filtrr2.js - Javascript Image Processing Library
 * 
 * Copyright (C) 2012 Alex Michael
 *
 * Permission is hereby granted, free of charge, to any person 
 * obtaining a copy of this software and associated documentation 
 * files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, 
 * merge, publish, distribute, sublicense, and/or sell copies of 
 * the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included 
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR 
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/
 

// ========================= Blender ========================= //


Filtrr.Blender = {};
    /*var mode = mode || "multiply";
    
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

    };*/
