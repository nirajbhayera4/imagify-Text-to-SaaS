import crypto from "node:crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";

// All amounts are in paise. The browser can request a plan, never set its price.
const plans = {
  basic: { amount: 1000, credits: 100 },
  advanced: { amount: 5000, credits: 500 },
  business: { amount: 25000, credits: 5000 },
};

const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
};

export const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Razorpay is not configured on the server" });
    }

    const planId = req.body?.planId;
    const plan = plans[planId];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid credit plan" });

    const user = await userModel.findById(req.userId).select("name email");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      receipt: `${user._id.toString().slice(-12)}-${Date.now()}`,
      notes: { userId: user._id.toString(), planId },
    });

    await paymentModel.create({
      userId: user._id,
      planId,
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: "INR",
      credits: plan.credits,
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      credits: plan.credits,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Create Razorpay order failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not start checkout" });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body ?? {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  try {
    const payment = await paymentModel.findOne({ razorpayOrderId: orderId, userId: req.userId });
    if (!payment) return res.status(404).json({ success: false, message: "Payment order not found" });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(503).json({ success: false, message: "Razorpay is not configured on the server" });

    const expected = crypto.createHmac("sha256", secret)
      .update(`${payment.razorpayOrderId}|${paymentId}`)
      .digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return res.status(400).json({ success: false, message: "Payment signature is invalid" });
    }

    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ success: false, message: "Razorpay is not configured on the server" });

    let providerPayment = await razorpay.payments.fetch(paymentId);
    if (
      providerPayment.order_id !== payment.razorpayOrderId ||
      providerPayment.amount !== payment.amount ||
      providerPayment.currency !== payment.currency
    ) {
      return res.status(400).json({ success: false, message: "Payment details do not match this order" });
    }
    if (providerPayment.status === "authorized") {
      providerPayment = await razorpay.payments.capture(paymentId, payment.amount, payment.currency);
    }
    if (providerPayment.status !== "captured") {
      return res.status(400).json({ success: false, message: "Payment has not been captured" });
    }

    // Keep payment state and balance update atomic so a retry cannot add credits twice.
    const session = await mongoose.startSession();
    let balance;
    try {
      await session.withTransaction(async () => {
        const claimed = await paymentModel.findOneAndUpdate(
          { _id: payment._id, status: "created" },
          { $set: { status: "paid", razorpayPaymentId: paymentId } },
          { new: true, session }
        );

        if (claimed) {
          const user = await userModel.findByIdAndUpdate(
            payment.userId,
            { $inc: { creditBalance: payment.credits } },
            { new: true, session }
          );
          if (!user) throw new Error("User not found while adding credits");
          balance = user.creditBalance;
        } else {
          const existing = await paymentModel.findById(payment._id).session(session);
          if (existing?.status !== "paid" || existing.razorpayPaymentId !== paymentId) {
            throw new Error("Order has already been processed");
          }
          const user = await userModel.findById(payment.userId).session(session);
          balance = user?.creditBalance ?? 0;
        }
      });
    } finally {
      await session.endSession();
    }

    return res.json({ success: true, message: "Payment verified", credits: balance });
  } catch (error) {
    console.error("Verify Razorpay payment failed:", error.message);
    return res.status(500).json({ success: false, message: "Could not verify payment" });
  }
};
