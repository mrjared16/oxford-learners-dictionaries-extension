function Tooltip(parent) {
    this.html_id = "__tooltip-ex-oxford";


    this.bars = ["Definition", "Image"];

    this.parent_element = parent || document.body;
    this.wrapper = null
    this.shadow_root = null;
    this.html_element = null;
    this.index = 0;

    this.init();
    return this;
}

Tooltip.style_url = {
    style: ["/style/oxford.css", "/style/tooltip.css"],
    font: ["/style/oxford.font.css"]
}

Tooltip.class_name = {
    header: {
        container: "__tooltip-header-container",
        bars: {
            container: "__tooltip-header-bar",
            button: "__tooltip-header-btn",
            selected: "__tooltip-header-selected",
            last: "__tooltip-header-last"
        }
    },
    word: "__tooltip-word-container",
    pronunciation: "__tooltip-pronun-container",
    content: "__tooltip-content-container",
    error: {
        word: "__tooltip-word-error",
        content: "__tooltip-content-error"
    }
}

Tooltip.getStyleForExtension = function () {
    Object.keys(Tooltip.style_url).forEach(key => Tooltip.style_url[key] = Tooltip.style_url[key].map(url => chrome.extension.getURL(url)));
}

Tooltip.prototype.renderTooltip = function (word_info, position) {
    // init html_element and headers
    this.initHTML();
    this.setTooltip(word_info);
    this.setPosition(this.getAbsolutePosition(position));
    this.addListener();
    this.show();
}

Tooltip.prototype.init = function () {
    this.wrapper = document.createElement("div");

    this.shadow_root = this.wrapper.attachShadow({ mode: 'open' });
    this.getStyle();

}


Tooltip.prototype.getStyle = function () {
    Tooltip.style_url.style.forEach(url => {
        let style = document.createElement('style');
        fetch(url)
            .then(res => res.text())
            .then(res => {
                style.innerHTML = res;
                this.shadow_root.appendChild(style);
            });
    });

    // font face does not affect shadow dom, append it to light dom
    Tooltip.style_url.font.forEach(url => {
        let style = document.createElement('style');
        fetch(url)
            .then(res => res.text())
            .then(res => {
                style.innerHTML = res;
                this.wrapper.appendChild(style);
            })
    })
}

Tooltip.prototype.initHTML = function () {
    this.html_element = document.createElement("div");
    this.html_element.id = this.html_id;
    // this.html_element.style.opacity = 0;
    let old;
    if ((old = this.shadow_root.getElementById(this.html_id))) {
        this.shadow_root.replaceChild(this.html_element, old);
    }
    else {
        this.shadow_root.appendChild(this.html_element);
    }
    
    this.parent_element.appendChild(this.wrapper);
    //this.initHeader();
}


Tooltip.prototype.setTooltip = function (word_info) {
    if (word_info.status === "success") {
        // wrap pronun
        this.wrapNode(Tooltip.class_name.pronunciation, word_info.pronunciation);
        // wrap examples

    }
    else {
        console.log(`${word_info.status}, not wrap anything`);
    }

    this.setNode(Tooltip.class_name.word, word_info.word);
    this.setNode(Tooltip.class_name.content, word_info.content);
}

Tooltip.prototype.setPosition = function (position) {
    this.html_element.style.top = position.y + "px";
    this.html_element.style.left = position.x + "px";
}

Tooltip.prototype.addListener = function () {
    this.html_element.addEventListener("click", e => e.preventDefault());

}

Tooltip.prototype.show = function () {
    if (this.parent_element && this.wrapper && this.html_element) {
        this.html_element.style.opacity = 1;
    }
    else
        console.log("OxfordLD extension: Something wrong happens...");
}

Tooltip.prototype.deleteFromDOM = function () {
    if (!this.html_element) {
        //console.log("init for first time, dont delete...");
    }
    else if (this.parent_element && this.wrapper) {
        //console.log("deleting...");
        this.parent_element.removeChild(this.wrapper);
        this.shadow_root.removeChild(this.html_element);
        this.html_element = null;
    }
    else {
        console.log("OxfordLD extension: Something wrong happens...");
    }
}

Tooltip.prototype.getAbsolutePosition = function (selection) {
    let tooltip = {
        width: this.html_element.offsetWidth,
        height: this.html_element.offsetHeight,
        indent: 20
    };

    let x_offset = window.pageXOffset;
    let y_offset = window.pageYOffset;

    //console.log(tooltip.height + tooltip.indent, selection.top);
    const isTop = (selection.top + tooltip.indent > window.innerHeight / 2 && tooltip.height + tooltip.indent < selection.top);
    if (isTop) {
        y_offset -= tooltip.height + tooltip.indent;
    }
    else {
        y_offset += tooltip.indent;
    }

    const isLeft = (selection.left > window.innerWidth / 2);
    if (isLeft) {
        x_offset -= tooltip.width;
    }

    return position = {
        x: selection.left + x_offset,
        y: selection.top + y_offset
    }
}

Tooltip.prototype.setNode = function (class_name, nodes) {
    // wrap nodes
    const div = this.wrap(class_name, nodes, false);

    // append or replace if exist
    const wrapper = this.html_element.getElementsByClassName(class_name);

    if (wrapper.length > 0) {
        this.html_element.replaceChild(div, wrapper[0]);
    }
    else {
        this.html_element.appendChild(div);
    }
}

Tooltip.prototype.wrapNode = function (class_name, nodes) {
    // save parent and anchor
    const parent = nodes[0].parentNode;
    //const anchor = nodes[nodes.length - 1].nextSibling;
    const anchor = nodes[0].previousSibling;

    // wrap and remove from parent
    const div = this.wrap(class_name, nodes, false);
    // insert after anchor
    parent.insertBefore(div, anchor.nextSibling);
}


Tooltip.prototype.initHeader = function () {
    const name = Tooltip.class_name.header;
    const container = this.wrap(name.container,
        [this.wrap(name.bars.container, this.getHeaderBar())]);

    this.html_element.appendChild(container);
}

Tooltip.prototype.getHeaderBar = function () {
    let result = [];
    const name = Tooltip.class_name.header.bars;

    this.bars.forEach((bar, i) => {
        let new_element = document.createElement("div");
        new_element.classList.add(name.button);

        if (i == this.index) {
            new_element.classList.add(name.selected);
        }

        new_element.innerHTML = bar;

        result.push(new_element);
    });

    result[result.length - 1].classList.add(name.last);
    return result;
}

Tooltip.prototype.wrap = function (class_names, nodes, isClone) {

    const div = document.createElement("div");
    div.className = class_names;

    nodes.forEach(node => {
        if (isClone) {
            clone = node.cloneNode(true);
            div.appendChild(clone);
        }
        else {
            div.appendChild(node);
        }
    });

    return div;
}

Tooltip.prototype.isInside = function (selection) {
    return (this.wrapper && this.wrapper === selection);
}
