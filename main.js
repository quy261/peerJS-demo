
function openStream() {
    const props = {
        audio: true,
        video: true
    }

    return navigator.mediaDevices.getUserMedia(props); // tra ve promises
}

function playStream(idVideoTag, stream) {
    // lay ra the co id = idVideoTag
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}


// You can pick your own id or omit the id if you want to get a random one from the server.
const peer = new Peer('peerjsDemo', {
    host: "localhost",
    port: 9000,
    path: "/myapp",
});
peer.on('open', id => {
    $('#my-peer').append(id)
    // xu li SIGN_UP
    $('#btnSignUp').click(() => {
        const userName = $('#txtUserName').val();
        if (userName.length == 0) {
            // alert('Do not accept an empty userName!!');
            notif('Do not accept an empty userName!!', '#d2d447');
            return false;
        }
        const user = {
            name: userName,
            peerID: id
        }
        console.log(userName.length);
        socket.emit('SIGN_UP', user);
    })
});

// xử lí call phias nguươi nhaajn
$('#btnCall').click(() => {
    const id = $('#remoteID').val();

    openStream()
        .then(stream => {
            playStream('localStream', stream);
            const call = peer.call(id, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
})

// xu lí phia nguoi nhan
peer.on('call', call => {

    openStream()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
})

$('#div-video').hide();

// connect socket
const socket = io.connect('http://localhost:8080');
socket.on("connect", () =>
    console.log("User is connecting to server...")
)

// catch event ONLINE_LIST
socket.on('ONLINE_LIST', arr => {
    console.log("online list: ", arr);
    const currentUser = arr[arr.length - 1].
        $('#div-video').show();
    $('#div-sign-up').hide();
    arr.forEach(user => {
        $('#ul-list').append(`<li id='${user.peerID}' style="cursor: pointer;">${user.name}</li>`)
    });
    // catch event HAVE_A_NEW_USER
    socket.on('HAVE_A_NEW_USER', user => {
        notif(user.message, '#319de0');
        console.log("have a new user: ", user.name);
        $('#ul-list').append(`<li id='${user.peerID}' style="cursor: pointer;">${user.name}</li>`)
    })
    // catch event SOME_BODY_LEAVED
    socket.on('SOME_BODY_LEAVED', data => {
        $(`#${data.id}`).remove();
        notif(data.message, '#309de0');
    })
    // xu li chon user nhan cuoc goi
    $('#ul-list').on('click', 'li', function () {
        const id = $(this).attr('id');
        console.log("ID: ", id);
        openStream()
            .then(stream => {
                playStream('localStream', stream);
                const call = peer.call(id, stream);
                call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
            })
    });
})


// catch event FAILED_TO_SIGNUP
socket.on('FAILED_TO_SIGN_UP', async data => {
    // alert(data.message);
    console.log(data);
    await notif(data.message, '#d35c4f');
    $('#txtUserName').val('');
});

// xu li hien thi notif
function notif(message, color) {
    // document.getElementById('div-notif').removeAttribute('hidden');
    // document.getElementById('div-notif').innerHTML = message;
    // document.getElementById('div-notif').style.backgroundColor = color;
    $('#div-notif').show().html(message).css("background-color", color);
    setTimeout(() => {
        // document.getElementById('div-notif').hidden = true;
        $('#div-notif').hide();
    }, 7000)
}

