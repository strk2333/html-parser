const uuid = require('uuid/v1')
const br = '<br \/>|<br\/>|<br>|<br >'
const FilterType = {
  TAG: 1,
  ATTR: 3,
  CLASS: 4,
  ID: 5,
  VALUE: 6,
}
const FilterOpt = {
  INCLUDE: 1,
  EQUAL: 2,
  START_WITH: 3,
  END_WITH: 4,

  NOT_INCLUDE: 101,
  NOT_EQUAL: 102,
  NOT_START_WITH: 103,
  NOT_END_WITH: 104,
}
const OutputType = {
  NODE: 1, // default
  TAG: 2,
  ATTR: 3,
  VALUE: 4,
  CHILDREN: 5,
}

class HTMLParser {

  constructor() {
    this.FilterType = FilterType
    this.FilterOpt = FilterOpt
    this.OutputType = OutputType

    this._brid = uuid() // br tag repalced as brid
    this._vtn = uuid() // virtual tag name

    this._bind()
  }

  _parseFromString(htmlText) {
    var cleanhtmlText = htmlText
      .replace(/\s{2,}/g, ' ')
      .replace(/\t|\n|\r/g, '')
      .replace(RegExp(br, 'g'), this._brid)
      .replace(/>/g, '>\n')
      .replace(/</g, '\n<')

    var rawhtmlData = []

    cleanhtmlText.split('\n').map(element => {
      element = element.trim()

      if (element === '') {
        return
      }

      if (!element || element.indexOf('?html') > -1) {
        return
      }

      if (element.indexOf('<') == 0 && element.indexOf('CDATA') < 0) {
        var parsedTag = this._parseTag(element)
        rawhtmlData.push(parsedTag)
        // \> \ >
        if (element.match(/\/\s*>$/)) {
          rawhtmlData.push(this._parseTag('</' + parsedTag.name + '>'))
        }
      } else {
        rawhtmlData[rawhtmlData.length - 1].value = this._parseValue(element)
      }
    })
    return this._convertTagsArrayToTree(rawhtmlData)[0]
  }

  _getElementsByTagName(tagName) {
    var matches = []

    if (tagName == '*' || this.name.toLowerCase() === tagName.toLowerCase()) {
      matches.push(this)
    }

    this.children.map(child => {
      matches = matches.concat(child.getElementsByTagName(tagName))
    })

    return matches
  }

