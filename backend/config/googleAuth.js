const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const Doctor = require('../models/Doctor');

const SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'openid',
  'email',
  'profile'
];

const CREDENTIALS_PATH = path.join(
  __dirname,
  '..',
  'google-oauth-client.json'
);

function getGoogleClientConfig() {

  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      'Google OAuth client file not found.'
    );
  }

  const credentials = JSON.parse(
    fs.readFileSync(
      CREDENTIALS_PATH,
      'utf-8'
    )
  );

  const installed =
    credentials.installed ||
    credentials.web;

  if (!installed) {
    throw new Error(
      'Invalid Google OAuth client file.'
    );
  }

  return {
    clientId: installed.client_id,
    clientSecret: installed.client_secret,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      installed.redirect_uris?.[0]
  };
}


// ============================================================
// CREATE OAUTH CLIENT
// ============================================================

function createOAuthClient() {

  const {
    clientId,
    clientSecret,
    redirectUri
  } = getGoogleClientConfig();

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}


// ============================================================
// GENERATE GOOGLE CONNECT URL
// ============================================================

function generateGoogleAuthUrl(doctorId) {

  const auth = createOAuthClient();

  const state = jwt.sign(
    {
      doctorId: doctorId.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '10m'
    }
  );

  const url = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
    include_granted_scopes: true
  });

  return url;
}


// ============================================================
// HANDLE GOOGLE CALLBACK
// ============================================================

async function handleGoogleCallback(
  code,
  state
) {

  if (!code || !state) {
    throw new Error(
      'Google authorization code or state is missing.'
    );
  }

  let decoded;

  try {

    decoded = jwt.verify(
      state,
      process.env.JWT_SECRET
    );

  } catch (error) {

    throw new Error(
      'Google authorization session expired. Please try again.'
    );
  }

  if (!decoded.doctorId) {
    throw new Error(
      'Invalid doctor authorization.'
    );
  }

  const doctor =
    await Doctor.findById(
      decoded.doctorId
    );

  if (!doctor) {
    throw new Error(
      'Doctor not found.'
    );
  }

  const auth =
    createOAuthClient();

  const {
    tokens
  } = await auth.getToken(code);

  auth.setCredentials(tokens);


  // ==========================================================
  // GET GOOGLE ACCOUNT EMAIL
  // ==========================================================

  const oauth2 =
    google.oauth2({
      auth,
      version: 'v2'
    });

  const userInfo =
    await oauth2.userinfo.get();

  const googleEmail =
    userInfo.data.email || '';


  // ==========================================================
  // SAVE GOOGLE OAUTH DETAILS
  // ==========================================================

  doctor.googleEmail =
    googleEmail;

  doctor.googleOAuth = {

    accessToken:
      tokens.access_token ||
      doctor.googleOAuth?.accessToken ||
      '',

    refreshToken:
      tokens.refresh_token ||
      doctor.googleOAuth?.refreshToken ||
      '',

    expiryDate:
      tokens.expiry_date ||
      doctor.googleOAuth?.expiryDate ||
      0

  };

  await doctor.save();


  return {
    doctor,
    googleEmail
  };
}


// ============================================================
// GET DOCTOR GOOGLE AUTH
// ============================================================

async function getDoctorGoogleAuth(
  doctorId
) {

  const doctor =
    await Doctor.findById(
      doctorId
    );

  if (!doctor) {
    throw new Error(
      'Doctor not found.'
    );
  }

  const googleOAuth =
    doctor.googleOAuth || {};

  if (
    !googleOAuth.refreshToken &&
    !googleOAuth.accessToken
  ) {

    throw new Error(
      'Doctor Google account is not connected. Please connect Google account first.'
    );
  }


  const auth =
    createOAuthClient();


  auth.setCredentials({

    access_token:
      googleOAuth.accessToken || undefined,

    refresh_token:
      googleOAuth.refreshToken || undefined,

    expiry_date:
      googleOAuth.expiryDate || undefined

  });


  // ==========================================================
  // SAVE NEW ACCESS TOKEN WHEN GOOGLE REFRESHES IT
  // ==========================================================

  auth.on(
    'tokens',
    async (tokens) => {

      try {

        const update = {};

        if (tokens.access_token) {
          update['googleOAuth.accessToken'] =
            tokens.access_token;
        }

        if (tokens.refresh_token) {
          update['googleOAuth.refreshToken'] =
            tokens.refresh_token;
        }

        if (tokens.expiry_date) {
          update['googleOAuth.expiryDate'] =
            tokens.expiry_date;
        }

        if (Object.keys(update).length > 0) {

          await Doctor.findByIdAndUpdate(
            doctorId,
            {
              $set: update
            }
          );
        }

      } catch (error) {

        console.error(
          'GOOGLE TOKEN UPDATE ERROR:',
          error.message
        );

      }

    }
  );


  return auth;
}


// ============================================================
// OLD COMMON AUTH
// Kept only for compatibility.
// Online consultation will NOT use this.
// ============================================================

const TOKEN_PATH = path.join(
  __dirname,
  '..',
  'google-token.json'
);

async function getGoogleAuth() {

  if (!fs.existsSync(TOKEN_PATH)) {

    throw new Error(
      'Google token not found.'
    );

  }

  const token =
    JSON.parse(
      fs.readFileSync(
        TOKEN_PATH,
        'utf-8'
      )
    );

  const auth =
    createOAuthClient();

  auth.setCredentials(token);

  return auth;
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  getGoogleAuth,

  getDoctorGoogleAuth,

  generateGoogleAuthUrl,

  handleGoogleCallback,

  TOKEN_PATH,

  CREDENTIALS_PATH

};