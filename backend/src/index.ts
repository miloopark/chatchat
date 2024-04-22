// index.ts (For Firebase Functions)

import * as functions from 'firebase-functions';
import app from './app'; // Import the shared Express app

exports.api = functions.https.onRequest(app);