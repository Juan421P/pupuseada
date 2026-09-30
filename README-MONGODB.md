# MongoDB / Render migration

The app no longer persists ledger data or photos on the local filesystem.

## Environment variables

Set these on Render:

- `MONGODB_URI`: your MongoDB Atlas connection string.
- `MONGODB_DB`: optional database name; defaults to `pupuseada`.

## Local development

1. Create a MongoDB database and set the variables above.
2. Run `npm install`.
3. Run `npm run build`.
4. Run `npm start`.

## Render

Use:

- Build command: `npm install && npm run build`
- Start command: `npm start`

The ledger is stored as one document in the `ledger` collection with `_id: "current"`.
Photos are stored as BSON binary documents in the `photos` collection.

The first request to `/api/ledger` seeds the original `Seed` data only when the MongoDB ledger document does not exist.

No `data/` directory is created or required, so Render's ephemeral filesystem is not used for application persistence.
