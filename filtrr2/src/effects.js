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

// #### Filtrr2.FxStore

// A placeholder object for all registered effects. Provides
// an API for adding new effects and accessing them by
// name. All effects added via the ```Filtrr2.fx()``` method end up
// into the ```FxStore```.
Filtrr2.FxStore = (function() {
    
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

// #### Filtrr2.fx

// Registers an effect. Registering an effect consists of a name
// and a function which will execute the effect. All registered 
// effects will be available on any ImageProcessor instance.
// This method is merely a nice wrapper around the ```Filtrr2.FxStore.add```
// method.
Filtrr2.fx = function(name, def)
{
    Filtrr2.FxStore.add(name, def);
};


// #### Filtrr2.ImageProcessor

// The *meat* of the framework. This is the context of the callback function
// which you pass into the ```Filttr2``` constructor i.e
//
//     Filtrr2('#img', function() {
//         // 'this' will be an ImageProcessor instance.
//     });
//
// It is also the context of the update function and it always
// contains all preset and user-defined effects *up to the point
// of it's creation*.
Filtrr2.ImageProcessor = function(F) 
{
    var $canvas = F.canvas, 
        canvas  = $canvas[0];
 
    var w   = canvas.width,
        h   = canvas.height,
        ctx = canvas.getContext("2d");
    
    // Returns a copy of the ImageData object passed 
    // as a parameter.
    var copyImageData = function(imageData)
    {
        var copy = ctx.createImageData(imageData),
            // Store some references for quicker processing.
            cData = copy.data,
            imData = imageData.data,
            len = imData.length,
            i = 0;
        // Copy over all pixel values to the copy buffer.
        for (i = 0; i < len; i++) {
            cData[i] = imData[i];
        }
        return copy;
    };  

    var clamp = Filtrr2.Util.clamp,

        // Canvas image data buffer - all manipulations are applied
        // here. Rendering the ImageProcessor object will save the buffer
        // back to the canvas.
        buffer = ctx.getImageData(0, 0, w, h),

        // Save a clean copy of the buffer to enable resetting.
        originalBuffer = copyImageData(buffer),
        
        //
        _F = F,
        layers = new Filtrr2.Layers();

    // Copy over all registered effects and create
    // proxy functions.
    var names = Filtrr2.FxStore.getNames(),
        len   = names.length, i = 0, n = null,
        that  = this;
    
    for (i = 0; i < len; i++) {
        n = names[i];
        this[n] = (function(_n, _f) {

            return $.proxy(function() {
                var fx = Filtrr2.FxStore.get(_n);
                _f.trigger(_n + ":preprocess");
                fx.apply(this, arguments);
                _f.trigger(_n + ":postprocess");
                return this;
            }, that);
        
        }(n, _F));
    }

    // Returns a new ImageProcessor instance. It's important to note
    // that the new instance's buffer will be a different copy than
    // this instance's buffer since getImageData() always returns a 
    // copy. But, any duplicate of this instance will share a reference
    // to the canvas object, hence rendering a duplicate will alter
    // the canvas element and potentially override any previous rendering
    // by this instance (if called after a render() was already called on
    // this instance).
    this.dup = function()
    {
        return new Filtrr2.ImageProcessor(_F);
    };

    this.buffer = function()
    {
        return buffer;
    };

    this.dims = function()
    {
        return {w: w, h: h};
    };

    // Resets the buffer to the original buffer by creating
    // a copy of it.
    this.reset = function() 
    {
        buffer = copyImageData(originalBuffer);
        return this;
    };

    // Put another layer on top of this ImageProcessor. The other
    // layer needs to be another ImageProcessor object, usually
    // created by using the ```dup()``` method.
    this.layer = function(type, top)
    {
        layers.merge(type, this, top);
        return this;
    };

    // Puts the modified context data buffer back
    // into the context which causes the image
    // to be redrawn. This extra step exists for 
    // performance reasons because we don't want to
    // be writing the data buffer on every effect 
    // application in the case of chained effects.
    // The render method takes a callback which is 
    // called after it is finished.
    this.render = function(callback)
    {
        _F.trigger("prerender");
        ctx.putImageData(buffer, 0, 0);
        _F.trigger("postrender");
        if (callback) {
            callback.call(this);
        }
        _F.trigger("finalize");
    };

    // Performs a pixel-by-pixel manipulation on the 
    // data buffer pixels. This means that ```procfn``` is 
    // called *on every pixel* in the data buffer and its
    // result is used to replace the existing valus in the 
    // buffer in-place. 
    // The values returned from ```procfn``` are clamped 
    // so that they are in the range [0,255].
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
                procfn(rgba, j, i);

                // Put back the data.
                data[index]     = parseInt(clamp(rgba.r));
                data[index + 1] = parseInt(clamp(rgba.g));
                data[index + 2] = parseInt(clamp(rgba.b));  
                data[index + 3] = parseInt(clamp(rgba.a));  

            }
        }
        return this;
    };

    // Performs a kerner convolution manipulation on the data
    // buffer. This is mostly used in masks i.e blurring or 
    // sharpening. It is a *very* intensive operation and will
    // be slow on big images! 
    // It creates a temporary data buffer where it writes the
    // new data. We can't modify the original buffer in-place 
    // because each new pixel value depends on the original
    // neighbouring values of that pixel (i.e the values residing)
    // inside the kernel.
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

// #### Pre-defined effects

