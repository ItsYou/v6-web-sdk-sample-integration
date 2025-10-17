# Bank ACH One-time Payment Sample Integration

This is a demo of how to integration Bank ACH One-time payment via PayPal Web SDK v6. Paypal SDK lets merchants provide Bank ACH as a payment method via plain HTML and javascript. 

## 🏗️ Architecture Overview

This sample demonstrates a complete Bank ACH integration flow: 

1. Initialize PayPal Web SDK with Bank ACH component
2. Create an order and authenticate payer's bank account
3. Handle bank ACH validation and order completion

### Prerequisites
Before running this demo, you'll need to set up accounts and configure your development environmnet

1. **PayPal Developer Account**
   - Visit [developer.paypal.com](https://developer.paypal.com)
   - Sign up for a developer account or log in with existing credentials
   - Navigate to the **Apps & Credentials** section in your dashboard

2. **Create a PayPal Application** (or configure the default application)
   - Click **Create App**
   - Name your app
   - Select **Merchant** under **Type**
   - Choose the **Sandbox** account for testing
   - Click **Create App** at the bottom of the modal
   - Enable **Features** -> **Accept payments** -> **Bank ACH** (be sure to click **Save Changes** below)
   - Note your **Client ID** and **Secret key** under **API credentials** for later configuration of the `.env` file

   ![Screenshot](images/enable-bank-ach.jpg)

## How to Run Locally

Update the `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET` in `.env` file in the root directory of this project with your sandbox application's client ID and secret 

```bash
npm install
npm start
```

- The Bank ACH demo will be available at [http://localhost:3000](http://localhost:3000).
- The backend API server (see instructions in `/server/node/README.md`) must also be running on [http://localhost:8080](http://localhost:8080).


## File Structure

- [`src/index.html`](src/index.html): Main HTML page for the Bank ACH demo.
- [`src/app.js`](src/fastlaneSdkComponent.js): Loads the PayPal SDK and initializes Fastlane.