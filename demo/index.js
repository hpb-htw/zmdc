import {JS_EXAMPLE_EL_QUERY, HTML_EXAMPLE_EL_QUERY,
    htmlEscape, parseExampleFunctions, showExampleCode} from '../dist/zmdc.js';

import {demoFetchOrigin} from "./minify-code.js";

import Prism from 'prismjs';

window.Prism = Prism;

document.addEventListener("DOMContentLoaded", async () => {
    // run demo code of formatFancy
    demoUsageTextFormatFunction();
    // parse myself to place demo code into DOM
    const MYSELF = "index.js";
    await showDemoCode(MYSELF);
    await demoFetchOrigin();
    demoUsageOfFunctionFancyFormatAgain();
    if(window.Prism) {
        Prism.highlightAll();
    }else {
        console.log("No Prismjs found")
    }
});


function formatFancy(text) {
    const escaped = htmlEscape(text);
    return `<span style="color:#fe2f33">${escaped}</span>`;
}

function demoUsageTextFormatFunction() {
    // tag: fancy-demo
    const text = "Funny texts don't need Comic Sans";
    const fancy = formatFancy(text);
    // <span id="ff-result"></span>
    document.getElementById("ff-result").innerHTML = fancy;
}

function demoHowtoPrepareDemoFunction() {
    // tag: howto-prepare-demo-function
    function demoUsageTextFormatFunction() {
        const text = "Funny texts don't need Comic Sans";
        const fancy = formatFancy(text);
        document.getElementById("ff-result").innerHTML = fancy;
    }
    // <span id="ff-result"></span>
}

function demoHowtoRunDemonstration() {
    // tag: howto-run-demo-function
    demoUsageTextFormatFunction();
}

function demoHowtoMarkNeededHTMLElement() {
    // tag: howto-mark-demo-info
    function demoUsageTextFormatFunction() {
        // tag: fancy-demo
        const text = "Funny texts don't need Comic Sans";
        const fancy = formatFancy(text);
        // <span id="ff-result">
        document.getElementById("ff-result").innerHTML = fancy;
    }
    // <div id="fancy-demo">
    //     <pre><code class="example-javascript"></code></pre>
    //     <pre><code class="example-html"></code></pre>
    // <div>
}

function demoHowtoShowDemoCodeInFunction() {
    // tag: howto-show-demo-code
    // get the source code of the demo function
    const demoFn = demoUsageTextFormatFunction.toString();
    // parse source code to example
    const example = parseExampleFunctions(demoFn)[0];
    // show example
    showExampleCode(example);
}

async function showDemoCode(demoScript) {
    const response = await fetch(demoScript, {method: 'GET'});
    const text = await response.text();
    const demoExamples = parseExampleFunctions(text);
    for(const example of demoExamples) {
        showExampleCode(example);
    }
}

function demoUsageOfFunctionFancyFormatAgain() {
    // tag: verify-contents-of-fancy-demo
    const fancyDemo = document.getElementById("fancy-demo");
    const jsCode = fancyDemo.querySelector(JS_EXAMPLE_EL_QUERY).innerHTML;
    const htmlCode = fancyDemo.querySelector(HTML_EXAMPLE_EL_QUERY).innerHTML;
    // <div id="duplicate-fancy-demo">
    const elId = 'duplicate-fancy-demo';
    const example = {
        js: jsCode,
        html: htmlCode,
        elId
    }
    showExampleCode(example);
}
