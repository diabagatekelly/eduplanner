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