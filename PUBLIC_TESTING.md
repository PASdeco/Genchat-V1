# GenChat Public Testing

## What testers need

- A Chromium browser such as Chrome, Brave, or Edge
- The unpacked extension folder or the tester zip produced from `npm run release:tester`

No local server, model install, or API key setup is required for testers.

## Release flow

1. Deploy the API with `npm run deploy:api`
2. Update `apps/extension/.env` with the deployed Worker URL
3. Run `npm run release:tester`
4. Share either:
   - `release/tester-extension`
   - `release/tester-extension.zip`

## Tester install steps

1. Open `chrome://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select the `tester-extension` folder
5. Visit a GenLayer docs page or relevant X/Twitter post
6. Open GenChat when the bubble appears

## Before sharing publicly

- Check `https://<your-worker-url>/api/v1/health`
- Load the unpacked release build yourself once
- Verify GenChat answers on at least:
  - one docs page
  - one X/Twitter post
  - one irrelevant page where the bubble should stay hidden
