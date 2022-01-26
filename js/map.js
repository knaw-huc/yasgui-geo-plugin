class Map {
    priority = 10;

    // Whether to show a select-button for this plugin
    hideFromSelection = false;

    constructor(yasr) {
        this.yasr = yasr;
    }

    // Draw the resultset. This plugin simply draws the string 'True' or 'False'
    draw() {
        const el = document.createElement("div");
        el.textContent = "rob was here";
        this.yasr.resultsEl.appendChild(el);
    }

    // A required function, used to indicate whether this plugin can draw the current
    // resultset from yasr
    canHandleResults() {
        return (
            !! this.yasr.results
        );
    }
    // A required function, used to identify the plugin, works best with an svg
    getIcon() {
        const textIcon = document.createElement("div");
        textIcon.innerText = "<>";
        return textIcon;
    }
}