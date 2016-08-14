# Backbone.Declarative.Views

[Setup][setup] – [Use case][use-case] – [Core functionality][core] – [Template caching][template-cache] – [Other][other] – [Build and test][build]

The `el` of a Backbone view is defined by a tag name, class name and other attributes. With Backbone.Declarative.Views, you can keep these properties out of your Javascript code. You no longer have to declare them in your views. Instead, describe the `el` properties right in your templates. ([Read why.][use-case])

Backbone.Declarative.Views works entirely behind the scenes. Just load it into your project, and [start declaring the `el` attributes][basic-usage] in your templates wherever you wish. Legacy code is not affected, existing templates work exactly as they did before – until you decide to enhance them with the features of Backbone.Declarative.Views.

##### Bonus feature: speed

As a bonus, you get a [template cache][template-cache], and a Javascript API for easy access to it. The cache is built into Backbone.Declarative.Views for fast and efficient operation. It makes overwhelming sense to take advantage of it for your own template processing, too. Creating new views becomes a much speedier affair, and the overall effect on performance can be huge.

Users of Marionette benefit from [automatic, integrated management][marionette-cache-integration] of the template caches which Marionette and Backbone.Declarative.Views provide.

##### Pseudo competitors: Backbone.Declarative.Views or Backbone.Inline.Template?

For defining the properties of an `el`, Backbone.Declarative.Views [makes use of data attributes][core]. They are set on the template tag. The `el` is not part of the template content itself, not defined by markup inside the template.

For some use cases, tough, you need just that. Fully self-contained templates, which include the `el` of the view inline in their markup, are the distiguishing feature of [Backbone.Inline.Template][].

For the pros and cons of each approach, and the trade-offs involved, see [this comparison][Backbone.Inline.Template-why].

##### Supporting the project

If you are a happy user of this project already, you can support its development by [donating to it][donations]. You absolutely don't have to, of course, but perhaps it is something you [might actually want to do][donations].

## Dependencies and setup

### With plain Backbone

Backbone.Declarative.Views depends on the Backbone stack: [Backbone][], [Underscore][], and [jQuery][] or one of its replacements. Include backbone.declarative.views.js after that lot.

If you use other components which extend Backbone.View, load these components after Backbone.Declarative.Views.

Backbone.Declarative.Views augments the Backbone.View base type, so its functionality is available in every view throughout your code.

When loaded as a module (e.g. AMD, Node), Backbone.Declarative.Views does not export a meaningful value. It solely lives in the Backbone namespace.

### With Marionette

Load backbone.declarative.views.js after [Marionette][].

If you use AMD, please be aware that Marionette is not declared as a dependency in the AMD build of Backbone.Declarative.Views. Declare it yourself by adding the following shim to your config:

```javascript
requirejs.config( {
    shim: {
        'backbone.declarative.views': ['marionette']
    }
} );
```

### Download, Bower, npm

The stable version of Backbone.Declarative.Views is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]). If you use Bower, fetch the files with `bower install backbone.declarative.views`. With npm, it is `npm install backbone.declarative.views`.

## Why use it?

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

In compliance with the [HTML5 data attributes][mdn-data-attributes] spec, `tagName` has turned into `data-tag-name`, and `className` has become `data-class-name`. Likewise, there are a `data-id` and `data-attributes`. Use these names when describing an `el` in a template.

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

Yes, that works as well. The template property of a view can be set to an HTML string instead of a selector, as in the following example. If you want to define the `el` in such a string, don't set the data attributes on an element; write them into a comment instead.

```javascript
var templateHtml = '<!-- data-tag-name="ul" data-class-name="list" -->' +
                   '<li class="bullet" data-tag-name="ul" data-class-name="list">' +
                   '  template <%= content %> goes here' +
                   '</li>',
    view = new Backbone.View( { template: templateHtml } );

console.log( view.el.tagName )   // => prints "UL"
console.log( view.el.className ) // => prints "list"
```

The position of the comment doesn't matter, it can be at the end or right in the middle of the template string as well. You can also add additional text to that special comment. However, the data attributes defining the `el` have to go into the same, single comment – don't spread them out over multiple ones.

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

// As you can see, the function signatures of `custom.compiler` and `_.template`  
// are identical here, so we could simplify the assignment to
Backbone.DeclarativeViews.custom.compiler = _.template;
```

[Defining a compiler][template-compiler] like that is optional, but gives you a significant speed boost for free. It is best to make a habit of always defining the template compiler.

```javascript
// Access the cache in a view.

