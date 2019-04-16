### Obviously there are too many great solutions but not this.

# react-html-plain-parser
Based on react-xml-parser which used for xml parser. Aiming to parse HTML using regex, offer some convinent functions with no mercy on effeciency.

## Installation
```
$ npm install react-html-plain-parser
```

## Usage
### Basic
```
// const parser = require('react-html-plain-parser')
import parser from 'react-html-plain-parser'

const htmlString = `<div>2333</div>`
const parser = new HTMLParser()
const rootNode = parser.parseFromString(htmlString) // get root node from plain html
const arr = rootNode.getElementsByTagName('div') // get all div tags, find from rootNode 

const beautifiedText = parser.textBeautify(parser.toString(arr[0]))
```

### Selector
- FilterType: TAG, ATTR, CLASS, ID, VALUE
- FilterOpt: INCLUDE, EQUAL, START_WITH, END_WITH, NOT_INCLUDE, NOT_EQUAL, NOT_START_WITH, NOT_END_WITH
- OutputType: NODE, TAG, ATTR, VALUE, CHILDREN
```
const {FilterType, FilterOpt, OutputType, filterConfig, outputConfig, select} = parser
const configs = [
    filterConfig(FilterType.TAG, FilterOpt.START_WITH, 'd'),
    filterConfig(FilterType.ATTR, FilterOpt.NOT_EQUAL, ['display', 'none']),
    filterConfig(FilterType.CLASS, FilterOpt.END_WITH, 't'),
    filterConfig(FilterType.ID, FilterOpt.INCLUDE, 'not')
]
const output = outputConfig(OutputType.TAG)
const res = select(html, configs, output)

const config = filterConfig(FilterType.TAG, FilterOpt.EQUAL, 'a')
const res2 = select(html, config, outputConfig(OutputType.ATTR, 'href'))
```

## Update
- v1.0.7 fix NOT selector incorrect result
- v1.0.6 fix config return, bind this, fix NOT selector incorrect result, clean dependencies, make more bugs.
- v1.0.5 read enum fixing (deadly bugs, unable to run)
- v1.0.4 - (deadly bugs, unable to run)
- v1.0.3 the biggest update ever, offer *selector* with terrible effeciency. (deadly bugs, unable to run)
- v1.0.2 add html text beautify


## Based on react-xml-parser
https://github.com/matanshiloah/xml-parser/

## License
ISC