function inject() {
    window.addEventListener("load", () => {
        Tooltip.getStyleForExtension();
        new ContentManager(document.body);
        //console.log('inject successful');
    });
}

inject();

