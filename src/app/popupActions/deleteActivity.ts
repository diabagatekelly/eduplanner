import { deleteActivity } from "../api/controller";

class PopupDeleteActivity {
  messageHeader: string;
  user: {email: string};
  activityName: string;
  declare onError;
  declare onSuccess;

  constructor(onError, onSuccess, user, activityName) {
    this.messageHeader = 'Are you sure you want to delete this activity?'
    this.user = user;
    this.activityName = activityName;
    this.onError = onError;
    this.onSuccess = onSuccess;
  }

  modalAction = async () => {
    try {
      const activityData = { email: this.user.email, activityName: this.activityName } 
      const response = await deleteActivity(activityData)
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

export default PopupDeleteActivity;