const Chalk = require('chalk')
const Timsort = require('timsort')
const { fetch } = require('fetch-ponyfill')()
const argv = require('yargs')
  .usage('Usage: $0 [page] [options]')
  .example('$0 5', 'list three-letter words 50-60')
  .example('$0 --page 3', 'list three-letter words 30-40')
  .example('$0 --letters 4 -p 1 -c 100', 'list four-letter words 100-200')
  .help()
  .alias('h', 'help')
  .option('l', {
    alias: 'letters',
    default: 3,
    describe: 'return words that have this many letters',
    type: 'number'
  })
  .option('c', {
    alias: 'count',
    default: 10,
    describe: 'number of words to return in descending order',
    type: 'number'
  })
  .option('p', {
    alias: 'page',
    default: 0,
    describe: 'the starting page for listing words (depends on count)',
    type: 'number'
  })
  .argv

const wordLength = argv.letters
const length = argv.count
const page = argv.page || argv._[0]
const start = page
  ? page * length
  : 0

function sleep (ms) {

  return new Promise(resolve => setTimeout(resolve, ms));

}


const url = [
  `http://wordfinder.yourdictionary.com/scrabble/articleAjax/type/letter-words/letter/${wordLength}?sEcho=1&iColumns=1&sColumns=&mDataProp_0=word&sSearch=&bRegex=false&sSearch_0=&bRegex_0=false&bSearchable_0=true&sSearch_1=&bRegex_1=false&bSearchable_1=true&sSearch_2=&bRegex_2=false&bSearchable_2=true&iSortCol_0=2&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&_=${new Date().getTime()}`,
  `iDisplayStart=${start.toString()}`,
  `iDisplayLength=${length.toString()}`,
  `sSortDir_0=des`,
  `sorting_field=word`,
].join('&')

fetch(url)
  .then(res => {

    return res.json()

  })
  .then(words => {

    const w = words.aaData.map(({ word }) => word)

    Timsort.sort(w)

    w.forEach((word, index, arr) => {

      const test = word.toLowerCase()
      sleep(index * 500)
        .then(() => {

          return fetch(`https://www.npmjs.com/package/${test}`)

        })
        .then(r => {

          const count = `(${index + 1}/${arr.length})`
          const { status, statusText } = r
          const prepend = status === 200
            ? `${count}`
            : `${count} ==========>`

          if (status === 404)
            return console.log(Chalk.gray(prepend), Chalk.cyan.bold(test))

          if (status === 200)
            return console.log(Chalk.gray(prepend, test, status))

          return console.log(Chalk.red(prepend, test, status, statusText))

        })

    })

  })
