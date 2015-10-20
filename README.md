# Backbone.Declarative.Views

[Setup][setup] – [Use case][use-case] – [Core functionality][core] – [Template caching][template-cache] – [Other][other] – [Build and test][build]

With Backbone.Declarative.Views, you can read the markup for the container element of a view directly from its template. Keep the tag name, class name and other attributes of `el` out of Backbone.View Javascript code. ([Read why.][use-case])

That [separation of concerns][use-case] works entirely behind the scenes. Just load Backbone.Declarative.Views into your project, and [start declaring the view attributes][basic-usage] in the HTML of your templates.

As a bonus, you get a Javascript API for direct access to the [template cache][template-cache]. The cache is built into Backbone.Declarative.Views to keep it fast and efficient. So why not take advantage of it for your own template processing, too? Creating new views becomes a much speedier affair, and the overall effect on performance can be huge.

Users of Marionette benefit from [automatic, integrated management][marionette-cache-integration] of the template caches which Marionette and Backbone.Declarative.Views provide.

If you are a happy user of this project already, you can support its development by [donating to it][donations]. You absolutely don't have to, of course, but perhaps it is something you [might actually want to do][donations].

## Dependencies and setup

### With plain Backbone

[Backbone][] is the only dependency. Include backbone.declarative.views.js after [Backbone][].

If you use other components which extend Backbone.View, load these components after Backbone.Declarative.Views.

Backbone.Declarative.Views augments the Backbone.View base type, so its functionality is available in every view throughout your code.

### With Marionette

Load backbone.declarative.views.js after [Marionette][].

If you use AMD, please be aware that Marionette is not declared as a dependency in the AMD build of Backbone.Declarative.Views. Declare it yourself by adding the following shim to your config:

```javascript
requirejs.config( {
    shim: {
        'backbone.declarative.views': {
            deps: ['marionette']
        }
    }
} );
```

### Getting it: Download, Bower, npm

The stable version of Backbone.Declarative.Views is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install backbone.declarative.views`. With npm, it is `npm install backbone.declarative.views`.

## Why use it

Markup, styling and behaviour should be kept separate – we all know that. Yet with Backbone views, it is common to mix them up.

Part of the view markup is often stored in the HTML, wrapped in script/template tags, while another part – the one describing the container `el` of the template – ends up right inside your Javascript, hidden away in `tagName`, `className` and other properties.

It doesn't belong there.

## Core functionality

Backbone views use [a couple of properties][backbone-el-properties] to describe the container element: `tagName`, `className`, `id` and `attributes`.

Instead of managing these properties in Javascript, declare them as data attributes of the script tag which is storing the template.

### Define an `el` with data attributes in the HTML

Lets begin with an example. Consider the following template snippet.

```html
<script id="my-template"
        type="text/x-template"

        data-tag-name="p"
        data-id="myContainer"
        data-class-name="someClass orOther">

    <!-- template content here -->

</script>
```

Now, if your view has a `template: "#my-template"` property, its `el` is set up as 

```html
<p id="myContainer" class="someClass orOther"></p>
```

The transformation doesn't require any intervention on your part, or additional code. This is the core of what Backbone.Declarative.Views does.

#### What exactly is going on here?

Backbone.Declarative.Views looks for a `template` property on the view, with a selector as its value. A `template`  option passed to the constructor [will do as well][view-setup]. As the Backbone view is created, Backbone.Declarative.Views fetches the template and uses the data attributes, if there are any, to set up the `el` of the view.

And that is the end of it. Processing the template, feeding template vars to it, appending the final HTML to the DOM – all that remains your responsibility. However, you can speed up the process by fetching the template [from the cache][template-cache] of Backbone.Declarative.Views. There is no need to read it from the DOM again.

#### Name changes

There is something else you might have noticed in the example above. The names of the Backbone.View properties have changed when they were written as data attributes.

In compliance with the [HTML5 data attributes][mdn-data-attributes] spec,  `tagName` has turned into `data-tag-name`, and `className` has become `data-class-name`. Likewise, there are a `data-id` and `data-attributes`. Use these names when describing an `el` in a template.

#### Define the `attributes` as JSON

Among the properties describing the `el` of the view, one warrants a closer look: the `attributes` property. In Javascript, it is a hash. So when declaring it in a template, write it as JSON.

```html
<script id="some-template"
        type="text/x-template"
        data-attributes='{ "lang": "en", "title": "container title" }'>

    <!-- template content here -->

