//elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const sendButton = document.getElementById("send-location");
const messages = document.getElementById("messages");

//templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-message-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

const autoScroll = () => {
    //#region autoscroll without interation
    // messages.scrollTop = messages.scrollHeight;
    //#endregion

    //#region autoscroll with interaction

    //new message element
    const newMessage = messages.lastElementChild;

    //height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = messages.offsetHeight;

    //height of messages container
    const containerHeight = messages.scrollHeight;

    //How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight;
    }

    //#endregion

}

socket.on('message', (messageData) => {
    // console.log(messageData)
    const html = Mustache.render(messageTemplate, {
        username: messageData.username,
        message: messageData.text,
        createdAt: moment(messageData.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll();
})

socket.on("locationMessage", (currentLocation)=>{
    // console.log(currentLocation);
    const html = Mustache.render(locationTemplate, {
        username: currentLocation.username,
        url: currentLocation.url,
        createdAt: moment(currentLocation.createdAt).format("h:mm a")
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on("roomData", ({ room, users })=>{
    const sidebar = document.getElementById("sidebar");
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html;
})

socket.emit("join", { username, room }, (error)=>{
    if(error){
        alert(error);
        location.href = "/";
    }
});

//#region To send the message 

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();//To prevent default action of submit buttom
    $messageFormButton.setAttribute("disabled", "disabled");
    const text = e.target.elements.inputText.value;
    //Emits 'sendMsg' event by passing the text as a parameter.
    socket.emit("sendMsg", text, (message)=>{
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
    });
})

socket.on("brd", (msg) => {
    console.log(msg);
})
//#endregion

//#region to send current geolocation
sendButton.addEventListener("click", (e) => {
    if(!navigator.geolocation){
        return alert("Geolacation not supported in this browser.")
    }
    sendButton.setAttribute("disabled", "disabled");
    return navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", { latitude: position.coords.latitude, longitude: position.coords.longitude }, (msg)=>{
            // if(msg){
            //     console.log(msg);
            // }
            console.log("location shared!");
            sendButton.removeAttribute("disabled");
        });
    })
})
//#endregion