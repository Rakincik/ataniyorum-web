import crypto from "crypto";

export interface ShopierPaymentOptions {
  orderId: string;
  totalAmount: number;
  buyerName: string;
  buyerSurname: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  buyerTcNo?: string;
  productName: string;
}

export function generateShopierFormHTML(options: ShopierPaymentOptions): string {
  const apiKey = process.env.SHOPIER_API_KEY || "1dd7664ab96dd4e332e9459008d2a008";
  const apiSecret = process.env.SHOPIER_SECRET || "1dd7664ab96dd4e332e9459008d2a008";
  const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX || "1";

  const formattedAmount = options.totalAmount.toFixed(2);
  const randomNr = Math.floor(100000 + Math.random() * 900000).toString();

  // Signature string: random_nr + platform_order_id + total_claim + currency
  const signatureData = randomNr + options.orderId + formattedAmount + "0";
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signatureData)
    .digest("base64");

  const fields: Record<string, string> = {
    API_key: apiKey,
    website_index: websiteIndex,
    platform_order_id: options.orderId,
    product_name: options.productName.slice(0, 100),
    product_type: "0", // Digital Product / Service
    buyer_name: options.buyerName || "Ogrenci",
    buyer_surname: options.buyerSurname || "Hocam",
    buyer_email: options.buyerEmail,
    buyer_account_age: "0",
    buyer_id_nr: options.buyerTcNo || "11111111111",
    buyer_phone: options.buyerPhone ? `90${options.buyerPhone.replace(/\D/g, "")}` : "905555555555",
    billing_address: options.buyerAddress || "Turkiye",
    billing_city: options.buyerCity || "Ankara",
    billing_country: "Turkey",
    billing_postcode: "06000",
    shipping_address: options.buyerAddress || "Turkiye",
    shipping_city: options.buyerCity || "Ankara",
    shipping_country: "Turkey",
    shipping_postcode: "06000",
    total_claim: formattedAmount,
    currency: "0", // TRY
    random_nr: randomNr,
    signature: signature
  };

  const inputs = Object.entries(fields)
    .map(([key, val]) => `<input type="hidden" name="${key}" value="${val.replace(/"/g, "&quot;")}" />`)
    .join("\n");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Shopier Güvenli Ödeme Yönlendirmesi</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f7; }
        .spinner { width: 48px; height: 48px; border: 5px solid #e0e0e0; border-top-color: #0066cc; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { color: #1d1d1f; margin-bottom: 8px; }
        p { color: #6e6e73; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <h2>Shopier Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz...</h2>
      <p>Lütfen sayfayı kapatmayın.</p>
      <form id="shopier_payment_form" action="https://www.shopier.com/ShowProduct/api_pay4.php" method="POST">
        ${inputs}
      </form>
      <script>
        document.getElementById('shopier_payment_form').submit();
      </script>
    </body>
    </html>
  `;
}
