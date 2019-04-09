# Obviously there are too many great solutions but not this.

# react-html-parser
Base on react-xml-parser which used for xml parser. Aiming to parse HTML, handling problems like br tag etc.

# Problems
1. [fixed] can't show some value in a closed tag, ex. `<p><div>1<p>2</p>3</div>4<p>` can't show 3,4: add virtual tag
2. [fixed] br tag: use uuid replace br


# Origin README
see https://github.com/matanshiloah/xml-parser/blob/master/README.md