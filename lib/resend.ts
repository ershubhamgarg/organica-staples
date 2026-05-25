import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (order: any) => {
  const { delivery_address, items, total_amount, id } = order;
  const customerEmail = delivery_address.email;
  const customerName = delivery_address.name;

  const itemsHtml = items
    .map(
      (item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #1A1814; max-width: 600px; margin: 0 auto; background-color: #FDFCF7; padding: 40px; border: 1px solid #E5E1DA; border-radius: 24px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #3D2B1F; font-size: 32px; margin-bottom: 10px;">Amritya Organics</h1>
        <p style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; font-weight: 700; color: #7FB069;">Order Confirmed</p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">Namaste ${customerName},</p>
      <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing Amritya Organics. Your order <strong>#${id.slice(0, 8).toUpperCase()}</strong> has been received and is being prepared with care.</p>
      
      <div style="margin: 30px 0; background: white; padding: 20px; border-radius: 16px; border: 1px solid #F3F0E9;">
        <h3 style="font-family: 'Cormorant Garamond', serif; margin-top: 0; color: #3D2B1F;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; font-weight: 700;">Total Amount</td>
            <td style="padding: 10px; text-align: right; font-weight: 700; color: #7FB069;">₹${total_amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div style="font-size: 14px; color: #3D2B1F/70; line-height: 1.5;">
        <p><strong>Delivery Address:</strong><br/>
        ${delivery_address.address}, ${delivery_address.city}, ${delivery_address.state} - ${delivery_address.zipCode}</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E1DA;">
        <p style="font-size: 12px; color: #3D2B1F/60;">With gratitude,<br/>The Amritya Organics Team</p>
      </div>
    </div>
  `;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent.");
      return { success: false, error: "Missing API Key" };
    }

    const { data, error } = await resend.emails.send({
      from: "Amritya Organics <orders@amrityaorganics.com>",
      to: customerEmail,
      subject: `Order Confirmed - #${id.slice(0, 8).toUpperCase()}`,
      html: html,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const html = `
    <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; color: #3D2B1F; max-width: 600px; margin: 0 auto; background-color: #FDFCF7; border: 1px solid #E5E1DA; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px rgba(61, 43, 31, 0.05);">
      <!-- Header with Logo -->
      <div style="background-color: #7FB069; padding: 40px 20px; text-align: center;">
        <img src="https://amrityaorganics.com/logo-white.png" alt="Amritya Organics" style="width: 180px; height: auto;" />
      </div>

      <div style="padding: 40px; background-image: url('https://amrityaorganics.com/bg-organic-texture.png'); background-repeat: repeat;">
        <h1 style="font-family: 'Cormorant Garamond', serif; color: #3D2B1F; font-size: 36px; margin-bottom: 24px; text-align: center; font-weight: 500; line-height: 1.2;">
          Purity in <span style="color: #C5A059; font-style: italic;">every grain.</span>
        </h1>
        
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
          Namaste${name ? ` ${name}` : ""},
        </p>
        
        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 32px; text-align: center; color: rgba(61, 43, 31, 0.8); font-weight: 400;">
          Welcome to Amritya Organics. We are honored to have you join our community of individuals who value purity, tradition, and the healing power of nature.
        </p>
        
        <div style="text-align: center; margin-bottom: 40px;">
          <a href="https://amrityaorganics.com/#shop" style="display: inline-block; background-color: #3D2B1F; color: #FDFCF7; padding: 16px 48px; border-radius: 100px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; box-shadow: 0 10px 20px rgba(61, 43, 31, 0.15);">
            Explore Now
          </a>
        </div>

        <div style="border-top: 1px solid rgba(197, 160, 89, 0.2); padding-top: 32px;">
          <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
            <div style="text-align: center;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7FB069; font-weight: 700; margin-bottom: 8px;">Direct Sourcing</p>
              <p style="font-size: 12px; color: rgba(61, 43, 31, 0.6);">From village farms to your table.</p>
            </div>
            <div style="text-align: center;">
              <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7FB069; font-weight: 700; margin-bottom: 8px;">100% Purity</p>
              <p style="font-size: 12px; color: rgba(61, 43, 31, 0.6);">Unprocessed and naturally potent.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div style="background-color: #3D2B1F; padding: 32px; text-align: center; color: #FDFCF7;">
        <p style="font-size: 12px; margin-bottom: 16px; opacity: 0.8; letter-spacing: 0.05em;">
          Follow our story of tradition and purity.
        </p>
        <div style="margin-bottom: 24px;">
          <a href="https://instagram.com/amritya_organics" style="color: #FDFCF7; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: 600;">Instagram</a>
          <a href="https://amrityaorganics.com/our-story" style="color: #FDFCF7; text-decoration: none; margin: 0 12px; font-size: 12px; font-weight: 600;">Our Story</a>
        </div>
        <p style="font-size: 10px; opacity: 0.5; letter-spacing: 0.02em;">
          © 2026 Amritya Organics. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "RESEND_API_KEY is not set. Welcome email will not be sent.",
      );
      return { success: false, error: "Missing API Key" };
    }

    const { data, error } = await resend.emails.send({
      from: "Amritya Organics <welcome@amrityaorganics.com>",
      to: email,
      subject: "Welcome to Amritya Organics",
      html: html,
    });

    if (error) {
      console.error("Resend welcome email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};
