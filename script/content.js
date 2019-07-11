function Content(word, content, pronunciation, stt) {
    if (!word || !content)
    {
        console.log("cannot scrape word nor content");
        //return;
    }
    return {
        id: 0,
        word: word,
        content: content,
        pronunciation: pronunciation,
        status: (stt) ? stt : "error",
    };
}

Content.templateError = function (header, msg) {
    const word = document.createElement("div");
    word.className = Tooltip.class_name.error.word;
    word.innerHTML = `${header}`;

    const content = document.createElement("div");
    content.className = Tooltip.class_name.error.content;
    content.innerHTML = `${msg}`;

    return Content([word], [content], null, "error", null);
}

Content.networdError = function (word) {
    return Content.templateError(`Error looking up the word "<strong>${word}</strong>"`, "Something went wrong. Please check your network and try again.");
}

Content.notFound = function (word) {
    return Content.templateError(`Error looking up the word "<strong>${word}</strong>"`, `Oh sorry, we do not found the word <strong>${word}</strong> in Oxford Learner's Dictionaries.`);
}

Content.outDate = function () {
    return Content.templateError(`Oops!`, `Oxford Learner's Dictionaries have changed their website. </br>Please report this bug and how to reproduce it. Thanks!`);
}

Content.fetchError = function(error) {
    return Content.templateError(`Extension error`, `This website has security policy problem with extension. Please report this bug (the word and site) and how to reproduce it to me. Thanks!`)
    //return Content.templateError(`Extension error`, `${error}`);
}

Content.reconstructTooltip = function(word, content, pronun)
{
    return Content(word, content, pronun, (pronun.length > 0) ? "success" : "default", null);
}
