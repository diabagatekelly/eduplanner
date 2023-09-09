const INITIAL_STATE = {}

export default function user(userData = INITIAL_STATE, action: {type: string, userInfo?: string, editProps?: {propKey: any}[],  allData?: {}}) {
    switch(action.type) {
        case 'SCAN':
            return {...userData}

        case 'QUERY':
            return userData[action.userInfo]
        
        case 'EDIT':
            action.editProps.forEach((prop) => {
                const key = Object.keys(prop)
                const value = Object.keys(prop)
                userData[key[0]] = value[0]
            })
            return {...userData}

        case 'POPULATE': 
            return {...userData, ...action.allData}
            
        case 'RESET': 
            userData = {}
            return {...userData}

        default:
            return userData;
    }
}