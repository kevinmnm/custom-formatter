/**
 * <pre> tag is not working.
**/

const htmlcopy = `
<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Document</title>
</head>
<body>
   <!-- This is a comment. -->
   {%      set myvar = "my world!" %}
   {% set yourvar = "my world!"    %}
   {% apply lower|escape('html') %}
      <strong>   SOME TEXT   </strong>
   {% endapply %}

   {# This is twig comment ! #}

   <div id="app">
      <div class="my-app">hello world!</div>
      <div class="my-app"> bye  world! </div>
      <div class="my-app">
         test word
      </div>
   </div>sdfsdf

   <pre>
      test
         ing    things
what
   </pre>
   my     test!
</body>
</html>
`;

function replaceSpacesAndNewlinesOutsidePreTags(input) {
   let substrings = input.split(/(<pre>|<\/pre>)/i);
   let insidePreTag = false;
 
   for (let i = 0; i < substrings.length; i++) {
     if (substrings[i].toLowerCase() === '<pre>') {
       insidePreTag = true;
     } else if (substrings[i].toLowerCase() === '</pre>') {
       insidePreTag = false;
     } else if (!insidePreTag) {
       substrings[i] = substrings[i].replace(/ {2}/g, ' ').replace(/\n/g, '');
     }
   }
 
   return substrings.join('');
 }

 const singleLine = replaceSpacesAndNewlinesOutsidePreTags(htmlcopy);

// const singleLine = htmlcopy
   // .replaceAll(/^(?!<pre)\s{2,}(?<!(<\/pre>))$/g, "") // Remove all spaces.
   // .replaceAll(/\s{2,}/g, "") // Remove all double spaces.
   // .replaceAll(/\n/g, ""); // Remove all newlines.



