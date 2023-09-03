"use strict";

window.onload = main;

let repositoryURL = "https://api.github.com/repos/JasonS05/sololearn-archive/git/trees/main";
let readmeURL = "https://raw.githubusercontent.com/JasonS05/sololearn-archive/main/README.md";

async function main() {
	window.onload = function() {};

	let codeID = parseInt(new URLSearchParams(window.location.search).get("id"));
	let json = await getJSONfromURL(repositoryURL);

	if (isNaN(codeID)) {
		document.body.style = "font-family: helvetica;";

		let response = await fetch(readmeURL);
		let readme = await response.text();

		readme = readme.replace(/^\#([^\#].+)\n/gm, "</p><h1>$1</h1><p>");
		readme = readme.replace(/^\#\#\#(.+)\n/gm, "</p><h3>$1</h3><p>");
		readme = readme.replace(/```\S*((?:[^`]|`(?!``))*)```/g, "</p><pre>$1</pre><p>");
		readme = readme.replace(/\[([^\]]+)\]\(([^\)]*)\)/g, "<a href=\"$2\">$1</a>");
		readme = readme.replace(/\n+/g, "</p><p>");

		let body = `\t\t<p>\n${readme}\n\t\t</p>`;

		body += "\t\t<ul>\n"

		for (let i = 0; i < json.tree.length; i++) {
			if (json.tree[i].type === "tree" && json.tree[i].path.includes("[Web]")) {
				let name = json.tree[i].path;
				name = name.split(/^..../).join("");
				name = name.split(/\ \[Web\]/).join("");
				body += `\t\t\t<li><a href="?id=${i}">${name}</a></li>\n`;
			}
		}

		body += "\t\t</ul>";

		document.body.innerHTML = body;
	} else {
		let programJSON = await getJSONfromURL(json.tree[codeID].url);

		let htmlJSON = await getJSONfromURL(programJSON.tree[1].url);
		let cssJSON = await getJSONfromURL(programJSON.tree[0].url);
		let jsJSON = await getJSONfromURL(programJSON.tree[2].url);

		let html = base64toUTF8(htmlJSON.content);
		let css = base64toUTF8(cssJSON.content);
		let js = base64toUTF8(jsJSON.content);

		html = html.split("</body>").join(
`	<style type="text/css">
${css}
		</style>
		<script type="text/javascript">
${js}
		</script>
	</body>`);

		let body = document.getElementsByTagName("body")[0];
		let iframe = document.createElement("iframe");
		iframe.style = `
position: fixed;
top: 0px;
bottom: 0px;
left: 0px;
width: 100%;
border: none;
margin: 0;
padding: 0;
overflow: hidden;
height: 100%;
`;
		iframe.srcdoc = html;
		body.appendChild(iframe);
	}
}

async function getJSONfromURL(url) {
	let response = await fetch(url);

	if (response.status === 200) {
		return await response.json();
	} else {
		let resetTime = response.headers.get("x-ratelimit-reset") - Date.now() / 1000;
		let resetMinutes = Math.floor(resetTime/60);
		let resetSeconds = Math.floor(resetTime - resetMinutes * 60);

		if (resetMinutes > 1) {
			document.body.innerHTML = `<h1>Rate limit exceeded.</h1><p>The limit will be reset in ${resetMinutes} minutes and ${resetSeconds} seconds.</p>`;
		} else if (resetMinutes === 1) {
			document.body.innerHTML = `<h1>Rate limit exceeded.</h1><p>The limit will be reset in 1 minute and ${resetSeconds} seconds.</p>`;
		} else if (resetSeconds !== 1) {
			document.body.innerHTML = `<h1>Rate limit exceeded.</h1><p>The limit will be reset in ${resetSeconds} seconds.</p>`;
		} else {
			document.body.innerHTML = `<h1>Rate limit exceeded.</h1><p>The limit will be reset in 1 second.</p>`;
		}

		throw new Error("Rate limit exceeded.");
	}
}

// https://stackoverflow.com/a/64752311
function base64toUTF8(base64) {
    const text = atob(base64);
    const length = text.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = text.charCodeAt(i);
    }

    const decoder = new TextDecoder(); // default is utf-8
    return decoder.decode(bytes);
}

