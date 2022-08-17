const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const VoiceGrant = AccessToken.VoiceGrant;
const VoiceResponse = twilio.twiml.VoiceResponse;
const callerId = 'client:quick_start';
const defaultIdentity = 'quickstart';

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_PUSH_CREDENTIAL_SID,
  TWILIO_TWIML_APP_SID,
} = process.env;

app.get('/token/:email', (req, res) => {
  try {
    const { email } = req.params;
    const accessToken = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET
    );
    accessToken.identity = email;
    const videoGrant = new VideoGrant();
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      pushCredentialSid: TWILIO_PUSH_CREDENTIAL_SID,
    });
    accessToken.addGrant(videoGrant);
    accessToken.addGrant(voiceGrant);
    const jwt = accessToken.toJwt();
    res.json({
      accessToken: jwt,
    });
  } catch (error) {
    return res.send(error.toString());
  }
});

function makeCall(request, response) {
  try {
    console.log(request.body, request.query)
    let to = null;
    if (request.method == 'POST') {
      to = request.body.To;
    } else {
      to = request.query.To;
    }

    const voiceResponse = new VoiceResponse();

    if (!to) {
      voiceResponse.say(
        'Congratulations! You have made your first call! Good bye.'
      );
    } else {
      const dial = voiceResponse.dial({ callerId: callerId });
      dial.client(to);
    }
    return response.send(voiceResponse.toString());
  } catch (error) {
    return response.send(error.toString());
  }
}

async function placeCall(request, response) {
  try {
    // The recipient of the call, a phone number or a client
    let to = null;
    console.log(request.body, request.query)
    if (request.method == 'POST') {
      to = request.body.to;
    } else {
      to = request.query.To;
    }
    // The fully qualified URL that should be consulted by Twilio when the call connects.
    const url = request.protocol + '://' + request.get('host') + '/incoming';
    const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
      accountSid: TWILIO_ACCOUNT_SID,
    });
    let call;

    if (!to) {
      call = await client.api.calls.create({
        url: url,
        to: 'client:' + defaultIdentity,
        from: callerId,
      });
    } else {
      call = await client.api.calls.create({
        url: url,
        to: 'client:' + to,
        from: callerId,
      });
    }
    return response.send(call.sid);
  } catch (error) {
    return response.send(error.toString());
  }
}

function incoming(request, response) {
  try {
    const voiceResponse = new VoiceResponse();
    voiceResponse.say(
      'Congratulations! You have received your first inbound call! Good bye.'
    );
    return response.send(voiceResponse.toString());
  } catch (error) {
    return response.send(error.toString());
  }
}

function welcome(request, response) {
  try {
    const voiceResponse = new VoiceResponse();
    voiceResponse.say('Welcome to Twilio');
    return response.send(voiceResponse.toString());
  } catch (error) {
    return response.send(error.toString());
  }
}

app.route('/makeCall').get(makeCall).post(makeCall);
app.route('/placeCall').get(placeCall).post(placeCall);
app.route('/incoming').get(incoming).post(incoming);
app.route('/').get(welcome).post(welcome);

app.listen(port, () => {
  console.log('Example app listening on port 3000!');
});
