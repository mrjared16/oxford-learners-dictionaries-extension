chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    async function sendRequest() {
        const response = await (fetch(request.url));

        // send error status code to content script
        if (!response.ok) {
            console.log('gotcha', response.status);
            return {
                'response': response.status,
                'error': true
            };
        }

        // send the data
        const data = await response.text();
        console.log('success');
        return {
            'response': data,
            'error': false
        };
    }

    // work around bcz can not use await
    sendRequest().then(sendResponse);
    // work around to content script wait for asynchronus call in background script
    return true;
});

