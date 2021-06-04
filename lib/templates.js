const fs = require("fs").promises;
const path = require("path");
const { render } = require("mustache");

const partials = {
  nested_list_html: `{{#children.length}}
<ul>
{{#children}}
<li>{{ text }}</li>
{{> nested_list_html}}
{{/children}}
</ul>
{{/children.length}}
`,
  nested_list_md: `{{#children.length}}
{{#children}}
- {{ text }}
{{> nested_list_md }}
{{/children}}
{{/children.length}}`
};

const loadTemplates = async () => {
  const a = fs.readFile(path.join("templates", "private-guide.mustache"), {
    encoding: "utf-8",
  });
  const b = fs.readFile(path.join("templates", "public-guide.mustache"), {
    encoding: "utf-8",
  });

  const [y, z] = await Promise.all([a, b]);
  return {
    private: y,
    public: z,
  };
};

const writeToDisk = async (document, template, subDirectory) => {
  const dir = path.join("output", subDirectory);
  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(
    path.join(dir, `${document.title}.md`),
    render(template, document, partials)
  );
};

const writeDocument = async (document) => {
  const { private, public } = await loadTemplates();
  await Promise.all([
    writeToDisk(document, private, "private"),
    writeToDisk(document, public, "public"),
  ]);
};

module.exports = { writeDocument };
