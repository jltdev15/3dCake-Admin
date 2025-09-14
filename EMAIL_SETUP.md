# Email Notification Setup Guide

This guide will help you set up email notifications for order status updates using EmailJS.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your chosen provider
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates** in your EmailJS dashboard
2. Click **Create New Template**
3. Use this template HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Status Update - {{company_name}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #333; margin: 0; font-size: 28px;">{{company_name}}</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Order Status Update</p>
    </div>
    
    <!-- Greeting -->
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear {{to_name}},</p>
    
    <!-- Status Message -->
    <div style="background-color: {{#if (eq order_status "accepted")}}#d4edda{{else}}#f8d7da{{/if}}; border: 1px solid {{#if (eq order_status "accepted")}}#c3e6cb{{else}}#f5c6cb{{/if}}; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
      <p style="margin: 0; color: {{#if (eq order_status "accepted")}}#155724{{else}}#721c24{{/if}}; font-weight: bold;">
        {{#if (eq order_status "accepted")}}✅ Order Accepted{{else}}❌ Order Declined{{/if}}
      </p>
    </div>
    
    <p style="font-size: 16px; color: #333; margin-bottom: 25px;">{{status_message}}</p>
    
    <!-- Order Details -->
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Order ID:</td>
          <td style="padding: 8px 0; color: #333;">#{{order_id}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Order Date:</td>
          <td style="padding: 8px 0; color: #333;">{{order_date}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; color: #333; text-transform: capitalize;">{{order_status}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-weight: bold;">Total Amount:</td>
          <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">₱{{order_total}}</td>
        </tr>
      </table>
    </div>
    
    <!-- Items List -->
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Order Items</h3>
      <div style="white-space: pre-line; color: #333; line-height: 1.6;">{{items_list}}</div>
    </div>
    
    <!-- Contact Information -->
    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
      <p style="color: #666; margin-bottom: 10px;">If you have any questions, please contact us:</p>
      <p style="color: #333; font-weight: bold; margin: 0;">{{support_email}}</p>
    </div>
    
    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p style="font-size: 14px; color: #999; margin: 0;">Thank you for choosing {{company_name}}!</p>
      <p style="font-size: 12px; color: #ccc; margin: 10px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
```

4. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key

1. Go to **Account** → **General** in your EmailJS dashboard
2. Find your **Public Key** (e.g., `user_abc123def456`)

## Step 5: Update Configuration

1. Open `src/config/emailConfig.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const EMAIL_CONFIG = {
  SERVICE_ID: 'your_actual_service_id',
  TEMPLATE_ID: 'your_actual_template_id', 
  PUBLIC_KEY: 'your_actual_public_key',
  // ... rest of the config
}
```

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Go to the orders page
3. Try accepting or declining an order
4. Check the browser console for email sending logs
5. Verify that the customer receives the email

## Troubleshooting

### Common Issues:

1. **"Email not sent" error**: Check that your EmailJS credentials are correct
2. **"Service not found" error**: Verify your Service ID is correct
3. **"Template not found" error**: Verify your Template ID is correct
4. **"Invalid public key" error**: Verify your Public Key is correct

### Testing:

You can test the email configuration by calling the test function in the browser console:

```javascript
import { EmailService } from './src/services/emailService'
EmailService.testEmailConfiguration()
```

## Email Limits

- **Free Plan**: 200 emails/month
- **Paid Plans**: Start from $15/month for 1,000 emails

## Security Notes

- Never commit your EmailJS credentials to version control
- Consider using environment variables for production
- The current setup uses the customer's contact field as email - ensure this contains valid email addresses

## Next Steps

1. Set up your EmailJS account and get the credentials
2. Update the configuration file
3. Test with a real order
4. Customize the email template as needed
5. Consider adding more email templates for different order statuses
