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

## Contents

1. What's this?
2. Roadmap
3. Examples
4. Installation
5. Forking, building and testing
6. Built-in goodness
7. Usage
8. Extending the framework

## What's this?

```Filtrr2``` is a JavaScript image manipulation library. Think of it as Instagram filters on the browser. It uses the ```<canvas>``` element to paint filtered pictures in the place of normal pictures on your website.

```Filtrr2``` is the successor to ```Filtrr``` which was a weekend hack thing, but it got some nice exposure when I decided to post it on Hacker News. It improves it on every aspect so if you are using ```Filtrr2```, then you should really upgrade.

#### What's up with the weird name?

Don't ask. It's weird and I know it, but now I'm stuck with it. I would love to rename this as ```fxjs```.

## Roadmap

The current release of ```Filtrr2``` lacks the blending functions of ```Filtrr```. This is in the pipeline - I want to provide a nicer API than the previous version hence I didn't include it for now. 

Other things that I have in mind:

- Fisheye lens
- Image borders
- Vignette
- Pseudo-async rendering so that the UI does not block.

## Examples

You can find some examples in the  ```examples/``` directory.

## Installation

You'll find the latest minified version in ```dist/```. If you wish to use the non-minified files, you first need to load ```filtrr2.js``` and then the rest of the files (```events.js```, ```effects.js```, ```util.js```).

#### Important note #1 

```Filtrr2``` depends on jQuery.

## Forking, building and testing

Fork away. Break it better. I would love contributions in the field of image processing like new and improved blur filters, or combinations of 
existing filters (see below on how to extend the framework).

### Testing

```Filtrr2``` uses ```QUnit``` for testing. For now, you'll have to manually run the tests in your browser(s) by visiting ```test/filtrr2.html```, ```test/util.html```, ```test/effects.html``` (not done yet), ```test/events.html```.

```test/play.html``` is a file I'm using for experiments, nothing special there.

I have plans on automating the test procedure using JsTestDriver or Selenium.

### Building

To build the project you will need node.js and jake. The ```Jakefile.js``` declares a build task which you can run: ```jake build```. The build task uses Google's Closure Compiler to minify all the files into one in ```dist/```. I've included the Compiler in the ```build/``` directory.

### Documentation

Code documentation is generated using Docco. If you'd like to build documentation for your updated version go [here](http://jashkenas.github.com/docco/) and follow the instructions. This document should be enough for covering usage patterns.

## Built-in goodness

```Filtrr2``` comes with a number of built-in effects and blending modes for you to use in your projects. Many of these take a range of values or parameters. Refer to the code
or the ```docs/``` directory for information on these.

### Effects

1. Brighten 
2. Saturate
3. Gamma
4. Adjust
5. Expose
6. Curves
7. Sharpen
8. Blur
9. Fill
10. Subtract
11. Sepia
12. Contrast
13. Posterize
14. Invert
15. Alpha

### Blending modes

1. Multiply 
2. Screen
3. Overlay
4. Soft Light
5. Addition
6. Exclusion
7. Difference

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

So, what happens here? We pass in a jQuery selector to the ```Filtrr2``` constructor and a callback function to get called when ```Filtrr2``` is ready. In the callback, ```this``` refers to a ```ImageProcessor``` instance which holds all defined effecs up to that moment. More about this object later on. As you can see, effect calls can be chained. This pattern should be enough for most use cases.

#### Important note #2

For performance reasons, the effects are *lazily* applied on the canvas. ```Filtrr2``` will *not* draw anything until you call the ```render()``` method.

#### Important note #3

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
- ```reset()```: Reset the image to its original state.


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

#### Important note #4 

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

#### Important note #5

The effects are triggered *per-instance*, i.e they are not global events. If you want global events, you can instantiate a ```Filtrr2.Events``` object and use it as a mediator between all your ```Filtrr2``` instances. 


#### Important note #6 

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

#### Important note #7

If ```Filtrr2``` is not ready when the ```update()``` method is called then the call will be ignored.

### Resetting the image

```js
var my = Filtrr2("#my-img", function() {

    this.brighten(50)
        .saturate(-50)
        .render();

});

window.setTimeout(function() {

    my.reset().render();

}, 2000);
```

The ```reset()``` method on an ```F``` instance allows for resetting the image to its *original* state. It is actually a proxy method to the ```ImageProcessor```'s ```reset()``` method, hence you could actually write ```my.processor.reset()``` instead. This method does not draw on the canvas hence you need to call ```render()``` if you want to set the resetting effect. Since it returns a reference to the ```ImageProcessor``` additional effects can be chained after it.

### Exporting the current image

```js
var my = Filtrr2("#my-img", function() {

    this.brighten(50)
        .saturate(-50)
        .render();

});

// Assume we have a button with id #save
$("#save").click(function() {
    my.save();
});
```

This will cause the current image to be downloaded in your browser. This is tested in recent browsers and it seems to work fine, although the image has no name. The ```save()``` method can take a ```type``` parameter which can be either "png" or "jpeg" which specifies the image type. It defaults to "png". ```JPEG``` support is not implement by all browsers and will fallback to ```PNG```.

### Using layers

```js
Filtrr2("#img", function() {
    
    var dup = this.dup().expose(-35);
                
    this.contrast(40)
        .saturate(-70)
        .adjust(0.2, 0.2, 0)
        .layer("softLight", dup)
        .render();
});
```

Layers work in the same way as Photoshop layers. Using the ```dup()``` method we 
get a duplicate of the current ```ImageProcessor``` instance. The duplicate holds
it's own pixel buffer copy *but* it shares a canvas reference with all other instances
created from the original ```ImageProcessor```. Hence any duplicate can render things
on the original canvas. 

We can then apply effects on the original and the duplicate instances and then we
can blend them together using the ```layer()``` method. The layer on which this method
is called is going to be the *bottom* layer. The layer passed as the (second) parameter to this method will be the top layer. The first parameter to the ```layer()``` method
is the blending mode.

## Extending the framework

You can very easily extend the framework with your own custom effects using the ```fx()``` method on the ```Filtrr2``` object. In fact, in ```effects.js``` you will notice that all the predefined effects are defined this way as well. 

### Before diving in

```Filtrr2``` tries to provide sensible ranges for every effect parameter. These usually lie between ```[-100, 100]```. You should try and keep your parameters in sensible ranges as well. There are two functions that will help you achieve that:

- ```Filtrr2.Util.clamp(val, min, max)```: Ensures ```val``` is >= ```min``` and <= ```max```. If it's less then ```val = min```. If it's more then ```val = max```.
- ```Filtrr2.Util.normalize(val, dmin, dmax, smin, smax)```: Normalizes a value in the source range ```[smin, smax]``` into the corresponding value in the destination range ```[dmin, dmax]```. So for example, it can normalize a value in the ```[-100, 100]``` range into a value in the ```[0, 2]``` range. This is very useful for giving meaningful ranges to the user, and then transforming the range into something more computationally meaningful in the effect method.

### Creating your own effects

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

var my = Filtrr2("#my-img");

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

#### Important note #8

Since your pre-defined filters will be exposed as functions on an ```ImageProcessor``` instance, the normal JavaScript variable naming rules apply to your effect names as well. Any name that breaks those rules might cause issues.
