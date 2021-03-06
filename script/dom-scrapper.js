function DOMScrapper(response) {
    const parser = new DOMParser();

    this.html = parser.parseFromString(response, "text/html");
    this.addListenerToDOM();
    // console.log(this.html);
    return this;
}

DOMScrapper.prototype.addListenerToDOM = function () {
    // add sound onclick listener
    Array.from(this.scrapeSoundButtons()).forEach(node =>
        node.addEventListener("click", OnclickFunction.playSound, false));

    // add collocation onclick listener
    Array.from(this.scrapeCollapseButtons()).forEach(node =>
        node.addEventListener("click", OnclickFunction.collapseToggle, false));
}

DOMScrapper.prototype.getResponseForTooltip = function () {
    const main_content = this.scrapeMainContent();
    if (!main_content)
    return Content.outDate();
    
    const word_info = Array.from(main_content.childNodes);
    if (this.isResponseError(word_info)) {
        return Content.outDate();
    }
    
    const template = (element, parent, anchor) => ({
        element,
        parent,
        anchor
    })
    
    const word = this.getWord(word_info);
    const content = this.getContent(word_info);
    const pronunciation = this.getPronunciation();
    const type = this.getWordType();
    const example = this.getExamples();
    
    return Content.reconstructTooltip(word, content, pronunciation, type, example);
}

DOMScrapper.prototype.isResponseError = function (word_info) {
    return (!word_info || !word_info.length || word_info.length < 2 || !this.isWordContainer(word_info[0]));
}

DOMScrapper.prototype.isWordContainer = function (node) {
    return node.classList.contains("top-container");
}

DOMScrapper.prototype.scrapeSoundButtons = function () {
    return this.html.getElementsByClassName("audio_play_button");
}

DOMScrapper.prototype.scrapeCollapseButtons = function () {
    return this.html.querySelectorAll(".unbox .heading");
}

DOMScrapper.prototype.scrapeMainContent = function () {
    return this.html.querySelector("div.entry");
}

DOMScrapper.prototype.getWord = function (word) {
    return [word[0]];
}

DOMScrapper.prototype.getContent = function (word) {
    return word.slice(1);
}

DOMScrapper.prototype.getPronunciation = function () {
    const scrapePronunciation = () => this.html.querySelectorAll(".top-g>.pron-gs, .top-g>.collapse");
    const pronunciation = Array.from(scrapePronunciation());
    while (pronunciation.length > 0 && pronunciation[pronunciation.length - 1].parentNode != pronunciation[0].parentNode) {
        pronunciation.pop();
    }
    if (!pronunciation.length)
        return null;
    return this.getObjectTemplate(pronunciation, pronunciation[0].parentNode, pronunciation[0].previousSibling);
}

DOMScrapper.prototype.getWordType = function () {
    const scrapeWordType = () => this.html.querySelectorAll('.arl1');

    let types = Array.from(scrapeWordType());
    if (!types.length)
        return null;

    // word type
    const getClass = (type) => {
        const pos = type.getElementsByTagName('pos');
        if (!pos || !pos[0]){
            return null;
        }
        return pos[0].innerText;
    }

    // path of url
    const getPath = (type) => {
        if (!type.parentNode)
            return null;
        let paths = (type.parentNode.href).split('/');
        return paths[paths.length - 1];
    }

    const getParent = () => {
        return this.html.querySelector(".webtop-g");
    }

    types = types.reduce((prev, type) => {
        if (!type){
            return prev;
        }
        const clss = getClass(type);
        const path = getPath(type);

        if (!clss || !path){
            console.log('class:', clss, 'path:', path);
            return prev;
        }
        prev.push({
            class: clss,
            path
        });
        return prev;
    }, []);

    return this.getObjectTemplate(types, getParent());
}

DOMScrapper.prototype.getExamples = function () {
    const scrapeExample = () => this.html.querySelectorAll('.def');
    const getParent = element => element[0].parentNode;
    const getAnchor = element => element[0].previousSibling;
    const getExample = element => {
        const example = [];
        while (element.nextElementSibling) {
            element = element.nextElementSibling;
            example.push(element);
        }
        return example;
    }

    const result = [];
    const definitions = scrapeExample();
    // each definition may be have example
    definitions.forEach(def => {
        const example = getExample(def);
        if (example.length === 0) {
            return;
        }
        const parent = getParent(example);
        const anchor = getAnchor(example);
        result.push(this.getObjectTemplate(example, parent, anchor));
    });
    return result;
}

DOMScrapper.prototype.getObjectTemplate = (element, parent, anchor) => ({
    element,
    parent,
    anchor: (anchor) ? anchor : null
});
