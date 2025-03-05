const Razorpay = require("razorpay");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
exports.payment = async ({ username, email, product, quantity, amount }) => {
    try {
        const parsedAmount = parseInt(amount);
        const parsedQuantity = parseInt(quantity) || 1;
        if (parsedAmount <= 0 || parsedQuantity <= 0) {
            return {
                status: 400,
                message: "Amount and quantity must be greater than zero",
            };
        }
        const totalAmount = parsedAmount * parsedQuantity * 100;
        const options = {
            amount: totalAmount,
            currency: "INR",
            receipt: `${email}`,
            payment_capture: 1,
            notes: {
                product_name: product,
                username,
                email,
            },
        };
        const createNewOrder = async (options) => {
            try {
                const order = await razorpay.orders.create(options);
                return order;
            } catch (error) {
                console.error("Error creating order:", error);
                throw new Error("Failed to create order");
            }
        }
        const order =await createNewOrder(options);
        if (!order) {
            return {
                status: 400,
                message: "Order creation failed",
            };
        }
        return {
            orderId: order.id,
            amount: order.amount,
            receipt: order.receipt,
            currency: order.currency,
            notes: order.notes,
        };
    } catch (err) {
        return {
            status: err.status || 500,
            message: err.message || "Payment creation failed",
        };
    }
};