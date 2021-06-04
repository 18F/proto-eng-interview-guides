const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");

const loadedQuestions = new Map();
const usedQuestions = new Set();

const fixup = (v) => {
  if (typeof v !== "object") {
    return { text: v, children: [] };
  }
  if (!Array.isArray(v.children)) {
    return { ...v, children: [] };
  }

  return { ...v, children: v.children.map(fixup) };
};

const loadQuestion = async (question) => {
  if (loadedQuestions.has(question)) {
    return loadedQuestions.get(question);
  }

  const q = yaml.load(
    await fs.readFile(path.join("questions", `${question}.yml`))
  );

  if (Array.isArray(q["follow ups"])) {
    q["follow ups"] = q["follow ups"].map(fixup);
  }
  if (Array.isArray(q.great)) {
    q.great = q.great.map(fixup);
  }
  if (Array.isArray(q.warning)) {
    q.warning = q.warning.map(fixup);
  }

  loadedQuestions.set(question, q);
  usedQuestions.add(question);

  return q;
};

const getUnusedQuestions = async () => {
  const questionFiles = await fs.readdir("questions");

  const all = new Set(questionFiles.map((f) => path.basename(f, ".yml")));
  usedQuestions.forEach((v) => all.delete(v));

  return Array.from(all);
};

module.exports = { getUnusedQuestions, loadQuestion };
