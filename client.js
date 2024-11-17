const io = require("socket.io-client");
const readline = require("readline");
const crypto = require ("crypto"); //module untuk penggunaan hash


const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

// function untuk melihat apakah client sudah connect kedalam server atau belum
socket.on("connect", () => {
    console.log("Connected to the server");

// Input username dari client yang masuk kedalam server  
    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Wellcome, ${username} to the chat`);
        rl.prompt();

//  Mengambil objek pesan sebelum di klik "enter" oleh user
        rl.on("line", (message) => {
            if(message.trim()){

// Fungsi untuk membuat hash dari pesan asli
                const hash = hashgenerate(message);

// Sebuah code mengirim objek pesan, nama, dan hash yang telah dibuat
                socket.emit("message", { username, message, hash});
            }
            rl.prompt();
        });
    });
});



socket.on("message", (data) => {
    const { username : senderUsername, message: senderMessage, hash : pengirimHash } = data;

// Fungsi untuk melihat apakah pesan dari user/client telah dimodifikasi atau di hack oleh server
    const acchash = hashgenerate(senderMessage.replace("(modified by server)", ""));
    const tampered = acchash != pengirimHash;


    if ( senderUsername != username )
    {
        console.log(`${senderUsername}: ${senderMessage}`);
        if (tampered) {
            console.log("warning: this message has been modified by the server!");
        }
        rl.prompt();
    }
});


socket.on("disconnect", () => {
    console.log("Server Disconnected, Exiting.....");
    rl.close();
    process.exit(0);
});


rl.on("SIGINT", () => {
    console.log("\nExiting.....");
    socket.disconnect();
    rl.close();
    process.exit(0);
});

const hashgenerate = (message) => {
    return crypto.createHash(`sha256`).update(message).digest(`hex`);
};