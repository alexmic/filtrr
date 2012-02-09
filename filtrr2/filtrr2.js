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
 
// ========================= Manipulation ========================= //

var Manipulation = function($canvas)
{
    if (!$canvas || $canvas.length === 0 || !$canvas[0]) {
        throw "Canvas supplied to Manipulation object was undefined";
    }
 
    var $canvas = $canvas, 
        canvas  = $canvas[0];
 
    var w   = canvas.width;
    var h   = canvas.height;
    var ctx = canvas.getContext("2d");

    // Canvas image data buffer - all manipulations are applied
    // here. Rendering the Manipulation object will save the buffer
    // back to the canvas.
    var buffer = ctx.getImageData(0, 0, w, h);

    // == Private API
   
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
    
    // == Public API
    
    return {
        
        // Properties 

        _ut: {
            
            normalize: normalize,
            clamp    : clamp,
            dist     : dist

        },

        $canvas: $canvas,
        
        canvas: $canvas[0],

        width: w,

        height: h,

        buffer: buffer,

        // Methods

        clone: function() 
        {
            return new Manipulation($canvas);
        },
    
        render: function() 
        {
            ctx.putImageData(buffer, 0, 0);
        },
        
        apply: function(procfn) 
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
        },

        convolve : function(kernel) 
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
        },

        adjust: function(pr, pg, pb)
        {   
            this.apply(function(rgba) {
                rgba.r *= 1 + pr;
                rgba.g *= 1 + pg;
                rgba.b *= 1 + pb;
            });
            return this;
        },

        // [-100, 100]
        brighten: function(p) 
        {
            p = normalize(p, -255, 255, -100, 100);
            this.apply(function(rgba) {
                rgba.r += p;
                rgba.g += p;
                rgba.b += p;
            });
            return this;
        },

        // [-100, 100]
        alpha: function(p) 
        {
            p = normalize(p, 0, 255, -100, 100);
            this.apply(function(rgba) {
                rgba.a = p;
            });
            return this;
        },

        // [-100, 100]
        saturate: function(p) 
        {    
            p = normalize(p, 0, 2, -100, 100);
            this.apply(function(rgba) {
                var avg = (rgba.r + rgba.g + rgba.b) / 3;
                rgba.r = avg + p * (rgba.r - avg);
                rgba.g = avg + p * (rgba.g - avg);
                rgba.b = avg + p * (rgba.b - avg);
            });
            return this;   
        },

        invert: function() 
        {
            this.apply(function(rgba) {
                rgba.r = 255 - rgba.r;
                rgba.g = 255 - rgba.g;
                rgba.b = 255 - rgba.b;
            });
            return this;
        },

        // [1, 255]
        posterize: function(p) 
        {    
            p = clamp(p, 1, 255);
            var step = Math.floor(255 / p);
            this.apply(function(rgba) {
                rgba.r = Math.floor(rgba.r / step) * step;
                rgba.g = Math.floor(rgba.g / step) * step;
                rgba.b = Math.floor(rgba.b / step) * step;
            });
            return this;
        },

        // [-100, 100]
        gamma: function(p) 
        {    
            p = normalize(p, 0, 2, -100, 100);
            this.apply(function(rgba) {
                rgba.r = Math.pow(rgba.r, p);
                rgba.g = Math.pow(rgba.g, p);
                rgba.b = Math.pow(rgba.b, p);
            });
            return this;
        },

        // [-100, 100]
        contrast: function(p) 
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
        },

        sepia: function() 
        {
            this.apply(function(rgba) {
                var r = rgba.r, g = rgba.g, b = rgba.b;
                rgba.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
                rgba.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
                rgba.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
            });
            return this;
        },

        subtract: function(r, g, b) 
        {
            this.apply(function(rgba)
            {        
                rgba.r -= r;
                rgba.g -= g;
                rgba.b -= b;
            });
            return this;
        },

        blur: function(t)
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
        },
        
        sharpen: function()
        {
            this.convolve([
                [0.0, -0.2,  0.0],
                [-0.2, 1.8, -0.2],
                [0.0, -0.2,  0.0]
            ]);
            return this;
        },

        curves: function()
        {
            // TODO
        },

        expose: function(p)
        {
            // TODO
            arg = min(100, arg)
            p = float(abs(arg)) / float(100);
            c1x, c1y = (0, (255 * p));
            c2x, c2y = ((255 - (255 * p)), 255);
    
            if arg < 0:
                c1y, c1x = c1x, c1y
                c2y, c2x = c2x, c2y
        
            return this.curves(
                (0, 0), 
                (c1x, c1y), 
                (c2x, c2y), 
                (255, 255)
            );
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