// ```Filtrr2``` comes with 15 pre-defined effects. Reading the code
// below is a good tutorial on how to create your own effects.

// #### Adjust [No Range]
Filtrr2.fx("adjust", function(pr, pg, pb) {   
    this.process(function(rgba) {
        rgba.r *= 1 + pr;
        rgba.g *= 1 + pg;
        rgba.b *= 1 + pb;
    });
});

// #### Brighten [-100, 100]
Filtrr2.fx("brighten",  function(p) {
    p = Filtrr2.Util.normalize(p, -255, 255, -100, 100);
    this.process(function(rgba) {
        rgba.r += p;
        rgba.g += p;
        rgba.b += p;
    });
});

// #### Alpha [-100, 100]
Filtrr2.fx("alpha", function(p) {
    p = Filtrr2.Util.normalize(p, 0, 255, -100, 100);
    this.process(function(rgba) {
        rgba.a = p;
    });
});

// #### Saturate [-100, 100]
Filtrr2.fx("saturate", function(p) {
    p = Filtrr2.Util.normalize(p, 0, 2, -100, 100);
    this.process(function(rgba) {
        var avg = (rgba.r + rgba.g + rgba.b) / 3;
        rgba.r = avg + p * (rgba.r - avg);
        rgba.g = avg + p * (rgba.g - avg);
        rgba.b = avg + p * (rgba.b - avg);
    });
});

// #### Invert
Filtrr2.fx("invert", function() {
    this.process(function(rgba) {
        rgba.r = 255 - rgba.r;
        rgba.g = 255 - rgba.g;
        rgba.b = 255 - rgba.b;
    });    
});

// #### Posterize [1, 255]
Filtrr2.fx("posterize", function(p) {    
    p = Filtrr2.Util.clamp(p, 1, 255);
    var step = Math.floor(255 / p);
    this.process(function(rgba) {
        rgba.r = Math.floor(rgba.r / step) * step;
        rgba.g = Math.floor(rgba.g / step) * step;
        rgba.b = Math.floor(rgba.b / step) * step;
    });
});

// #### Gamma [-100, 100]
Filtrr2.fx("gamma", function(p) {    
    p = Filtrr2.Util.normalize(p, 0, 2, -100, 100);
    this.process(function(rgba) {
        rgba.r = Math.pow(rgba.r, p);
        rgba.g = Math.pow(rgba.g, p);
        rgba.b = Math.pow(rgba.b, p);
    });
});

// #### Constrast [-100, 100]
Filtrr2.fx("contrast", function(p) {
    p = Filtrr2.Util.normalize(p, 0, 2, -100, 100);
    function c(f, c){
        return (f - 0.5) * c + 0.5;
    }
    this.process(function(rgba) {
        rgba.r = 255 * c(rgba.r / 255, p);
        rgba.g = 255 * c(rgba.g / 255, p);
        rgba.b = 255 * c(rgba.b / 255, p);
    });
});

// #### Sepia
Filtrr2.fx("sepia", function() {
    this.process(function(rgba) {
        var r = rgba.r, g = rgba.g, b = rgba.b;
        rgba.r = (r * 0.393) + (g * 0.769) + (b * 0.189);
        rgba.g = (r * 0.349) + (g * 0.686) + (b * 0.168);
        rgba.b = (r * 0.272) + (g * 0.534) + (b * 0.131);
    });    
});

// #### Subtract [No Range]
Filtrr2.fx("subtract", function(r, g, b) {
    this.process(function(rgba)
    {        
        rgba.r -= r;
        rgba.g -= g;
        rgba.b -= b;
    }); 
});

// #### Fill [No Range]
Filtrr2.fx("fill", function(r, g, b) {
    this.process(function(rgba)
    {
        rgba.r = r;
        rgba.g = g;
        rgba.b = b;
    });
});

// #### Blur ['simple', 'gaussian']
Filtrr2.fx("blur", function(t) {
    t = t || "simple";
    if (t == "simple") {
        this.convolve([
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9],
            [1/9, 1/9, 1/9]
        ]);
    } else if (t == "gaussian") {
        this.convolve([
            [1/273, 4/273, 7/273, 4/273, 1/273],
            [4/273, 16/273, 26/273, 16/273, 4/273],
            [7/273, 26/273, 41/273, 26/273, 7/273],
            [4/273, 16/273, 26/273, 16/273, 4/273],             
            [1/273, 4/273, 7/273, 4/273, 1/273]
        ]); 
    } 
});

// #### Sharpen
Filtrr2.fx("sharpen", function() {
    this.convolve([
        [0.0, -0.2,  0.0],
        [-0.2, 1.8, -0.2],
        [0.0, -0.2,  0.0]
    ]);
});

// #### Curves
Filtrr2.fx("curves", function(s, c1, c2, e) {
    var bezier = new Filtrr2.Util.Bezier(s, c1, c2, e),
        points = bezier.genColorTable();
    this.process(function(rgba) 
    {
        rgba.r = points[rgba.r];
        rgba.g = points[rgba.g];
        rgba.b = points[rgba.b];
    });    
});

// #### Expose [-100, 100]
Filtrr2.fx("expose", function(p) {
    var p  = Filtrr2.Util.normalize(p, -1, 1, -100, 100),
        c1 = {x: 0, y: 255 * p},
        c2 = {x: 255 - (255 * p), y: 255};
    this.curves(
        {x: 0, y: 0}, 
        c1,
        c2, 
        {x: 255, y: 255}
    );
});
  