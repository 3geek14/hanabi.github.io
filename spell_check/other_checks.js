const path = require('path');
const vfileGlob = require('vfile-glob');
const unified = require('unified');
const parse = require('remark-parse')
const remark2retext = require('remark-retext')
const english = require('retext-english');
const repeated = require('retext-repeated-words');
const indefiniteArticle = require('retext-indefinite-article');
const stringify = require('retext-stringify');
const report = require('vfile-reporter');
const exitHook = require('exit-hook');

let errorsHappened = false;
const parentDirectory = path.join(__dirname, '..');

vfileGlob(`${parentDirectory}/**`, {
  ignore: [
    `${parentDirectory}/.git/**`,
    `${parentDirectory}/academic-papers/**`,
    `${parentDirectory}/img/**`,
    `${parentDirectory}/misc/*.pdf`,
    `${parentDirectory}/spell-check/node_modules/**`,
    `${parentDirectory}/spell-check/package-lock.json`,
    `${parentDirectory}/LICENSE`,
  ],
}).subscribe({
  next(file) {
    unified()
    .use(parse)
    .use(
      remark2retext,
      unified()
      .use(english)
      .use(repeated)
      .use(indefiniteArticle)
    )
    .use(stringify)
    .process(file, function(err, file) {
      if (!file) {
        return;
      }
      const output = report(err || file, {
        quiet: true,
      }).trim();
      if (output) {
        console.error(output);
        errorsHappened = true;
      }
    })
  },
})

exitHook(() => {
  if (errorsHappened) {
    process.exit(1);
  }
});
