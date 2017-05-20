const Timsort = require('timsort')
const { fetch } = require('fetch-ponyfill')()
const words = require('../data/three.json').aaData

const w = words.map(({ word }) => word)

function sleep (ms) {

  return new Promise(resolve => setTimeout(resolve, ms));

}

Timsort.sort(w)

w.forEach((word, index) => {

  const test = word.toLowerCase()
  sleep(index * 500)
    .then(() => {

      return fetch(`https://www.npmjs.com/package/${test}`)

    })
    .then(r => {

      const { status } = r
      const prepend = status === 200
        ? ''
        : '==========>'
      console.log(prepend, test, r.status)

    })

})
