
# Handy Javascript methods

License: MIT

Author: Ganesh Rathinavel

Requirements: es6, javascript enabled browser or node.js

Version: 1.2

URL: [https://github.com/ganeshrvel/useful-js-snippets](https://github.com/ganeshrvel/useful-js-snippets)

Navigate through 'tools.js' for the codes.

### Installation:
```javascript
const {
  move,
  imageLoaded,
  getNetElementWidth,
  rand,
  stripTags,
  replaceAll,
  urlSanitizer,
  chainValidator,
  onlyNumber,
  toObject,
  rtrim,
  urls,
  htmlSanitize,
  isTouchDevice,
  isiOS,
  isFunction,
  isArray,
  isObject,
  isString,
  isJSON,
  changeURLHash,
  waitForElementLoad,
} = require('./tools')
```

### Overview:

#####  Move an array key-value pair to another index.

```javascript
//Example:
let value = ['animals', 'plants'];
value.move(0, 3);

//Output: ["plants",undefined,undefined,"animals"]
```

##### Wait for an image to load.

```javascript
//Example: <img src='https://assets-cdn.github.com/images/modules/logos_page/GitHub-Logo.png'>

imageLoaded(
    'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Logo.png').
then(res => {
  console.log(`Success`);
}).
catch(e => {
  console.error(`Error`);
});
```

##### Find the actual width of an element.
> Total width: (width + margin - padding + border).
> It takes the styles of its children into consideration;

```javascript
//Example:
getNetElementWidth('#logo');
```

##### Generate a lengthy random number.
```javascript
//Example:
rand();
```

##### Strip HTML Tags from an input string.

```javascript
//Example:
stripTags(
    `<img src='https://assets-cdn.github.com/images/modules/logos_page/GitHub-Logo.png'>`,
    `<img><span>`);
```

##### Replace all occurrences of a sub-string.
```javascript
//Example:
replaceAll('this is a test but this is another test too', 'this', 'that');

//Output: that is a test but that is another test too
```

##### URL Sanitizer.
> Encodes and decodes url parameters

```javascript
//Example:
urlSanitizer(`https://www.google.co.in/search?ei=abc&q=test+test`);
```

##### Chained object validator.

```javascript
//Example:

let obj1 = {
      key2: {
        key3: 'qwerty',
      },
      key4: [ //array
        {key5: 'abc'},
        [
          {key6: 'xyz'},
          [
            [
              {
                key7: 12345,
                key8: [
                  {
                    key9: '0000000',
                  },
                ],
              },
            ],
          ],
        ],
      ],
    };

chainValidator(obj1, 'unknownKey'); //Output=> undefined
chainValidator(obj1, 'key2'); //Output=> {key3: "qwerty"}
chainValidator(obj1, 'key2.key3'); //Output=> qwerty
chainValidator(obj1, 'key4[0]'); //Output=> {key5: "abc"}
chainValidator(obj1, 'key4[1][0].key6'); //Output=> xyz
chainValidator(obj1, 'key4[1][1][0][0].key7'); //Output=> 12345
chainValidator(obj1, 'key4[1][1][0][0].key8[0].key9'); //Output=> 0000000
```

##### Return numeric value from the input string.

```javascript
//Example:
onlyNumber(`test abc 124#$' xyz`);

//Output: 124
```

##### Array to Object.

```javascript
//Example:
toObject([3, 5, 6]);
```

##### Strip a character from the beginning and end of the string

```javascript
//Example:
let animal = ' cat  ';
rtrim(animal);
//Output: cat

let planet = 'sunearthsun';
rtrim(planet, 'sun');
//Output: earth

let alphabets = 'aaaaabaaaaa';
rtrim(alphabets, 'a');
//Output: b

```

##### Get/Manipulate URL, URI parameters or hashes.
> - get: returns parameter(s) in a url as an object; if url is empty current url is considered; if param is empty all url parameters are returned as an object
> - getUrlWithoutHash: strips hash and return url; if url is empty current url is considered;
> - getHash: returns the hash value of an url as an object; if url is empty current url is considered;
> - parseHash: parses and returns multiple hash values of an url as an object; if url is empty current url is considered; if param is empty all url parameters are returned as an object
> - removeHash: remove hash from the address bar url
 getUrlPath: get url location pathname

```javascript
//Example:
urls.get({});
//Output: {param: "value1", q: "hey"}

urls.get({url: 'http://www.example.com?t=a&p=s'});
//Output: {t: "a", p: "s"}

urls.getUrlWithoutHash({});
urls.getUrlWithoutHash({url: http://www.example.com?t=a&p=s#test'});
//Output: http://www.example.com?t=a&p=s

urls.getHash({});
urls.getHash({url: 'http://www.example.com?t=a&p=s#test'});
//Output: test

urls.parseHash({});
urls.parseHash({url: 'http://www.example.com#test1=var1&test2=var2'});
//Output: {test1: "var1", test2: "var2"}

urls.getUrlPath();
//Output: '/path1/path2'
```

##### Sanitize html tags.
> Escapes and unescapes html tags

```javascript
htmlSanitize('<html>').escape;
//Output: &lt;html&gt;

htmlSanitize('&lt;html&gt;').unescape;
//Output: <html>
```

##### Check whether the device is touch enabled.

```javascript
//Example:
isTouchDevice();
```

##### Detecting iOS.

```javascript
//Example:
isiOS();
```

##### Check whether the given variable is a function.

```javascript
//Example:
let testFunction = function() {
  console.log('I am a function..');
};
isFunction(testFunction);
```

##### Check whether the input variable is an Array.

```javascript
//Example:
let testArray = ['earth', 'mars', 'venus'];
isArray(testArray);
```

##### Check whether the input variable is an Object.

```javascript
//Example:
let testObj = {
  'window': {
    'name': 'main_window',
    'width': 500,
    'height': 500,
  },
};
isObject(testObj);
```

##### Check whether the input variable is an String.

```javascript
//Example:
isString('qwerty');
```

##### Check whether the variable is a JSON Object.

```javascript
//Example:
let testJson = {
  'menuitem': [
    {'value': 'New', 'onclick': 'CreateNewDoc()'},
  ],
};
isJSON(testJson);
```

##### Change the url hash in the address bar and push the same into the browser history.

```javascript
//Example:
changeURLHash('test_param');

//Output: http://www.example.com#test_param
```

##### Wait for DOM element load.

```javascript
//Example:
waitForElementLoad({
  selector: '#div-id',
  time: 200,
}).
then(response => {
  console.log(`Element was successfully loaded into the DOM`);
}).
catch(e => {
  console.error(e);
});
```

### Changelogs:
##### v1.2
- Added: ES5 Module import compatible
- Optimization: Cleaned some codes, Fixed few bugs

##### v1.1
- Updated the README
- Added: Chained Object Validator
- Optimization: Cleaned some codes

##### v1.0:
Initial Push
