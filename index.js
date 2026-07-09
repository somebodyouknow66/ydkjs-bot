require('dotenv').config({ path: '/root/ydkjs-bot/.env' });
const { App } = require("@slack/bolt");
const Groq = require('groq-sdk');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

function buildMessages(question) {
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
      content: question,
    }
  ];
}


app.command('/ydkjs-ask', async({ command, ack, respond }) => {
  await ack();

  const question = command.text;
  if (!question) {
    await respond('Please ask a question! Example: `ydkjs-ask what is a closure?`');
    return
  }

  await respond({text: 'checking the ydkjs books....'});

  try {
    const result = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: buildMessages(question),
    });
    await respond({ text: result.choices[0].message.content })
  } catch (err) {
    console.error(err);
    await respond({ text: 'Something went wrong. Try again.' })
  }
});


(async () =>{
  try{
    await loadYDKJS();
    await app.start();
    console.log('bot is running')
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1)
  }
})