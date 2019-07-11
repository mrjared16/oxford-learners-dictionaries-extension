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

    while (pronun && pronun.length > 0 && pronun[pronun.length - 1].parentNode != pronun[0].parentNode) {
        pronun.pop();
    }

    if (this.isResponseError(word_info)) {
        return Content.outDate();
    }
    
    return Content.reconstructTooltip([word_info[0]], word_info.slice(1), pronun);
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