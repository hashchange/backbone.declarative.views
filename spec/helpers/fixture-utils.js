/**
 * Creates a raw HTML string for a template. A comment containing the el configuration can be inserted into it.
 *
 * By default, the comment is inserted at the beginning of the HTML string.
 *
 * @param   {Function} createTemplateFn  the function returning the template HTML, except for the el comment. It  must
 *                                       be possible to pass the el comment as an insertion. Expected signature:
 *                                       createTemplateFn( templateLanguage, insertion )
 * @param   {string} templateLanguage    currently supported: "Handlebars", "EJS" (EJS), "ES6". It is up to the template
 *                                       creation function what to make of it (e.g., can be ignored if there are no
 *                                       template vars)
 * @param   {Object} elCommentConfig
 * @param   {Function} [elCommentConfig.createContent]    a function generating the content of the comment which defines
 *                                                        the el, except for the outer comment tags (not wrapped in
 *                                                        "<!-- ... -->"). Called with the data attributes (as a hash).
 *                                                        Expected signature: createContent( dataAttributes )
 * @param   {boolean}  [elCommentConfig.noComment=false]  flag: comment should be omitted
 * @param   {boolean}  [elCommentConfig.trailing=false]   flag: comment should be placed at the end of the HTML
 * @param   {boolean}  [elCommentConfig.among=false]      flag: comment should be placed inside the HTML
 * @param   {Object}   [dataAttributes]                   hash containing the data attributes to be set in the comment
 *
 * @returns {string}
 */
function createRawHtml( createTemplateFn, templateLanguage, elCommentConfig, dataAttributes ) {
    // Construct the HTML string
    var comment = elCommentConfig.noComment ? "" : "<!-- " + elCommentConfig.createContent( dataAttributes ) + " -->",

        insertion = elCommentConfig.among ? comment : "",
        isLeading = ! elCommentConfig.trailing && !elCommentConfig.among,
        isTrailing = elCommentConfig.trailing,

        baseTemplate = createTemplateFn( templateLanguage, insertion );

    return isLeading ? comment + baseTemplate : isTrailing ? baseTemplate + comment : baseTemplate;
}

/**
 * Creates the content of a complex template. It should contain as many pitfalls for correct processing as possible.
 *
 * Features:
 *
 * - has a top-level comment (single line)
 * - has a top-level comment (multi-line)
 * - has a comment containing a tag
 * - has numerous top-level tags
 * - has text at top level, not enclosed in another tag
 * - has tags nested in invalid ways, creating invalid HTML (<h1> inside <p>)
 * - has significant whitespace which must be preserved
 * - has template vars inside a tag itself (defining attributes)
 * - has a template var define the tag type
 * - has templating instructions (if/else)
 * - has a script tag inside the template, containing Javascript
 * - has a reference to a partial template
 *
 * NB For ES6 templates, only the start and end delimiters used for a variable are supported, other constructs (if, loop,
 * partial) are omitted here.
 *
 * @param   {string} templateLanguage          values are "Handlebars", "EJS" (EJS), "ES6"
 * @param   {object} [options]
 * @param   {string} [options.indentation=""]  a string of whitespace, e.g. "   " or "" (no indentation)
 * @param   {string} [options.insertion=""]    an additional string which is inserted somewhere in the middle of the
 *                                             content (if left undefined, a blank line, plus insertion, appears instead)
 * @returns {string}
 */
function createComplexTemplate ( templateLanguage, options ) {
    var t = getTemplateLanguageConstructs( templateLanguage ),

        indent = options && options.indentation || "",
        insert = options && options.insertion || "",

        lines = [
            '<!-- top-level comment (single line) -->',
            '<!--',
            '  top-level',
            '  comment',
            '  (multi-line)',
            '-->',

            t.if,
            '<p>This is a %%paragraph',
            'Some random %%text&& with different line breaks.<br><br/><br />',
            t.else,
            '<h1 class="header">This is a %%header&&</h1>    ',
            t.endIf,
            t.if,
            '</p>',
            t.endIf,

            insert,

            'Some top-level %%text&&, not wrapped in a tag.<br><br/><br />',
            '<!-- comment containing a <div> tag -->',
            "<" + "script>alert( 'foo' );</" + "script>",
            '<p class="significantWhitespaceExpected">',
            '  some text  </p>',
            '<%%tagName&& %%attrs&&>lorem ipsum</%%tagName&&>',
            '<p><h1>Invalid nesting</h1></p>',

            t.partial,

            '<dl class="%%dl_class&&">',
            '  ' + t.loop,
            '  <dt class="dtclass">%%dd_name&&</dt>',
            '  <dd class="ddclass">%%dd_content&&</dd>',
            '  ' + t.endLoop,
            '</dl>'
        ],

        innerContent = _.map( lines, function ( line ) {
            return indent + line;
        } ).join( "\n" );

    return innerContent.replace( /%%/g, t.startDelimiter ).replace( /&&/g, t.endDelimiter );
}

/**
 * Returns the language constructs for a given template language, for use in template creation.
 *
 * NB For ES6 templates, only the start and end delimiters used for a variable are supported, other constructs (if, loop,
 * partial) are omitted here. Empty strings are returned for the instead.
 *
 * @param   {string} templateLanguage
 * @returns {Object}
 */
function getTemplateLanguageConstructs ( templateLanguage ) {
    var constructs;

    switch ( templateLanguage.toLowerCase() ) {

        case "handlebars":
            constructs = {
                startDelimiter: "{{",
                endDelimiter: "}}",
                if: "{{#if isActive}}",
                else: "{{else}}",
                endIf: "{{/if}}",
                loop: "{{#each looped as |value index|}}",
                endLoop: "{{/each}}",
                partial: '{{> userMessage tagName="h2" }}'
            };

            break;
        case "ejs":
            constructs = {
                startDelimiter: "<%= ",
                endDelimiter: " %>",
                if: "<% if (isActive) { %>",
                else: "<% } else { %>",
                endIf: "<% } %>",
                loop: "<% looped.forEach(function(item) { %>",
                endLoop: "<% }); %>",
                partial: "<%- include('user/show', {user: user}); %>"
            };
            break;
        case "es6":
            constructs = {
                startDelimiter: "${",
                endDelimiter: "}",
                if: "",
                else: "",
                endIf: "",
                loop: "",
                endLoop: "",
                partial: ""
            };
            break;
        default:
            throw new Error( 'Unsupported template language "' + templateLanguage + '"' );
    }

    return constructs;
}
