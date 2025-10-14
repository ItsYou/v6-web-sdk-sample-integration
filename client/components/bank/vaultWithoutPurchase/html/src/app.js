async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["bank-ach-payments"],
      pageType: "checkout",
    });
    const paymentMethods = await sdkInstance.findEligibleMethods({
      apiCode: "restApi",
      countryCode: "US",
      currencyCode: "USD",
      paymentFlow: "VAULT_WITHOUT_PAYMENT",
      paymentMethods: ["ACH"],
    });

    if (paymentMethods.isEligible("ach")) {
      setupAchButton(sdkInstance);
    } else {
      console.log("Bank ACH is not eligible");
    }
  } catch (error) {
    console.error("Error loading PayPal Web SDK:", error);
  }
}

const paymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const createPaymentTokenResponse = await createPaymentToken(
      data.vaultSetupToken,
    );
    console.log("Create payment token response: ", createPaymentTokenResponse);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

async function setupAchButton(sdkInstance) {
  const achPaymentSession = sdkInstance.createBankAchSavePaymentSession(
    paymentSessionOptions,
  );

  const achButton = document.querySelector("#ach-button");
  achButton.removeAttribute("hidden");

  achButton.addEventListener("click", async () => {
    try {
      await achPaymentSession.start(
        { presentationMode: "auto" },
        createVaultSetupToken(),
      );
    } catch (error) {
      console.error("Error starting ACH payment session:", error);
    }
  });
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
}

async function createVaultSetupToken() {
  const response = await fetch("/paypal-api/vault/setup-token/create-ach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { id } = await response.json();

  return { vaultSetupToken: id };
}

async function createPaymentToken(vaultSetupToken) {
  const response = await fetch("/paypal-api/vault/payment-token/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vaultSetupToken }),
  });
  const data = await response.json();

  return data;
}