</script>
```

When hand-writing JSON, remember to quote property names as well as their values. And those quotes must be double quotes.

### How to tell a view to use a template

There are two ways to let a view know about its template:

- You can set the template property of the class with `extend()`: 

  ```javascript
  var View = Backbone.View.extend( { template: "#selector" } );
  ```

- You can also pass the template in as an option when you create the view: 

  ```javascript
  var view = new View( { template: "#selector" } );
  ```

The `template` option, if provided, is attached to the view directly. It is available to the methods of your view, including `initialize()`, as `this.template`.

### How _not_ to tell a view to use a template

If you want Backbone.Declarative.Views to pick up the properties of your `el`, and perhaps cache the template for you, you have to play by the rules.

- You can't set the template property to a selector inside `initialize` – that is too late. The `el` has already been set up at this point. Modifications of the template property in `initialize()` will not affect the `el` of the view. 

  This behaviour is a feature, not a bug. It is common to compile a template in `initialize`, along the lines of

  ```javascript
  initialize: function () {
    this.template = _.template( $( this.template ).html() );
  }
  ```

  The original value of the template property is overwritten in the process. Backbone.Declarative.Views does not interfere with this pattern, it continues to work. Equally, overwriting the template property in `initialize` won't break the functionality of Backbone.Declarative.Views, either.

- The `el` properties in a template are ignored if the view does not create its own, shiny new `el`. Backbone allows you to attach a view to an `el` which already exists in the DOM, rather than create a new one:

  ```javascript
  var view = new View( { el: existingElement } );
  ```

  Even if you specify a `template` along with it, the data attributes of the template won't get applied to the `el`. That is in line with the default Backbone behaviour. Backbone ignores `el`-related view properties, like `tagName` and `className`, if `el` is set to an existing DOM element.

### How to override the `el` definition in a template

You can override part or all of the `el` properties which are declared in data attributes.

In the [example above][basic-usage], the data attribute defines the tag as a `p`. Suppose you add a `tagName: "section"` property to the view, or pass it to the constructor as an option. The tag name applied by your script, `section`, will trump the `p` you defined statically in the template.

### Setting the template property to a template string rather than a selector

Yes, that works as well. The template property of a view can be set to an HTML string instead of a selector, as in the following example:

```javascript
var templateHtml = '<li class="bullet" data-tag-name="ul" data-class-name="list">' +
                   'template <%= content %> goes here' + 
                   '</li>',
    view = new Backbone.View( { template: templateHtml } );

console.log( view.el.tagName )   // => prints "UL"
console.log( view.el.className ) // => prints "list"
```

If the template HTML doesn't have a single top-level element, but multiple ones, then the data attributes defining the `el` must be on the first top-level element.

## Performance: Use the template cache

Accessing the DOM is rather slow. Ideally, for each template, it should be enough to touch the DOM once. The very first time a template is used, Backbone.Declarative.Views retrieves it from the DOM and checks for `el` data on the template tag. From here on out, the data of that template is cached.

It makes overwhelming sense to reuse that data and save yourself future look-ups. Backbone.Declarative.Views tries to be helpful, so it does not just keep the data attributes of the `el` in its cache. It will happily hand you the inner HTML of the template, or the outer HTML. And if you tell it [which template compiler to use][template-compiler], it will even compile the templates for you and cache the results, too.

### At a glance: How to use the cache

Here is a pretty universal duo of snippets for tapping into the cache of Backbone.Declarative.Views. 

The snippets assume that you compile your templates with the `_.template()` function of Underscore. If you don't, it is pretty easy to see what you need to change.

```javascript
// Tell the caching mechanism which template compiler to use
Backbone.DeclarativeViews.custom.compiler = function ( templateHtml ) {
  return _.template( templateHtml );
};
```

[Defining a compiler][template-compiler] like that is optional, but gives you a speed boost for free.

```javascript

