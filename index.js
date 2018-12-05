var utils = require("loader-utils");
var fs = require("fs");
var path = require("path");
var nunjucks = require("nunjucks");
var markdownTag = require("nunjucks-markdown");

module.exports = function(content) {
	var opt = utils.getOptions(this) || {};
	var nunjucksSearchPaths = opt.searchPaths;
	var nunjucksContext = opt.context;
	var nunjEnv = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(nunjucksSearchPaths)
	);

	nunjucks.configure(null, { watch: false });

	if (opt.filters) {
		Object.assign(nunjEnv.filters, opt.filters);
	}

	if (opt.filters && opt.filters.md) {
		markdownTag.register(nunjEnv, opt.filters.md);
	}

	nunjEnv.globals.now = function now(unixtime) {
		return unixtime ? Date.now() : new Date();
	};

	nunjEnv.globals.ctx = function ctx(property, outputJSON) {
		const value = typeof property === "string" ? this.ctx[property] : this.ctx;
		const stringify = outputJSON || (typeof property === "boolean" && property);
		return stringify ? nunjEnv.filters.json(value) : value;
	};

	var template = nunjucks.compile(content, nunjEnv);
	html = template.render(nunjucksContext);

	return html;
};
