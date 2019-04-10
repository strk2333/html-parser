const HTMLParser = require('../htmlParser')
const indexRes = require('./data/indexSrc')
const lrcRes = require('./data/lrcSrc')
const customRes = require('./data/customSrc')


const parser = new HTMLParser()
const html = parser.parseFromString(customRes)
const arr = html.getElementsByTagName('div')
const arr2 = arr.filter((it) => {
    return it.attributes && it.attributes.class && it.attributes.class.indexOf('content') !== -1
})

var expect = require('chai').expect;

describe('test01', function () {

    describe('#run', function () {
        it('seconds', function () {
            expect(html.length).to.not.eq(0);
        })
    });

});


// console.log(parser.toString(html))
// console.log(arr)
// console.log(arr2)
// console.log(arr[0])

// for (i of arr) {
//     console.log(i)
// }
 
// const arr3 = arr[1].getElementsByTagName('a')

// index
// for (i of arr) {
//     if (i.attributes.href && i.attributes.href.match(/(.*html)/g))
//         console.log(i.attributes.href)
//         // console.log(i)
// }

