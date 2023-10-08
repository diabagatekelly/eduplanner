import { deleteUser } from "../api/controller";

class PopupDeleteAccount {
  messageHeader: string;
  user: {email: string};
  declare onError;
  declare onSuccess;

  constructor(onError, onSuccess, user) {
    this.messageHeader = 'Are you sure you want to delete your account forever?'
    this.user = user;
    this.onError = onError;
    this.onSuccess = onSuccess;
  }

  modalAction = async () => {
    try {
      const userDetails = { email: this.user.email }
      const response = await deleteUser(userDetails)
        .then(async (response) => {
          if (response.status !== 200) {
            this.onError(response.data.message)
          } else {
            this.onSuccess()
          }
        })
    } catch (error) {
      console.error(error)
      if (error.response) {
        this.onError(error.response.data.message)
      }
    }
  }
}

export default PopupDeleteAccount;