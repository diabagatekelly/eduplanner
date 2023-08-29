import mongoose, { Schema, Types } from 'mongoose';

interface ICard {
  name: string,
  frequency: string,
  description: string,
  decks?: Types.ObjectId,
  queue?: string[],
  points: number,
}

const cardSchema = new Schema<ICard>({
  name: { type: String, required: true },
  frequency: { type: String, required: true },
  description: { type: String, required: true },
  decks: Schema.Types.ObjectId,
  queue: [String],
  points: { type: Number, required: true },
});

/** Create and export Card model */
export const Card = mongoose.model('Card', cardSchema);

