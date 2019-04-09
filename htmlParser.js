const uuid = require('uuid/v1')

module.exports = class {

    constructor() {
        this.brid = uuid(); // br tag repalced as brid
        this.vtn = uuid(); // virtual tag name
    }

    _parseFromString(htmlText) {
        var cleanhtmlText = htmlText
        .replace(/\s{2,}/g, ' ')
        .replace(/\t|\n|\r/g, '')
        .replace(/<br \/>|<br\/>|<br>|<br >/g, this.brid)
        .replace(/>/g, '>\n')
        .replace(/</g, '\n<')

        var rawhtmlData = [];

        cleanhtmlText.split('\n').map(element => {
            element = element.trim();

            if (element === '') {
                return;
            }
            
            // console.log(`element: ${element}`)
            
            if (!element || element.indexOf('?html') > -1) {
                return;
            }
            
            if (element.indexOf('<') == 0 && element.indexOf('CDATA') < 0) {
                var parsedTag = this._parseTag(element);
                rawhtmlData.push(parsedTag);
                // \> \ >
                if (element.match(/\/\s*>$/)) {
                    rawhtmlData.push(this._parseTag('</' + parsedTag.name + '>'));
                }
            } else {
                rawhtmlData[rawhtmlData.length - 1].value = this._parseValue(element);
            }
        });
        return this._convertTagsArrayToTree(rawhtmlData)[0];
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

    _convertTagsArrayToTree(html, parent) {
        var htmlTree = [];

        if (html.length == 0) {
            return htmlTree;
        }

        var tag = html.shift();
        tag.value = tag.value.replace(RegExp(this.brid, 'g'), '<br />')

        if ((tag.value.indexOf('</') > -1 || tag.name.match(/\/$/))) {
            tag.name = tag.name.replace(/\/$/, '').trim();
            tag.value = tag.value.substring(0, tag.value.indexOf('</'));
            htmlTree.push(tag);
            htmlTree = htmlTree.concat(this._convertTagsArrayToTree(html));

            return htmlTree;
        }

        if (tag.name.indexOf('/') == 0) {
            if (tag.value !== '') {
                const virtualTag = this._parseTag(`<${this.vtn}>`);
                virtualTag.value = tag.value;
                html.unshift(virtualTag);
                html.unshift(this._parseTag(`</${this.vtn}>`));

                if ((!parent || parent.indexOf(this.vtn) === -1)) {
                    htmlTree = this._convertTagsArrayToTree(html);
                }
            }
            return htmlTree;
        }

        htmlTree.push(tag);
        if (tag.name.indexOf(this.vtn) === -1)
            tag.children = this._convertTagsArrayToTree(html, tag.name);
        htmlTree = htmlTree.concat(this._convertTagsArrayToTree(html));

        return htmlTree;
    }

    _toString(html) {
        var htmlText = this._convertTagToText(html);

        if (html.children && html.children.length > 0) {
            html.children.map(child => {
                htmlText += this._toString(child);
            });

            htmlText += '</' + html.name + '>';
        }

        return htmlText;
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

    parseFromString(htmlText) {
        return this._parseFromString(htmlText);
    }

    toString(html) {
        return this._toString(html);
    }
};
