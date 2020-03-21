# Migration Bot

This is Discord bot acts as a client to the Feirm Migration API.

## Configuration
1. Paste this into a file called `config.json` and edit it to your liking.
```json
{
    "token": "BOT_TOKEN",
    "prefix": "PREFIX",
    "api": "API_ENDPOINT"
}
```
2. Install the necessary dependencies
```bash
npm install
```
3. Run the bot
```bash
node index.js
```

## Available comamnds
```
!xfe.swap <NEW_BLOCKCHAIN_ADDRESS>
!xfe.swap-details <REQUEST_ID>