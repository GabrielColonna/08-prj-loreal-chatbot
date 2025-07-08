/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "L'Oréal Smart Product Advisor joined the chat...";

// Store the conversation history
const conversation = [
  {
    role: "system",
    content:
      "You are Ash, the energetic AI chatbot for L’Oréal Paris. Your sole task is to answer questions about L’Oréal Paris products, routines, and beauty tips. Use short, peppy replies in Markdown: Begin each conversation with a friendly greeting and end with a light sign-off . If a user asks anything not related to L’Oréal Paris, politely say: “Sorry, I can only help with L’Oréal Paris products and routines! 😊”  Always keep responses concise to maintain engagement",
  },
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const message = userInput.value;

  // Add user's message to conversation history
  conversation.push({ role: "user", content: message });

  // Show user's message in the chat window
  chatWindow.innerHTML += `<div class="user-msg">${message}</div>`;

  // Show loading message
  const loadingId = `loading-${Date.now()}`;
  chatWindow.innerHTML += `<div class="bot-msg" id="${loadingId}">Thinking...</div>`;

  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Prepare the API request
  // This uses your Cloudflare Worker as the backend for OpenAI API calls
  const endpoint = "https://loreal-chat-bot-worker.gcolo042.workers.dev/";
  const headers = {
    "Content-Type": "application/json",
    // No Authorization header needed for Cloudflare Worker
  };
  const body = JSON.stringify({
    model: "gpt-4o",
    messages: conversation,
  });

  try {
    // Make the API call
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await response.json();

    // Get the assistant's reply
    const reply =
      data.choices && data.choices[0] && data.choices[0].message.content
        ? data.choices[0].message.content
        : "Sorry, I couldn't get a response.";

    // Add assistant's reply to conversation history
    conversation.push({ role: "assistant", content: reply });

    // Remove the loading message
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();

    // Show the assistant's reply
    chatWindow.innerHTML += `<div class="bot-msg">${reply}</div>`;
  } catch (error) {
    // Remove the loading message
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.remove();
    chatWindow.innerHTML += `<div class="bot-msg error">Error: ${error.message}</div>`;
  }

  // Clear the input
  userInput.value = "";
  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
