# GenChat Public Testing

## What testers need

- A Chromium browser such as Chrome, Brave, or Edge
- The `tester-extension.zip` file from the latest GitHub Release

No local server, model install, or API key setup is required for testers.

## Clean public flow

1. Keep the source repository clean and push code only
2. Deploy the API with `npm run deploy:api`
3. In GitHub, set the repository variable `GENCHAT_API_BASE_URL` to the deployed Worker URL
4. Run the `Public Tester Release` GitHub Actions workflow manually, or push a tag like `v0.1.0`
5. Let GitHub Actions build `tester-extension.zip`
6. Share the GitHub Release page with testers

## Tester install steps

1. Open the latest GitHub Release
2. Download `tester-extension.zip`
3. Extract the zip to a regular folder
4. Open `chrome://extensions`
5. Turn on `Developer mode`
6. Click `Load unpacked`
7. Select the extracted `tester-extension` folder
8. Visit a GenLayer docs page or relevant X/Twitter post
9. Open GenChat when the bubble appears

## Maintainer setup

1. Go to GitHub repository `Settings` > `Secrets and variables` > `Actions`
2. Add a repository variable named `GENCHAT_API_BASE_URL`
3. Set it to your deployed Worker URL, for example:

```text
https://genchat-api-production.genchat-vibecode.workers.dev
```

4. Open the `Actions` tab
5. Run `Public Tester Release`, or push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

6. After the workflow finishes, GitHub will have:
- a workflow artifact
- a GitHub Release with `tester-extension.zip` attached for tagged builds

## Before sharing publicly

- Check `https://<your-worker-url>/api/v1/health`
- Download the GitHub Release zip yourself once
- Load the unpacked extracted build yourself once
- Verify GenChat answers on at least:
  - one docs page
  - one X/Twitter post
  - one irrelevant page where the bubble should stay hidden
