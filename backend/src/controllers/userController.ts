import {UserService} from "../services/userService";

export class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req, res) => {
    try {
      console.log('get all users conteoller')
      const users = await this.userService.getAllUsers();
      res.json({ data: users, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  createUser = async (req, res) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.json({ data: user, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  getUserById = async (req, res) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json({ data: user, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  updateUser = async (req, res) => {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json({ data: user, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  deleteUser = async (req, res) => {
    try {
      const user = await this.userService.deleteUser(req.params.id);
      res.json({ data: user, status: "success" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}


