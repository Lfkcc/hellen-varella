import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`API em http://127.0.0.1:${config.port}`);
});
