# PayPal Core Web SDK Analysis

## Overview

The **PayPal Core Web SDK** (v6) is a client-side JavaScript SDK loaded from `https://www.sandbox.paypal.com/web-sdk/v6/core` that provides a unified interface for integrating various PayPal payment methods and features.

## SDK Architecture

### 1. Global Entry Point

The SDK exposes a global `window.paypal` object that serves as the main entry point for all integrations.

### 2. SDK Instance Creation

```javascript
const sdkInstance = await window.paypal.createInstance({
  clientToken,        // Browser-safe client token from server
  components,         // Array of component names to load
  pageType,          // Context: "checkout", "product", etc.
});
```

**Parameters:**
- `clientToken` (string): Server-generated browser-safe authentication token
- `components` (array): List of components to initialize (e.g., `["paypal-payments"]`, `["bank-ach-payments"]`)
- `pageType` (string): Page context for optimization and UX

### 3. Component Types

Based on the codebase analysis, the SDK supports these component types:

| Component Name | Purpose | Used For |
|----------------|---------|----------|
| `paypal-payments` | PayPal, PayLater, PayPal Credit | One-time and save payment sessions |
| `venmo-payments` | Venmo payments | One-time payment sessions |
| `googlepay-payments` | Google Pay | One-time payment sessions |
| `bank-ach-payments` | Bank ACH (US) | Save payment sessions (vault) |
| `fastlane` | Fastlane checkout | Guest checkout experiences |
| (Apple Pay via different integration) | Apple Pay | One-time payments |

### 4. Payment Flow Types

The SDK supports two main payment flows:

1. **One-Time Payment**: Immediate purchase transactions
2. **Vault Without Payment**: Save payment method for future use

## BankACHSavePaymentSession Implementation

### Purpose

`BankACHSavePaymentSession` enables merchants to collect and save customer bank account details (ACH) for future payments **without requiring an immediate purchase**. This is ideal for:

- Subscription services
- Recurring billing
- Merchant-initiated transactions
- Usage-based billing

### Integration Pattern

#### Step 1: Load SDK with Bank ACH Component

```javascript
const sdkInstance = await window.paypal.createInstance({
  clientToken: await getBrowserSafeClientToken(),
  components: ["bank-ach-payments"],
  pageType: "checkout",
});
```

#### Step 2: Check Eligibility

```javascript
const paymentMethods = await sdkInstance.findEligibleMethods({
  currencyCode: "USD",
  paymentFlow: "VAULT_WITHOUT_PAYMENT",  // Key for save payment
});

if (paymentMethods.isEligible("bank-ach")) {
  // Bank ACH is available for this customer
}
```

**Key Points:**
- `paymentFlow: "VAULT_WITHOUT_PAYMENT"` indicates vaulting intent
- Eligibility depends on buyer location, merchant configuration, and compliance
- ACH is typically US-only

#### Step 3: Create Payment Session

```javascript
const achPaymentSession = sdkInstance.createBankAchSavePaymentSession(
  paymentSessionOptions
);
```

**Method Signature:**
```typescript
createBankAchSavePaymentSession(options: PaymentSessionOptions): BankACHSavePaymentSession
```

#### Step 4: Configure Session Options

```javascript
const paymentSessionOptions = {
  async onApprove(data) {
    // Called when customer approves bank linking
    // data contains: { vaultSetupToken }
    console.log("Vault Setup Token:", data.vaultSetupToken);

    // Convert setup token to payment token on server
    await createPaymentToken(data.vaultSetupToken);
  },

  onCancel(data) {
    // Called when customer cancels the flow
    console.log("Customer cancelled");
  },

  onError(error) {
    // Called on errors during the flow
    console.error("Error:", error);
  },
};
```

**Callback Parameters:**

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onApprove` | `data: { vaultSetupToken: string }` | Fired when customer successfully authorizes bank account linking |
| `onCancel` | `data: {}` | Fired when customer cancels the authorization flow |
| `onError` | `error: Error` | Fired when an error occurs |

#### Step 5: Start the Session

```javascript
await achPaymentSession.start(
  { presentationMode: "auto" },
  createVaultSetupToken()
);
```

**Parameters:**
1. **Presentation Options:**
   - `presentationMode: "auto"` - SDK chooses best UX (popup, redirect, etc.)
   - `presentationMode: "redirect"` - Force redirect flow
   - `presentationMode: "popup"` - Force popup flow

2. **Vault Setup Token Provider:**
   - Function or Promise that returns `{ vaultSetupToken: string }`
   - Must be created server-side via PayPal Vault API
   - Uniquely identifies this vaulting session

## Payment Session Comparison

### Common Pattern Across All Payment Types

All payment session types follow this unified pattern:

```javascript
// 1. Create SDK instance
const sdkInstance = await window.paypal.createInstance({ ... });

// 2. Check eligibility
const methods = await sdkInstance.findEligibleMethods({ ... });

// 3. Create session
const session = sdkInstance.create<PaymentMethod><FlowType>Session(options);

// 4. Start session
await session.start(presentationOptions, paymentData);
```

### Session Types by Payment Method

| Payment Method | One-Time Payment | Save Payment (Vault) |
|----------------|------------------|----------------------|
| PayPal | `createPayPalOneTimePaymentSession()` | `createPayPalSavePaymentSession()` |
| Venmo | `createVenmoOneTimePaymentSession()` | ❌ Not available |
| Google Pay | `createGooglePayOneTimePaymentSession()` | ❌ Not available |
| Bank ACH | ❌ Not available | `createBankAchSavePaymentSession()` |
| PayLater | `createPayLaterOneTimePaymentSession()` | ❌ Not available |
| PayPal Credit | `createPayPalCreditOneTimePaymentSession()` | ❌ Not available |

### Data Flow Differences

**One-Time Payment:**
```
start({ presentationMode }, createOrder)
  ↓
