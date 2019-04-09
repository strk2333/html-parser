const uuid = require('uuid/v1')

module.exports = class {

    constructor() {
        this.brid = uuid(); // br tag repalced as brid
        this.vtn = uuid(); // virtual tag name
    }

    _parseFromString(xmlText) {
        var cleanXmlText = xmlText
        .replace(/\s{2,}/g, ' ')
        .replace(/\t|\n|\r/g, '')
        .replace(/<br \/>|<br\/>|<br>|<br >/g, this.brid)
        .replace(/>/g, '>\n')
        .replace(/</g, '\n<')

        var rawXmlData = [];

        cleanXmlText.split('\n').map(element => {
            element = element.trim();

            if (element === '') {
                return;
            }
            
            // console.log(`element: ${element}`)
            
            if (!element || element.indexOf('?xml') > -1) {
                return;
            }
            
            if (element.indexOf('<') == 0 && element.indexOf('CDATA') < 0) {
                var parsedTag = this._parseTag(element);
                rawXmlData.push(parsedTag);
                // \> \ >
                if (element.match(/\/\s*>$/)) {
                    rawXmlData.push(this._parseTag('</' + parsedTag.name + '>'));
                }
            } else {
                rawXmlData[rawXmlData.length - 1].value = this._parseValue(element);
            }
        });
        return this._convertTagsArrayToTree(rawXmlData)[0];
    }

    _getElementsByTagName(tagName) {
        var matches = [];

        if (tagName == '*' || this.name.toLowerCase() === tagName.toLowerCase()) {
            matches.push(this);
        }

        this.children.map(child => {
            matches = matches.concat(child.getElementsByTagName(tagName));
        });

        return matches;
    }

    _parseTag(tagText) {
        // split tag
        // div, class='root'
        var cleanTagText = tagText.match(/([^\s]*)=('([^']*?)'|"([^"]*?)")|([\/?\w\-\:]+)/g);
        var tag = {
            name: cleanTagText.shift().replace(/\/\s*$/, ''), // get tag name and remove '/'
            attributes: {},
            children: [],
            value: '',
            getElementsByTagName: this._getElementsByTagName
        };

        cleanTagText.map(attribute => {
            var attributeKeyVal = attribute.split('=');

            // ?
            if (attributeKeyVal.length < 2) {
                return;
            }

            var attributeKey = attributeKeyVal[0];
            var attributeVal = '';

            if (attributeKeyVal.length === 2) {
                attributeVal = attributeKeyVal[1];
            } else {
                attributeKeyVal = attributeKeyVal.slice(1);
                attributeVal = attributeKeyVal.join('=');
            }

            tag.attributes[attributeKey] = 'string' === typeof attributeVal ? (attributeVal.replace(/^"/g, '').replace(/^'/g, '').replace(/"$/g, '').replace(/'$/g, '').trim()) : attributeVal;
        });

        return tag;
    }

    _parseValue(tagValue) {
        if (tagValue.indexOf('CDATA') < 0) {
            return tagValue.trim();
        }

        return tagValue.substring(tagValue.lastIndexOf('[') + 1, tagValue.indexOf(']'));
    }

    _convertTagsArrayToTree(xml, parent) {
        var xmlTree = [];

        if (xml.length == 0) {
            return xmlTree;
        }

        var tag = xml.shift();
        tag.value = tag.value.replace(RegExp(this.brid, 'g'), '<br />')

        if ((tag.value.indexOf('</') > -1 || tag.name.match(/\/$/))) {
            tag.name = tag.name.replace(/\/$/, '').trim();
            tag.value = tag.value.substring(0, tag.value.indexOf('</'));
            xmlTree.push(tag);
            xmlTree = xmlTree.concat(this._convertTagsArrayToTree(xml));

            return xmlTree;
        }

        if (tag.name.indexOf('/') == 0) {
            if (tag.value !== '') {
                const virtualTag = this._parseTag(`<${this.vtn}>`);
                virtualTag.value = tag.value;
                xml.unshift(virtualTag);
                xml.unshift(this._parseTag(`</${this.vtn}>`));

                if ((!parent || parent.indexOf(this.vtn) === -1)) {
                    xmlTree = this._convertTagsArrayToTree(xml);
                }
            }
            return xmlTree;
        }

        xmlTree.push(tag);
        if (tag.name.indexOf(this.vtn) === -1)
            tag.children = this._convertTagsArrayToTree(xml, tag.name);
        xmlTree = xmlTree.concat(this._convertTagsArrayToTree(xml));

        return xmlTree;
    }

    _toString(xml) {
        var xmlText = this._convertTagToText(xml);

        if (xml.children && xml.children.length > 0) {
            xml.children.map(child => {
                xmlText += this._toString(child);
            });

            xmlText += '</' + xml.name + '>';
        }

        return xmlText;
    }

    _convertTagToText(tag) {
        if (tag.name.indexOf(this.vtn) > -1)
            return tag.value;

        var tagText = '<' + tag.name;

        for (var attribute in tag.attributes) {
            tagText += ' ' + attribute + '="' + tag.attributes[attribute] + '"';
        }

        if (tag.value && tag.value.length > 0) {
            tagText += '>' + tag.value;
            if (tag.children && tag.children.length === 0)
                tagText += '</' + tag.name + '>';
        } else {
            tagText += '>';
        }

        return tagText;
    }

    parseFromString(xmlText) {
        return this._parseFromString(xmlText);
    }

    toString(xml) {
        return this._toString(xml);
    }
};
