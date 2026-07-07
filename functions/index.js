const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// Initialize Razorpay with environment variables.
// Read from process.env (loaded automatically from .env by Firebase)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TAeKKzYiH2zniV',
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Callable function to securely create a Razorpay order from the backend.
 * Expects { amount, currency, receipt } in the data payload.
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Authentication check (optional but recommended for a real app)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
  // }

  const { amount, currency = 'INR', receipt = 'receipt#1' } = data;

  if (!amount) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount is required.');
  }

  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create order.');
  }
});

/**
 * Callable function to securely verify a Razorpay payment signature.
 * Expects { orderData, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  const { orderData, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing payment verification details.');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Create the expected signature
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpaySignature;

  if (isAuthentic) {
    try {
      // Payment is verified! Write the order to Firestore securely.
      const orderRef = await db.collection('orders').add({
        ...orderData,
        paymentStatus: 'paid',
        status: 'pending',
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Audit trail
      await db.collection('payments').add({
        orderId: orderRef.id,
        razorpayPaymentId,
        razorpayOrderId,
        status: 'success',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, orderId: orderRef.id };
    } catch (dbError) {
      console.error('Error writing to Firestore:', dbError);
      throw new functions.https.HttpsError('internal', 'Payment verified but failed to save order.');
    }
  } else {
    throw new functions.https.HttpsError('permission-denied', 'Invalid payment signature.');
  }
});
