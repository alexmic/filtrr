/**
 * layers.js - Part of Filtrr2
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

Filtrr2.Layers = function()
{
    // Clamp shortcut
    var clamp = Filtrr2.Util.clamp;

    var apply = function(bottom, top, fn)
    {
        var bottomData = bottom.buffer().data,
            topData    = top.buffer().data,
            i = 0, j = 0,
            h = Math.min(bottom.dims().h, top.dims().h),
            w = Math.min(bottom.dims().w, top.dims().w),
            index, brgba, trgba;
        
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                index = (i*w*4) + (j*4);

                // Create bottom/top rgbas.
                brgba = {
                    r: bottomData[index],
                    g: bottomData[index + 1],
                    b: bottomData[index + 2],
                    a: bottomData[index + 3]
                };
                trgba = {
                    r: topData[index],
                    g: topData[index + 1],
                    b: topData[index + 2],
                    a: topData[index + 3]
                };
                
                // Execute blend.
                fn(brgba, trgba);
            
                // Re-assign data.
                bottomData[index]     = clamp(brgba.r);
                bottomData[index + 1] = clamp(brgba.g);
                bottomData[index + 2] = clamp(brgba.b);
                bottomData[index + 3] = clamp(brgba.a);
            }
        }
    };

    var layers = {
        
        multiply: function(bottom, top) 
        {
            apply(bottom, top, function(b, t)
            {
                b.r = (t.r * b.r) / 255;
                b.g = (t.g * b.g) / 255;
                b.b = (t.b * b.b) / 255;                
            });
        },

        screen: function(bottom, top) 
        {
            apply(bottom, top, function(b, t)
            {
                b.r = 255 - (((255 - t.r) * (255 - b.r)) / 255);
                b.g = 255 - (((255 - t.g) * (255 - b.g)) / 255);
                b.b = 255 - (((255 - t.b) * (255 - b.b)) / 255);
            });
        },

        overlay: function(bottom, top) 
        {
            apply(bottom, top, function(b, t)
            {
                // TODO 
            });
        }, 

        softLight: function(bottom, top) 
        {
            apply(bottom, top, function(b, t)
            {
                // TODO
            });
        },

        addition: function(bottom, top)
        {
            apply(bottom, top, function(b, t)
            {
                b.r += t.r;
                b.g += t.g;
                b.b += t.b;
            });
        },

        exclusion: function(bottom, top)
        {
            apply(bottom, top, function(b, t)
            {
                // TODO
            });
        },

        difference: function(bottom, top)
        {
            apply(bottom, top, function(b, t)
            {
                // TODO
            });
        }
    };

    // == Public API

    this.merge = function(type, bottom, top)
    {
        if (layers[type] != null) {
            layers[type](bottom, top);
        } else {
            throw Error("Unknown layer blend type '" + type + "'.");
        }
    };

};
