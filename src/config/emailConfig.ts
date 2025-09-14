// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Create a new service (Gmail, Outlook, etc.)
// 4. Create an email template
// 5. Get your Service ID, Template ID, and Public Key
// 6. Replace the values below

export const EMAIL_CONFIG = {
  // EmailJS credentials
  SERVICE_ID: 'service_wm98wn8',
  TEMPLATE_ID: 'template_ls2snm8', 
  PUBLIC_KEY: 'rybwmj0atBFGOHrXN',
  
  // Email template variables (these should match your EmailJS template)
  TEMPLATE_VARIABLES: {
    TO_EMAIL: 'to_email',
    TO_NAME: 'to_name',
    ORDER_ID: 'order_id',
    ORDER_STATUS: 'order_status',
    ORDER_DATE: 'order_date',
    ORDER_TOTAL: 'order_total',
    ITEMS_LIST: 'items_list',
    STATUS_MESSAGE: 'status_message',
    COMPANY_NAME: 'company_name',
    SUPPORT_EMAIL: 'support_email'
  }
}

// Sample EmailJS template HTML (for reference):
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <h1 style="color: #333; text-align: center;">{{company_name}}</h1>
    <h2 style="color: #666;">Order Status Update</h2>
    
    <p>Dear {{to_name}},</p>
    
    <p>{{status_message}}</p>
    
    <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> #{{order_id}}</p>
      <p><strong>Order Date:</strong> {{order_date}}</p>
      <p><strong>Status:</strong> {{order_status}}</p>
      <p><strong>Total Amount:</strong> ₱{{order_total}}</p>
      
      <h4>Items:</h4>
      <pre style="white-space: pre-line;">{{items_list}}</pre>
    </div>
    
    <p>If you have any questions, please contact us at {{support_email}}.</p>
    
    <p>Thank you for choosing {{company_name}}!</p>
    
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
*/
