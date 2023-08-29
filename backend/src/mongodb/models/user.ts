import mongoose, { Schema, Types } from 'mongoose';

interface IUser {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  accountType: string[],
  lastLogin: Date,
  activities?: Types.ObjectId,
  supervisorId?: Types.ObjectId,
  studentIds?: Types.ObjectId[],
  sessions?: Types.ObjectId[],
}

export const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  accountType: { type: [{type: String}], required: true },
  lastLogin: { type: Date, required: true, default: Date.now },
  activities: Schema.Types.ObjectId,
  supervisorId: Schema.Types.ObjectId,
  studentIds: [Schema.Types.ObjectId],
  sessions: [Schema.Types.ObjectId],
});

/** Create and export User model */
export const User = mongoose.model('User', userSchema);
