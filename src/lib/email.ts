import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const fromEmail =
  process.env.RESEND_FROM_EMAIL ??
  "Dulce Cafecito <onboarding@resend.dev>";

type OrderReceivedEmailProps = {
  to: string;
  customerName: string;
  orderNumber: number;
  confirmationToken: string;
  pickupDate: string;
  pickupTime: string;
  totalCents: number;
  paymentMethod: string;
};

type OrderStatusEmailProps = {
  to: string;
  customerName: string;
  orderNumber: number;
  confirmationToken: string;
  pickupDate: string;
  pickupTime: string;

  status:
    | "confirmed"
    | "ready"
    | "cancelled";
};

type NewOrderAdminEmailProps = {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  totalCents: number;
  paymentMethod: string;
};

type StatusEmailContent = {
  subject: string;
  eyebrow: string;
  heading: string;
  message: string;
  buttonText: string;

  badgeText: string;
  badgeBackground: string;
  badgeColor: string;
};

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
}

function formatPickupDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

function formatPickupTime(
  time: string
) {
  const [
    hoursString,
    minutes = "00",
  ] = time.split(":");

  const hours =
    Number(hoursString);

  const period =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHours =
    hours % 12 || 12;

  return `${displayHours}:${minutes} ${period}`;
}

function formatMoney(
  cents: number
) {
  return `$${(
    cents / 100
  ).toFixed(2)}`;
}

function paymentLabel(
  method: string
) {
  if (
    method === "cash"
  ) {
    return "Cash at Pickup";
  }

  if (
    method === "cashapp"
  ) {
    return "Cash App";
  }

  if (
    method === "zelle"
  ) {
    return "Zelle";
  }

  if (
    method === "card"
  ) {
    return "Card";
  }

  return method;
}

function detailRow(
  label: string,
  value: string
) {
  return `
    <tr>
      <td
        style="
          padding: 8px 0;
          color: #94716b;
          font-size: 13px;
          line-height: 1.5;
        "
      >
        ${label}
      </td>

      <td
        align="right"
        style="
          padding: 8px 0;
          color: #4a2d29;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
        "
      >
        ${value}
      </td>
    </tr>
  `;
}

type BrandEmailProps = {
  preheader: string;

  eyebrow: string;

  heading: string;

  introHtml: string;

  badgeText?: string;

  badgeBackground?: string;

  badgeColor?: string;

  detailsHtml?: string;

  noteHtml?: string;

  buttonUrl: string;

  buttonText: string;

  footerText: string;
};

