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


var F = function(elem, callback)
{   
    var name   = elem[0].nodeName.toLowerCase(),
        offset = elem.offset(),
        repl   = function(pic) 
        {
            var img = new Image();
            img.src = elem.attr("src");
            img.onload = $.proxy(function()
            {
                var c = $("<canvas>", {
                            'id'   : elem.attr('id'),
                            'class': elem.attr('class'), 
                            'style': elem.attr('style')
                        })
                        .css({
                            width   : img.width,
                            height  : img.height,
                            top     : offset.top,
                            left    : offset.left,
                            position: "absolute" 
                        });
                var el = c[0];

                this.canvas = c;
                
                el.width  = img.width;
                el.height = img.height;
                el.getContext("2d").drawImage(img, 0, 0);
                
                // Replace with canvas.
                elem.replaceWith(c);

                // all done - call callback with this as a new 
                // CoreEffects object.
                if (callback) {
                    callback.call(new Filtrr.CoreEffects(this));
                }

            }, this);
        };
        
    // Original element
    this.elem = elem;

    // Events
    this.events  = new Filtrr.Events();
    this.on      = this.events.on;
    this.off     = this.events.off;
    this.trigger = this.events.trigger;

    if (name === "img") {
        // Replace picture with canvas
        repl.call(this, elem);  
    } else if (name === "canvas") {
        this.canvas = elem;
        // all done - call callback with this as a new 
        // CoreEffects object.
        callback.call(new Filtrr.CoreEffects(this));
    } else {
        throw new Error("'" + name + "' is an invalid object.");
    }
    
    return this;
};


// ========================= Filtrr ========================= //


var Filtrr = function(_elem, callback) 
{   
    if (typeof _elem === 'undefined' || _elem === null) {
        throw new Error("The element you gave Filtrr was not defined.");
    }

    var t = typeof _elem,
        elem = _elem;
    
    if (t === 'string' || t === 'object' && _elem.constructor.toString().indexOf("String") > -1) {
        // We have a selector object instead of a jQuery element.
        elem = $(_elem);
    }

    if (elem.length === 0) {
        throw new Error("Filtrr cannot find your picture.");
    }

    return new F(elem, callback);
};
