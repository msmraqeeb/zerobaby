import SSLCommerzPayment from 'sslcommerz-lts';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { amount, transactionId, customerName, customerEmail, customerPhone } = req.body;

    const isLive = process.env.IS_LIVE === 'true';
    const storeId = process.env.STORE_ID;
    const storePassword = process.env.STORE_PASSWORD;

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/order-success/${transactionId}`,
        fail_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/checkout`,
        cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/checkout`,
        ipn_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/api/ipn`,
        shipping_method: 'Courier',
        product_name: 'Grocery Items',
        product_category: 'Grocery',
        product_profile: 'general',
        cus_name: customerName || 'Customer Name',
        cus_email: customerEmail || 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: customerPhone || '01711111111',
    };

    const sslcz = new SSLCommerzPayment(storeId, storePassword, isLive);

    try {
        const apiResponse = await sslcz.init(data);
        console.log('SSLCommerz API Response:', apiResponse);
        if (apiResponse?.GatewayPageURL) {
            res.status(200).json({ gatewayUrl: apiResponse.GatewayPageURL });
        } else {
            console.error('SSLCommerz Initialization Failed. Response:', apiResponse);
            res.status(500).json({ error: 'Failed to generate payment URL', details: apiResponse });
        }
    } catch (error) {
        console.error('SSLCommerz Error:', error);
        res.status(500).json({ error: 'Payment initialization failed', message: error.message });
    }

}