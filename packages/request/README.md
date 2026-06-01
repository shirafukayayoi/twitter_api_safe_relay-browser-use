# twitter-api-safe-request

Safe request helpers for Twitter/X web API access through a browser page bridge.

```ts
import { createTwitterBrowser } from "twitter-api-safe-request";
import { launchBrowserUse } from "twitter-api-safe-relay";

const browser = await launchBrowserUse({
  userDataDir: "./user_data/account1",
  headless: false,
});
const page = await browser.newPage();
const client = createTwitterBrowser(page);
await client.inject();
await client.goto("https://x.com/home");

const result = await client.graphQLFullResponse(
  {
    queryId: "query-id",
    operationName: "OperationName",
    operationType: "query",
    metadata: {
      featureSwitches: [],
      fieldToggles: [],
    },
  },
  {},
);
```
