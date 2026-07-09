require("dotenv").config();
const { App } = require("@slack/bolt");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const YDKJS_BOOKS = [
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/get-started/README.md",
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/scope-closures/README.md",
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/objects-classes/README.md",
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/types-grammar/README.md",
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/sync-async/README.md",
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/2nd-ed/es-next-beyond/README.md",
];

let ydkjsContext = "";

async function loadYDKJS() {
  console.log("fetching the books");
  const fetches = await Promise.all(
    YDKJS_BOOKS.map((url) => fetch(url).then((response) => response.text())),
  );
  ydkjsContext = fetches.join("/n/n---/n/n");
  console.log("fetched all books");
}

function buildMessages(prompt) {
  return [
    {
      role: "system",
      content: `You are a JavaScript expert bot based on the "You Don't Know JS" (YDKJS) book series by Kyle Simpson.
                Use ONLY the following book content to answer questions. Always explain the "why" behind JS behavior.
                Be beginner friendly but technically accurate.

                YDKJS BOOKS CONTENT:
                ${ydkjsContext}`,
    },
    {
      role: 'user',
      content: prompt
    }
  ];
}
