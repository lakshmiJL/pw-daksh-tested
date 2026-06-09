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
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace with your Razorpay Key ID from https://dashboard.razorpay.com
const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX'; // ← REPLACE THIS

// ─── TYPES ───────────────────────────────────────────────────────────────────
/**
 * @typedef {Object} PaymentOptions
 * @property {number}  amount       - Amount in PAISE (₹1 = 100 paise)
 * @property {string}  orderId      - Your internal Firestore order ID
 * @property {string}  customerName
 * @property {string}  customerEmail
 * @property {string}  customerPhone
 * @property {string}  description  - e.g. "Order #ABC123 - Sharma Tea Stall"
 */

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────
/**
 * Opens the Razorpay payment sheet and handles success/failure
 * @param {PaymentOptions} options
 * @returns {Promise<{success: boolean, paymentId?: string, error?: string}>}
 */
export const initiateRazorpayPayment = async (options) => {
  const {
    amount,
    orderId,
    customerName = '',
    customerEmail = '',
    customerPhone = '',
    description = 'Paaswala Order',
  } = options;

  const razorpayOptions = {
    description,
    image: 'https://i.imgur.com/3g7nmJC.png', // Your app logo URL
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
    // Enable all payment methods
    config: {
      display: {
        blocks: {
          utib: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
          other: { name: 'Other Payment Modes', instruments: [
            { method: 'card' },
            { method: 'netbanking' },
            { method: 'wallet' },
          ]},
        },
        sequence: ['block.utib', 'block.other'],
        preferences: { show_default_blocks: false },
      },
    },
  };

  if (Platform.OS === 'web' || !RazorpayCheckout) {
    return {
      success: false,
      error: 'Payments are only supported on the mobile app. Please use an Android or iOS device.',
    };
  }

  return new Promise((resolve) => {
    RazorpayCheckout.open(razorpayOptions)
      .then(async (paymentData) => {
        // Payment successful - paymentData.razorpay_payment_id
        try {
          await recordPaymentSuccess(orderId, paymentData.razorpay_payment_id, amount);
          resolve({ success: true, paymentId: paymentData.razorpay_payment_id });
        } catch (dbError) {
          console.error('DB update after payment failed:', dbError);
          // Payment was still successful even if DB update failed
          resolve({ success: true, paymentId: paymentData.razorpay_payment_id });
        }
      })
      .catch((error) => {
        // error.code: 0 = user cancelled, 1 = payment failed, 2 = network error
        const userCancelled = error.code === 0;
        resolve({
          success: false,
          cancelled: userCancelled,
          error: userCancelled ? 'Payment cancelled' : error.description || 'Payment failed',
        });
      });
  });
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Updates Firestore order with payment confirmation details
 */
const recordPaymentSuccess = async (orderId, razorpayPaymentId, amount) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId,
    paidAt: new Date(),
    paidAmount: amount,
  });

  // Also log to a payments collection for audit trail
  await addDoc(collection(db, 'payments'), {
    orderId,
    razorpayPaymentId,
    amount,
    currency: 'INR',
    status: 'success',
    createdAt: serverTimestamp(),
  });
};

/**
 * Records a failed payment attempt for debugging
 */
export const recordPaymentFailure = async (orderId, errorDescription) => {
  try {
    await addDoc(collection(db, 'payments'), {
      orderId,
      status: 'failed',
      errorDescription,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('Could not record payment failure:', e);
  }
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
