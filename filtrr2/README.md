```Filttr2``` - JavaScript Image Manipulation Library

Copyright (C) 2012 Alex Michael

## MIT Licence


Permission is hereby granted, free of charge, to any person 
obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR 
ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## What's this?

```Filtrr2``` is a JavaScript image manipulation library. Think of it as Instagram filters on the browser. It uses the ```<canvas>``` element to paint filtered pictures in the place of normal pictures on your website.

```Filtrr2``` is the successor to ```Filtrr``` which was a weekend hack thing, but it got some nice exposure when I decided to post it on Hacker News. It improves it on every aspect so if you are using ```Filtrr2```, then you should really upgrade.

#### What's up with the weird name?

Don't ask. It's weird and I know it, but now I'm stuck with it. I would love to rename this as ```fxjs```.

## Installation

You'll find the latest minified version in ```dist/```. If you wish to use the non-minified files, you first need to load ```filtrr2.js``` and then the rest of the files (```events.js```, ```effects.js```, ```util.js```).

**Important note #1** 

```Filtrr2``` depends on jQuery.

## Forking, building and testing

Fork away. Break it better. I would love contributions in the field of image processing like new and improved blur filters, or combinations of 
existing filters (see below on how to extend the framework).

#### Testing

```Filtrr2``` uses ```QUnit``` for testing. For now, you'll have to manually run the tests in your browser(s) by visiting ```test/filtrr2.html```, ```test/util.html```, ```test/effects.html``` (not done yet), ```test/events.html```.

```test/play.html``` is a file I'm using for experiments, nothing special there.

I have plans on automating the test procedure using JsTestDriver or Selenium.

#### Building

To build the project (i.e create a minified version of it in ```/dist```) you will need node.js and jake. The ```Jakefile.js``` declares a build task which you can run: ```jake build```.

## Usage

```Filtrr2``` aims to be really easy to use out of the box, but offers more advanced usage patterns if you want to dig deeper. Let's visit a few of those patterns:

### Simple usage

```js
Filtrr2("#my-img", function() {

    this.brighten(50)
        .saturate(-50)
        .render();

});
```

So, what happens here? We pass in a jQuery selector to the ```Filtrr2``` constructor and a callback function to get called when ```Filtrr2``` is ready. In the callback, ```this``` refers to a ```Filtrr2``` instance (actually an instance of the ```F``` object) which holds all defined effecs up to that moment. As you can see, effect calls can be chained. This pattern should be enough for most use cases.

**Important note #2**

For performance reasons, the effects are *lazily* applied on the canvas. ```Filtrr2``` will *not* draw anything until you call the ```render()``` method.

**Important note #3**

The selector passed into ```Filtrr2``` as the first argument can be any valid jQuery selector string *or* jQuery object (```<img>``` or ```<canvas>```). Hence passing ```"#my-img"``` or ```$("#my-img")``` makes no difference.

### Storing a reference to Filtrr2

```js
var my = Filtrr2("#my-img", function() {

    this.posterize(16)
        .invert() 
        .render();

});
```

Calling the ```Filtrr2``` constructor returns a reference to an ```F``` object instance. Assigning that to a variable will allow you to update your canvas manually through the ```processor``` property and bind functions to events through the ```Events``` API. The ```F``` object has the following public properties and methods:

- ```processor```: A reference to an ```ImageProcessor``` instance which contains all the defined effects up to that moment.
- ```el```: The jQuery-extended object which initialized ```Filtrr2```.
- ```canvas```: The created canvas element.
- ```on()```: Binds a callback on a specific event in the effect pipeline.
- ```off()```: Removes a callback from an event.
- ```trigger()```: Triggers an event.
- ```ready()```: Register a callback to fire when ```Filtrr2``` is ready.
- ```update()```: Update the canvas with new effects.


### Initializing without a callback

```js
var my = Filtrr2($("#my-img"));

my.ready(function() {

    console.log("Filtrr2 is now ready.");
    this.expose(10)
        .sharpen()
        .subtract(10, 20, 24)
        .render()

});
```

