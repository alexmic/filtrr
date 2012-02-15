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
 
   
// ========================= CoreEffects ========================= //


Filtrr.CoreEffects = function(filtrr) 
{
    var $canvas = filtrr.canvas, 
        canvas  = $canvas[0];
 
    var w   = canvas.width,
        h   = canvas.height,
        ctx = canvas.getContext("2d");
    
    // Shortcuts
    var clamp = Filtrr.Util.clamp,
        dist  = Filtrr.Util.dist,
        normalize = Filtrr.Util.normalize;

    // Canvas image data buffer - all manipulations are applied
    // here. Rendering the CoreEffects object will save the buffer
    // back to the canvas.
    var buffer = ctx.getImageData(0, 0, w, h);

    // Current effect
    var currEffect = null;

    // Filtrr ref
    var _filtrr = filtrr;

    // == Public API
    
    this.clone = function()
    {
        //
    };

    this.render = function(callback)
    {
        _filtrr.trigger("prerender");
        ctx.putImageData(buffer, 0, 0);
        _filtrr.trigger("postrender");
        if (callback) {
            callback.call(this);
        }
        _filtrr.trigger("finalize");
    };

    this.process = function(procfn) 
    {    
        _filtrr.trigger(currEffect + ":preprocess");
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
        _filtrr.trigger(currEffect + ":postprocess");
        currEffect = null;
        return this;
    };


    this.convolve = function(effect, kernel) 
    {    
        if (!ctx.createImageData) {
            throw "createImageData is not supported."
        }

        _filtrr.trigger(currEffect + ":preprocess");
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
        _filtrr.trigger(currEffect + ":postprocess");
        return this;
    };

    this.adjust = function(pr, pg, pb)
    {   
        currEffect = "adjust";
        this.process(function(rgba) {
            rgba.r *= 1 + pr;
            rgba.g *= 1 + pg;
            rgba.b *= 1 + pb;
        });
        return this;
    };

    // [-100, 100]
    this.brighten = function(p) 
    {
        currEffect = "brighten";
        p = normalize(p, -255, 255, -100, 100);
        this.process(function(rgba) {
            rgba.r += p;
            rgba.g += p;
            rgba.b += p;
        });
        return this;
    };

    // [-100, 100]
    this.alpha = function(p) 
    {
        currEffect = "alpha";
        p = normalize(p, 0, 255, -100, 100);
        this.process(function(rgba) {
            rgba.a = p;
        });
        return this;
    };

    // [-100, 100]
    this.saturate = function(p) 
    {    
        currEffect = "saturate";
        p = normalize(p, 0, 2, -100, 100);
        this.process(function(rgba) {
            var avg = (rgba.r + rgba.g + rgba.b) / 3;
            rgba.r = avg + p * (rgba.r - avg);
            rgba.g = avg + p * (rgba.g - avg);
            rgba.b = avg + p * (rgba.b - avg);
        });
        return this;   
    };

    this.invert = function() 
    {
        currEffect = "invert";
        this.process(function(rgba) {
            rgba.r = 255 - rgba.r;
            rgba.g = 255 - rgba.g;
            rgba.b = 255 - rgba.b;
        });
        return this;
    };

    // [1, 255]
    this.posterize = function(p) 
    {    
        currEffect = "posterize";
        p = clamp(p, 1, 255);
        var step = Math.floor(255 / p);
        this.process(function(rgba) {
            rgba.r = Math.floor(rgba.r / step) * step;
            rgba.g = Math.floor(rgba.g / step) * step;
            rgba.b = Math.floor(rgba.b / step) * step;
        });
        return this;
    };

    // [-100, 100]
    this.gamma = function(p) 
    {    
        currEffect = "gamma";
        p = normalize(p, 0, 2, -100, 100);
        this.process(function(rgba) {
            rgba.r = Math.pow(rgba.r, p);
            rgba.g = Math.pow(rgba.g, p);
            rgba.b = Math.pow(rgba.b, p);
        });
        return this;
    };

    // [-100, 100]
    this.contrast = function(p) 
    {    
        currEffect = "contrast";
        p = normalize(p, 0, 2, -100, 100);
        function c(f, c){
            return (f - 0.5) * c + 0.5;
        }
        this.process(function(rgba) {
            rgba.r = 255 * c(rgba.r / 255, p);
            rgba.g = 255 * c(rgba.g / 255, p);
            rgba.b = 255 * c(rgba.b / 255, p);
        });
        return this;
    };

    this.sepia = function() 
    {
        currEffect = "sepia";
        this.process(function(rgba) {
            var r = rgba.r, g = rgba.g, b = rgba.b;
            rgba.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
            rgba.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
            rgba.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
        });
        return this;
    };

    this.subtract = function(r, g, b) 
    {
        currEffect = "subtract";
        this.process(function(rgba)
        {        
            rgba.r -= r;
            rgba.g -= g;
            rgba.b -= b;
        });
        return this;
    };

    this.fill = function(r, g, b)
    {
        currEffect = "fill";
        this.process(function(rgba)
        {
            rgba.r = r;
            rgba.g = g;
            rgba.b = b;
        });
        return this;
    };

    this.blur = function(t)
    {
        currEffect = "blur";
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
        currEffect = "sharpen";
        this.convolve([
            [0.0, -0.2,  0.0],
            [-0.2, 1.8, -0.2],
            [0.0, -0.2,  0.0]
        ]);
        return this;
    };

    this.curves = function(s, c1, c2, e)
    {
        // This is a hack for now since curves might
        // be used by other filters so they take 
        // precedence.
        if (!currEffect) {
            currEffect = "curves";
        }
        var bezier = new Filtrr.Util.Bezier(s, c1, c2, e),
            points = bezier.genColorTable();
        this.process(function(rgba) 
        {
            rgba.r = points[rgba.r];
            rgba.g = points[rgba.g];
            rgba.b = points[rgba.b];
        });
        return this;
    };

    this.expose = function(p)
    {
        currEffect = "expose";
        var p  = normalize(p, -1, 1, -100, 100),
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


// ========================= Presets ========================= //


Filtrr.Presets = function() {
    
};
