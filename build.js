const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");

const { writeDocument } = require("./lib/templates");
const { getUnusedQuestions, loadQuestion } = require("./lib/questions");

const main = async () => {
  const sourcePath = "interviews";
  const interviews = await fs.readdir(sourcePath);

  await Promise.all(
    interviews.map(async (interview) => {
      const document = yaml.load(
        await fs.readFile(path.join(sourcePath, interview))
      );

      for (let i = 0; i < document.sections.length; i += 1) {
        const questions = document.sections[i].questions;
        if (!Array.isArray(questions) || questions.length < 1) {
          document.sections.splice(i, 1);
          i -= 1;
          continue;
        }

        document.sections[i].questions = await Promise.all(
          questions.map(loadQuestion)
        );
      }

      await writeDocument(document);
    })
  );

  const unused = await getUnusedQuestions();

  if (unused.length) {
    const list = unused.map((u) => `- ${u}`).join("\n");
    console.log("These questions are not used in any interview guides:");
    console.log(list);
  }
};

main();
