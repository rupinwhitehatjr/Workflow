/* **********************************************
Function Uses Gmail Api, reference plese visit to
https://developers.google.com/gmail/api

Files token.json & credentials.json is required
For Process to configure new "FROM" email address

Please visit https://console.cloud.google.com/
Login with project access id & get Client ID
& Client secret from Apis & Services followed by 
Credentials & choose project

Please Register your email account on redirect api
https://developers.google.com/oauthplayground
and authorise your app by entering
https://mail.google.com 
client id & secret id

Register gmail account for "FROM" address
*************************************************/

async function sendEmailHtml({ recipient, cc, from, subject, template }) {
    const readline = require('readline')
    const { google } = require('googleapis')

    const TOKEN_PATH = 'token.json'

    // Read & send applicability
    const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send'
    ]

    const fs = require('fs')

    // Authorise app by credentials.json
    fs.readFile('credentials.json', async (err, content) => {
        await authorize(JSON.parse(content));
    })

    // Auth required for login
    let oAuth2Client;

    function authorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.installed
        console.log("All credentials ------->", client_secret, client_id, redirect_uris)
        oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1])
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                return getNewToken(oAuth2Client)
            }
            oAuth2Client.setCredentials(JSON.parse(token))
        })
    }

    // Generate & store token
    async function getNewToken(oauth2Client) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                oauth2Client.setCredentials(token)
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                    if (err) return console.error(err)
                    console.log('Token stored to', TOKEN_PATH)
                })
            });
        });
    }

    // Encoded email
    function makeBody(to, cc, from, subject, message) {
        var str = ["Content-Type: text/html; charset=\"UTF-8\"\n",
            "MIME-Version: 1.0\n",
            "Content-Transfer-Encoding: 7bit\n",
            "to: ", to, "\n",
            "cc: ", cc, "\n",
            "from: ", from, "\n",
            "subject: ", subject, "\n\n",
            message
        ].join('');

        var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
        return encodedMail;
    }

    // Send email
    function sendMail(auth) {
        var raw = makeBody(recipient, cc, from, subject, template);
        const gmail = google.gmail({ version: 'v1', auth });
        gmail.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                raw: raw
            }

        }, function (err, response) {
            if (err) {
                console.log("This is error --------->", err.message)
            }
            else {
                console.log("This is response ------->", response.data)
            }
            return (err || response)
        });
    }
    setTimeout(async () => {
        var send = await sendMail(oAuth2Client)
    }, 10000)
}

module.exports = {
    sendEmailHtml
}