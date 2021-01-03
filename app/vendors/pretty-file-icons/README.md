# Pretty File Icons

Pretty colorful icons for files (in svg format).

Icon pack author: [Madebyoliver](http://www.flaticon.com/authors/madebyoliver).
Icons are published as-is and under the licence by [flaticon.com](http://flaticon.com).
Licence for everything except icons is MIT.

See [index.json](index.json) for available icons list. Live preview is
available [here](https://kravets-levko.github.io/pretty-file-icons/preview.html).
 
## Usage
 
Just download image files and use them. Also, this package is available on NPM:
```
npm install pretty-file-icons
```
 
In addition, this package contains mapping for some file extensions - see the
[index.json](index.json) file. Also, it can be used in javascript applications 
to retrieve icon names by file name:
```javascript
var prettyFileIcons = require('pretty-file-icons');

console.log(prettyFileIcons.getIcon('test.csv'));
console.log(prettyFileIcons.getIcon('test.csv', 'svg'));
console.log(prettyFileIcons.getIcon('.test', 'svg'));

// Prints:
// csv
// csv.svg
// unknown.svg
```
  
## Preview:
  
![Preview](preview.png)  
