class Publisher {
    priority = 10;

    // Whether to show a select-button for this plugin
    hideFromSelection = false;

    constructor(yasr) {
        this.yasr = yasr;
        this.mandatories = ["repo", "token", "query_name"];
    }

    // Draw the publication form.
    draw() {
        const form = document.createElement("div");
        form.setAttribute("class", "mdForm");
        form.append(this.createRow(this.createLabel("Github repo:"), this.createValue("input", "repo", 60)));
        form.append(this.createRow(this.createLabel("Github token:"), this.createValue("input", "token", 60)));
        form.append(this.createRow(this.createLabel("Query name:"), this.createValue("input", "query_name", 30)));
        form.append(this.createRow(this.createLabel("Summary:"), this.createValue("input", "summary", 60)));
        form.append(this.createRow(this.createLabel("Description:"), this.createValue("input", "description", 100)));
        form.append(this.createRow(this.createLabel("Endpoint:"), this.createValue("input", "endpoint", 60)));
        form.append(this.createRow(this.createLabel("Mime:"), this.createValue("input", "mime", 40)));
        form.append(this.createRow(this.createLabel("Method:"), this.createList("method", ["----", "GET", "POST"])));
        form.append(this.createRow(this.createLabel("Pagination:"), this.createValue("input", "pagination", 4)));
        form.append(this.createRow(this.createLabel("Tags:"), this.createValue("textarea", "tags", 60, 4)));
        const publishBtn = document.createElement("button");
        publishBtn.innerText = "Publish";
        const cell = document.createElement("div");
        cell.setAttribute("class", "mdFormValue");
        cell.append(publishBtn);
        form.append(this.createRow(this.createLabel(""), cell));
        this.yasr.resultsEl.appendChild(form);
        document.getElementById("endpoint").value = yasgui.getTab(0).getEndpoint();
        document.getElementById("tags").placeholder = "Tag 1; Tag2; Tag3"
    }

    async get_user() {
        const response = await octokit.rest.users.getAuthenticated();
        const login = await response;
        document.getElementById('rob').innerText = login.data.login;
        return;
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
        textIcon.innerText = "";
        return textIcon;
    }

    // Functions for creating form elements
    createRow(label, value) {
        const row = document.createElement('div');
        row.setAttribute("class", "mdFormRow");
        row.append(label);
        row.append(value);
        return row;
    }

    createLabel(label) {
        const cell = document.createElement("div");
        cell.setAttribute("class", "mdFormLabel");
        cell.innerText = label;
        return cell;
    }

    createValue(inputType, id, cols, lines = 1) {
        const cell = document.createElement("div");
        cell.setAttribute("class", "mdFormValue");
        const input = document.createElement(inputType);
        input.setAttribute("id", id);
        switch (inputType) {
            case "textarea":
                input.setAttribute("rows", lines);
                input.setAttribute("cols", cols);
                break;
            case "input":
                input.setAttribute("size", cols);
                if (id === 'token') {
                    input.setAttribute("type", "password");
                }
                break;
            default:
                return cell;
        }

        cell.append(input);
        if (this.mandatories.includes(id)) {
            const man = document.createElement("span");
            man.innerText = " *";
            cell.append(man);
        }
        return cell;
    }

    createList(id, values) {
        const cell = document.createElement("div");
        cell.setAttribute("class", "mdFormValue");
        const input = document.createElement("select");
        input.setAttribute("id", id);

        for (let value in values) {
            let opt = document.createElement("option");
            opt.innerText = values[value];
            input.append(opt);
        }
        cell.append(input);
        return cell;
    }


}