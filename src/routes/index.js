const express = require('express')
const route = express.Router()
const SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'https://spotifyliked.herokuapp.com/callback'
});

route.get('/',(req, res)=>{
  var scopes=["user-library-read", "playlist-modify-private"]
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL)
})

route.get('/callback', async(req, res)=>{
  let authorizationCode = req.query.code
  const {expires_in, access_token, refresh_token } = (await spotifyApi.authorizationCodeGrant(authorizationCode)).body
  spotifyApi.setAccessToken(access_token);
  spotifyApi.setRefreshToken(refresh_token);
  res.redirect('/getTracks')
})

route.get('/getTracks', async(req, res)=>{
  const {id} = (await spotifyApi.getMe()).body
  const playlist = await spotifyApi.createPlaylist(`${id}`,'testPlaylist1', { 'public' : false })

  let tracks = {
    body : {
      next : 1
    }
  }

  for(var i = 0 ; tracks.body.next ; i += 50){
    tracks = await spotifyApi.getMySavedTracks({
      limit : 50,
      offset : i
    })
    let uris =  [...tracks.body.items].map(a => a.track.uri)
    await spotifyApi.addTracksToPlaylist(playlist.body.id,uris)
  }
  res.send('Playlist Created')
})


module.exports = route