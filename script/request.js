function Request(word) {
    this.query = word;
    this.url = `https://www.oxfordlearnersdictionaries.com/search/english/?q=${this.query}`;
    return this;
}

// send to background script do the fetch, get the HTML text
Request.fetch = function (url) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ url }, (messageResponse) => {
            if (chrome.runtime.lastError) {
                // An error occurred :(
                console.log("ERROR: ", chrome.runtime.lastError);
            } else {
                if (!messageResponse)
                    reject('500');

                const { response, error } = messageResponse;
                if (error)
                    reject(response);
                else
                    resolve(response);
            }
        });
    });
}

Request.prototype.sendRequest = function () {
    return Request.fetch(this.url);
}


