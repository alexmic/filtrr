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

// #### Filtrr2.Events

// A simplistic Pub/Sub mechanism inspired by ```Backbone.js```. It 
// provides three API methods:
//         
// ``` on(ev, callback, ctx) ```
// 
// Register a callback ```callback``` on an event ```ev```. When the callback is 
// called, call it with the given context ```ctx```.
// 
// ``` off(ev, callback) ```
//
// Unregister the callback ```callback``` for the given event ```ev```.
//
// ``` trigger(ev) ```
//
// Trigger all registered callbacks for event ```ev```.
Filtrr2.Events = function()
{
    var registry = {};        
    
    this.on = function(ev, callback, ctx)
    {
        if (!registry[ev]) {
            registry[ev] = [];
        }
        if (ctx === undefined) {
            ctx = null;
        }
        registry[ev].push({
            cback: callback,
            ctx: ctx
        });
    };

    this.off = function(ev, callback)
    {
        var i = 0, cbacks = [], cb = null, offs = [];
        if (registry[ev] && registry[ev].length > 0) {
            if (!callback) {
                registry[ev] = [];
            } else {
                cbacks = registry[ev];
                for (i = 0; i < cbacks.length; i++) {
                    if (cbacks.hasOwnProperty(i)) {
                        cb = cbacks[i];
                        if (cb.cback === callback) {
                            delete cbacks[i];
                        }
                    }
                }
            }
        }
    };

    this.trigger = function(ev)
    {
        var cbacks = registry[ev],
            i = null, cb = null,
            args = [].slice.apply(arguments);
        for (i in cbacks) {
            if (cbacks.hasOwnProperty(i)) {
                cb = cbacks[i];
                if (cb) {
                    cb.cback.apply(cb.ctx, args.slice(1));
                }
            }
        }
    };
};
     