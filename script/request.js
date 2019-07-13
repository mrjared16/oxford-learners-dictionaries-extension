function Request(word) {
    this.query = this.getEncodeWord(word);
    this.url = `https://www.oxfordlearnersdictionaries.com/definition/english/${this.query}`;
    return this;
}

Request.prototype.sendRequest = function () {
    return window.fetch(this.url);
}
Request.prototype.getEncodeWord = function(word)
{
    return word.replace(" ", "-");
}