// Tap into the cache in a view class. 
//
// Safe to use even if you don't define a template for some of your views. 
// Also works if you leave out the snippet above, and don't set a compiler.
var BaseView = Backbone.View.extend( {
  initialize: function () {
    var cachedTemplate = this.declarativeViews.getCachedTemplate();
    if ( cachedTemplate ) {
      this.template = cachedTemplate.compiled || _.template( cachedTemplate.html );
    }
  }
} );
```

This little bit of code has got you covered. For the fine print, read on. 

### Reading template data from the cache

You can access cached template data easily from inside a view. The necessary methods are tucked away, or rather namespaced, in the `declarativeViews` property of a view.

In addition, you can deal with cache entries independently of individual, instantiated views. The global cache API is attached to the `Backbone.DeclarativeViews` namespace (note that there is no dot inside `DeclarativeViews`).


#### Two ways of fetching a cache entry

In the context of a view, call `declarativeViews.getCachedTemplate()`:

```javascript
initialize: function () {
  var cachedTemplate = this.declarativeViews.getCachedTemplate();
  // Do stuff with it, most likely with cachedTemplate.html, 
  // or perhaps with cachedTemplate.compiled.
}
```

As you can see in the example, the cached template is available by the time `initialize()` is run, so you can use it there.

<a name="permanent-view-template-link"></a>The link between a view and a template is forged when the view is instantiated, and as far as the cache is concerned, it can never be changed. You can modify or overwrite the `template` property as you wish, do whatever you want with it during `render()`, even use multiple templates. But `getCachedTemplate()` always returns the template you started out with – the one defined by the `template` property, or a `template` option, at the time the view [was created][view-setup].

If you need to access the cache independently of an individual view, call `getCachedTemplate()` via the global API with a template selector.

```javascript
var cachedTemplate = Backbone.DeclarativeViews.getCachedTemplate( "#template" );
```

Don't worry about availability. If the template is not yet in the cache, that call will put it in there.

To avoid duplicate cache entries, use the same selector for a `getCachedTemplate()` query as in your views. Selectors which are equivalent but not identical, e.g. `"#template"` and `"script#template"`, create two distinct cache entries even though they refer to the same template.

#### What is on offer in a cache entry?

When you pull data from the cache with `getCachedTemplate()`, you _do not_ get a string with the template HTML back. Rather, your receive a hash with various properties of the cache entry:

- `html` (string)
  the actual template content if the template has been specified by a selector.

  If you don't define your template with a selector, and rather pass in [a raw HTML template string][raw-html-template-string], the `html` property contains the _inner_ HTML of that string. In case you need the string back verbatim, call `outerHtml()` instead. Please keep in mind that [some HTML strings are uncacheable (see below)][cache-miss-uncacheable-string].
  
- `outerHtml` (function)
  a function returning the full (outer) HTML of the template
  
- `compiled` (function, or undefined)
  the compiled template (ie, a function returning the final HTML, with the template vars filled in) if a
  template compiler [has been set][template-compiler] in `Backbone.DeclarativeViews.custom.compiler`. Or undefined, otherwise.
  
- `tagName` (string or undefined)
  the tag to be used for the `el`, if defined by a data attribute of the template
  
- `className` (string or undefined)
  the class name of the `el`, if defined by a data attribute
  
- `attributes` (hash or undefined)
  hash of `el` attributes and their values, if defined by a data attribute

_(Oh, and have you spotted the textbook case of bad API design? One way to get back the template HTML is by reading the `html` **property**, while its twin `outerHtml` is a **function** you have to call. Yes, that seems silly, and yes, it can trip you up._

_But then again, some templates are rather big, and most people don't need the outer HTML. Given today's memory constraints on mobile devices, it seemed better to reconstruct the outer HTML on demand, with a function call, rather than double the memory consumption of the cache by storing near-identical strings for every template.)_

#### What about cache misses?

There won't be a cache miss for any template which exists in the DOM. When you call `getCachedTemplate()` on either a view or the global `Backbone.DeclarativeViews` object, you get the template back. If it is not yet in the cache, it will be put there in the process.

You do get a cache miss in the following cases.

- <a name="cache-miss-no-string"></a>The template you request is not defined by a string.

  You can set the template property of a view to pretty much anything. It could be a function returning what you need. It could, theoretically, be a hash of things. 

  Backbone.Declarative.Views does not handle these kinds of template definitions. It simply leaves them alone. Consequentially, the templates do not make it into the built-in cache.

- The selector does not match a DOM node.

  That only matters on first access. If the DOM node is deleted after its content is already in the cache, you get the cached template back.

- <a name="cache-miss-uncacheable-string"></a>The template is not a selector but a [raw HTML string][raw-html-template-string], and that string can't be turned into a template _element_ (or a set of elements).

  Backbone.Declarative.Views hands the template string over to `Backbone.$` (read: jQuery) for processing, or to a [custom loader][custom-loader] if you have defined one. If jQuery, or your loader, can't handle the string, you get a cache miss.

  In practice, that happens when you pass the _inner_ HTML of a template to your view, and parts of the HTML are not wrapped in a tag. Consider a view like this:

  ```javascript
  var view = new View( {
    template: "Template <%= content %> <em>without</em> a tag around it."
  } );
  ```
  
  The loader, jQuery, can't deal with the string. There would have to be HTML tags around the plain text, but without them, jQuery throws an error (which is caught, silently). Because the template loader can't handle it, Backbone.Declarative.Views ignores it. This is an uncacheable template as far as Backbone.Declarative.Views is concerned.
  
In all of these cases, `getCachedTemplate()` returns undefined.

### Keeping compiled templates in the cache

Backbone.Declarative.Views handles the template caching, with one exception. Compiled templates are not in the cache, at least by default. You first need to tell Backbone.Declarative.Views which compiler to use.

This is how:

```javascript
Backbone.DeclarativeViews.custom.compiler = function ( templateHtml, $template ) {
  // do stuff
  return yourCompiledTemplate;
};
```

The compiler function receives the inner HTML of the template node as the first argument. As the second argument, it is passed the template node itself, in a jQuery wrapper.

The compiler should return a function which accepts the template vars as an argument and produces the final HTML. But in fact, the compiler is allowed to return anything. Backbone.Declarative.Views doesn't care what your compiled templates are, and what you do with them. It just stores them for you.

The return value of the compiler is stored in the `compiled` property [of each cache entry][cache-entry].

So in effect, if you define a compiler, this is what Backbone.Declarative.Views does for you:

```javascript
cacheEntry.compiled = Backbone.DeclarativeViews.custom.compiler( cacheEntry.html, $template );
```

### Using a custom template loader

By default, the template property of your view is assumed to be a selector, or perhaps a [raw HTML string][raw-html-template-string]. For processing, it is handed over to `Backbone.$`, which acts as the default loader and fetches your template from the DOM (or creates a node from the raw HTML string).

If that is not how you want to go about loading your templates, define a custom loader instead. It will take the place of `Backbone.$` when the template is fetched. 

```javascript
Backbone.DeclarativeViews.custom.loadTemplate = function ( templateProperty ) {
  // do stuff
  return $( nodeOrOuterTemplateHtml );
};
```

The custom loader is called with the template property as the only argument. That argument is always a string. The custom loader must return a jQuery object (or more precisely an instance of `Backbone.$`, which usually means jQuery).

The returned jQuery object is considered to be the template node. The template HTML should best be _inside_ that node (rather than _be_ the node), though it is essentially up to you how you set that up. Inner and outer HTML of the node can be retrieved from the `html` property and `outerHtml()` method [of the cache entry][cache-entry].

But sometimes, things just go wrong. If your loader can't process the template argument, or does not find the template, it is allowed to throw an error. The error is caught and handled silently. Alternatively, the loader can return a jQuery object which does not contain any nodes (length 0). Both cases are treated as a permanent [cache miss][cache-misses].

Please be aware that your custom loader will only be called if the template of the view [is defined by a string][cache-miss-no-string]. If it is not, Backbone.Declarative.Views bails out well before attempting to load anything. Non-string template properties are [none of its business][cache-miss-no-string]. 

### Clearing the cache

If you modify a template in the DOM, and if that template has already been used, you have to clear the cache. Otherwise, the cache does not pick up the changes and returns an outdated version of the template.

You can clear the cache for a specific template, or a number of them, from the global `Backbone.DeclarativeViews` object:

```javascript
Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2" );
Backbone.DeclarativeViews.clearCachedTemplate( [ "#template", "#template2" ] );
```
You must use the exact same selectors as when you first used the templates. Selectors which are merely equivalent, e.g. `"script#template"` instead of `"#template"`, don't match the cache entry and leave it in the cache.

Alternatively, you can target the template [associated with a specific view][cache-entry-access], and clear it from there: 

```javascript
someView.declarativeViews.clearCachedTemplate();
```

Again, this makes sure that the template will be re-read from the DOM on next access. But it [does not allow you to re-associate][permanent-view-template-link] the view with another template (as far as the cache is concerned). That [link][permanent-view-template-link] stays in place for the lifetime of the view.

Finally, if you want to clear the whole cache in one go, do it with

```javascript
Backbone.DeclarativeViews.clearCache();
```

### Marionette cache integration

There is a lightweight link between the caches of Marionette and Backbone.Declarative.Views. If you clear an item from one cache, it gets cleared from the other as well. You can call the cache-clearing methods [of Marionette][Marionette.TemplateCache.clear] and Backbone.Declarative.Views interchangeably.

And that, surprisingly, is where it ends. You might have expected deeper integration, like an actual joint cache, which would have saved memory and reduced DOM access even further. 

Indeed, that joint cache has [existed briefly][src-obsolete-marionette-loader-integration]. But it turned out that the costs outweighed the benefits. The performance gain was minimal at best, sometimes not even offsetting the additional overhead of integration. And crucially, it didn't work that well with some Marionette customizations. [Custom template loaders in Marionette][Marionette.TemplateCache.loadTemplate] had been trickier to use. In the end, full cache integration had been more trouble than it is worth, and has been removed.

## Other

### Does Backbone.Declarative.Views work with frameworks built on top of Backbone?

With Marionette, [it does][setup-marionette]. The unit tests cover Marionette, too.

With other frameworks, it should work just as well. Backbone.Declarative.Views is designed to play nice with third-party code of any kind. So go ahead and try it. Feedback is always welcome.

### Does it clash with "traditional" ways of defining tagName or className?

No. You can [continue to define][overriding-data-attributes] `tagName`, `className` etc as properties of Backbone Views in your Javascript code, or pass them in as options. Backbone.Declarative.Views just gives you yet another way to declare them – and quite possibly a superior one.

Equally, you can omit the `template` property, or assign a value to it which is a function, rather than a selector. Obviously, the `el` of the view won't be set up from data attributes this way, but rest assured that nothing will break.

### What if a view just composes other views and doesn't have markup of its own?

An example of such a view is the [Marionette.CollectionView][] type. Its content is entirely made up of iterated child views. Its own markup consists of nothing more than the containing `el`.

And yes, that `el` can be defined with a template. You don't have to put the `el` properties back into Javascript code. 

For such a view, only the data attributes matter in the template. The content inside the template tag will simply be ignored.

```html
<script id="collection-view-template"
        type="text/x-template"
        data-tag-name="ul"
        data-class-name="itemlist">
  <!-- This is a template for a collection view, hence no content. -->
