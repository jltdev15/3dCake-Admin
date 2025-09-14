import emailjs from '@emailjs/browser'
import { EMAIL_CONFIG } from '../config/emailConfig'
import { ref as dbRef, get } from 'firebase/database'
import { database } from '../firebase/config'

// Initialize EmailJS
emailjs.init(EMAIL_CONFIG.PUBLIC_KEY)

export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  status: 'accepted' | 'declined'
  total: number
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

export class EmailService {
  /**
   * Extract email address from contact information
   */
  static extractEmail(contact: string): string | null {
    // Check if contact is already an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(contact)) {
      return contact
    }
    
    // If not an email, return null
    return null
  }

  /**
   * Get user email from userId
   */
  static async getUserEmail(userId: string): Promise<string | null> {
    try {
      const userRef = dbRef(database, `users/${userId}`)
      const userSnapshot = await get(userRef)
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val()
        return userData.email || null
      }
      
      return null
    } catch (error) {
      console.error('Error fetching user email:', error)
      return null
    }
  }

  /**
   * Send order status notification email to customer
   */
  static async sendOrderStatusEmail(orderData: OrderEmailData): Promise<boolean> {
    try {
      // Validate email address
      if (!orderData.customerEmail || orderData.customerEmail.trim() === '') {
        console.warn('No email address provided for order:', orderData.orderId)
        return false
      }

      // Check if email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(orderData.customerEmail)) {
        console.warn('Invalid email address for order:', orderData.orderId, orderData.customerEmail)
        return false
      }

      // Prepare email template parameters
      const templateParams = {
        to_email: orderData.customerEmail,
        to_name: orderData.customerName,
        order_id: orderData.orderId,
        order_status: orderData.status,
        order_date: orderData.orderDate,
        order_total: orderData.total.toFixed(2),
        items_list: EmailService.formatItemsList(orderData.items),
        status_message: EmailService.getStatusMessage(orderData.status),
        company_name: '3D Cake Maker',
        support_email: 'support@3dcakemaker.com'
      }

      // Debug: Log the parameters being sent
      console.log('EmailJS Template Parameters:', templateParams)
      console.log('EmailJS Config:', {
        serviceId: EMAIL_CONFIG.SERVICE_ID,
        templateId: EMAIL_CONFIG.TEMPLATE_ID,
        publicKey: EMAIL_CONFIG.PUBLIC_KEY
      })

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        templateParams
      )

      console.log('Email sent successfully:', response)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  /**
   * Format items list for email template
   */
  static formatItemsList(items: OrderEmailData['items']): string {
    return items.map(item => 
      `${item.name} x${item.quantity} - ₱${item.unitPrice.toFixed(2)} each = ₱${item.totalPrice.toFixed(2)}`
    ).join('\n')
  }

  /**
   * Get appropriate status message based on order status
   */
  static getStatusMessage(status: 'accepted' | 'declined'): string {
    switch (status) {
      case 'accepted':
        return 'Great news! Your order has been accepted and is now being prepared. We will contact you soon with more details about delivery or pickup arrangements.'
      case 'declined':
        return 'We regret to inform you that your order could not be processed at this time. Please contact us for more information or to place a new order.'
      default:
        return 'Your order status has been updated.'
    }
  }


  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<boolean> {
    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test User',
        order_id: 'TEST123',
        order_status: 'accepted',
        order_date: new Date().toLocaleDateString(),
        order_total: '100.00',
        items_list: 'Test Item x1 - ₱100.00 each = ₱100.00',
        status_message: 'This is a test email.',
        company_name: '3D Cake Maker',
        support_email: 'support@3dcakemaker.com'
      }

      await emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, testParams)
      return true
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return false
    }
  }
}

// Export a simple function for easy use
export const sendOrderNotification = EmailService.sendOrderStatusEmail