// The following lines are safe to use even if you don't define a template for
// some of your views. They also work if you leave out the snippet above, and
// don't set a compiler.
var BaseView = Backbone.View.extend( {
  initialize: function () {
    var cachedTemplate = this.declarativeViews.getCachedTemplate();
    if ( cachedTemplate ) {
      this.template = cachedTemplate.compiled || _.template( cachedTemplate.html );
    }
  }
} );

// If you always define the template compiler, and your view is guaranteed to
// have a template, get rid of the cruft and just use
var BaseView = Backbone.View.extend( {
  initialize: function () {
    this.template = this.declarativeViews.getCachedTemplate().compiled;
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

  If you don't define your template with a selector, and rather pass in [a raw HTML template string][raw-html-template-string], the `html` property contains that string.

- `compiled` (function, or undefined)
  the compiled template (ie, a function returning the final HTML, with the template vars filled in) if a
  template compiler [has been set][template-compiler] in `Backbone.DeclarativeViews.custom.compiler`. Or undefined, otherwise.

- `tagName` (string or undefined)
  the tag to be used for the `el`, if defined by a data attribute of the template

- `className` (string or undefined)
  the class name of the `el`, if defined by a data attribute

- `attributes` (hash or undefined)
  hash of `el` attributes and their values, if defined by a data attribute

#### What about cache misses?

There won't be a cache miss for any template which exists in the DOM. When you call `getCachedTemplate()` on either a view or the global `Backbone.DeclarativeViews` object, you get the template back. If it is not yet in the cache, it will be put there in the process.

The same happens for any string value you set the template to. If the string is not a selector which matches a DOM node, it is taken to be a [raw HTML string][raw-html-template-string].

For that reason, even invalid or mistyped selectors do not cause a cache miss – they are interpreted as a template string and end up as HTML as well. That is actually beneficial for debugging, more straightforward than a cache miss, as you get to see the mistaken selector string right in the output. But the onus is on you to handle it properly.

Of course, the validity of the selector only matters on first access. If the DOM node is deleted after its content is already in the cache, you get the cached template back.

You do get a cache miss in the following cases:

- <a name="cache-miss-no-string"></a>The template you request is not defined by a string.

  You can set the template property of a view to pretty much anything. It could be a function returning what you need. It could, theoretically, be a hash of things.

  Backbone.Declarative.Views does not handle these kinds of template definitions. It simply leaves them alone. Consequentially, the templates do not make it into the built-in cache.

- <a name="cache-miss-empty-string"></a>You set the template to an empty string.

- <a name="cache-miss-uncacheable-string"></a>You use a [custom template loader][custom-loader] and it can't handle your template string, throwing an error or returning an empty jQuery object as a result. Because the template loader can't handle the template, Backbone.Declarative.Views ignores it.

  The default loader of Backbone.Declarative.Views does not produce cache misses of that kind, though. The only string leading to a cache miss is an empty template string. And an empty template string should be considered a misconfiguration anyway.

In these cases, `getCachedTemplate()` returns undefined.

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

##### Arguments and expected return value

The custom loader is called with the template property of the view as the only argument. That argument is always a string. The custom loader must return a jQuery object (or more precisely an instance of `Backbone.$`, which usually means jQuery).

The returned jQuery object is considered to be the template node. The template HTML has to be _inside_ that node (rather than _be_ the node). The inner HTML of the node can be retrieved from the `html` property [of the cache entry][cache-entry].

##### Errors

Sometimes, things just go wrong. If your loader can't process the template argument, or does not find the template, it is allowed to throw an error. The error is caught and handled silently (with one exception, see below). Alternatively, the loader can return a jQuery object which does not contain any nodes (length 0). Both cases are treated as a permanent [cache miss][cache-misses].

If you need to call attention to a specific type of problem, your loader can raise the alarm. An error is allowed to bubble up, rather than being handled silently, if the loader throws one of the error types belonging to Backbone.Declarative.Views. These are `Backbone.DeclarativeViews.Error`, `Backbone.DeclarativeViews.TemplateError`, `Backbone.DeclarativeViews.CompilerError` and `Backbone.DeclarativeViews.CustomizationError`.

##### Other considerations

Please be aware that your custom loader will only be called if the template of the view [is defined by a string][cache-miss-no-string]. If it is not, Backbone.Declarative.Views bails out well before attempting to load anything. Non-string template properties are [none of its business][cache-miss-no-string].

Your custom loader has access to the default loader and can invoke it like this:

```javascript
$template = Backbone.DeclarativeViews.defaults.loadTemplate( templateProperty );
```

In most cases, though, that won't be necessary and is hardly worth the bother: the default loader just returns `$( templateProperty )` anyway. But things are different if a plugin overwrites the default loader and replaces it with more complex code. Your own custom loader might need to access it then, and it can.  

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

### The template property is set to a selector, but the selector string itself is returned as the template content. Why?

The selector doesn't match a DOM element, and hence is [interpreted as a template literal][cache-misses]. Fix your selector to make it work.

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

#### Considerations for testing

To run the tests on remote clients (e.g. mobile devices), start a web server with `grunt interactive` and visit `http://[your-host-ip]:9400/web-mocha/` with the client browser. Running the tests in a browser like this is slow, so it might make sense to disable the power-save/sleep/auto-lock timeout on mobile devices. Use `grunt test` (see below) for faster local testing.

#### Tool chain and commands

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

## Facilitating development

To my own surprise, [a kind soul][donations-idea] wanted to donate to one of my projects, but there hadn't been a link. [Now there is.][donations-paypal-link]

Please don't feel obliged in the slightest. The license here is [MIT][license], and so it's free. That said, if you do want to support the maintenance and development of this component, or any of my [other open-source projects][hashchange-projects-overview], I _am_ thankful for your contribution.

Naturally, these things don't pay for themselves – not even remotely. The components I write aim to be well tested, performant, and reliable. These qualities may not seem particularly fascinating, but I put a lot of emphasis on them because they make all the difference in production. They are also rather costly to maintain, time-wise.

That's why donations are welcome, and be it as nod of appreciation to keep spirits up. [Thank you!][donations-paypal-link]

[![Donate with Paypal][donations-paypal-button]][donations-paypal-link]

## Release Notes

### v3.0.1

- Simplified AMD shim for using Marionette

### v3.0.0

###### Changes

- Removed the separate AMD/Node builds in `dist/amd`. Module systems and browser globals are now supported by the same file, `dist/backbone.declarative.views.js` (or `.min.js`)
- Made the `.html` property of a cache entry [return the full HTML][cache-entry] of a raw template string (previously: the inner HTML only)
- Made all raw template strings cacheable, including those with text at the top level, outside of a tag
- Removed the `outerHtml()` method from cache entries
- In raw template strings, `el` attributes are [defined inside a comment][raw-html-template-string] (previously: with attributes on the first top-level tag)
- Invalid template selectors are [treated as template strings][cache-misses], no longer cause a cache miss
- Version is exposed in `Backbone.DeclarativeViews.version`

###### Fixes

- Fixed parsing errors, caused by invalid HTML or unusual template directives, when caching raw template strings

### v2.2.1

- Updated jQuery dependency to jQuery 3.1

### v2.2.0

- Added `Backbone.DeclarativeViews.plugins.registerCacheAlias` method for use by plugins
- Fixed jQuery data cache updates for jQuery 1.x, 2.x

### v2.1.0

- Exposed the default template loader in `Backbone.DeclarativeViews.defaults.loadTemplate`
- Exposed `registerDataAttribute`, `getDataAttributes` and `updateJqueryDataCache` methods for use by plugins (accessible from `Backbone.DeclarativeViews.plugins`)
- Added component-specific error types

### v2.0.4

- Updated jQuery dependency to jQuery 3

### v2.0.3

- Updated Backbone and jQuery dependencies

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

Copyright (c) 2014-2016 Michael Heim.

Code in the data provider test helper: (c) 2014 Box, Inc., Apache 2.0 license. [See file][data-provider.js].

[jQuery]: http://jquery.com/ "jQuery"
[Underscore]: http://underscorejs.org/ "Underscore.js"
[Backbone]: http://backbonejs.org/ "Backbone.js"
[Marionette]: https://github.com/marionettejs/backbone.marionette#readme "Marionette: a composite application library for Backbone.js"
[Backbone.Inline.Template]: https://github.com/hashchange/backbone.inline.template "Backbone.Inline.Template"
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

[Backbone.Inline.Template-why]: https://github.com/hashchange/backbone.inline.template#why-use-it "Backbone.Inline.Template: Why use it?"
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

[donations]: #facilitating-development "Facilitating development"
[donations-idea]: https://github.com/hashchange/jquery.documentsize/issues/1 "jQuery.documentSize, issue #1: Thank you!"
[donations-paypal-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=HQ9K6AGMYV7H2 "Donate with Paypal"
[donations-paypal-button]: https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif "Donate with Paypal"
[license]: #license "License"
[hashchange-projects-overview]: http://hashchange.github.io/ "Hacking the front end: Backbone, Marionette, jQuery and the DOM. An overview of open-source projects by @hashchange."

[data-provider.js]: https://github.com/hashchange/backbone.declarative.views/blob/master/spec/helpers/data-provider.js "Source code of data-provider.js"
