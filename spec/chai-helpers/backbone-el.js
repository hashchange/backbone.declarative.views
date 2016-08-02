(function ( chaiBackboneEl ) {
    // Module systems magic dance.
    if ( typeof require === "function" && typeof exports === "object" && typeof module === "object" ) {
        // NodeJS
        module.exports = chaiBackboneEl;
    } else if ( typeof define === "function" && define.amd ) {
        // AMD
        define( function () {
            return function ( chai, utils ) {
                return chaiBackboneEl( chai, utils );
            };
        } );
    } else {
        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use( function ( chai, utils ) {
            return chaiBackboneEl( chai, utils );
        } );
    }
}( function ( chai, utils ) {

    var Assertion = chai.Assertion;

    /**
     * Takes a hash of expected el properties (tagName, className, id, attributes) as parameter and checks if the
     * subject, a view instance, matches these properties.
     *
     * Example: expect( view ).to.have.elProperties( { tagName: "div", id: "foo" } );
     *
     * The assertion also passes if the view instance has other properties, in addition to the specified ones. For
     * instance, in the example above, the test passes as long as the el is a div with id foo, even if it also has a
     * class or other attributes.
     */
    Assertion.addMethod( 'elProperties', function ( elProperties ) {
        var tagName, className, id,
            validKeys = [ "tagName", "className", "id", "attributes" ],
            subject = this._obj,
            $el = subject.$el;

        // Check the test parameter
        new Assertion( elProperties ).to.be.an( 'object', "Invalid argument for the expected value, must be a hash" );

        // Verify that at least one actual el property has been passed in
        new Assertion( _.size( _.pick( elProperties, validKeys ) ) ).to.have.be.above( 0, "Invalid argument for the expected value. The hash must contain at least one property describing an 'el' (tagName, className, id, attributes), but it doesn't\n(Noise, ignore)" );

        // Verify that only actual el properties have been passed in
        new Assertion( _.size( _.omit( elProperties, validKeys ) ) ).to.equal( 0, "Invalid argument for the expected value. The hash must only contain properties which describe an 'el' (tagName, className, id, attributes). It contains the following invalid properties: " + _.keys( _.omit( elProperties, validKeys ) ).join( ", " ) + "\n(Noise, ignore)" );

        // Check the environment
        new Assertion( Backbone ).to.be.an( 'object', "Global variable 'Backbone' not available" );

        // Verify that the subject has an el property, and that the el is initialized
        new Assertion( subject.el ).to.be.an.instanceof( HTMLElement, "The 'el' property of the view appears to be missing" );

        // Examine el
        if ( elProperties.tagName ) {
            tagName = $el.prop( "tagName" ) && $el.prop( "tagName" ).toLowerCase();
            this.assert(
                tagName === elProperties.tagName,
                "expected the 'el' property of the view #{this} to be a #{exp} tag but got a #{act} tag",
                "expected the 'el' property of the view #{this} not to be a #{exp} tag",
                elProperties.tagName,
                tagName
            );
        }

        if ( elProperties.className ) {
            className = $el.attr( "class" );
            this.assert(
                className === elProperties.className,
                "expected the 'el' property of the view #{this} to have a class attribute equal to #{exp} but got #{act}",
                "expected the 'el' property of the view #{this} not to have a class attribute equal to #{exp}",
                elProperties.className,
                className
            );
        }

        if ( elProperties.id ) {
            id = $el.attr( "id" );
            this.assert(
                id === elProperties.id,
                "expected the 'el' property of the view #{this} to have the id #{exp} but got #{act}",
                "expected the 'el' property of the view #{this} not to have the id #{exp}",
                elProperties.className,
                className
            );
        }

        if ( elProperties.attributes && _.size( elProperties.attributes ) ) {

            _.each( elProperties.attributes, function ( value, key ) {

                var actual = $el.attr( key );

                this.assert(
                    actual === value,
                    "expected the 'el' property of the view #{this} to have a #{exp} attribute but got an attribute value of #{act}",
                    "expected the 'el' property of the view #{this} not to have a #{exp} attribute",
                    key + ": " + value,
                    actual
                );

            }, this );

        }

    } );

    /**
     * Takes a hash of expected el properties (tagName, className, id, attributes) as parameter and checks if the
     * subject, a view instance, exactly matches these properties.
     *
     * Example: expect( view ).to.have.exactElProperties( { tagName: "div", id: "foo" } );
     *
     * The assertion does not pass if the view instance has other attributes, in addition to the specified ones.
     */
    Assertion.addMethod( 'exactElProperties', function ( elProperties ) { // exact match
        var expectedAttributeCount = 0,
            subject = this._obj;

        new Assertion( subject ).to.elProperties( elProperties );

        if ( !_.isUndefined( elProperties.className ) ) expectedAttributeCount++;
        if ( !_.isUndefined( elProperties.id ) ) expectedAttributeCount++;
        if ( !_.isUndefined( elProperties.attributes ) ) expectedAttributeCount += _.size( elProperties.attributes );

        this.assert(
            subject.el.attributes.length === expectedAttributeCount,
            "expected the 'el' property of the view #{this} to have #{exp} attribute(s), but it has #{act} attribute(s)",
            "expected the 'el' property of the view #{this} not to have #{exp} attribute(s)",
            expectedAttributeCount,
            subject.el.attributes.length
        );
    } );

    /**
     * Checks if the subject, a view instance, has an el in the default state, ie an empty div without attributes.
     *
     * Example: expect( view ).to.have.defaultEl;
     */
    Assertion.addProperty( 'defaultEl', function () {
        new Assertion( this._obj ).to.have.exactElProperties( {
            tagName: "div",
            className: undefined,
            id: undefined,
            attributes: undefined
        } );
    } );

    /**
     * Checks if the subject, an uninstantiated view _class_, behaves like an unmodified Backbone view when it is
     * instantiated and creates its el.
     *
     * Internally, the assertion creates a number of view instances from the class and examines the el in each case.
     * These cases are:
     *
     * - The class in its default state, ie without passing in tagName, className etc, is expected to produce a default
     *   el (empty div).
     * - The class is extended with dummy el properties (tagName etc). These properties are expected to show up in the
     *   el.
     * - The class is instantiated with dummy el properties passed as an option. Again, the el must reflect these
     *   properties.
     *
     * Example: expect( View ).to.createElWithStandardMechanism;
     */
    Assertion.addProperty( 'createElWithStandardMechanism', function () {

        var ExtendedViewClass,
            ViewClass = this._obj,

            dummyViewProperties = {
                tagName: "ul",
                className: "viewClass",
                id: "viewId",
                attributes: {
                    lang: "fr",
                    title: "title from view properties"
                }
            };

        // Check if the test subject is a function (must be a constructor)
        // (Instance type check is taken care of by other assertions.)
        new Assertion( ViewClass ).is.a( 'function' );

        // Instantiating the view without specifying any el properties
        //
        // (Unfortunately, I don't know a way to pass that info on as a message prefix in case of error - perhaps the
        // message flag could help. Leaving it out for now.)
        new Assertion( new ViewClass() ).to.have.defaultEl;

        // Testing with dummy el properties
        ExtendedViewClass = ViewClass.extend( _.clone( dummyViewProperties ) );
        new Assertion( new ExtendedViewClass() ).to.have.exactElProperties( dummyViewProperties, "Instantiating the view after extending it with dummy el properties" );

        new Assertion( new ViewClass( _.clone( dummyViewProperties ) ) ).to.have.exactElProperties( dummyViewProperties, "Instantiating the view with dummy el properties, passed as an option" );

    } );

    /**
     * Checks if the subject, an uninstantiated view _class_, behaves like an unmodified Backbone view when it is
     * instantiated and attached to an existing el. The $el must be passed as an argument (as a jQuery element).
     *
     * Internally, the assertion creates a number of view instances from the class and examines the el in each case:
     *
     * - the class is in its default state, ie without passing in tagName, className etc
     * - the class is extended with dummy el properties (tagName etc)
     * - the class is instantiated with dummy el properties passed as an option
     *
     * In all these cases, the el is expected to be unmodified; in particular, the dummy el properties should be ignored.
     * That is the default behaviour of Backbone views.
     *
     * Example: expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
     */
    Assertion.addMethod( 'useExistingElWithoutAlteringIt', function ( $el ) { // tests a view CLASS (uninstantiated!)

        var el,
            ExtendedViewClass,
            ViewClass = this._obj,

            elProperties = {},
            dummyViewProperties = {
                tagName: "ul",
                className: "viewClass",
                id: "viewId",
                attributes: {
                    lang: "fr",
                    title: "title from view properties"
                }
            };

        // Check the test parameter
        new Assertion( $el ).to.be.an.instanceOf( Backbone.$, "Assertion called with wrong parameter, must be a jQuery-wrapped element" );
        new Assertion( $el ).to.have.length( 1, "Assertion called with wrong parameter, must be a single jQuery-wrapped element" );

        el = $el.get(0);

        // Extract the attributes and tag name of $el and write them into an elProperties structure.
        // For the method to extract the attributes, see http://stackoverflow.com/a/14645827/508355
        $.each( el.attributes, function () {

            if ( this.specified ) {

                switch ( this.name ) {
                    case "id":
                        elProperties.id = this.value;
                        break;
                    case "class":
                        elProperties.className = this.value;
                        break;
                    default:
                        elProperties.attributes || (elProperties.attributes = {});
                        elProperties.attributes[this.name] = this.value;
                }

            }

        } );

        elProperties.tagName = $el.prop( "tagName" ) && $el.prop( "tagName" ).toLowerCase();

        // Check if the test subject is a function (must be a constructor)
        // (Instance type check is taken care of by other assertions.)
        new Assertion( ViewClass ).is.a( 'function' );

        // Instantiating the view without specifying any el properties in the view itself (default behaviour)
        //
        // (Unfortunately, I don't know a way to pass that info on as a message prefix in case of error - perhaps the
        // message flag could help. Leaving it out for now.)
        new Assertion( new ViewClass( { el: el } ) ).to.have.exactElProperties( elProperties, "Instantiating the view without specifying any el properties in the view itself (default behaviour)" );


        // Testing with dummy el properties
        ExtendedViewClass = ViewClass.extend( _.clone( dummyViewProperties ) );
        new Assertion( new ExtendedViewClass( { el: el } ) ).to.have.exactElProperties( elProperties, "Instantiating the view after extending it with dummy el properties" );

        new Assertion( new ViewClass( _.extend( {}, dummyViewProperties,{ el: el } ) ) ).to.have.exactElProperties( elProperties, "Instantiating the view with dummy el properties, passed as an option" );

    } );

    /**
     * Checks if the subject, the value returned by a cache query, matches expectations. Ie, it must contain
     *
     * - the expected properties and values for a given set of data attributes
     * - the template HTML (html property) for a given outer HTML
     * - a "compiled" property which is undefined by default, or holds a function returning the final HTML
     *
     * The expected outerHtml string needn't have the data attributes applied - this is handled by the assertion. Data
     * attributes set on the outerHtml are ignored. In fact, they are removed from the outerHtml string, and replaced by
     * the attributes specified in the dataAttributes argument.
     *
     * The outerHtml can be passed in as a string or a jQuery node.
     *
     * The optional compiledTemplate expectation must be a function which produces the final HTML. If provided, it will
     * be called and its output compared to that of the actual compiledTemplate function, which will be called as well.
     *
     * Examples:
     *
     *   expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
     *   expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, $templateNode );
     *
     * @param {Object}             dataAttributes                hash of data attributes. Key names must have the "data-" prefix
     * @param {jQuery|string}      outerHtml                     outer HTML of the template node, may or may not include the data attributes
     * @param {Function|undefined} [compiledTemplate=undefined]  the expected template function
     */
    Assertion.addMethod( 'returnCacheValueFor', function ( dataAttributes, outerHtml, compiledTemplate ) {

        var $template, invalidDataAttributes, compiled, expected, transformed,
            attrNames = [],
            cacheEntry = this._obj;

        // If a jQuery node is passed in, turn it into an independent copy. (We could possibly also use the .clone()
        // method of jQuery, but the one here is guaranteed to be free of side effects.)
        if ( outerHtml instanceof $ ) outerHtml = outerHtml.prop( 'outerHTML' );

        // Check if the arguments are correct
        new Assertion( outerHtml ).is.a( "string", "Invalid outerHtml argument passed as expected value. It must be a string or a jQuery node, but it is not. It is of type " + ( typeof outerHtml )  );
        new Assertion( dataAttributes ).to.be.an( "object", "Invalid dataAttributes argument passed as expected value. It must be an object but is a " + ( typeof dataAttributes ) );

        invalidDataAttributes= ( _.reject( _.keys( dataAttributes ), function ( key ) {
            return key.match( /^data-/ );
        } ) ).join( ", " );
        new Assertion( invalidDataAttributes ).to.have.length( 0, 'Invalid dataAttributes argument passed as expected value. Attribute names (keys) must be prefixed with "data-", but the following attributes are not: ' + invalidDataAttributes + "\n(Noise, ignore)" );

        if ( compiledTemplate !== undefined ) {
            new Assertion ( compiledTemplate ).is.a( "function", "Invalid compiledTemplate argument passed as expected value. It is not a function" );
        }

        // Create a node from the outerHtml expectation and see if it works.
        try {
            $template = $( outerHtml );
            if ( ! $template.length ) throw new Error();
        } catch ( err ) {
            new Assertion( false ).to.equal( true, "Invalid outerHtml argument passed as expected value. The string \"" + outerHtml + "\" is not valid outer HTML and can't be turned into a node\n(Noise, ignore)" );
        }

        // Try evaluating the compiledTemplate expectation, if provided, and see if it works.
        if ( compiledTemplate ) {
            try {
                compiled = compiledTemplate();
            } catch ( err ) {
                new Assertion( false ).to.equal( true, "Invalid compiledTemplate function passed in as expected value. When called, it threw an error. " + err + "\n(Noise, ignore)");
            }
            if ( !_.isString( compiled ) ) throw new Error( "Invalid compiledTemplate function passed in as expected value. The compiledTemplate function did not produce a string when called" );
        }

        // Remove existing data attributes from the $template node and replace them with the ones specified in
        // dataAttributes.
        //
        // Because the attributes collection is a live list, we must iterate safely and extract the names first, and
        // only then begin to remove attributes.
        _.each( $template[0].attributes, function ( attrNode ) {
            if ( attrNode.nodeName.match( /^data-/ ) ) attrNames.push( attrNode.nodeName );
        } );
        _.each( attrNames, function ( attrName ) {
            $template.removeAttr( attrName );
        } );
        _.each( dataAttributes, function ( value, name ) {
            $template.attr( name, value );
        } );

        // Build the expected object. It is not exactly identical to the corresponding cache entry:
        //
        // - Its `compiled` property holds the return value of the compiledTemplate expectation, if it has been
        //   provided, rather than the compiledTemplate function itself.
        //
        // Before expected and actual values are compared, the test subject must be transformed to match that format.
        expected = _.extend(
            dataAttributesToProperties( dataAttributes ),
            {
                html: $template.html(),
                compiled: compiled
            } );

        // Finally, do the actual test.

        // Check if the test subject is a an object.
        new Assertion( cacheEntry ).is.an( 'object' );

        // Check if it has a "compiled" property matching the expectation, if provided
        new Assertion( cacheEntry ).to.have.ownProperty( "compiled" );
        if ( compiled ) {
            new Assertion( cacheEntry.compiled ).to.be.a( "function", "compiled property" );
            new Assertion( cacheEntry.compiled() ).to.equal( expected.compiled, "return value of compiled()" );
        }

        // Create a clone of the test subject. In the clone, the `compiled` function is replaced by its return value, if
        // it exists.
        transformed = _.clone( cacheEntry );
        transformed.compiled = cacheEntry.compiled && cacheEntry.compiled();

        // Compare the transformed test subject clone to the expected object.
        new Assertion( transformed ).to.eql( expected );

    } );


} ));
