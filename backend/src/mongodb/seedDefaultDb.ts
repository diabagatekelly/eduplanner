import { MongoClient } from 'mongodb';
import { config } from '../../environments';
import mongoose from 'mongoose';
import { User } from './models/user';
import { Card } from './models/card';

/**
 * Seed our database with some default collections that are user-created
 */
export default class SeedDefaultDb {
  /**
   * Connect to MongoDb and Mongoose and create/seed specified collections
   */
  async run() {
    const uri = config.mongodb_uri;
    const client = new MongoClient(uri);

    try {
      await client.connect();
      await mongoose.connect(uri);
      await this.seedAdminUser()
      await this.seedMathCard()
      await this.listDatabases(client);

    } finally {
      // Close the database connection when finished or an error occurs
      await mongoose.disconnect()
      await client.close();
    }
  }

  /**
   * Create and seed the admin user.
   */
  private async seedAdminUser() {
    const user = new User({
      firstName: 'Kelly',
      lastName: 'Diabagate',
      username: 'sysadmin',
      email: 'diabagatekelly@yahoo.fr',
      password: 'sysadmin',
      accountType: ['admin', 'supervisor']
    });
    await user.save();
  }

  /**
   * Create and seed the math card.
   */
  private async seedMathCard() {
    const mathCard = new Card({
      name: 'Math Facts',
      frequency: 'daily',
      description: 'Review your math facts using Xtramath',
      points: 5,
    });
    await mathCard.save();
  }

  /**
   * Print the names of all available databases
   * @param {MongoClient} client A MongoClient that is connected to a cluster
   */
  private async listDatabases(client: MongoClient) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  };
}
