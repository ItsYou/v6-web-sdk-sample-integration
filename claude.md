# PayPal v6 Web SDK Sample Integration

This repository contains sample integrations demonstrating how to use PayPal's v6 Web SDK for various payment scenarios.

## Project Overview

This is a **demonstration repository** maintained by PayPal that provides working examples of:
- One-time payments with different payment methods (PayPal, Venmo, Google Pay, Apple Pay)
- Saving payment methods for future transactions (vaulting)
- PayPal Pay Later messaging
- Fastlane integration
- Guest checkout flows

The repository includes both **client-side** and **server-side** implementations to showcase full payment flows.

## Repository Structure

```
.
├── client/
│   ├── components/          # Individual component examples
│   │   ├── applePay/
│   │   ├── fastlane/
│   │   ├── googlePayPayments/
│   │   ├── paypalGuestPayments/
│   │   ├── paypalMessages/
│   │   ├── paypalPayments/
│   │   └── venmoPayments/
│   └── prebuiltPages/       # Complete page examples
│       └── react/
└── server/
    └── node/                # Node.js Express server with PayPal SDK integration
```

## Technology Stack

**Server:**
- Node.js with Express
- PayPal Server SDK
- RESTful API endpoints for order creation, capture, and authentication

**Client:**
- Multiple implementations: HTML/JavaScript, React, TypeScript
- PayPal JavaScript SDK v6
- Various payment component integrations

## Development Setup

1. **Environment Variables:**
   - Copy `.env.sample` to `.env`
   - Add your `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET`
   - Obtain credentials from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

2. **Server Setup:**
   ```bash
   cd server/node
   npm install
   npm start
   ```

3. **Client Setup:**
   Navigate to any example directory and run:
   ```bash
   npm install
   npm start
   ```

## Key API Endpoints

The Node.js server provides these main endpoints:

- `GET /paypal-api/auth/browser-safe-client-token` - Generate client authentication token
- `POST /paypal-api/checkout/orders/create-with-sample-data` - Create PayPal order
- `POST /paypal-api/checkout/orders/{orderId}/capture` - Capture completed order

## Important Notes

- This is a **sample/demo repository** - not production code
- Examples use PayPal Sandbox environment for testing
- Each client example has its own README with specific setup instructions
- Google Pay requires additional sandbox account configuration
- The repository demonstrates various integration patterns - choose the one that fits your stack
