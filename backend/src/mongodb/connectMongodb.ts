import { MongoClient, Db } from 'mongodb';
import {config} from '../../environments';
import mongoose from 'mongoose';

export default class ConnectMongodb {
  constructor() { }

  async run() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = config.mongodb_uri

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client = new MongoClient(uri, { useUnifiedTopology: true });
     */
    const client = new MongoClient(uri);

    try {
      // Connect to the MongoDB cluster
      await client.connect();
      // Connect to Mongoose
      await this.connectMongoose(uri);
    } catch (e) {
      console.error(e);
    } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
    }
  }


  /**Connect Mongoose to MongoDb */
  private async connectMongoose(uri) {
    try {
      await mongoose.connect(uri);
    } catch {
      console.error
    }
  }
}