function renderBrandEmail({
  preheader,
  eyebrow,
  heading,
  introHtml,
  badgeText,
  badgeBackground =
    "#f9e5e8",
  badgeColor =
    "#8e4d56",
  detailsHtml,
  noteHtml,
  buttonUrl,
  buttonText,
  footerText,
}: BrandEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #fff8f4;
          color: #4a2d29;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            display: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          "
        >
          ${preheader}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background: #fff8f4;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 42px 18px;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 620px;
                "
              >
                <!-- Brand -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding-bottom: 22px;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #b76e79;
                        font-size: 11px;
                        font-weight: 600;
                        letter-spacing: 4px;
                        text-transform: uppercase;
                      "
                    >
                      Dulce Cafecito
                    </p>

                    <p
                      style="
                        margin: 11px 0 0;
                        color: #d9aaaa;
                        font-size: 15px;
                        letter-spacing: 5px;
                      "
                    >
                      ── ◇ ──
                    </p>
                  </td>
                </tr>

                <!-- Main Card -->
                <tr>
                  <td
                    style="
                      overflow: hidden;
                      background: #ffffff;
                      border: 1px solid #ecd6d6;
                      border-radius: 28px;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <!-- Header -->
                      <tr>
                        <td
                          align="center"
                          style="
                            padding:
                              44px
                              36px
                              30px;
                          "
                        >
                          <p
                            style="
                              margin: 0;
                              color: #b76e79;
                              font-size: 11px;
                              font-weight: 600;
                              letter-spacing: 3px;
                              text-transform: uppercase;
                            "
                          >
                            ${eyebrow}
                          </p>

                          <h1
                            style="
                              margin:
                                14px
                                auto
                                0;
                              color: #4a2d29;
                              font-family:
                                Georgia,
                                'Times New Roman',
                                serif;
                              font-size: 38px;
                              line-height: 1.12;
                              font-weight: 700;
                              letter-spacing: -0.8px;
                            "
                          >
                            ${heading}
                          </h1>

                          ${
                            badgeText
                              ? `
                                <div
                                  style="
                                    margin-top: 20px;
                                  "
                                >
                                  <span
                                    style="
                                      display: inline-block;
                                      padding: 8px 14px;
                                      border-radius: 999px;
                                      background: ${badgeBackground};
                                      color: ${badgeColor};
                                      font-size: 10px;
                                      font-weight: 700;
                                      letter-spacing: 1.5px;
                                      text-transform: uppercase;
                                    "
                                  >
                                    ${badgeText}
                                  </span>
                                </div>
                              `
                              : ""
                          }

                          <p
                            style="
                              margin:
                                22px
                                auto
                                0;
                              max-width: 470px;
                              color: #76534e;
                              font-size: 15px;
                              line-height: 1.8;
                            "
                          >
                            ${introHtml}
                          </p>

                          <p
                            style="
                              margin:
                                20px
                                0
                                0;
                              color: #d9aaaa;
                              font-size: 14px;
                              letter-spacing: 5px;
                            "
                          >
                            ─ ◇ • ◇ ─
                          </p>
                        </td>
                      </tr>

                      ${
                        detailsHtml
                          ? `
                            <!-- Details -->
                            <tr>
                              <td
                                style="
                                  padding:
                                    0
                                    36px
                                    28px;
                                "
                              >
                                <div
                                  style="
                                    padding: 22px;
                                    background: #fff8f7;
                                    border: 1px solid #f1dddd;
                                    border-radius: 20px;
                                  "
                                >
                                  <table
                                    role="presentation"
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    border="0"
                                  >
                                    ${detailsHtml}
                                  </table>
                                </div>
                              </td>
                            </tr>
                          `
                          : ""
                      }

                      ${
                        noteHtml
                          ? `
                            <!-- Note -->
                            <tr>
                              <td
                                style="
                                  padding:
                                    0
                                    36px
                                    10px;
                                "
                              >
                                <div
                                  style="
                                    padding:
                                      17px
                                      18px;
                                    border-radius: 16px;
                                    background: #fdf1df;
                                    color: #76534e;
                                    font-size: 13px;
                                    line-height: 1.7;
                                  "
                                >
                                  ${noteHtml}
                                </div>
                              </td>
                            </tr>
                          `
                          : ""
                      }

                      <!-- CTA -->
                      <tr>
                        <td
                          align="center"
                          style="
                            padding:
                              25px
                              36px
                              36px;
                          "
                        >
                          <a
                            href="${buttonUrl}"
                            style="
                              display: inline-block;
                              padding:
                                15px
                                28px;
                              border-radius: 999px;
                              background: #8e4d56;
                              color: #ffffff;
                              font-size: 14px;
                              font-weight: 700;
                              text-decoration: none;
                            "
                          >
                            ${buttonText} →
                          </a>

                          <p
                            style="
                              margin:
                                26px
                                auto
                                0;
                              max-width: 460px;
                              color: #94716b;
                              font-size: 11px;
                              line-height: 1.7;
                            "
                          >
                            ${footerText}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    align="center"
                    style="
                      padding-top: 26px;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        color: #b76e79;
                        font-family:
                          Georgia,
                          'Times New Roman',
                          serif;
                        font-size: 19px;
                      "
                    >
                      ♡ ☕
                    </p>

                    <p
                      style="
                        margin:
                          8px
                          0
                          0;
                        color: #94716b;
                        font-size: 11px;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      "
                    >
                      Made with a little sweetness
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getStatusEmailContent(
  status:
    OrderStatusEmailProps["status"],
  orderNumber: number
): StatusEmailContent {
  if (
    status === "confirmed"
  ) {
    return {
      subject:
        `Dulce Cafecito Order #${orderNumber} Confirmed ☕`,

      eyebrow:
        `Order #${orderNumber}`,

      heading:
        "Your Order Is Confirmed!",

      message:
        "Your order has been confirmed. Your private pickup location is now available on your secure order page.",

      buttonText:
        "View Pickup Details",

      badgeText:
        "Confirmed",

      badgeBackground:
        "#edf5ea",

      badgeColor:
        "#426b42",
    };
  }

  if (
    status === "ready"
  ) {
    return {
      subject:
        `Dulce Cafecito Order #${orderNumber} Is Ready ☕`,

      eyebrow:
        `Order #${orderNumber}`,

      heading:
        "Your Cafecito Is Ready!",

      message:
        "Your Dulce Cafecito order is ready for pickup. Open your secure order page for the pickup address and any pickup instructions.",

      buttonText:
        "View Pickup Details",

      badgeText:
        "Ready for Pickup",

      badgeBackground:
        "#f9e5e8",

      badgeColor:
        "#8e4d56",
    };
  }

  return {
    subject:
      `Dulce Cafecito Order #${orderNumber} Cancelled`,

    eyebrow:
      `Order #${orderNumber}`,

    heading:
      "Order Cancelled",

    message:
      "Your Dulce Cafecito order has been cancelled. If you have any questions, please contact us.",

    buttonText:
      "View Order",

    badgeText:
      "Cancelled",

    badgeBackground:
      "#f3eeee",

    badgeColor:
      "#76534e",
  };
}

export async function sendOrderReceivedEmail({
  to,
  customerName,
  orderNumber,
  confirmationToken,
  pickupDate,
  pickupTime,
  totalCents,
  paymentMethod,
}: OrderReceivedEmailProps) {
  if (
    !process.env.RESEND_API_KEY
  ) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const orderUrl =
    `${appUrl}/order-confirmation/${encodeURIComponent(
      confirmationToken
    )}`;

  const safeCustomerName =
    escapeHtml(
      customerName
    );

  const formattedDate =
    formatPickupDate(
      pickupDate
    );

  const formattedTime =
    formatPickupTime(
      pickupTime
    );

  const formattedTotal =
    formatMoney(
      totalCents
    );

  const safePaymentMethod =
    escapeHtml(
      paymentLabel(
        paymentMethod
      )
    );

  const html =
    renderBrandEmail({
      preheader:
        `We received Dulce Cafecito order #${orderNumber}.`,

      eyebrow:
        `Order #${orderNumber}`,

      heading:
        "Order Received!",

      badgeText:
        "Waiting for Confirmation",

      badgeBackground:
        "#fdf1df",

      badgeColor:
        "#96620b",

      introHtml: `
        Hi <strong>${safeCustomerName}</strong>,
        we received your order.
        We&apos;ll let you know as soon as
        Dulce Cafecito confirms it.
      `,

      detailsHtml: `
        ${detailRow(
          "Pickup Date",
          formattedDate
        )}

        ${detailRow(
          "Pickup Time",
          formattedTime
        )}

        ${detailRow(
          "Order Total",
          formattedTotal
        )}

        ${detailRow(
          "Payment",
          safePaymentMethod
        )}
      `,

      noteHtml: `
        <strong
          style="
            color: #4a2d29;
          "
        >
          Pickup location
        </strong>
        <br />
        The exact pickup address will appear on your
        secure order page after Dulce Cafecito confirms
        your order.
      `,

      buttonUrl:
        orderUrl,

      buttonText:
        "View My Order",

      footerText:
        "Keep this email so you can return to your order status and pickup details later.",
    });

  const text = `
Dulce Cafecito

Order Received!
Order #${orderNumber}

Hi ${customerName},

We received your order and will let you know when Dulce Cafecito confirms it.

Pickup Date: ${formattedDate}
Pickup Time: ${formattedTime}
Total: ${formattedTotal}
Payment: ${paymentLabel(paymentMethod)}

The exact pickup address will appear after your order is confirmed.

View your order:
${orderUrl}
  `.trim();

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from:
        fromEmail,

      to: [
        to,
      ],

      subject:
        `Dulce Cafecito Order #${orderNumber} Received ☕`,

      html,

      text,
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  return data;
}

export async function sendOrderStatusEmail({
  to,
  customerName,
  orderNumber,
  confirmationToken,
  pickupDate,
  pickupTime,
  status,
}: OrderStatusEmailProps) {
  if (
    !process.env.RESEND_API_KEY
  ) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const orderUrl =
    `${appUrl}/order-confirmation/${encodeURIComponent(
      confirmationToken
    )}`;

  const content =
    getStatusEmailContent(
      status,
      orderNumber
    );

  const formattedDate =
    formatPickupDate(
      pickupDate
    );

  const formattedTime =
    formatPickupTime(
      pickupTime
    );

  const safeCustomerName =
    escapeHtml(
      customerName
    );

  const safeHeading =
    escapeHtml(
      content.heading
    );

  const safeMessage =
    escapeHtml(
      content.message
    );

  const safeButtonText =
    escapeHtml(
      content.buttonText
    );

  const html =
    renderBrandEmail({
      preheader:
        content.subject,

      eyebrow:
        content.eyebrow,

      heading:
        safeHeading,

      badgeText:
        content.badgeText,

      badgeBackground:
        content.badgeBackground,

      badgeColor:
        content.badgeColor,

      introHtml: `
        Hi <strong>${safeCustomerName}</strong>,
        ${safeMessage}
      `,

      detailsHtml: `
        ${detailRow(
          "Order",
          `#${orderNumber}`
        )}

        ${detailRow(
          "Pickup Date",
          formattedDate
        )}

        ${detailRow(
          "Pickup Time",
          formattedTime
        )}
      `,

      noteHtml:
        status ===
        "confirmed"
          ? `
            Your private pickup location and pickup
            instructions are now available on your
            secure order page.
          `
          : status ===
              "ready"
            ? `
              Please check your secure order page
              before heading to pickup so you have
              the latest address and instructions.
            `
            : `
              Your secure order page will remain
              available so you can review the order
              details.
            `,

      buttonUrl:
        orderUrl,

      buttonText:
        safeButtonText,

      footerText:
        "This secure link lets you return to your order status and pickup details.",
    });

  const text = `
Dulce Cafecito

${content.heading}
Order #${orderNumber}

Hi ${customerName},

${content.message}

Pickup Date: ${formattedDate}
Pickup Time: ${formattedTime}

${content.buttonText}:
${orderUrl}
  `.trim();

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from:
        fromEmail,

      to: [
        to,
      ],

      subject:
        content.subject,

      html,

      text,
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  return data;
}

export async function sendNewOrderAdminEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  pickupDate,
  pickupTime,
  totalCents,
  paymentMethod,
}: NewOrderAdminEmailProps) {
  const ownerEmail =
    process.env
      .OWNER_NOTIFICATION_EMAIL;

  if (!ownerEmail) {
    console.warn(
      "OWNER_NOTIFICATION_EMAIL is not configured."
    );

    return null;
  }

  if (
    !process.env.RESEND_API_KEY
  ) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const adminUrl =
    `${appUrl}/admin/orders`;

  const formattedDate =
    formatPickupDate(
      pickupDate
    );

  const formattedTime =
    formatPickupTime(
      pickupTime
    );

  const formattedTotal =
    formatMoney(
      totalCents
    );

  const safeCustomerName =
    escapeHtml(
      customerName
    );

  const safeCustomerEmail =
    escapeHtml(
      customerEmail
    );

  const safeCustomerPhone =
    escapeHtml(
      customerPhone
    );

  const safePayment =
    escapeHtml(
      paymentLabel(
        paymentMethod
      )
    );

  const html =
    renderBrandEmail({
      preheader:
        `New Dulce Cafecito order #${orderNumber}.`,

      eyebrow:
        "Dulce Cafecito Admin",

      heading:
        "New Order!",

      badgeText:
        `Order #${orderNumber}`,

      badgeBackground:
        "#f9e5e8",

      badgeColor:
        "#8e4d56",

      introHtml: `
        A new order was just placed.
        Review the customer and pickup details below.
      `,

      detailsHtml: `
        ${detailRow(
          "Customer",
          safeCustomerName
        )}

        ${detailRow(
          "Email",
          safeCustomerEmail
        )}

        ${detailRow(
          "Phone",
          safeCustomerPhone
        )}

        ${detailRow(
          "Pickup",
          `${formattedDate}<br />${formattedTime}`
        )}

        ${detailRow(
          "Total",
          formattedTotal
        )}

        ${detailRow(
          "Payment",
          safePayment
        )}
      `,

      noteHtml: `
        <strong
          style="
            color: #4a2d29;
          "
        >
          Admin action needed
        </strong>
        <br />
        Open the dashboard to review and confirm
        this order.
      `,

      buttonUrl:
        adminUrl,

      buttonText:
        "Manage Order",

      footerText:
        "Sign in to the Dulce Cafecito admin dashboard to confirm and manage this order.",
    });

  const text = `
Dulce Cafecito Admin

New Order #${orderNumber}

Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}

Pickup: ${formattedDate} at ${formattedTime}
Total: ${formattedTotal}
Payment: ${paymentLabel(paymentMethod)}

Manage order:
${adminUrl}
  `.trim();

  const {
    data,
    error,
  } =
    await resend.emails.send({
      from:
        fromEmail,

      to: [
        ownerEmail,
      ],

      subject:
        `New Dulce Cafecito Order #${orderNumber} ☕`,

      html,

      text,
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  return data;
}