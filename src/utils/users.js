const users = [];

const addUser = ({id, username, room})=> {
    username = username.trim().toLowerCase(); 
    room = room.trim().toLowerCase(); 

    if(!username || !room){
        return {
            error: "username and room are required"
        }
    }

    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room;
    });

    if(existingUser){
        return{
            error: "Username is in use!"
        }
    }

    const user = { id, username, room };
    users.push(user);
    return { user };

}

const removeUser = (id)=>{
    if(!id){
        return {
            error: "Provide an ID to remove a user"
        }
    }

    const index = users.findIndex(user=> user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }else{
        return{
            error: "ID does not exist"
        }
    }

}

const getUser = (id)=> {
    if(!id){
        return {
            error: "Provide a valid ID to get a user."
        }
    }

    const user = users.find(user => user.id === id);
    return user;
}

const getUsersInRoom = (roomName)=>{
    roomName = roomName.trim().toLowerCase();
    if(!roomName){
        return {
            error: "Provide a valid room name"
        }
    }

    const usersInRoom = users.filter(user=> user.room === roomName);
    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}