  _parseTag(tagText) {
    // split tag
    // div, class='root'
    var cleanTagText = tagText.match(/([^\s]*)=('([^']*?)'|"([^"]*?)")|([\/?\w\-\:]+)/g)
    var tag = {
      name: cleanTagText.shift().replace(/\/\s*$/, ''), // get tag name and remove '/'
      attributes: {},
      children: [],
      value: '',
      getElementsByTagName: this._getElementsByTagName
    }

    cleanTagText.map(attribute => {
      var attributeKeyVal = attribute.split('=')

      // ?
      if (attributeKeyVal.length < 2) {
        return
      }

      var attributeKey = attributeKeyVal[0]
      var attributeVal = ''

      if (attributeKeyVal.length === 2) {
        attributeVal = attributeKeyVal[1]
      } else {
        attributeKeyVal = attributeKeyVal.slice(1)
        attributeVal = attributeKeyVal.join('=')
      }

      tag.attributes[attributeKey] = 'string' === typeof attributeVal ? (attributeVal.replace(/^"/g, '').replace(/^'/g, '').replace(/"$/g, '').replace(/'$/g, '').trim()) : attributeVal
    })

    return tag
  }

  _parseValue(tagValue) {
    if (tagValue.indexOf('CDATA') < 0) {
      return tagValue.trim()
    }

    return tagValue.substring(tagValue.lastIndexOf('[') + 1, tagValue.indexOf(']'))
  }

  _convertTagsArrayToTree(html, parent) {
    var htmlTree = []

    if (html.length == 0) {
      return htmlTree
    }

    var tag = html.shift()
    tag.value = tag.value.replace(RegExp(this._brid, 'g'), '<br />')

    if ((tag.value.indexOf('</') > -1 || tag.name.match(/\/$/))) {
      tag.name = tag.name.replace(/\/$/, '').trim()
      tag.value = tag.value.substring(0, tag.value.indexOf('</'))
      htmlTree.push(tag)
      htmlTree = htmlTree.concat(this._convertTagsArrayToTree(html))

      return htmlTree
    }

    if (tag.name.indexOf('/') == 0) {
      if (tag.value !== '') {
        const virtualTag = this._parseTag(`<${this._vtn}>`)
        virtualTag.value = tag.value
        html.unshift(virtualTag)
        html.unshift(this._parseTag(`</${this._vtn}>`))

        if ((!parent || parent.indexOf(this._vtn) === -1)) {
          htmlTree = this._convertTagsArrayToTree(html)
        }
      }
      return htmlTree
    }

    htmlTree.push(tag)
    if (tag.name.indexOf(this._vtn) === -1)
      tag.children = this._convertTagsArrayToTree(html, tag.name)
    htmlTree = htmlTree.concat(this._convertTagsArrayToTree(html))

    return htmlTree
  }

  _toString(html) {
    var htmlText = this._convertTagToText(html)

    if (html.children && html.children.length > 0) {
      html.children.map(child => {
        htmlText += this._toString(child)
      })

      htmlText += '</' + html.name + '>'
    }

    return htmlText
  }

  _convertTagToText(tag) {
    if (tag && tag.name.indexOf(this._vtn) > -1)
      return tag.value

    var tagText = '<' + tag.name

    for (var attribute in tag.attributes) {
      tagText += ' ' + attribute + '="' + tag.attributes[attribute] + '"'
    }

    if (tag.value && tag.value.length > 0) {
      tagText += '>' + tag.value
      if (tag.children && tag.children.length === 0)
        tagText += '</' + tag.name + '>'
    } else {
      tagText += '>'
    }

    return tagText
  }

  parseFromString(htmlText) {
    return this._parseFromString(htmlText)
  }

  toString(html) {
    return this._toString(html)
  }

  //bind this
  _bind() {
    this.parseFromString = this.parseFromString.bind(this)
    this.toString = this.toString.bind(this)
    this.textBeautify = this.textBeautify.bind(this)
    this.filterConfig = this.filterConfig.bind(this)
    this.outputConfig = this.outputConfig.bind(this)
    this.select = this.select.bind(this)
  }

  // 
  _textBeautify(htmlText) {
    return htmlText
      .replace(/\s{2,}/g, ' ')
      .replace(/\t|\n|\r/g, '')
      .replace(RegExp(br, 'g'), '\n')
      .replace(/<.*?>/g, '')
  }

  textBeautify(htmlText) {
    return this._textBeautify(htmlText)
  }

  // html selector
  _select(nodes, configs, output) {
    let res = []
    let filterNodes = nodes
    for (let config of configs) {
      res = []
      if (!Array.isArray(filterNodes)) {
        res = res.concat(this._filter(nodes, config))
      } else {
        for (let filterNode of filterNodes) {
          res = res.concat(this._filter(filterNode, config))
        }
      }
      filterNodes = res
    }

    return this._output(res, output)
  }


  _filterConfig(type, opt, params) {
    if (type && opt && params)
      if (Array.isArray(params))
        return { type, opt, params }
      else
        return { type, opt, params: [params] }
    return
  }

  _filterOutput(type, param) {
    if (type)
      return { type, param }
    return
  }

  /**
   * HTML node filter
   * 
   * @param {array} filterConfig filter configs
   * @usage
   * Ex. [
   *   {type: FilterType.TAG, opt: FilterOpt.START_WITH, params: ['a']},
   *   {type: FilterType.ATTR, opt: Filtert.INCLUDE, params: ['href', 'aaa', 'bbb']},
   *   {type: FilterType.CLASS, opt: FilterOpt.START_WITH, params: ['a', 'b']},
   * ]
   */
  _filter(node, config, output) {
    if (!config)
      return

    let res = []
    switch (config.type) {
      case FilterType.TAG:
        res = this._filterTag(node, config.opt, config.params)
        break
      case FilterType.ATTR:
        const [attrName, ...attrValues] = config.params
        res = this._filterAttr(node, config.opt, attrName, attrValues)
        break
      case FilterType.CLASS:
        res = this._filterClass(node, config.opt, config.params)
        break
      case FilterType.ID:
        res = this._filterId(node, config.opt, config.params)
        break
      case FilterType.VALUE:
        res = this._filterValue(node, config.opt, config.params)
        break
    }
    return res
  }

  _output(src, output) {
    let outputRes = src

    if (!output)
      return outputRes

    switch (output.type) {
      case OutputType.TAG:
        outputRes = src.map(it => it.name)
        break
      case OutputType.ATTR:
        outputRes = src.map(it => {
          return it.attributes[output.param]
        })
        break
      case OutputType.VALUE:
        outputRes = src.map(it => it.value)
        break
      case OutputType.CHILDREN:
        outputRes = src.map(it => it.children)
        break
      default:
        // node
        break
    }
    return outputRes
  }

  _filterTag(node, opt, params) {
    var matches = []
    const findCallback = this._getCallBack(opt, node.name.toLowerCase())
    if (params.find(findCallback))
      matches.push(node)

    node.children.map(child => {
      matches = matches.concat(this._filterTag(child, opt, params))
    })

    return matches
  }

  _filterAttr(node, opt, attrName, matchValues) {
    var matches = []
    const source = node.attributes[attrName]
    if (source) {
      // split attribute values like 'class1 class2' to ['class1', 'class2']
      const sources = source.split(' ')
      let pass = true
      for (let source of sources) {
        let findCallback = this._getCallBack(opt, source)
        if (matchValues.find(findCallback)) {
          if (opt > 100) { // not options
            pass = false
          } else {
            matches.push(node)
          }
          break
        }
      }
      if (opt > 100 && pass)
        matches.push(node)
    }

    node.children.map(child => {
      matches = matches.concat(this._filterAttr(child, opt, attrName, matchValues))
    })
    return matches
  }

  _filterClass(node, opt, params) {
    return this._filterAttr(node, opt, 'class', params)
  }

  _filterId(node, opt, params) {
    return this._filterAttr(node, opt, 'id', params)
  }

  _filterValue(node, opt, params) {
    var matches = []
    const findCallback = this._getCallBack(opt, node.value)

    if (params.find(findCallback))
      matches.push(node)

    node.children.map(child => {
      matches = matches.concat(this._filterValue(node, opt, params))
    })

    return matches
  }

  _getCallBack(opt, source) {
    let callBack = it => false
    const src = source.toLowerCase()
    switch (opt) {
      case FilterOpt.INCLUDE:
      case FilterOpt.NOT_INCLUDE:
        callBack = it => src.includes(it.toLowerCase())
        break
      case FilterOpt.EQUAL:
      case FilterOpt.NOT_EQUAL:
        callBack = it => src === it.toLowerCase()
        break
      case FilterOpt.START_WITH:
      case FilterOpt.NOT_START_WITH:
        callBack = it => src.indexOf(it.toLowerCase()) === 0
        break
      case FilterOpt.END_WITH:
      case FilterOpt.NOT_END_WITH:
        callBack = it => src.lastIndexOf(it.toLowerCase()) === src.length - it.length
        break
    }
    return callBack
  }

  // _hasChildren() {

  // }

  select(nodes, configs, output) {
    return this._select(nodes, configs, output)
  }

  filterConfig(type, opt, params) {
    return this._filterConfig(type, opt, params)
  }

  outputConfig(type, param) {
    return this._filterOutput(type, param)
  }
}


module.exports = new HTMLParser()
