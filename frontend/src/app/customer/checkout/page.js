export default function CheckoutPage() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="text-gray-500 mt-2">
        Checkout and payment flow will be connected here.
      </p>

      {/* TODO:
          POST /orders
          POST /payments
          Keep payment secrets on the backend.
          Never expose payment secret keys in NEXT_PUBLIC_* variables.
      */}
    </section>
  );
}
