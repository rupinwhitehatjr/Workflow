async function oAuthGoogle(permisionType, callback) {
    const readline = require('readline')
    const { google } = require('googleapis')
    const TokenJson = require('./token.json')

    const TOKEN_PATH = 'token.json'

    // Read & send applicability
    const SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.file'
    ]

    const fs = require('fs')

    // Authorise app by credentials.json
    fs.readFile('credentials.json', async (err, content) => {
        authorize(JSON.parse(content));
    })

    // Auth required for login
    let oAuth2Client;

    function authorize(credentials) {
        const { client_secret, client_id, redirect_uris } = credentials.installed
        oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[1])
        if(TokenJson && permisionType && TokenJson[permisionType]) {
            oAuth2Client.setCredentials(TokenJson[permisionType])
            callback(oAuth2Client)
        } else if(TokenJson && permisionType && !TokenJson[permisionType]) {
            return getNewToken(oAuth2Client)
        }
    }

    // Generate & store token
    async function getNewToken(oauth2Client) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                oauth2Client.setCredentials(token)
                callback(oauth2Client)
                if(TokenJson) {
                    TokenJson[permisionType] = token
                }
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
                    if (err) return console.error(err)
                })
            });
        });
    }
}

module.exports = {
    oAuthGoogle: oAuthGoogle
}