onApprove({ orderId })
  ↓
captureOrder(orderId)
```

**Save Payment (Vault):**
```
start({ presentationMode }, createVaultSetupToken)
  ↓
onApprove({ vaultSetupToken })
  ↓
createPaymentToken(vaultSetupToken)
  ↓
Store payment token in database
```

## Server-Side Integration

### Required API Endpoints

For Bank ACH vault without purchase, you need:

1. **Generate Client Token**
   ```
   GET /paypal-api/auth/browser-safe-client-token
   ```
   Returns browser-safe authentication token

2. **Create Vault Setup Token**
   ```
   POST /paypal-api/vault/setup-token/create-ach
   ```
   Creates a vault setup token for ACH

   Request body (server-side):
   ```json
   {
     "paymentSource": {
       "bank": {
         "achDebit": {
           "billingAddress": {
             "countryCode": "US"
           },
           "experienceContext": {
             "cancelUrl": "https://example.com/cancelUrl",
             "locale": "en-US",
             "returnUrl": "https://example.com/returnUrl"
           },
           "verification": {
             "paypal": {
               "method": "INSTANT_ACCOUNT_VERIFICATION"
             }
           }
         }
       }
     }
   }
   ```

3. **Create Payment Token**
   ```
   POST /paypal-api/vault/payment-token/create
   ```
   Converts vault setup token to payment token

   Request body:
   ```json
   {
     "vaultSetupToken": "<token-from-onApprove>"
   }
   ```

## Security Considerations

### Critical Security Rules

1. **Never expose payment tokens to the client**
   - Payment tokens must be stored server-side only
   - They represent the ability to charge the customer

2. **Client token vs Payment token**
   - **Client Token**: Browser-safe, temporary, limited scope
   - **Payment Token**: Sensitive, long-lived, allows charging

3. **Server-side validation**
   - Always validate vault setup tokens server-side
   - Verify the token belongs to your merchant account
   - Check for fraud indicators

### Best Practices

```javascript
// ❌ WRONG - Never do this
async onApprove(data) {
  const paymentToken = await createPaymentToken(data.vaultSetupToken);
  return paymentToken.id; // DON'T return to client!
}

// ✅ CORRECT - Store server-side
async onApprove(data) {
  await createPaymentToken(data.vaultSetupToken);
  return { status: "SUCCESS", message: "Bank account saved" };
}
```

## Error Handling

### Common Error Scenarios

1. **Eligibility Errors**
   - Bank ACH not available in customer's region
   - Merchant not configured for ACH
   - Customer account restrictions

2. **Session Start Errors**
   - Invalid vault setup token
   - Token already used
   - Network failures

3. **Authorization Errors**
   - Customer's bank rejects linking
   - Insufficient permissions
   - Account verification failures

### Error Handling Pattern

```javascript
try {
  await achPaymentSession.start(
    { presentationMode: "auto" },
    createVaultSetupToken()
  );
} catch (error) {
  if (error.isRecoverable) {
    // Show retry option to user
    showRetryButton();
  } else {
    // Show alternative payment methods
    showAlternativePaymentOptions();
  }

  // Log for debugging
  console.error("ACH session error:", {
    message: error.message,
    code: error.code,
    details: error.details
  });
}
```

## Testing

### Sandbox Testing

1. Use sandbox environment: `https://www.sandbox.paypal.com/web-sdk/v6/core`
2. Create test accounts in PayPal Developer Dashboard
3. Use sandbox client credentials in `.env`

### Test Flows

**Happy Path:**
1. Click "Save Bank Account" button
2. PayPal opens bank linking UI
3. Select test bank account
4. Complete authorization
5. Verify `onApprove` is called
6. Confirm payment token created server-side

**Error Paths:**
1. Cancel during bank selection → `onCancel` called
2. Invalid vault setup token → `onError` called
3. Network failure → `onError` with network error

## Advanced Features

### Presentation Modes

**Auto Mode (Recommended):**
```javascript
await session.start({ presentationMode: "auto" }, ...)
```
- SDK chooses best UX based on device/browser
- Mobile: May use app switch
- Desktop: Popup or redirect

**Redirect Mode:**
```javascript
await session.start({ presentationMode: "redirect" }, ...)
```
- Forces full-page redirect
- Better for complex flows
- Required for some compliance scenarios

**Popup Mode:**
```javascript
await session.start({ presentationMode: "popup" }, ...)
```
- Opens in popup window
- Keeps merchant page loaded
- Can be blocked by popup blockers

### Using Saved Payment Tokens

After saving a bank account, use the payment token for future transactions:

```javascript
// Server-side: Create order with saved payment token
const order = await createOrder({
  intent: "CAPTURE",
  payment_source: {
    token: {
      id: savedPaymentTokenId,
      type: "PAYMENT_METHOD_TOKEN"
    }
  },
  purchase_units: [...]
});
```

## Browser Compatibility

The SDK is designed to work across modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Summary

The `BankACHSavePaymentSession` provides a streamlined way to:
1. ✅ Securely collect bank account details
2. ✅ Vault payment methods without immediate purchase
3. ✅ Enable recurring/subscription payments
4. ✅ Reduce checkout friction for repeat customers
5. ✅ Maintain PCI compliance (PayPal handles sensitive data)

The session-based approach abstracts complexity while providing flexibility through callbacks and configuration options.
