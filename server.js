// Importing the express module
const express = require('express');
// Creating an instance of an Express application
const app = express();
// Defining the port number
const port = 3000;

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
