/**
 * razorpayService.js
 * Handles all Razorpay payment operations for Paaswala
 *
 * Setup required:
 *   npm install react-native-razorpay
 *   Add your Razorpay Key ID in app.json + this file
 */

import { Platform } from 'react-native';
let RazorpayCheckout;
if (Platform.OS !== 'web') {
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch (e) {
    console.warn('Razorpay could not be loaded:', e);
  }
}
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your Razorpay Key ID from https://dashboard.razorpay.com
const RAZORPAY_KEY_ID = 'rzp_test_TAeKKzYiH2zniV';

// ─── TYPES ───────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} PaymentOptions
 * @property {number}  amount       - Amount in RUPEES
 * @property {Object}  orderData    - Full order payload written to Firestore on success
 * @property {string}  customerName
 * @property {string}  customerEmail
 * @property {string}  customerPhone
 * @property {string}  description  - e.g. "Order #ABC123 - Sharma Tea Stall"
 */

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
/**
 * Opens the Razorpay payment sheet and handles success/failure
 * @param {PaymentOptions} options
 * @returns {Promise<{success: boolean, paymentId?: string, orderId?: string, error?: string}>}
 */
export const initiateRazorpayPayment = async (options) => {
  const {
    amount,
    orderData,
    customerName = '',
    customerEmail = '',
    customerPhone = '',
    description = 'Paaswala Order',
  } = options;

  if (Platform.OS === 'web' || !RazorpayCheckout) {
    return {
      success: false,
      error: 'Payments are only supported on the mobile app. Please use an Android or iOS device.',
    };
  }

  const razorpayOptions = {
    description,
    image: 'https://i.imgur.com/3g7nmJC.png',
    currency: 'INR',
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Convert ₹ to paise
    name: 'Paaswala',
    prefill: {
      email: customerEmail,
      contact: customerPhone,
      name: customerName,
    },
    theme: { color: '#007AFF' },
  };

  return new Promise((resolve) => {
    RazorpayCheckout.open(razorpayOptions)
      .then(async (paymentData) => {
        // Payment confirmed — write the order to Firestore
        try {
          const orderRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            paymentStatus: 'paid',
            status: 'pending',
            razorpayPaymentId: paymentData.razorpay_payment_id,
            paidAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          });

          const orderId = orderRef.id;

          // Audit trail
          await addDoc(collection(db, 'payments'), {
            orderId,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            amount,
            currency: 'INR',
            status: 'success',
            createdAt: serverTimestamp(),
          });

          resolve({ success: true, paymentId: paymentData.razorpay_payment_id, orderId });
        } catch (dbError) {
          console.error('DB write after payment failed:', dbError);
          resolve({ success: true, paymentId: paymentData.razorpay_payment_id, orderId: null });
        }
      })
      .catch((error) => {
        const desc = (error.description || '').toLowerCase();
        const userCancelled =
          error.code === 0 ||
          desc.includes('cancel') ||
          desc.includes('dismissed');
        resolve({
          success: false,
          cancelled: userCancelled,
          error: userCancelled
            ? 'Payment cancelled'
            : error.description || 'Payment failed',
        });
      });
  });
};

/**
 * Formats amount for display: 1500 → "₹15.00"
 */
export const formatAmount = (paise) => {
  return `₹${(paise / 100).toFixed(2)}`;
};

/**
 * Converts rupees to paise for Razorpay
 */
export const rupeesToPaise = (rupees) => Math.round(rupees * 100);