If your use-case demands more fine-grained control over when effects are applied, then you can initialize ```Filtrr2``` without a callback function. Since we are dealing with images, initialization is always asynchronous, hence you have to use the ```ready()``` function. ```Ready()``` registers a callback to be called when ```Filtrr2``` is ready, or executes the callback immediately if ```Filtrr2``` is ready at the point of call. If you call ```ready()``` with no callback, it will report the readiness state of the ```Filtrr2``` instance.

**Important note #4** 

Calling ```ready()``` with a callback will replace any previously registered callback.

### Listening to events

```js
var my = Filtrr2("#my-img");

my.on("gamma:preprocess", function() {
    // Do something..
});

my.on("gamma:postprocess", function() {
    // Do something..
});

my.on("contrast:preprocess", function() {
    // Do something..
});

my.on("constrast:postpropess", function() {
    // Do something..
});

my.on("prerender", function() {
    // Do something..
});

my.on("postrender", function() {
    // Do something..
});

my.on("finalize", function() {
    // Do something..
});

my.ready(function() {

    this.gamma(50)
        .contrast(-40)
        .render();

});
```

The pattern above lists all the events fired during the effect pipeline. For each applied effect, ```preprocess``` and ```postprocess``` events are triggered in the order the effects are applied. These events are prefixed with the name of the effect so you can target each step in the pipeline directly.

Two further events, ```prerender``` and ```postrender```, are triggered during rendering, and a ```finalize``` event is triggered when all is done.

**Important note #5**

The effects are triggered *per-instance*, i.e they are not global events. If you want global events, you can instantiate a ```Filtrr2.Events``` object and use it as a mediator between all your ```Filtrr2``` instances. 


**Important note #6** 

There's a reason I didn't pass a callback into the ```Filtrr2``` constructor. If we are initializing the constructor with a canvas object then the callback will fire immediately since the canvas object does not have to be loaded. Hence, all event callbacks will be registered *after* the effects code has been executed. 


### Updating the image manually

```js
var my = Filtrr2("#my-img", function() {

    this.brighten(50)
        .saturate(-50)
        .render();

});

window.setTimeout(function() {

    my.update(function() {

        this.saturate(-50).render();

    });

}, 2000);
```

The ```update()``` method on an ```F``` instance allows for manual updates to the current canvas drawing. The context of the callback function is the ```ImageProcessor``` instance of the ```F``` object. 

**Important note #7** 

If ```Filtrr2``` is not ready when the ```update()``` method is called then the call will be ignored.

## Extending the framework

You can very easily extend the framework with your own custom effects using the ```fx()``` method on the ```Filtrr2r``` object. In fact, in ```effects.js``` you will notice that all the predefined effects are defined this way as well. For example:

```js
Filtrr2.fx('boostRed', function(p) {
    
    // clamp() is a utility method which forces a value
    // to be between a specified range.
    // Here we are forcing p to be between [0, 100].
    p = Filtrr2.Util.clamp(p, 0, 100);

    this.process(function(rgba) {

        // This is getting called on every pixel in the image.
        rgba.r += p;   
         
    });

});

Filtrr2("#my-img", function() {

    this.boostRed(50).render();

});
```

The ```process()``` method allows you to apply a transformation on the pixels of the image by. All custom-defined effects have to be created before any ```Filtrr2``` initialization otherwise they will not be available to use (obviously).

The normal events will be triggered when custom effects are in use as well. 

The real power comes when you combine existing effects - that's when you create nice Instagram-like filters:

```js
Filtrr2.fx('age1960', function(p) {
    
    this.saturate(-70)
        .contrast(30)
        .expose(1)
        .render();

});

var my = ("#my-img");

my.on("age1960:preprocess", function() {
    console.log("age1960");
});

my.on("contrast:preprocess", function() {
    console.log("contrast");
});

my.on("expose:preprocess", function() {
    console.log("expose");
});

my.on("saturate:preprocess", function() {
    console.log("saturate");
});

my.ready(function() {

    this.age1960().render();

});
```

**Important note #8**

Since your pre-defined filters will be exposed as functions on an ```ImageProcessor``` instance, the normal JavaScript variable naming rules apply to your effect names as well. Any name that breaks those rules might cause issues.



