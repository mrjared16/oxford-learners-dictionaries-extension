function Content(status, word, content, pronunciation, type, example) {
    if (!word || !content) {
        console.log("Cannot scrape word nor content");
    }
    return {
        word: word,
        content: content,
        pronunciation: (pronunciation) ? pronunciation : null,
        other: (type) ? type : null,
        example: (example) ? example : null,
        status: (status) ? status : "error"
    };
}

Content.templateError = function (header, msg) {
    const word = document.createElement("div");
    word.className = Tooltip.class_name.error.word;
    word.innerHTML = `${header}`;

    const content = document.createElement("div");
    content.className = Tooltip.class_name.error.content;
    content.innerHTML = `${msg}`;

    return Content("error", [word], [content]);
}

Content.networdError = function (word) {
    return Content.templateError(`Error looking up the word "<strong>${word}</strong>"`, "Something went wrong. Please check your network and try again.");
}

Content.notFound = function (word) {
    return Content.templateError(`Error looking up the word "<strong>${word}</strong>"`, `Oh sorry, we do not found the word <strong>${word}</strong> in Oxford Learner's Dictionaries.`);
}

Content.outDate = function () {
    return Content.templateError(`Oops!`, `Oxford Learner's Dictionaries result for this word looks strange.</br>Please report this (the word and site) and how to reproduce it. Thanks!`);
}

Content.fetchError = function () {
    return Content.templateError(`Extension error`, `This website has security policy problem with extension. Please report this (the word and site) and how to reproduce it. Thanks!`)
}

Content.reconstructTooltip = function (word, content, pronunciation, type, example) {
    //const status = (pronunciation) ? "success" : "default";

    const status = "success";
    return Content(status, word, content, pronunciation, type, example);
}
