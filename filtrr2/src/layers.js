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

// #### Filtrr2.Layers

// This object mimics the functionality of Photoshop layers. 
// It provides a single method: ```merge()```. This method takes
// a top and a bottom layer to merge together. *The top layer is 
// merged ontop of the bottom layer*.
//
// There are 7 pre-defined blending modes with which you can
// blend layers.
Filtrr2.Layers = function()
{
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
            var c = function(b, t) {
                return (b > 128) ? 255 - 2 * (255 - t) * (255 - b) / 255: (b * t * 2) / 255;
            };

            apply(bottom, top, function(b, t)
            {
                b.r = c(b.r, t.r);
                b.g = c(b.g, t.g);
                b.b = c(b.b, t.b)
            });
        }, 

        // Thanks to @olivierlesnicki for suggesting a better algoritm.
        softLight: function(bottom, top) 
        {
            var c = function(b, t) {
                b /= 255; 
                t /= 255;
                return (t < 0.5) ? 255*((1-2*t)*b*b + 2*t*b) : 255*((1-(2*t-1))*b+(2*t-1)*Math.pow(b, 0.5));
            };
            apply(bottom, top, function(b, t)
            {
                b.r = c(b.r, t.r);
                b.g = c(b.g, t.g);
                b.b = c(b.b, t.b) 
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
                b.r = 128 - 2 * (b.r - 128) * (t.r - 128) / 255;
                b.g = 128 - 2 * (b.g - 128) * (t.g - 128) / 255;
                b.b = 128 - 2 * (b.b - 128) * (t.b - 128) / 255;
            });
        },

        difference: function(bottom, top)
        {
            var abs = Math.abs;
            apply(bottom, top, function(b, t)
            {
                b.r = abs(t.r - b.r);
                b.g = abs(t.g - b.g);
                b.b = abs(t.b - b.b);
            });
        }
    };

    // Merges two layers. Takes a ```type``` parameter and 
    // a bottom and top layer. The ```type``` parameter specifies
    // the blending mode.
    this.merge = function(type, bottom, top)
    {
        if (layers[type] != null) {
            layers[type](bottom, top);
        } else {
            throw Error("Unknown layer blend type '" + type + "'.");
        }
    };

};
