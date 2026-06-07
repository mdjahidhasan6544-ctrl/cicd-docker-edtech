import app, { initializeApp } from "./app.js";

const port = process.env.PORT || 5000;

initializeApp()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
