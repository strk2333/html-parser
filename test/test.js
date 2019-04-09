const XMLParser = require('../xmlParser')
const indexRes = require('./indexSrc')
const customRes = require('./customSrc')


const parser = new XMLParser()
const xml = parser.parseFromString(customRes)
const arr = xml.getElementsByTagName('div')
const arr2 = arr.filter((it) => {
    return it.attributes && it.attributes.class && it.attributes.class.indexOf('content') !== -1
})

console.log(parser.toString(xml))
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

