const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/chatgpt", async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const { origin, length, activity, budget } = req.body || {};
  const input = `Hello I would like to travel from ${origin} with a budget of ${budget} for a length of ${length}. 
  My main interest is to experience ${activity}. Give me a list of destinations and accomodations recommendations and explain why they are good recommendations`;

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: input,
      temperature: 0.6,
      max_tokens: 4000,
    });

    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
});

// Export the Express API
module.exports = app;
