import app, { initializeApp } from "../src/app.js";

export default async function handler(req, res) {
  await initializeApp();
  return app(req, res);
}
