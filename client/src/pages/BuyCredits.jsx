import React, { useContext, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import { plans, assets } from "../assets/icons/assets";
import { AppContext } from "../context/Appcontext";

let razorpayLoadPromise;
const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoadPromise) return razorpayLoadPromise;

  razorpayLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayLoadPromise = null;
      reject(new Error("Could not load Razorpay Checkout"));
    };
    document.body.appendChild(script);
  });
  return razorpayLoadPromise;
};

const BuyCredits = () => {
  const { user, backendUrl, token, setShowLogin, loadCreditsData } = useContext(AppContext);
  const [processingPlan, setProcessingPlan] = useState("");

  const purchasePlan = async (plan) => {
    if (!user || !token) {
      setShowLogin(true);
      return;
    }
    if (!backendUrl) {
      toast.error("Backend URL is not configured");
      return;
    }

    const planId = plan.id.toLowerCase();
    setProcessingPlan(planId);
    try {
      await loadRazorpayCheckout();

      const { data: order } = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { planId },
        { headers: { token } }
      );
      if (!order.success) throw new Error(order.message || "Could not start checkout");

      let checkoutFinished = false;
      const finishCheckout = () => {
        if (checkoutFinished) return;
        checkoutFinished = true;
        setProcessingPlan("");
      };

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Imagify",
        description: `${order.credits} image generation credits`,
        order_id: order.orderId,
        prefill: { name: order.user.name, email: order.user.email },
        theme: { color: "#2563eb" },
        handler: async (paymentDetails) => {
          try {
            const { data: result } = await axios.post(
              `${backendUrl}/api/payment/verify`,
              paymentDetails,
              { headers: { token } }
            );
            if (!result.success) throw new Error(result.message || "Payment verification failed");

            await loadCreditsData();
            toast.success(`${order.credits} credits added to your account`);
          } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Could not verify payment");
          } finally {
            finishCheckout();
          }
        },
        modal: { ondismiss: finishCheckout },
      });

      checkout.on("payment.failed", ({ error }) => {
        toast.error(error?.description || "Payment failed. Please try again.");
        finishCheckout();
      });
      checkout.open();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not start checkout");
      setProcessingPlan("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-14 mb-10"
    >
      <div className="inline-block border border-gray-400 px-10 py-2 rounded-full mb-6">Our Plans</div>
      <h1 className="text-3xl font-medium mb-6 sm:mb-10">Choose a plan</h1>
      <div className="flex flex-wrap justify-center gap-6 text-left">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white drop-shadow-sm rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all"
          >
            <img width={40} src={assets.logo_icon} alt="Imagify" />
            <p className="mt-3 mb-1 font-semibold">{plan.id}</p>
            <p className="text-sm">{plan.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">{"\u20B9"}{plan.price}</span> / {plan.credits} credits
            </p>
            <button
              type="button"
              disabled={Boolean(processingPlan)}
              onClick={() => purchasePlan(plan)}
              className="w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52 disabled:opacity-60 disabled:cursor-wait"
            >
              {processingPlan === plan.id.toLowerCase()
                ? "Processing..."
                : user
                  ? "Purchase"
                  : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredits;
