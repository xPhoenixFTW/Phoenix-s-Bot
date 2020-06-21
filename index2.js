
var Client = require('mpp-client-xt');
const http = require("http");
const fs = require("fs");

var prefix = '`';
var proxies = [
    "socks4://60.239.219.65:1080",
];
let client = proxies.map((proxy, i) => {
    const client = new Client(null, proxy);
    client.setChannel("TPhoenix's Lobby");
    client.start();

    client.on('c', connect => {
        console.log('Connected.');
        client.setName("Phoenix's Bot  `help");
        play();
    });
    const getConnectedClients = () => client.filter(c => c.isConnected());
    const nextClient = noteNumber => getConnectedClients()[Math.floor(noteNumber / (127 / getConnectedClients().length))];
    var x = 0;

    function play() {
        var keyNameMap = require('./key-map.json');
        var MidiPlayer = require('midi-player-js');

        var Player = new MidiPlayer.Player(function(event) {
            if (
                event.name == 'Note off' ||
                (event.name == 'Note on' && event.velocity === 0)
            ) {
                client.stopNote(keyNameMap[event.noteName]);
                client.noteQuota.spend(1);
            } else if (event.name == 'Note on') {
                client.startNote(keyNameMap[event.noteName], event.velocity / 100);
            } else if (event.name == 'Set Tempo') {
                Player.setTempo(event.data);
            }
        });


        Array.prototype.random = function() {
            return this[(Math.random() * this.length) | 0];
        };
       
        client.on('a', msg => {

            console.log(`[${msg.p._id}] ${msg.p.name}: ${msg.a}`);

            let args = msg.a.split(' ');
            let cmd = args[0].toLowerCase();
            let argcat = msg.a.substring(cmd.length).trim();

            if (msg.a.startsWith(prefix + "stop")) {
                Player.stop();
            }

            if (msg.a.startsWith(prefix + "sustain")) {
                Player.sustain = !Player.sustain;
            }

            if (msg.a.startsWith(prefix + "help")) {
                client.say(`My commands: ${prefix}play <song>, ${prefix}load <midi url>, ${prefix}stop.`);
                return;
            }

            if (msg.a.startsWith(prefix + "info")) {
                client.say("This bot was created by Phoenix [!help], if you need any help with the bot he created, contact ꧁ 𝓟𝓱𝓸𝓮𝓷𝓲𝔁 ꧂#3520 on discord.");
                return;
            }

            if (msg.a.startsWith(prefix + "myid"))  client.say("Your ID is: " + msg.p._id);

            if (msg.a.startsWith(prefix + "prefix")) {
            prefix = args[1];
            client.say(`Your prefix was changed to ${prefix}`);
            return;
            }

            if (msg.a.startsWith(prefix + "play")) {
                try {
                    let input = msg.a.substr(6);
                    let midiList = fs.readdirSync("./midis/");
                    if (typeof input == "string" && input == "")
                        client.say(midiList.join(", "));
                    else {
                        let selectedMidiFileName = midiList
                            .filter(fileName => fileName.toLowerCase().includes(input.toLowerCase()))
                            .random();
                        Player.stop();
                        Player.loadFile(`./midis/${selectedMidiFileName}`);
                        Player.play();
                        client.say(
                            `Playing ${selectedMidiFileName.slice(
        0,
        selectedMidiFileName.endsWith(".mid")
          ? selectedMidiFileName.length - 4
          : selectedMidiFileName.length
      )}`
                        );
                    }
                } catch (err) {
                    client.say(
                        err.code == "ENOENT" ?
                        "File not found." :
                        typeof err.message == "string" ?
                        err.message :
                        err
                    );
                }

            }
           /* if (msg.a.startsWith(`${prefix}load`)) {
                let url = msg.a.substr(5);
                if (!url) client.say(`Usage: ${prefix}load <url>`);
                else {
                    try {
                        const file = fs.createWriteStream("midi.mid");
                        const request = http.get(args[1], function(response) {response.pipe(file)});
                        Player.stop();
                        setTimeout(() => {
                        Player.loadFile('./midi.mid');
                        }, 5000);
                        Player.play();
                        client.say("Downloading...");
                    } catch (error) {
                        client.say(error.message || error);
                    }
                }
            }*/
        });
        var NoteQuota = require('./NoteQuota.js');
        var noteQuota = client.noteQuota = new NoteQuota(function(points) {
            if (!points) {
                console.log("Switching client.");
                x = x++ % 10
            }
        });
        setInterval(function() {
            noteQuota.tick();

        }, 2000);

        client.on('nq', function(nq_params) {
            noteQuota.setParams(nq_params);
        });
    }
});

