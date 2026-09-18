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

type StatusEmailContent = {
  subject: string;
  heading: string;
  message: string;
  buttonText: string;
};

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPickupDate(
  date: string
) {
  const [year, month, day] =
    date.split("-").map(Number);

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
  const [hoursString, minutes] =
    time.split(":");

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

function paymentLabel(
  method: string
) {
  if (method === "cash") {
    return "Cash at Pickup";
  }

  if (method === "cashapp") {
    return "Cash App";
  }

  if (method === "zelle") {
    return "Zelle";
  }

  if (method === "card") {
    return "Card";
  }

  return method;
}

function getStatusEmailContent(
  status: OrderStatusEmailProps["status"],
  orderNumber: number
): StatusEmailContent {
  if (status === "confirmed") {
    return {
      subject:
        `Dulce Cafecito Order #${orderNumber} Confirmed ☕`,

      heading:
        "Your Order Is Confirmed!",

      message:
        "Your order has been confirmed. Your private pickup location is now available on your secure order page.",

      buttonText:
        "View Pickup Details",
    };
  }

  if (status === "ready") {
    return {
      subject:
        `Dulce Cafecito Order #${orderNumber} Is Ready ☕`,

      heading:
        "Your Order Is Ready!",

      message:
        "Your Dulce Cafecito order is ready for pickup. Please use your secure order page for the pickup address and instructions.",

      buttonText:
        "View Pickup Details",
    };
  }

  return {
    subject:
      `Dulce Cafecito Order #${orderNumber} Cancelled`,

    heading:
      "Order Cancelled",

    message:
      "Your Dulce Cafecito order has been cancelled. If you have any questions, please contact us.",

    buttonText:
      "View Order",
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
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const orderUrl =
    `${appUrl}/order-confirmation/${confirmationToken}`;

  const safeCustomerName =
    escapeHtml(customerName);

  const formattedDate =
    formatPickupDate(
      pickupDate
    );

  const formattedTime =
    formatPickupTime(
      pickupTime
    );

  const formattedTotal =
    `$${(
      totalCents / 100
    ).toFixed(2)}`;

  const safePaymentMethod =
    escapeHtml(
      paymentLabel(
        paymentMethod
      )
    );

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

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #fff8f4;
              font-family: Arial, Helvetica, sans-serif;
              color: #4a2d29;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border: 1px solid #ecd6d6;
                  border-radius: 24px;
                  padding: 36px;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #b76e79;
                    font-size: 12px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                  "
                >
                  Dulce Cafecito
                </p>

                <h1
                  style="
                    margin: 16px 0 0;
                    font-size: 30px;
                  "
                >
                  Order Received! ☕
                </h1>

                <p
                  style="
                    margin: 18px 0 0;
                    line-height: 1.7;
                  "
                >
                  Hi ${safeCustomerName},
                  we received your order
                  <strong>
                    #${orderNumber}
                  </strong>.
                </p>

                <p
                  style="
                    margin: 8px 0 0;
                    line-height: 1.7;
                    color: #76534e;
                  "
                >
                  We'll let you know when
                  Dulce Cafecito confirms it.
                </p>

                <div
                  style="
                    margin: 28px 0;
                    padding: 20px;
                    border-radius: 16px;
                    background: #fff8f4;
                  "
                >
                  <p
                    style="
                      margin: 0 0 8px;
                    "
                  >
                    <strong>
                      Pickup
                    </strong>
                  </p>

                  <p
                    style="
                      margin: 0 0 6px;
                    "
                  >
                    ${formattedDate}
                  </p>

                  <p
                    style="
                      margin: 0 0 16px;
                    "
                  >
                    ${formattedTime}
                  </p>

                  <p
                    style="
                      margin: 0 0 6px;
                    "
                  >
                    <strong>
                      Total:
                    </strong>

                    ${formattedTotal}
                  </p>

                  <p
                    style="
                      margin: 0;
                    "
                  >
                    <strong>
                      Payment:
                    </strong>

                    ${safePaymentMethod}
                  </p>
                </div>

                <p
                  style="
                    line-height: 1.7;
                    color: #76534e;
                  "
                >
                  The exact pickup address will
                  appear on your secure order page
                  after your order is confirmed.
                </p>

                <div
                  style="
                    margin-top: 30px;
                    text-align: center;
                  "
                >
                  <a
                    href="${orderUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 26px;
                      border-radius: 999px;
                      background: #8e4d56;
                      color: #ffffff;
                      text-decoration: none;
                      font-weight: 600;
                    "
                  >
                    View My Order
                  </a>
                </div>

                <p
                  style="
                    margin-top: 30px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #94716b;
                  "
                >
                  Keep this email so you can
                  return to your order status
                  and pickup details later.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
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
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const orderUrl =
    `${appUrl}/order-confirmation/${confirmationToken}`;

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

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #fff8f4;
              font-family: Arial, Helvetica, sans-serif;
              color: #4a2d29;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border: 1px solid #ecd6d6;
                  border-radius: 24px;
                  padding: 36px;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #b76e79;
                    font-size: 12px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                  "
                >
                  Dulce Cafecito
                </p>

                <h1
                  style="
                    margin: 16px 0 0;
                    font-size: 30px;
                  "
                >
                  ${safeHeading}
                </h1>

                <p
                  style="
                    margin: 18px 0 0;
                    line-height: 1.7;
                  "
                >
                  Hi ${safeCustomerName},
                </p>

                <p
                  style="
                    margin: 8px 0 0;
                    line-height: 1.7;
                    color: #76534e;
                  "
                >
                  ${safeMessage}
                </p>

                <div
                  style="
                    margin: 28px 0;
                    padding: 20px;
                    border-radius: 16px;
                    background: #fff8f4;
                  "
                >
                  <p
                    style="
                      margin: 0 0 8px;
                    "
                  >
                    <strong>
                      Order #${orderNumber}
                    </strong>
                  </p>

                  <p
                    style="
                      margin: 0 0 6px;
                    "
                  >
                    ${formattedDate}
                  </p>

                  <p
                    style="
                      margin: 0;
                    "
                  >
                    ${formattedTime}
                  </p>
                </div>

                <div
                  style="
                    margin-top: 30px;
                    text-align: center;
                  "
                >
                  <a
                    href="${orderUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 26px;
                      border-radius: 999px;
                      background: #8e4d56;
                      color: #ffffff;
                      text-decoration: none;
                      font-weight: 600;
                    "
                  >
                    ${safeButtonText}
                  </a>
                </div>

                <p
                  style="
                    margin-top: 30px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #94716b;
                  "
                >
                  This secure link lets you
                  return to your order status
                  and pickup details.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  return data;
}

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
    process.env.OWNER_NOTIFICATION_EMAIL;

  if (!ownerEmail) {
    console.warn(
      "OWNER_NOTIFICATION_EMAIL is not configured."
    );

    return null;
  }

  if (!process.env.RESEND_API_KEY) {
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
    `$${(
      totalCents / 100
    ).toFixed(2)}`;

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

  const { data, error } =
    await resend.emails.send({
      from:
        fromEmail,

      to: [
        ownerEmail,
      ],

      subject:
        `New Dulce Cafecito Order #${orderNumber} ☕`,

      html: `
        <!DOCTYPE html>

        <html>
          <body
            style="
              margin: 0;
              padding: 0;
              background: #fff8f4;
              font-family: Arial, Helvetica, sans-serif;
              color: #4a2d29;
            "
          >
            <div
              style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
              "
            >
              <div
                style="
                  background: #ffffff;
                  border: 1px solid #ecd6d6;
                  border-radius: 24px;
                  padding: 36px;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #b76e79;
                    font-size: 12px;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                  "
                >
                  Dulce Cafecito Admin
                </p>

                <h1
                  style="
                    margin: 16px 0 0;
                    font-size: 30px;
                  "
                >
                  New Order! ☕
                </h1>

                <p
                  style="
                    margin: 18px 0 0;
                    line-height: 1.7;
                  "
                >
                  Order
                  <strong>
                    #${orderNumber}
                  </strong>
                  was just placed.
                </p>

                <div
                  style="
                    margin: 28px 0;
                    padding: 20px;
                    border-radius: 16px;
                    background: #fff8f4;
                  "
                >
                  <p>
                    <strong>
                      Customer:
                    </strong>
                    ${safeCustomerName}
                  </p>

                  <p>
                    <strong>
                      Email:
                    </strong>
                    ${safeCustomerEmail}
                  </p>

                  <p>
                    <strong>
                      Phone:
                    </strong>
                    ${safeCustomerPhone}
                  </p>

                  <p>
                    <strong>
                      Pickup:
                    </strong>
                    ${formattedDate}
                    at
                    ${formattedTime}
                  </p>

                  <p>
                    <strong>
                      Total:
                    </strong>
                    ${formattedTotal}
                  </p>

                  <p>
                    <strong>
                      Payment:
                    </strong>
                    ${safePayment}
                  </p>
                </div>

                <div
                  style="
                    margin-top: 30px;
                    text-align: center;
                  "
                >
                  <a
                    href="${adminUrl}"
                    style="
                      display: inline-block;
                      padding: 14px 26px;
                      border-radius: 999px;
                      background: #8e4d56;
                      color: #ffffff;
                      text-decoration: none;
                      font-weight: 600;
                    "
                  >
                    Manage Order
                  </a>
                </div>

                <p
                  style="
                    margin-top: 30px;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #94716b;
                  "
                >
                  Sign in to the Dulce Cafecito admin
                  dashboard to confirm and manage this
                  order.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

  if (error) {
    throw new Error(
      `Resend error: ${error.message}`
    );
  }

  return data;
}