import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  ...next,
  {
    ignores: [
      "bot/**",
      "pairing-portal/**",
      "admin-portal/**",
      "temp_sessions/**",
      "session/**"
    ]
  },
  {
    rules: {
      "react-hooks/rules-of-hooks": "error"
    }
  }
]);
