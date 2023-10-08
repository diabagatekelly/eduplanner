import { unlinkAccount } from "../api/controller";

class PopupUnlinkAccount {
  messageHeader: string;
  user: {email: string};
  student: {email: string};
  declare onError;
  declare onSuccess;

  constructor(onError, onSuccess, user, student) {
    this.messageHeader = 'Are you sure you want to delete this student?'
    this.user = user;
    this.student = student;
    this.onError = onError;
    this.onSuccess = onSuccess;
  }

  modalAction = async () => {
    try {
      const teacherRawData = { teacher: { email: this.user.email, addStudent: this.student.email } }
      const teacherResponse = await unlinkAccount(teacherRawData)
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

export default PopupUnlinkAccount;