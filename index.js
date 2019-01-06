const utils = require("loader-utils");
const fs = require("fs");
const path = require("path");
const nunjucks = require("nunjucks");

const markdown = require("nunjucks-markdown");
const marked = require('marked');


module.exports = function(content) {
  const defaultOpt = {
    markdown: {
      gfm: true,
      tables: true,
      breaks: false,
      headerIds: true,
      headerPrefix: 'heading-',
      pendantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false,
    },
  };

  const webpackOpt = utils.getOptions(this) || {};

  const opt = { ...defaultOpt, ...webpackOpt }

  const nunjucksSearchPaths = opt.searchPaths;
  const nunjucksContext = opt.context;
  const nunjEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(nunjucksSearchPaths)
  );

  nunjucks.configure(null, { watch: false });

  if (opt.filters) {
    Object.assign(nunjEnv.filters, opt.filters);
  }

  nunjEnv.globals.now = function now(unixtime) {
    return unixtime ? Date.now() : new Date();
  };

  nunjEnv.globals.ctx = function ctx(property, outputJSON) {
    const value = typeof property === "string" ? this.ctx[property] : this.ctx;
    const stringify = outputJSON || (typeof property === "boolean" && property);
    return stringify ? nunjEnv.filters.json(value) : value;
  };

  marked.setOptions({
    renderer: new marked.Renderer(),
    ...opt.markdown,
  });

  markdown.register(nunjEnv, marked);

  const template = nunjucks.compile(content, nunjEnv);
  html = template.render(nunjucksContext);

  return html;
};
