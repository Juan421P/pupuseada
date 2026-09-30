import { Collection, MongoClient } from "mongodb";
import type { LedgerData } from "../domain/Ledger.js";

interface LedgerDocument extends LedgerData {
  _id: string;
}

interface PhotoDocument {
  _id: string;
  contentType: string;
  data: Buffer;
}

export class Repository {
  private readonly client: MongoClient;
  private ledger!: Collection<LedgerDocument>;
  private photos!: Collection<PhotoDocument>;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Falta la variable de entorno MONGODB_URI");
    this.client = new MongoClient(uri, { promoteBuffers: true });
  }

  async init(): Promise<void> {
    await this.client.connect();
    const db = this.client.db(process.env.MONGODB_DB || "pupuseada");
    this.ledger = db.collection<LedgerDocument>("ledger");
    this.photos = db.collection<PhotoDocument>("photos");
  }

  async loadLedger(): Promise<LedgerData | null> {
    const doc = await this.ledger.findOne({ _id: "current" });
    if (!doc) return null;

    const { _id, ...data } = doc;
    return data;
  }

  async saveLedger(data: LedgerData): Promise<void> {
    const document: LedgerDocument = {
      _id: "current",
      ...data
    };

    await this.ledger.replaceOne(
      { _id: "current" },
      document,
      { upsert: true }
    );
  }

  async savePhoto(
    id: string,
    ext: string,
    contentType: string,
    bytes: Buffer
  ): Promise<string> {
    const filename = `${id}.${ext}`;

    const document: PhotoDocument = {
      _id: filename,
      contentType,
      data: bytes
    };

    await this.photos.replaceOne(
      { _id: filename },
      document,
      { upsert: true }
    );

    return `/photos/${filename}?v=${Date.now()}`;
  }

  async getPhoto(filename: string): Promise<PhotoDocument | null> {
    return this.photos.findOne({ _id: filename });
  }
}