</script>
```

### Is Backbone.Declarative.Views available to components which are loaded before it?

Mostly, yes. It depends on how you set up your views. If you define the template property with `extend()`, before instantiating the view, things will just work.

But you can run into an edge case if you

- load a component which creates its own Backbone.View subtypes AND
- load the component too early, ie before Backbone.Declarative.Views AND
- while instantiating a view which is supplied by the component, you pass it a template selector as an option.

In that case, and in that case only, the data attributes of the template won't get applied to the `el` of the view.

So to be on the safe side, load your view-related components [after Backbone.Declarative.Views][setup].

Incidentally, [Marionette][] is not affected by that edge case. You can load Marionette before Backbone.Declarative.Views, and in fact [you should][setup-marionette].

### Why data attributes?

On the face of it, using data attributes on one tag to describe another tag seems nonstandard and indirect. You may wonder why the markup for the `el` of a view can't just be part of the HTML inside the template, as an enclosing tag perhaps.

As it turns out, that kind of approach is fraught with problems. See the [related Backbone issue][backbone-issue-546] for a discussion. [@tbranyen lists][comment-tbranyen] some of the difficulties. Also check out the [comment by @jashkenas][comment-jashkenas].

Backbone.Declarative.Views does not make any assumptions about what you keep inside your templates, or how you structure them. It does not break existing code, no matter what. You can include it into any project and use it where it helps you most, without being forced to rework legacy code. Data attributes are the best solution for that kind of approach.

## Build process and tests

If you'd like to fix, customize or otherwise improve the project: here are your tools.

### Setup

[npm][] and [Bower][] set up the environment for you. 

- The only thing you've got to have on your machine is [Node.js]. Download the installer [here][Node.js].
- Open a command prompt in the project directory.
- Run `npm install`. (Creates the environment.)
- Run `bower install`. (Fetches the dependencies of the script.)

Your test and build environment is ready now. If you want to test against specific versions of Backbone, edit `bower.json` first.

### Running tests, creating a new build

The test tool chain: [Grunt][] (task runner), [Karma][] (test runner), [Mocha][] (test framework), [Chai][] (assertion library), [Sinon][] (mocking framework). The good news: you don't need to worry about any of this.

A handful of commands manage everything for you:

- Run the tests in a terminal with `grunt test`.
- Run the tests in a browser interactively, live-reloading the page when the source or the tests change: `grunt interactive`.
- If the live reload bothers you, you can also run the tests in a browser without it: `grunt webtest`.
- Run the linter only with `grunt lint` or `grunt hint`. (The linter is part of `grunt test` as well.)
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http._ So please be aware of the security implications. You can restrict that access to localhost in `Gruntfile.js` if you just use browsers on your machine.

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## Supporting development

To my own surprise, [a kind soul][donations-idea] wanted to donate to one of my projects, but there hadn't been a link. [Now there is.][donations-paypal-link]

Please don't feel obliged in the slightest. It's [MIT][license], and so it's free. That said, if you do want to support the maintenance and development of this component, or any of my [other open-source projects][hashchange-projects-overview], I _am_ thankful for your contribution.

Naturally, these things don't pay for themselves – not even remotely. The components I write aim to be well tested, performant, and reliable. That may not sound terribly fascinating, but at the end of the day, these attributes make all the difference in production. And maintaining that standard is rather costly, time-wise. That's why donations are welcome, no matter how small, and be it as nod of appreciation to keep spirits up. [Thank you!][donations-paypal-link]

[![Donate with Paypal][donations-paypal-button]][donations-paypal-link]

## Release Notes

### v2.0.1

- Updated Backbone dependency

### v2.0.0

- Added safe and transparent template caching, significant speed gains
- Added a cache management API, opening the cache for access from client code
- Added Marionette cache integration (if Marionette is available)
- Added support for custom template loaders and compilers
- Updated dependencies

### v1.0.2

- Fixed handling of options.template with undefined value

### v1.0.1

- Fixed strict mode in AMD build
- Improved build environment

### v1.0.0

- Made available as an npm install
- Improved documentation

### v0.2.0

- Added caching for the template element
- Tweaked AMD build
- Clarified documentation

### v0.1.1

- Fixed AMD build
- Fixed documentation

### v.0.1.0

- Initial public release

## License

MIT.

Copyright (c) 2014, 2015 Michael Heim.

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Marionette]: https://github.com/marionettejs/backbone.marionette#readme "Marionette: a composite application library for Backbone.js"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma – Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha – the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS – Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[dist-dev]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/backbone.declarative.views.js "backbone.declarative.views.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/backbone.declarative.views.min.js "backbone.declarative.views.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/amd/backbone.declarative.views.js "backbone.declarative.views.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/amd/backbone.declarative.views.min.js "backbone.declarative.views.min.js, AMD build"

[mdn-data-attributes]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-* "MDN – Global HTML attributes: data-*"
[Marionette.TemplateCache.clear]: http://marionettejs.com/docs/marionette.templatecache.html#clear-items-from-cache "Marionette.TemplateCache: Clear items from cache"
[Marionette.TemplateCache.loadTemplate]: http://marionettejs.com/docs/marionette.templatecache.html#override-template-retrieval "Marionette.TemplateCache: Override template retrieval"
[Marionette.CollectionView]: https://github.com/marionettejs/backbone.marionette/blob/master/docs/marionette.collectionview.md "Marionette.CollectionView"
[backbone-el-properties]: http://backbonejs.org/#View-el "Backbone.View: el"
[backbone-issue-546]: https://github.com/jashkenas/backbone/issues/546 "Backbone issue: Don't wrap views if using templates"
[comment-tbranyen]: https://github.com/jashkenas/backbone/issues/546#issuecomment-16722262
[comment-jashkenas]: https://github.com/jashkenas/backbone/issues/546#issuecomment-3604746
[src-obsolete-marionette-loader-integration]: https://github.com/hashchange/backbone.declarative.views/blob/d51af3baace4426788ec621e5ff2c02dc82b057e/src/marionette.declarativeviews.integration.js#L20-54

[setup]: #dependencies-and-setup
[setup-marionette]: #with-marionette
[use-case]: #why-use-it
[core]: #core-functionality
[basic-usage]: #define-an-el-with-data-attributes-in-the-html
[view-setup]: #how-to-tell-a-view-to-use-a-template
[overriding-data-attributes]: #how-to-override-the-el-definition-in-a-template
[raw-html-template-string]: #setting-the-template-property-to-a-template-string-rather-than-a-selector
[template-cache]: #performance-use-the-template-cache
[cache-entry-access]: #two-ways-of-fetching-a-cache-entry
[permanent-view-template-link]: #permanent-view-template-link
[cache-entry]: #what-is-on-offer-in-a-cache-entry
[cache-misses]: #what-about-cache-misses
[cache-miss-no-string]: #cache-miss-no-string
[cache-miss-uncacheable-string]: #cache-miss-uncacheable-string
[template-compiler]: #keeping-compiled-templates-in-the-cache
[custom-loader]: #using-a-custom-template-loader
[marionette-cache-integration]: #marionette-cache-integration
[other]: #other
[edge-case]: #is-it-available-to-components-which-are-loaded-before-it
[build]: #build-process-and-tests

[donations]: #supporting-development "Supporting development"
[donations-idea]: https://github.com/hashchange/jquery.documentsize/issues/1 "jQuery.documentSize, issue #1: Thank you!"
[donations-paypal-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HQ9K6AGMYV7H2 "Donate with Paypal"
[donations-paypal-button]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif "Donate with Paypal"
[license]: #license "License"
[hashchange-projects-overview]: http://hashchange.github.io/ "Hacking the front end: Backbone, Marionette, jQuery and the DOM. An overview of open-source projects by @hashchange."