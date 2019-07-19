function DOMScrapper(response) {
    const parser = new DOMParser();

    this.html = parser.parseFromString(response, "text/html");
    this.addListenerToDOM();
    return this;
}

DOMScrapper.prototype.addListenerToDOM = function () {
    // add sound onclick listener
    Array.from(this.getSoundButtons()).forEach(node =>
        node.addEventListener("click", OnclickFunction.playSound, false));

    // add collocation onclick listener
    Array.from(this.getCollapseButtons()).forEach(node =>
        node.addEventListener("click", OnclickFunction.collapseToggle, false));
}

DOMScrapper.prototype.getResponseForTooltip = function () {
    const main_content = this.getMainContent();
    if (!main_content)
        return;

    const word_info = Array.from(main_content.childNodes);
    const pronun = Array.from(this.getPronunciation());

    while (pronun.length && pronun.length > 0 && pronun[pronun.length - 1].parentNode != pronun[0].parentNode) {
        pronun.pop();
    }

    if (this.isResponseError(word_info)) {
        return Content.outDate();
    }
    const template = (element, parent, anchor) => ({
        element,
        parent,
        anchor
    })

    const pronunciation = (pronun.length && pronun.length !== 0) ? [template(pronun, pronun[0].parentNode, pronun[0].previousSibling)]: null;
    const defs = Array.from(this.getOtherDefinition());
    let def_object = null;
    if (defs.length > 0) {
        def_object = this.getOtherDefinitonObject(defs);
    }

    const example = this.getExamples();

    return Content.reconstructTooltip([word_info[0]], word_info.slice(1), pronunciation, def_object, example);
}

DOMScrapper.prototype.isResponseError = function (word_info) {
    return (!word_info || word_info.length < 2 || !this.isWordContainer(word_info[0]));
}

DOMScrapper.prototype.getSoundButtons = function () {
    return this.html.getElementsByClassName("audio_play_button");
}

DOMScrapper.prototype.getCollapseButtons = function () {
    return this.html.querySelectorAll(".unbox .heading");
}

DOMScrapper.prototype.getMainContent = function () {
    return this.html.querySelector("div.entry > .h-g");
}

DOMScrapper.prototype.getPronunciation = function () {
    return this.html.querySelectorAll(".top-g>.pron-gs, .top-g>.collapse");
}

DOMScrapper.prototype.isWordContainer = function (node) {
    return node.classList.contains("top-container");
}

DOMScrapper.prototype.getOtherDefinition = function () {
    return this.html.querySelectorAll('.arl1');

}

DOMScrapper.prototype.getOtherDefinitonObject = function (defs) {
    let getAnchor = () => {
        return this.html.querySelector(".webtop-g");
    }
    const _anchor = getAnchor();


    let getClass = (def) => {
        return def.getElementsByTagName('pos')[0].innerText;
    }
    let getWordPath = (def) => {
        let paths = (def.parentNode.href).split('/');
        return paths[paths.length - 1];
    }
    let templateObject = (clss, pth) => {
        return {
            class: clss,
            path: pth,
            anchor: _anchor
        }
    }

    let result = [];
    defs.forEach(def => {
        result.push(templateObject(getClass(def), getWordPath(def)));
    });
    return result;
}

DOMScrapper.prototype.getExamples = function () {
    const templateExample = (element, parent, anchor) => ({
        element,
        parent,
        anchor
    })
    const getParent = element => element[0].parentNode;
    const getAnchor = element => element[0].previousSibling;
    const getExample = element => {
        const example = [];
        while (element.nextElementSibling)
        {
            element = element.nextElementSibling;
            example.push(element);
        }
        return example;
    }
    const result = [];

    let definitions = this.html.querySelectorAll('.def');
    // each definition may be have example
    definitions.forEach(index => {
        const example = getExample(index);
        if (example.length === 0) {
            return;
        }
        const parent = getParent(example);
        const anchor = getAnchor(example);
        // add to result
        result.push(templateExample(example, parent, anchor));

    });
    return result;
}