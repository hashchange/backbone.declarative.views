# Backbone.Declarative.Views

With Backbone.Declarative.Views, you can read the markup for the container element of a view directly from its template. Keep the tag name, class name and other attributes of `el` out of Backbone.View Javascript code.

Backbone.Declarative.Views works entirely behind the scenes and does not expose a Javascript API of its own.

## Dependencies and setup

[Backbone][] is the only dependency. Include backbone.declarative.views.js after [Backbone][].

If you use other components which extend Backbone.View, load those components after Backbone.Declarative.Views. (Even if you load them too early, Backbone.Declarative.Views does its job as intended. But you might have to deal with a [corner case][edge-case].)

The stable version of Backbone.Declarative.Views is available in the `dist` directory ([dev][dist-dev], [prod][dist-prod]), including an AMD build ([dev][dist-amd-dev], [prod][dist-amd-prod]). If you use Bower, fetch the files with `bower install backbone.declarative.views`.

Backbone.Declarative.Views augments the Backbone.View base type, so its functionality will be available in every view throughout your code.

## Why use it

Markup, styling and behaviour should be kept separate - we all know that. Yet with Backbone views, it is common to mix them up.

Part of the view markup is often stored in the HTML, wrapped in script/template tags, while another part - the one describing the container of the template - ends up right inside your Javascript, hidden away in `tagName`, `className` and other properties.

It doesn't belong there.

## Usage and examples

Backbone views use [a couple of properties][backbone-el-properties] to describe the container element: `tagName`, `className`, `id` and `attributes`.

Instead of managing these properties in Javascript, declare them as data attributes of the script tag which is storing the template.

### Basic usage

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

Now, if your view has a `template: "#my-template"` property, its `el` is set up as `<p id="myContainer" class="someClass orOther"></p>`, right out of the box.

So here is how it works. Backbone.Declarative.Views expects to find a `template` property on the view, with a selector as its value. When the Backbone view is initialized, it will automatically locate the template and use the data attributes, if there are any, to set up the `el` of the view.

(You still have to read and apply the template in `render()` to actually, well, render the content - or whatever else you do to get your templates into the DOM.)

The names of the Backbone.View properties have to change a bit when they are written as HTML-compliant data attributes. So `tagName` turns into `data-tag-name`, and `className` becomes `data-class-name`. Likewise, there are a `data-id` and `data-attributes`.

### Overriding the declaration

You can override part or all of the `el` properties which are declared in data attributes.

In the example above, the data attribute defines the tag as a `p`. Suppose you add a `tagName: "section"` property to the view, or pass it to the constructor as an option. The tag name applied by your script, `section`, will trump the `p` you defined statically in the template.

### Hashes turn into JSON

Among the properties describing the `el` of the view, one warrants a closer look: the `attributes` property. In Javascript, it is a hash. So when declaring it in a template, write it as JSON.

```html
<script id="some-template"
        type="text/x-template"
        data-attributes='{ "lang": "en", "title": "container title" }'>

    <!-- template content here -->

</script>
```

(Note to self: When hand-writing JSON, remember to quote property names as well as their values. And those quotes must be double quotes.)

### When to set the template property of the view

There are two ways to let a view know about the template:

- You can set the template property of the class with `extend()`.
- You can also pass the template in as an option when you create the view.

  (If you have loaded other components before Backbone.Declarative.Views, and if those components extend Backbone.View for their own view types, you likely cannot pass the template as an option to these types. See the [edge case, below][edge-case]).

On the other hand, this is how it _won't_ work:

- If you modify the template property in `initialize()`, it will not affect the `el` of the view. The `el` has already been set up at this point. So you can't set the template property to a selector in `initialize`.

  This behaviour is a feature, not a bug. It is common to compile a template in `initialize`, along the lines of `this.template = _.template( $( this.template ).html() )`, and overwrite the template property in the process. This pattern will continue to work, and it won't break the functionality of Backbone.Declarative.Views, either.

- If you set the `el` of the view to an existing DOM element, the data attributes of a template don't get applied to it. That matches the default Backbone behaviour. Backbone ignores `el`-related view properties, like `tagName` and `className`, if `el` is set to an existing DOM element.

### Setting the template property to a template string rather than a selector

Yes, that works as well. The template property of a view can be set to an HTML string instead of a selector, as in the following example:

```javascript
var templateHtml = '<li class="bullet" data-tag-name="ul" data-class-name="list">template stuff</li>',
    view = new Backbone.View( { template: templateHtml } );

console.log( view.el.tagName )   // => prints "UL"
console.log( view.el.className ) // => prints "list"
```

If the template HTML doesn't have a single top-level element, but multiple ones, then the data attributes defining the `el` must be on the first top-level element.

## Other

### Does it work with frameworks built on top of Backbone?

With [Marionette][], it does. The unit tests cover Marionette, too.

With other frameworks, it should work just as well. But then again, what do I know? ;) Feedback welcome.

