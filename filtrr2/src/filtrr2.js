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


// ========================= F - Filtrr instance ========================= //


var F = function(el, callback)
{   
    var name   = el[0].nodeName.toLowerCase(),
        offset = el.offset(),
        events = null,
        repl   = function(pic) 
        {
            var img = new Image();

            img.src = el.attr("src");
            img.onload = $.proxy(function()
            {
                var c = $("<canvas>", {
                            'id'   : el.attr('id'),
                            'class': el.attr('class'), 
                            'style': el.attr('style')
                        })
                        .css({
                            width   : img.width,
                            height  : img.height,
                            top     : offset.top,
                            left    : offset.left,
                            position: "absolute" 
                        }),
                    canv = c[0];

                this.canvas = c;
                
                canv.width  = img.width;
                canv.height = img.height;
                canv.getContext("2d").drawImage(img, 0, 0);
                
                // Replace with canvas.
                el.replaceWith(c);

                // all done - call callback with a new 
                // ImageProcessor object as context.
                this.processor = new Filtrr.ImageProcessor(this);
                if (_callback) {
                    _callback.call(this.processor);
                }
                _ready = true;

            }, this);
        },

        // State control.
        _ready    = false,
        _callback = callback || null;

    // Original element, usually a picture.
    this.el = el;

    // Reference to the image processor.
    this.processor = null;

    // Events
    events = new Filtrr.Events();
    this.on  = events.on;
    this.off = events.off;
    this.trigger = events.trigger;

    // == Public API

    /*
     * Register a callback to be called when Filtrr is ready. If
     * it's already ready by the time of this call, the callback
     * will immediately fire. If a callback was passed through
     * the Filtrr constructor, then any callback passed through
     * this method will be ignored.
     */
    this.ready = function(callback)
    {
        if (!callback) {
            return _ready;
        }
        if (!_callback) {
            _callback = callback;
        }
        if (_ready) {
            _callback.call(this.ip);
        }
    };

    /**
     * Update Filtrr through callback. The callback
     * is given the ImageProcessor as context. Used to 
     * dynamically update the image with new filters. 
     * This method will only execute if Filtrr is ready,
     * otherwise the callback is ignored.
     */
    this.update = function(callback)
    {
        if (callback) {
            if (_ready) {
                callback.call(this.processor);        
            }
        };
    };

    if (name === "img") {
        // Replace picture with canvas
        repl.call(this, el);  
    } else if (name === "canvas") {
        this.canvas = el;
        this.processor = new Filtrr.ImageProcessor(this);
        if (_callback) {
            _callback.call(this.processor);
        }
        _ready = true;
    } else {
        throw new Error("'" + name + "' is an invalid object.");
    }
    
    return this;
};


// ========================= Filtrr ========================= //


var Filtrr = (function() 
{   
    var store = {};

    return function(_el, callback) {
        
        var t, el, isSelector;

        if (typeof _el === 'undefined' || _el === null) {
            throw new Error("The element you gave Filtrr was not defined.");
        }

        t  = typeof _el;
        el = _el; 
        isSelector = (t === 'string' 
            || t === 'object' && _el.constructor.toString().indexOf("String") > -1);
        
        if (isSelector) {
            key = _el;
        } else {
            key = _el.selector;
        }

        if (store[key]) {
            return store[key];
        } else {

            if (isSelector) {
                el = $(_el);
            }

            if (el.length === 0) {
                throw new Error("Element not found.");
            }

            inst = new F(el, callback);
            store[key] = inst;
            return inst;
        }
    };

}());
