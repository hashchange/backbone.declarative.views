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
        new Assertion( subject.el ).to.be.an( 'object', "The 'el' property of the view appears to be missing" );

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


} ));