const html = singleLine
   .replaceAll(/(<\/?)/g, "\n$1") // Add new line before html syntax.
   .replaceAll(/({%|{#)/g, "\n$1") // Add new line before twig syntax.
   /**
    * @type TWIG
    * @syntax {% ... %}
    * @desc Format twig operators/filters.
    **/
   .replaceAll(/({%)(.*)(%})/g, (match, $1, $2, $3) => {
      // console.log({ match, $1, $2, $3 });
      const $1Trimmed = $1.trim();
      const $2Trimmed = $2.trim();
      const $3Trimmed = $3.trim();
      const format = `${$1Trimmed} ${$2Trimmed} ${$3Trimmed}`;
      return format;
   })
   /**
    * @type HTML
    * @desc Add newline infront of strings.
    **/
   .replaceAll(/^(.*<.*>)(.+)/gm, (match, $1, $2, offset, string) => {
      // console.warn({ match, $1, $2, offset });
      const isPreTag = $1.includes("<pre");
      const $2Format = isPreTag ? $2 : $2.trim();
      const format = `${$1}\n${$2Format}`;
      const final = isPreTag ? format : format.trim();
      return final;
   });

const lines = html.split(/\n/);

/////////////////////////////////////////////////////////////////////

const CONFIGS = {
   tabSpaces: 3,
   tags: {
      get html() {
         const _ID = "html";
         const _STANDALONE_LIST = [
            "!DOCTYPE",
            "!--",
            "meta",
            "link",
            "img",
            "br",
            "hr",
            "input",
         ];

         const standaloneList = _STANDALONE_LIST.join("|");
         const openingList = standaloneList;

         const standalone = [new RegExp(`^<(${standaloneList})`, "g")];
         // const opening = [/^<(?!\/).*/];
         const opening = [new RegExp(`^<(?!\/)(?!${openingList})`, "g")];
         const closing = [/^<(?=\/)/];

         return {
            id: _ID,
            standalone,
            opening,
            closing,
         };
      },
      get twig() {
         const _ID = "twig";
         // const _STANDALONE_LIST = ["{% set", "{{"];
         const _STANDALONE_LIST = ["set"];
         const _CLOSING_LIST = ["end", "else", "elseif"];

         const standaloneList = _STANDALONE_LIST.join("|");
         const openingList = [..._STANDALONE_LIST, ..._CLOSING_LIST].join("|");
         const closingList = _CLOSING_LIST.join("|");

         const standalone = [
            // new RegExp(`(^\{%\s*(${standaloneList})$)|\{\{\s*`, "i"),
            // new RegExp(`(^\\{%\\s*(${standaloneList}))|(^(\\{\\{\\s*))`, "i"),
            // new RegExp(`(^\\{(?=(%|#))\\s*(${standaloneList}))|(^(\\{\\{\\s*))`, "i"),
            // new RegExp(`(^\\{(?=(%|#))\\s*(${standaloneList}))|(^(\\{\\{\\s*)|(^(\\{#\\s+)))`, "i"),
            // new RegExp(`(^\\{(?=(%|#))\\s*(${standaloneList}))|(^(\\{\\{\\s*)|(^(\\{#\\s+))|((.*#})$))`, "mi"),
            new RegExp(`(^\\{%\\s*(${standaloneList}))|(^(\\{\\{\\s*)|(^(\\{#\\s+))|((.*#})$))`, "mi"),
         ];
         const opening = [new RegExp(`^\\{%\\s*(?!${openingList})\\w+`, "i")];
         const closing = [new RegExp(`\{%\\s*(${closingList})`, "i")];

         return {
            id: _ID,
            standalone,
            closing,
            opening,
         };
      },
   },
};

const FINAL = [];

/////////////////////////////////////////////////////////////////////

const getTagTypes = (linearg) => {
   const tagConfigs = CONFIGS.tags;

   const line = linearg?.trim?.() || lineTrimmed;
   if (!line) return;

   let isStandalone = false;
   let isOpening = false;
   let isClosing = false;

   for (const type in tagConfigs) {
      const tagConfig = tagConfigs[type];
      const standaloneTags = tagConfig.standalone;
      const openingTags = tagConfig.opening;
      const closingTags = tagConfig.closing;

      isOpening = openingTags.some((pattern) => {
         if (pattern instanceof RegExp) {
            const result = pattern.test(line);
            console.log({ type: "isOpening", line, pattern, result });
            return result;
         }
         return line.startsWith(pattern);
      });
      isStandalone = standaloneTags.some((pattern) => {
         if (pattern instanceof RegExp) {
            const result = pattern.test(line);
            console.log({ type: "isStandalone", line, pattern, result });
            return result;
         }
         return line.startsWith(pattern);
      });
      isClosing = closingTags.some((pattern) => {
         if (pattern instanceof RegExp) {
            const result = pattern.test(line);
            // console.log({ type: "isClosing", line, pattern, result });
            return result;
         }
         return line.startsWith(pattern);
      });

      if (isStandalone || isClosing || isOpening) break;
   }

   const isTextNode = !isStandalone && !isClosing && !isOpening;

   if (isStandalone && isOpening) {
      throw new Error(
         JSON.stringify(
            {
               line,
               tagConfigs,
            },
            null,
            4
         )
      );
   }
   return {
      standalone: isStandalone,
      closing: isClosing,
      opening: isOpening,
      text: isTextNode,
   };
};

function startFormatter(lines) {
   if (!lines || !lines.length) return;
   const tabSpaces = CONFIGS.tabSpaces;

   let level = 0;
   lines.forEach((line) => {
      const lineTrimmed = line.trim();
      if (!lineTrimmed) return;

      const lineTagType = getTagTypes(lineTrimmed);

      const isStandaloneLine = lineTagType.standalone;
      const isClosingLine = lineTagType.closing;
      const isOpeningLine = lineTagType.opening;
      const isTextLine = lineTagType.text;

      console.warn(
         line,
         isClosingLine
            ? "-- CLOSING"
            : isOpeningLine
            ? "-- OPENING"
            : isTextLine
            ? "-- TEXT"
            : isStandaloneLine
            ? "-- STANDALONE"
            : "-- UNKNOWN"
      );
      console.log(level);
      console.log();

      if (isClosingLine) {
         --level;
      }

      const spaceCount = level * tabSpaces;
      const indent = " ".repeat(spaceCount);
      const lineIndented = indent + lineTrimmed;
      FINAL.push(lineIndented);

      if (isOpeningLine) {
         ++level;
      }
   });
}

startFormatter(lines);
console.log(FINAL);
