const docusign = require('../src/index');
const assert = require('assert');
const { JWTAuth } = require('./helpers');
let {
  SING_TEST1_FILE,
  EMAIL,
  apiClient,
  getSignerTabsDefinition
} = require('./constants');
const path = require('path');
const fs = require('fs');

let ACCOUNT_ID = '';

describe('FoldersApi Tests With Callbacks:', () => {
  before((done) => {
    try {
      JWTAuth(done).then((response) => {
        apiClient = response.apiClient;
        ACCOUNT_ID = response.ACCOUNT_ID;
        done();
      });
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });

  const envelopesApi = new docusign.EnvelopesApi(apiClient);
  const foldersApi = new docusign.FoldersApi(apiClient);

  it('moveEnvelopes should move the envelopes to the specified folder if the foldersRequest option is provided', (done) => {
    let fileBytes = null;
    try {
      // read file from a local directory
      fileBytes = fs.readFileSync(path.resolve(__dirname, SING_TEST1_FILE));
    } catch (ex) {
      // handle error
      console.log(`Exception: ${ex}`);
    }

    const envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = 'Please Sign my Node SDK Envelope';
    envDef.emailBlurb = 'Hello, Please sign my Node SDK Envelope.';

    // add a document to the envelope
    const doc = new docusign.Document();
    const base64Doc = Buffer.from(fileBytes).toString('base64');
    doc.documentBase64 = base64Doc;
    doc.name = 'TestFile.pdf';
    doc.documentId = '1';

    const docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    const signer1 = new docusign.Signer();
    signer1.email = EMAIL;
    signer1.name = 'Pat Developer';
    signer1.recipientId = '1';

    const signer2 = new docusign.Signer();
    signer2.email = 'another@email.com';
    signer2.name = 'Pat Manager';
    signer2.recipientId = '2';

    const tabs = getSignerTabsDefinition();
    signer1.tabs = tabs;
    signer2.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer1, signer2);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = 'sent';

    let envelopeId;

    const moveEnvelopesCallback = function (error, data, __response) {
      if (error) {
        console.error(error);
        return done(error);
      }
      assert.notStrictEqual(data, undefined);
      assert.notStrictEqual(data.envelopes, undefined);
      assert.notStrictEqual(data.envelopes[0], undefined);
      assert.strictEqual(data.envelopes[0].envelopeId, envelopeId);
      done();
    };

    const createEnvelopeCallback = function (error, data, __response) {
      if (error) {
        console.error(error);
        return done(error);
      }

      envelopeId = data.envelopeId;

      const foldersRequest = new docusign.FoldersRequest();
      foldersRequest.envelopeIds = [];
      foldersRequest.envelopeIds.push(envelopeId);

      foldersApi.moveEnvelopes(ACCOUNT_ID, 'recyclebin', { foldersRequest }, moveEnvelopesCallback);
    };

    envelopesApi.createEnvelope(ACCOUNT_ID, { envelopeDefinition: envDef }, createEnvelopeCallback);
  });
});
