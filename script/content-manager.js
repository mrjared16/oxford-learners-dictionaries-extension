function ContentManager(place_holder) {
    this.place_holder = place_holder;

    this.max_length = 20;
    this.max_words = 1;

    this.selection = null;
    this.rect = null;

    this.tooltip = new Tooltip();

    this._addListener();
    return this;
}

ContentManager.prototype._addListener = function () {
    this.place_holder.addEventListener("mouseup", this._onMouseUp.bind(this));
}

ContentManager.prototype._onMouseUp = function (event) {

    this.selection = window.getSelection();
    if (this.selection.rangeCount <= 0)
        return;
    this.rect = this.selection.getRangeAt(0).getBoundingClientRect();

    if (!this.shouldRenderTooltip(event.target))
        return;


    this.initTooltip();
    (new Request(this.word)).sendRequest()
        .then(res => {
            this.renderTooltip(res);
            //event.preventDefault();
        })
        .catch(() => this.handleFetchError());

}

ContentManager.prototype.shouldRenderTooltip = function (event) {
    if (this.tooltip.isInside(event)) {
        //console.log("inside");
        return false;
    }
    this.tooltip.deleteFromDOM();
    this.word = this.wordProcessing(this.selection.toString());

    return (this.word && this.word != "");
}

ContentManager.prototype.wordProcessing = function (text) {
    // remove double spaces
    let result = text.trim().replace(/\s+\s/g, " ");

    // remove symbols
    var e = new RegExp("([=+?!@#$%⁄^&{_}():;\\|<>.,]|[\n])", "g");
    result = (result.replace(e, "")).replace("’", "'");

    // validate 
    const words = result.split(" ").length;
    if (words > this.max_words && result.length > this.max_length)
        return "";

    return result.toLowerCase();
}

ContentManager.prototype.renderTooltip = function (response) {

    let word_info;
    if (response.status === 404) {
        word_info = Content.notFound(this.word);
    }
    else if (!response || response.status != 200) {
        word_info = Content.networdError(this.word);
    }
    if (word_info) {
        this.createToolTip(word_info);
        return;
    }

    response.text()
        .then(res => new DOMScrapper(res))
        .then(scrapper => scrapper.getResponseForTooltip())
        .then(info => this.createToolTip(info));

}

ContentManager.prototype.handleFetchError = function()
{
    this.createToolTip(Content.fetchError());
}

ContentManager.prototype.createToolTip = function (data) {
    this.tooltip.renderTooltip(data, this.rect);
}

ContentManager.prototype.initTooltip = function () {
    //this.tooltip.deleteFromDOM();
    // loading word info
}

