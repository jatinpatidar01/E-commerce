ALTER TABLE orders
ADD COLUMN razorpay_order_id VARCHAR(100),
ADD COLUMN razorpay_payment_id VARCHAR(100),
ADD COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'pending';