const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('../../config');
const utils = require('./utils');

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/user_debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

module.exports = async (ctx) => {
  const id = ctx.params.id;

  const response = await got({
    method: 'get',
    url: `https://blog.csdn.net/${id}`,
    headers: {
      'User-Agent': config.ua,
      Referer: `https://blog.csdn.net/${id}`,
    },
  });

  const data = response.data;

  const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
  const blogTitle = $('header .title-box .title-blog').text().replace(/\n/g, '').trim();
  const article = $('div .article-list');
  const list = article.find('div .article-item-box');

  const items = await Promise.all(
    list &&
      list
      .map(async (index, article) => {
        article = $(article);
        var articleLink = article.find('h4 a').attr('href');
        var articleContent = await utils.getFullArticle(articleLink);

        const item = {
          title: article.find('h4').first().text().trim(),
          description: `${articleContent.trim().replace(/\n/g, '')}`,
          pubDate: `${article.find('.info-box .date').first().text().trim()}`,
          link: `${articleLink}`,
        };

        return Promise.resolve(item);
      })
      .get(),
  );

  ctx.state.data = {
    title: `CSDN-${blogTitle}`,
    link: `https://blog.csdn.net/${id}/article/list/1`,
    item: items,
  };
};
