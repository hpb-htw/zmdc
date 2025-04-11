import type {CurlyMatch, Example, Formatter, HtmlCommentCandidate, ParsingFunctionState} from "./types.js";

export const JS_EXAMPLE_EL_QUERY = 'code[class*="example-javascript"]';
export const HTML_EXAMPLE_EL_QUERY = 'code[class*="example-html"]';
export const DEMO_INDICATOR = /^((?<level>(export|return))\s+)?(async(\s+))?function(\*?)(\s+)demo(?<fnName>\w+)(\s)*\(/m;

/**
 * escape HTML specific character.
 * @param text text to insert into HTML
 * @return escaped text
 * */
export const htmlEscape = (text:string) : string => {
    return text.replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/**
 * recognize demo functions and parse them to an Array of Example {@see Example}.
 * A function is recognized as an example, if its declaration begins with `export function demo`.
 * For example:
 * ```
 * export function demoFancyImageProcessing(img) {
 *      // tag: demo-1
 *      const metadata = auxiliaryFunction(img);
 *      const fancyImage = doSomeFancyStuff(img, metadata);
 *      // <div id="result">
 *      document.getElementById("result").innerHTML = `<img src="${fancyImage}" alt="">`;
 * }
 * ```
 * @param code example code
 * @return Example[]
 * */
export function parseExampleFunctions(code: string): Example[] {
    const example:Example[] = [];
    //let functionLines = [];
    const state:ParsingFunctionState = {
        inFunction: false,
        openCurly: 0,
        closeCurly: 0,
        fnName: "",
        fnModify: "",
        fnLines: []
    };
    for (const line of code.split('\n')) {
        if(!state.inFunction) {
            const trimmedLine = line.trim();
            const matched = DEMO_INDICATOR.exec(trimmedLine);
            if ( matched ) {
                // recognize a new demo function
                state.inFunction = true;
                state.fnName = matched.groups!["fnName"];
                // @ts-ignore
                state.fnModify = matched.groups!["level"];
            }
        }
        if (state.inFunction) {
            state.fnLines.push(line);
            const {openCurly, closeCurly} = countCurly(line);
            state.openCurly += openCurly;
            state.closeCurly += closeCurly;
            if (state.openCurly === state.closeCurly) {
                example.push(parseCode( state) );
                // reset state
                state.inFunction = false;
                state.openCurly = 0;
                state.closeCurly = 0;
                state.fnName = "";
                state.fnModify = "";
                state.fnLines = [];
            }
        }
    }
    return example;
}

function countCurly(line:string): CurlyMatch {
    const length = line.length;
    const openCurly = length - (line.replaceAll('{','').length);
    const closeCurly = length - (line.replaceAll('}','').length);
    return {openCurly, closeCurly};
}

/**
 * show an Example in a DOM
 * @param example the example, which is the result of {@see #parseCode} by parsing an example function.
 * @param fmt a formatter. The default formatter just escapes HTML specific character.
 *
 * */
export function showExampleCode(example:Example, fmt: Formatter = {js:htmlEscape, html:htmlEscape}) {
    const {js, html, elId} = {...example};
    const el = document.getElementById(elId);
    if(el) {
        if(js.length > 0) {
            const jsContainer = el.querySelector(JS_EXAMPLE_EL_QUERY);
            if(jsContainer) {
                jsContainer.innerHTML = fmt.js(js);
            } else {
                throw new Error(`Container id ${elId} does not contain ${JS_EXAMPLE_EL_QUERY} but javascript example is not empty`);
            }
        }
        if(html.length > 0) {
            const htmlContainer = el.querySelector(HTML_EXAMPLE_EL_QUERY);
            if(htmlContainer) {
                htmlContainer.innerHTML = fmt.html(html);
            } else {
                throw new Error(`Container id ${elId} does not contain ${HTML_EXAMPLE_EL_QUERY} but HTML example is not empty`);
            }
        }
    }else {
        throw new Error(`Container element with id="${elId}" not found`);
    }
}

export function parseCode( state:ParsingFunctionState ):Example {
    const functionLines = state.fnLines;
    const FUNCTION_INDENT_SIZE = 4;
    const js = [];
    const html = [];
    const functionBodyLines = functionLines.slice(2, -1);
    if(functionBodyLines.length === 0) {
        js.push('');
        html.push('')
    }
    for(const line of functionBodyLines ) {
        const chars = line.slice(FUNCTION_INDENT_SIZE).trimEnd();
        const htmlComment = validHTML(chars);
        if (  htmlComment.isComment ) {
            html.push(  htmlComment.value );
        }else {
            js.push(chars);
        }
    }
    const elId = parseElId(functionLines[1]);
    return {js: js.join('\n'), html: html.join('\n'), elId, name:state.fnName};
}

function parseElId(line:string) {
    line = line.trim();
    const EL_ID_INDICATOR = '// tag:';
    if(line.startsWith(EL_ID_INDICATOR)) {
        return line.slice(EL_ID_INDICATOR.length).trim();
    }
    throw new Error(`'${line}' not started with ${EL_ID_INDICATOR}`);
}

function validHTML(chars:string):HtmlCommentCandidate {
    const HTML_INDICATOR = /^(\/\/(\s+))</m;
    const CROPPED_PREFIX = '// '.length;
    const matches = HTML_INDICATOR.exec(chars);
    if(matches) {
        return {
            isComment:true,
            value: chars.slice(CROPPED_PREFIX)
        }
    }
    return  {
        isComment: false
    }
}
