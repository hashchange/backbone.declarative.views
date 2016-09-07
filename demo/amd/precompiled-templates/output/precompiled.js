define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['item-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<!--  data-tag-name=\"li\" data-class-name=\"item\" -->\n"
    + container.escapeExpression(((helper = (helper = helpers.number || (depth0 != null ? depth0.number : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"number","hash":{},"data":data}) : helper)))
    + "\n";
},"useData":true});
templates['list-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<!--\n    data-tag-name=\"ul\"\n    data-class-name=\"list small-block-grid-4 medium-block-grid-8 large-block-grid-10\"\n    no other content - template just exists for the el definition\n-->\n";
},"useData":true});
templates['stats-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<!-- data-tag-name=\"p\" data-class-name=\"row\" -->\nGenerating "
    + alias4(((helper = (helper = helpers.itemViewCount || (depth0 != null ? depth0.itemViewCount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"itemViewCount","hash":{},"data":data}) : helper)))
    + " item views took "
    + alias4(((helper = (helper = helpers.duration || (depth0 != null ? depth0.duration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"duration","hash":{},"data":data}) : helper)))
    + "ms. In total, it took "
    + alias4(((helper = (helper = helpers.renderDuration || (depth0 != null ? depth0.renderDuration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"renderDuration","hash":{},"data":data}) : helper)))
    + "ms until they had all been appended to the DOM. Finally, when painting was over, "
    + alias4(((helper = (helper = helpers.totalDuration || (depth0 != null ? depth0.totalDuration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalDuration","hash":{},"data":data}) : helper)))
    + "ms had passed.\n";
},"useData":true});
return templates;
});
