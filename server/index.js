const express = require("express");
const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","Origin, X - Requested - With, Content - Type, Accept");
    next();
});

const server = app.listen(8080, () => {
    console.log("Server is running on port ", 8080);
})

const io = require('socket.io')(server,
    {
        // fix CORS
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }
);

let userInfoArr = [];

io.sockets.on('connection', socket => {
    console.log('connecting...')
    console.log(socket.id);

    // catch event SIGN_UP
    socket.on('SIGN_UP', user => {
        const isExist = userInfoArr.some(e => e.name === user.name);
        if (isExist) return socket.emit('FAILED_TO_SIGN_UP', { message: "Please try again because this username is aready used!!!" })
        socket.peerID = user.peerID;
        userInfoArr.push(user);
        // tra ve danh sach user
        socket.emit('ONLINE_LIST', userInfoArr);
        // tra ve nguoi dung moi
        user.message = 'Have a new user joined !!! ' + user.name;
        socket.broadcast.emit('HAVE_A_NEW_USER', user);
    })

    // event disconnect
    socket.on('disconnect', () => {
        // lay ra index
        const index = userInfoArr.findIndex(user => user.peerID === socket.peerID);
        // xoa khoi mang user
        userInfoArr.splice(index, 1);
        const data = {
            id: socket.peerID,
            message: socket.peerID + ' left this video stream !!!'
        }
        io.emit('SOME_BODY_LEAVED', data);
    })
})
