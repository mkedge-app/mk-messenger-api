import { Request, Response } from "express";
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import QRCode from 'qrcode';

class WppSessionController {
  async create(req: Request, res: Response) {
    async function connectToWhatsApp() {
      const { state, saveCreds } = await useMultiFileAuthState('tokens/auth_info_baileys')

      const sock = makeWASocket({ printQRInTerminal: true, auth: state });

      sock.ev.on('creds.update', (res) => {
        console.log('----------creds.update----------', res);
        saveCreds();
      })

      sock.ev.on('connection.update', (update) => {

        // Responder pelo nosso socket(qr, error);
        const { connection, lastDisconnect, qr } = update
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
          console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
          // reconnect if not logged out
          if (shouldReconnect) {
            connectToWhatsApp()
          }
        } else if (connection === 'open') {
          console.log('opened connection')
        }
      })

      return res.json({ ok: true })

      // sock.ev.on('messages.upsert', m => {
      //   console.log(JSON.stringify(m, undefined, 2))

      //   console.log('replying to', m.messages[0].key.remoteJid)
      //   await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
      // })
    }

    connectToWhatsApp();
  }
}

export default new WppSessionController();
