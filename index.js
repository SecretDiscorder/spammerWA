const {
	MessageType,
	MessageOptions, MessageMedia,
	Mimetype,
	makeWASocket,
	useMultiFileAuthState,
	DisconnectReason
} = require("@whiskeysockets/baileys");


const express = require("express");
const app = express();
const qrcode = require('qrcode-terminal');
const keep_alive = require("./keep_alive.js");
async function connectToWhatsApp(){
	try{
		const{
			state,
			saveCreds
		} = await useMultiFileAuthState("auth_info_baileys");
		const sock = makeWASocket({
			auth: state,
			printQRInTerminal: true,
		});
		
		sock.ev.on('creds.update', saveCreds);
		
		sock.ev.on('connection.update', async (update)=>{
			const{
					connection,
					lastDisconnect
			} = update;
			
			if (connection === 'close'){
			
				const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
				console.log('connection close due to, ', lastDisconnect.error, ', reconnecting', shouldReconnect);
				if (shouldReconnect){
				
					await connectToWhatsApp();
					
				}
			} else if(connection === 'open'){
				console.log('Opened Connection');
			}
		});
		
		sock.ev.on('messages.upsert', async({ messages }) => {

			const msg = messages[0];
			var abc = JSON.stringify(msg, undefined, 2);
			console.log(abc);
			const args = msg.message.conversation.split(' ');
			const cmd = args[0];
			if (cmd === '!spam'){
				if (args.length != 3){
					await sock.sendMessage(msg.key.remoteJid,{
						text: 'Format yang benar !spam {string} [1]'
					});
        }else{
          const c = args[1];
          const b = parseInt(args[2]);
            while(b > 0){
              try{
              await sock.sendMessage(msg.key.remoteJid,{
                text: c.repeat(b)

              })
              }catch(error){
                console.log(error)
              }
            }
			  }
			}
			
		})
	}catch(error){
		console.log('terjadi kesalahan', error);
	
	}
	
	
}
connectToWhatsApp();