const users = [];

//addUser 
const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    //validate
    if (!username || !room) {
        return {
            error: 'Username or room are required'
        }
    }
    //check for existing users
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //validate existing user
    if (existingUser) {
        return {
            error: 'Username taken'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user);
    return { user };
}

// addUser({
//     id: 22,
//     username: 'Lisa',
//     room: 'test'
// })

// addUser({
//     id: 44,
//     username: 'mike',
//     room: 'test'
// })




//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}



//getUser 
const getUser = (id) => {
    return users.find((user) => user.id === id);
    // if (!userN) {
    //     return console.log('user not found')
    // }
    console.log(userN.username);
}


//getUsersInRoom 
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

const check = getUsersInRoom('test');
console.log(check)



module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}