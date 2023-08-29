import {User} from "../mongodb/models/user";

export class UserService {
  getAllUsers = async () => {
    return await User.find();
  };
   
  createUser = async (user) => {
    return await User.create(user);
  };
  getUserById = async (id) => {
    return await User.findById(id);
  };
   
  updateUser = async (id, user) => {
    return await User.findByIdAndUpdate(id, user);
  };
   
  deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
  };

}

 
