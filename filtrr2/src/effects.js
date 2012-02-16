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
 

// ========================= Effect Store ========================= //


/**
 * Holds all registered effects.
 */
Filtrr.EffectStore = (function() {
    
    var effects = {},
        exports = {},
        count   = 0;

    exports.add = function(name, def)
    {
        effects[name] = def;  
        count++;
    };

    exports.count = function()
    {
        return count;
    };

    exports.get = function(name)
    {
        return effects[name];
    };

    exports.getNames = function()
    {
        var names = [], n = null;
        for (n in effects) {
            if (effects.hasOwnProperty(n)) {
                names.push(n);
            }
        }
        return names;
    };

    return exports;

}());


// ========================= Effect Registration ========================= //

/*
 * Registers an effect. Registering an effect consists of a name
 * and a function which will execute the effect. All registered 
 * effects will be available on any ImageProcessor instance.
 */
Filtrr.effect = function(name, def)
{
    Filtrr.EffectStore.add(name, def);
};


// ========================= Effect Registration ========================= //

/*
 * The 'meat' of the framework. This is the context of the callback function
 * which you pass into Filttr i.e
 *
 * Filtrr('#img', function() {
 *    // 'this' will be an ImageProcessor instance.
 * });
 *
 * It will contain all preset and user-defined effects.
 */ 
Filtrr.ImageProcessor = function(filtrr) 
{
    var $canvas = filtrr.canvas, 
        canvas  = $canvas[0];
 
    var w   = canvas.width,
        h   = canvas.height,
        ctx = canvas.getContext("2d");
    
    // Shortcuts.
    var clamp = Filtrr.Util.clamp,
        dist  = Filtrr.Util.dist,
        normalize = Filtrr.Util.normalize;

    // Canvas image data buffer - all manipulations are applied
    // here. Rendering the CoreEffects object will save the buffer
    // back to the canvas.
    var buffer = ctx.getImageData(0, 0, w, h);

    // Filtrr ref.
    var _filtrr = filtrr;

    // Copy over all registered effects and create
    // proxy functions.
    var names = Filtrr.EffectStore.getNames(),
        len   = names.length, i = 0, n = null,
        that  = this;
    
    for (i = 0; i < len; i++) {
        n = names[i];
        this[n] = (function(_n, _f) {

            return $.proxy(function() {
                var fx = Filtrr.EffectStore.get(_n);
                _f.trigger(_n + ":preprocess");
                fx.apply(this, arguments);
                _f.trigger(_n + ":postprocess");
                return this;
            }, that);
        
        }(n, filtrr));
    }

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

};


// ===================== Preset effects ====================== //


Filtrr.effect("adjust", function(pr, pg, pb) {   
    this.process(function(rgba) {
        rgba.r *= 1 + pr;
        rgba.g *= 1 + pg;
        rgba.b *= 1 + pb;
    });
});

Filtrr.effect("brighten",  function(p) {
    p = Filtrr.Util.normalize(p, -255, 255, -100, 100);
    this.process(function(rgba) {
        rgba.r += p;
        rgba.g += p;
        rgba.b += p;
    });
});

Filtrr.effect("alpha", function(p) {
    p = Filtrr.Util.normalize(p, 0, 255, -100, 100);
    this.process(function(rgba) {
        rgba.a = p;
    });
});

Filtrr.effect("saturate", function(p) {
    p = Filtrr.Util.normalize(p, 0, 2, -100, 100);
    this.process(function(rgba) {
        var avg = (rgba.r + rgba.g + rgba.b) / 3;
        rgba.r = avg + p * (rgba.r - avg);
        rgba.g = avg + p * (rgba.g - avg);
        rgba.b = avg + p * (rgba.b - avg);
    });
});

Filtrr.effect("invert", function() {
    this.process(function(rgba) {
        rgba.r = 255 - rgba.r;
        rgba.g = 255 - rgba.g;
        rgba.b = 255 - rgba.b;
    });    
});

Filtrr.effect("posterize", function(p) {    
    p = Filtrr.Util.clamp(p, 1, 255);
    var step = Math.floor(255 / p);
    this.process(function(rgba) {
        rgba.r = Math.floor(rgba.r / step) * step;
        rgba.g = Math.floor(rgba.g / step) * step;
        rgba.b = Math.floor(rgba.b / step) * step;
    });
});

Filtrr.effect("gamma", function(p) {    
    p = Filtrr.Util.normalize(p, 0, 2, -100, 100);
    this.process(function(rgba) {
        rgba.r = Math.pow(rgba.r, p);
        rgba.g = Math.pow(rgba.g, p);
        rgba.b = Math.pow(rgba.b, p);
    });
});

Filtrr.effect("contrast", function(p) {
    p = Filtrr.Util.normalize(p, 0, 2, -100, 100);
    function c(f, c){
        return (f - 0.5) * c + 0.5;
    }
    this.process(function(rgba) {
        rgba.r = 255 * c(rgba.r / 255, p);
        rgba.g = 255 * c(rgba.g / 255, p);
        rgba.b = 255 * c(rgba.b / 255, p);
    });
});

Filtrr.effect("sepia", function(p) {
    this.process(function(rgba) {
        var r = rgba.r, g = rgba.g, b = rgba.b;
        rgba.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
        rgba.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
        rgba.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
    });    
});

Filtrr.effect("subtract", function(r, g, b) {
    this.process(function(rgba)
    {        
        rgba.r -= r;
        rgba.g -= g;
        rgba.b -= b;
    }); 
});

Filtrr.effect("fill", function(r, g, b) {
    this.process(function(rgba)
    {
        rgba.r = r;
        rgba.g = g;
        rgba.b = b;
    });
});

Filtrr.effect("blur", function(t) {
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
});

Filtrr.effect("sharpen", function() {
    this.convolve([
        [0.0, -0.2,  0.0],
        [-0.2, 1.8, -0.2],
        [0.0, -0.2,  0.0]
    ]);
});
   
Filtrr.effect("curves", function(s, c1, c2, e) {
    var bezier = new Filtrr.Util.Bezier(s, c1, c2, e),
        points = bezier.genColorTable();
    this.process(function(rgba) 
    {
        rgba.r = points[rgba.r];
        rgba.g = points[rgba.g];
        rgba.b = points[rgba.b];
    });    
});

Filtrr.effect("expose", function(p) {
    var p  = Filtrr.Util.normalize(p, -1, 1, -100, 100),
        c1 = {x: 0, y: 255 * p},
        c2 = {x: 255 - (255 * p), y: 255};
    this.curves(
        {x: 0, y: 0}, 
        c1,
        c2, 
        {x: 255, y: 255}
    );
});
  