export function populateUser() {
    return {
        type: 'POPULATE',
        allData: JSON.parse(sessionStorage.getItem('user_data')) || {}
    }
}

export function resetUser() {
    return {
        type: 'RESET'
    }
}

export function addNewStudent(newStudent) {
    const username = newStudent.username
    const newStudentObj = {
        [username]: newStudent
    }
    const currentUserData = JSON.parse(sessionStorage.getItem('user_data'))
    const updatedStudentIds = currentUserData.studentIds ? [...currentUserData.studentIds, newStudent.username] : [newStudent.username]
    const updatedStudents = currentUserData ? {...currentUserData.students, ...newStudentObj} : {...newStudentObj}
    currentUserData.studentIds = updatedStudentIds;
    currentUserData.students = updatedStudents;
    sessionStorage.setItem('user_data', JSON.stringify(currentUserData))
    return {
        type: 'EDIT',
        editProps: [
            {
                studentIds: updatedStudentIds
            },
            {
                students: updatedStudents
            }
        ]
    }

}