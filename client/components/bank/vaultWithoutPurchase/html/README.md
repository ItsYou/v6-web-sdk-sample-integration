# Bank ACH Save Payment Integration

This example demonstrates how to save a bank account (ACH) payment method using the PayPal v6 Web SDK **without requiring an immediate purchase**. This is also known as "vault without purchase" and is useful for scenarios like:

- Setting up recurring payments
- Subscription services
- Storing payment methods for future merchant-initiated transactions

## Overview

This integration uses the `createBankAchSavePaymentSession` method from the PayPal core-web-sdk to allow customers to securely link their bank account for future use.

## How It Works

1. **Client Token Generation**: The server generates a browser-safe client token
2. **SDK Initialization**: The PayPal Web SDK is loaded with the `bank-ach-payments` component
3. **Eligibility Check**: Check if Bank ACH is eligible for the customer
4. **Vault Setup Token**: Server creates a vault setup token for ACH
5. **Customer Authorization**: Customer authorizes linking their bank account through PayPal's UI
6. **Payment Token Creation**: Upon approval, a payment token is created and stored server-side for future use

## Running the Example

### Prerequisites

1. PayPal sandbox account with credentials configured in `.env`
2. Server running on port 8080

### Start the Server

From the repository root:

```bash
cd server/node
npm install
npm start
```

### Start the Client

From this directory:

```bash
npm install
npm start
```

The example will be available at `http://localhost:5174`

## Key Files

- **`src/index.html`**: Basic HTML page with the ACH save button
- **`src/app.js`**: Client-side integration logic using the PayPal Web SDK
- **`vite.config.js`**: Vite configuration for local development

## Server Endpoints Used

- `GET /paypal-api/auth/browser-safe-client-token`: Generate client authentication token
- `POST /paypal-api/vault/setup-token/create-ach`: Create vault setup token for ACH
- `POST /paypal-api/vault/payment-token/create`: Create payment token from vault setup token

## Payment Flow

```
Customer clicks "Save Bank Account"
         ↓
SDK checks ACH eligibility
         ↓
Server creates vault setup token
         ↓
PayPal displays bank linking UI
         ↓
Customer links bank account
         ↓
onApprove callback triggered
         ↓
Server creates payment token
         ↓
Payment token stored for future use
```

## Important Notes

- **Payment Token Storage**: The payment token ID should be stored securely in your database and **never** returned to the browser
- **Sandbox Environment**: This example uses the PayPal sandbox environment
- **Future Payments**: The stored payment token can be used to initiate payments when the customer is not present
- **Security**: Always validate and process payment tokens server-side

## Testing

Use PayPal sandbox test accounts to test the ACH linking flow. You can create sandbox accounts in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).

## Next Steps

After saving a payment method, you can use the stored payment token to:
- Create orders with the saved payment method
- Process recurring payments
- Implement subscription billing

Refer to the [PayPal Vault API documentation](https://developer.paypal.com/docs/api/vault/v2/) for more information on using saved payment methods.
