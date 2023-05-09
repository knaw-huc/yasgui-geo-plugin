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
        const err = document.createElement("div");
        err.setAttribute("id", "pubErrorMessage");
        this.yasr.resultsEl.appendChild(err);

        const form = document.createElement("div");
        form.setAttribute("class", "mdForm");
        form.setAttribute("id", "mdForm");
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
        publishBtn.addEventListener("click", validate);
        const cell = document.createElement("div");
        cell.setAttribute("class", "mdFormValue");
        cell.append(publishBtn);
        form.append(this.createRow(this.createLabel(""), cell));
        const hidden_input = document.createElement("input");
        hidden_input.setAttribute("type", "hidden");
        hidden_input.setAttribute("id", "spQuery");
        hidden_input.setAttribute("name", "spQuery");
        form.append(hidden_input);
        this.yasr.resultsEl.appendChild(form);
        document.getElementById("endpoint").value = yasgui.getTab().getEndpoint();
        document.getElementById("tags").placeholder = "Tag 1; Tag2; Tag3";
        //For testing purposes
        document.getElementById("repo").value = "https://github.com/robzeeman/grlc-queries";
        document.getElementById("token").value = "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";

        function validate() {
            let html = "";
            let submit = true;
            const errMsg = document.getElementById("pubErrorMessage");
            if (document.getElementById("repo").value === "") {
                html = "No Git repository added!<br/>";
                errMsg.innerHTML = html;
                submit = false;
            }
            if (document.getElementById("token").value === "") {
                html = html + "No token added!<br/>";
                errMsg.innerHTML = html;
                submit = false;
            }
            if (document.getElementById("query_name").value === "") {
                html = html + "No query name added!<br/>";
                errMsg.innerHTML = html;
                submit = false;
            }
            if (submit) {
                const file = build_rq();
                const queryName = document.getElementById("query_name").value.split('.')[0] + '.rq';
                const key = document.getElementById("token").value;
                document.getElementById("mdForm").innerHTML = "<pre> Writing file:\n\n" + file + "</pre>";

                send_file(file, queryName, key);
            }

            async function send_file(file, queryName, key) {
                document.inst(key);
                const commits = await document.client.repos.listCommits({
                    owner: "robzeeman",
                    repo: "grlc-queries",
                });
                const commitSHA = commits.data[0].sha;
                console.log(commitSHA);
                const files = [
                    {
                        name: queryName,
                        content: file
                    }
                ];
                console.log(files);
                const commitableFiles = files.map(({name, content}) => {
                    return {
                        path: name,
                        mode: '100644',
                        type: 'commit',
                        content: content
                    }
                });
                console.log(commitableFiles);
                const {
                    data: { sha: currentTreeSHA },
                } = await document.client.git.createTree({
                    owner: "robzeeman",
                    repo: "grlc-queries",
                    tree: commitableFiles,
                    base_tree: commitSHA,
                    message: 'Updated with HuC SPARQL Publisher',
                    parents: [commitSHA],
                });
                console.log("Tree created");
                const {
                    data: { sha: newCommitSHA },
                } = await document.client.git.createCommit({
                    owner: "robzeeman",
                    repo: "grlc-queries",
                    tree: currentTreeSHA,
                    message: `Updated with HuC SPARQL Publisher`,
                    parents: [commitSHA],
                });
                await document.client.git.updateRef({
                    owner: "robzeeman",
                    repo: "grlc-queries",
                    sha: newCommitSHA,
                    ref: "heads/main", // Whatever branch you want to push to
                });
                document.getElementById("mdForm").innerHTML = "Query committed";
                //console.log(commits);

            }

        }

        function build_rq() {
            const repo = document.getElementById("repo").value;
            const query_name = document.getElementById("query_name").value.split(".")[0] + ".rq";
            const token = document.getElementById("token").value;
            let content = "";
            content = content + singleMD("summary");
            content = content + singleMD("description");
            content = content + singleMD("endpoint");
            content = content + singleMD("pagination");
            content = content + singleMD("mime");
            content = content + singleMD("method");
            content = content + tagsMD();
            content = content + "\n" + yasgui.getTab().getQuery();
            return content;
        }

        function singleMD(objID) {
            const elem = document.getElementById(objID).value;
            if (elem !== undefined && elem.trim() !== "")  {
                return "#+  " + objID + ": " + document.getElementById(objID).value.trim() + "\n";
            } else {
                return "";
            }
        }

        function tagsMD() {
            let retStr = "";
            const tags = document.getElementById("tags").value;
            if (tags !== undefined && tags.trim() !== "") {
                retStr = "#+  tags:\n";
                const tagArray = tags.split(";");
                tagArray.forEach(function (item) {
                    if (item.trim() !== "")
                    {
                        retStr = retStr + "#+    - " + item.trim() + "\n";
                    }
                })
            }
            return retStr;
        }
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
        input.setAttribute("name", id);
        input.setAttribute("value", "");
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
            console.log(value);
            let opt = document.createElement("option");
            if (value === "0") {
                opt.value = "";
            } else {
                opt.value = values[value];
            }
            opt.text = values[value];
            input.append(opt);
        }
        cell.append(input);
        return cell;
    }


}