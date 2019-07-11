function Request(word) {
    this.url = `https://www.oxfordlearnersdictionaries.com/definition/english/${word}`;
    this.word = word;
    return this;
}

Request.prototype.sendRequest = function () {
    return window.fetch(this.url)
}
Request.prototype.normalizeURL = function()
{
    word.replace(" ", "%20");
}