### Does it clash with "traditional" ways of defining tagName or className?

No. You can continue to define `tagName`, `className` etc as properties of Backbone Views in your Javascript code, or pass them in as options. Backbone.Declarative.Views just gives you yet another way to declare them - and quite possibly a superior one.

Equally, you can omit the `template` property, or assign a value to it which is a function, rather than a selector. Obviously, the `el` of the view won't be set up from data attributes this way, but rest assured that nothing will break.

### Is it available to components which are loaded before it?

Mostly, yes. It depends on how you set up your views. If you define the template property with `extend()`, before instantiating the view, things will just work.

But you can run into an edge case if you

- load a component which creates its own Backbone.View subtypes
- load the component too early, ie before Backbone.Declarative.Views
- while instantiating a view which is supplied by the component, pass it a template selector as an option.

In that case, and in that case only, the data attributes of the template won't get applied to the `el` of the view.

So to be on the safe side, load your view-related components after Backbone.Declarative.Views.

Incidentally, [Marionette][] is not affected by that edge case. You can load Marionette as you please, before or after Backbone.Declarative.Views.

### Why data attributes?

On the face of it, using data attributes on one tag to describe another tag seems nonstandard and indirect. You may wonder why the markup for `el` can't just be part of the HTML in the template.

As it turns out, that kind of approach is fraught with problems. See the [related Backbone issue][backbone-issue-546] for a discussion. [@tbranyen lists][comment-tbranyen] some of the difficulties. Also check out the [comment by @jashkenas][comment-jashkenas].

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
- Build the dist files (also running tests and linter) with `grunt build`, or just `grunt`.
- Build continuously on every save with `grunt ci`.
- Change the version number throughout the project with `grunt setver --to=1.2.3`. Or just increment the revision with `grunt setver --inc`. (Remember to rebuild the project with `grunt` afterwards.)
- `grunt getver` will quickly tell you which version you are at.

Finally, if need be, you can set up a quick demo page to play with the code. First, edit the files in the `demo` directory. Then display `demo/index.html`, live-reloading your changes to the code or the page, with `grunt demo`. Libraries needed for the demo/playground should go into the Bower dev dependencies, in the project-wide `bower.json`, or else be managed by the dedicated `bower.json` in the demo directory.

_The `grunt interactive` and `grunt demo` commands spin up a web server, opening up the **whole project** to access via http. By default, that access is restricted to localhost. You can relax the restriction in `Gruntfile.js`, but be aware of the security implications._

### Changing the tool chain configuration

In case anything about the test and build process needs to be changed, have a look at the following config files:

- `karma.conf.js` (changes to dependencies, additional test frameworks)
- `Gruntfile.js`  (changes to the whole process)
- `web-mocha/_index.html` (changes to dependencies, additional test frameworks)

New test files in the `spec` directory are picked up automatically, no need to edit the configuration for that.

## License

MIT.

Copyright (c) 2014 Michael Heim.

[Backbone]: http://backbonejs.org/ "Backbone.js"
[Marionette]: https://github.com/marionettejs/backbone.marionette#readme "Marionette: a composite application library for Backbone.js"
[Node.js]: http://nodejs.org/ "Node.js"
[Bower]: http://bower.io/ "Bower: a package manager for the web"
[npm]: https://npmjs.org/ "npm: Node Packaged Modules"
[Grunt]: http://gruntjs.com/ "Grunt: The JavaScript Task Runner"
[Karma]: http://karma-runner.github.io/ "Karma - Spectacular Test Runner for Javascript"
[Mocha]: http://visionmedia.github.io/mocha/ "Mocha - the fun, simple, flexible JavaScript test framework"
[Chai]: http://chaijs.com/ "Chai: a BDD / TDD assertion library"
[Sinon]: http://sinonjs.org/ "Sinon.JS - Versatile standalone test spies, stubs and mocks for JavaScript"
[JSHint]: http://www.jshint.com/ "JSHint, a JavaScript Code Quality Tool"

[dist-dev]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/backbone.declarative.views.js "backbone.declarative.views.js"
[dist-prod]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/backbone.declarative.views.min.js "backbone.declarative.views.min.js"
[dist-amd-dev]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/amd/backbone.declarative.views.js "backbone.declarative.views.js, AMD build"
[dist-amd-prod]: https://raw.github.com/hashchange/backbone.declarative.views/master/dist/amd/backbone.declarative.views.min.js "backbone.declarative.views.min.js, AMD build"

[backbone-el-properties]: http://backbonejs.org/#View-el "Backbone.View: el"
[backbone-issue-546]: https://github.com/jashkenas/backbone/issues/546 "Backbone issue: Don't wrap views if using templates"
[comment-tbranyen]: https://github.com/jashkenas/backbone/issues/546#issuecomment-16722262
[comment-jashkenas]: https://github.com/jashkenas/backbone/issues/546#issuecomment-3604746

[edge-case]: #is-it-available-to-components-which-are-loaded-before-it