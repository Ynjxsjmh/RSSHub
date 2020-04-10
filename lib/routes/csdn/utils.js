const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('../../config');

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/utils_debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const getFullArticle = async (link) => {
  const response = await got({
    method: 'get',
    url: `${link}`,
    headers: {
      'User-Agent': config.ua,
      Referer: `${link}`,
    },
  });

  const data = response.data;

  const $ = cheerio.load(data);
  const article = $('#article_content #content_views');

  return article.html();
};

module.exports = {
  getFullArticle,
};
