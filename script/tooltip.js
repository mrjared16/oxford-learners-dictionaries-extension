function Tooltip(content_manager, parent) {
    this.html_id = "__tooltip-ex-oxford";


    this.bars = ["Definition", "Image"];

    this.parent_element = parent || document.body;
    this.wrapper = null
    this.shadow_root = null;
    this.html_element = null;
    this.index = 0;

    this.content_manager = content_manager;

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
    },
    class: {
        button: "class-button"
    },
    example: {
        wrapper: "tooltip-example",
        button: {
            wrapper: "button-wrapper",
            button: "example-button"
        },
        example: "example-wrapper"
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
    //console.log(word_info);

    if (word_info.status === "success") {
        // wrap pronun
        if (word_info.pronunciation) {
            this.wrapPronunciation(word_info.pronunciation);
        }

        //add other word type
        if (word_info.other) {
            this.addClassButtons(word_info.other);
        }

        // wrap examples
        if (word_info.example) {
            this.addExampleButtons(word_info.example);
        }
    }
    else {
        console.log(`${word_info.status}, not wrap anything`);
    }

    this.setNode(Tooltip.class_name.word, word_info.word);
    this.setNode(Tooltip.class_name.content, word_info.content);
}

Tooltip.prototype.wrapPronunciation = function (pronun) {
    this.wrapNode(Tooltip.class_name.pronunciation, [pronun]);
}

Tooltip.prototype.addClassButtons = function (types) {
    const { parent, anchor } = types;
    if (!parent || !types || 
        !types.element || !types.element.hasOwnProperty('length') || !types.element.length) {
        return;
    }

    const getButton = (type) => {
        const button = document.createElement('button');

        button.className = Tooltip.class_name.class.button;
        button.innerHTML = `${type.class}`;

        button.addEventListener("click", () => {
            this.deleteFromDOM();
            this.content_manager.createTooltip(type.path);
        });
        return button;
    }

    const getPosNode = (type) => {
        const result = document.createElement("span");
        result.className = "pos";
        result.appendChild(getButton(type));
        return result;
    }
    types.element.forEach(element => {
        //element.anchor.appendChild(getPosNode(element));
        const div = getPosNode(element);
        if (anchor) {
            // insert after anchor
            parent.insertBefore(div, anchor.nextSibling);
        }
        else {
            parent.appendChild(div);
        }
    });
}

Tooltip.prototype.addExampleButtons = function (examples) {
    if (!examples || !examples.length) {
        return;
    }

    const buttonListener = parent => {
        const button = parent.childNodes[0].childNodes[0];
        button.classList.toggle('active');
        const dropdown = parent.childNodes[1];
        dropdown.classList.toggle('active');

        button.innerHTML = (button.classList.contains('active')) ? 'Hide examples' : 'Show examples';
    }

    const createWrapper = (class_name) => {
        const div = document.createElement('div');
        div.className = class_name;

        return div;
    }

    const createButton = (parent) => {
        const button = document.createElement('button');
        button.addEventListener('click', () => buttonListener(parent));
        button.className = Tooltip.class_name.example.button.button;
        button.innerHTML = 'Show examples';

        const btn_wrapper = document.createElement('div');
        btn_wrapper.appendChild(button);
        btn_wrapper.className = Tooltip.class_name.example.button.wrapper;

        return btn_wrapper;
    }

    examples.forEach(node => {
        const { parent, anchor } = node;

        if (!parent) {
            return;
        }

        const wrapper = createWrapper(Tooltip.class_name.example.wrapper);
        const button = createButton(wrapper);

        // wrap and remove from parent
        const example = this.wrap(Tooltip.class_name.example.example, node.element, false);

        wrapper.appendChild(button);
        wrapper.appendChild(example);

        if (anchor) {
            // insert after anchor
            parent.insertBefore(wrapper, anchor.nextSibling);
        }
        else {
            parent.appendChild(wrapper);
        }
    });
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
    if (!nodes || !nodes.hasOwnProperty('length') || !nodes.length) {
        return;
    }

    nodes.forEach(node => {
        const { parent, anchor } = node;
        if (!parent) {
            return;
        }
        // wrap and remove from parent
        const div = this.wrap(class_name, node.element, false);
        if (anchor) {
            // insert after anchor
            parent.insertBefore(div, anchor.nextSibling);
        }
        else {
            parent.appendChild(div);
        }
    });
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

