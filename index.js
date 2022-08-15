const express = require('express');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET
} = process.env;

app.get('/:email', (req, res) => {
  const { email } = req.params;
  const accessToken = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET
  )
  accessToken.identity = email
  const grant = new VideoGrant()
  accessToken.addGrant(grant)
  const jwt = accessToken.toJwt()
  res.json({
    accessToken: jwt
  });
});

app.listen(port, () => {
  console.log('Example app listening on port 3000!');
});
