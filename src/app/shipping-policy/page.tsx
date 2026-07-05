import React from 'react';
import styles from '../policy.module.css';

export default function ShippingPolicy() {
  return (
    <div className={styles.policyWrapper}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Shipping Policy</h1>
        <p className={styles.lastUpdated}>Effective Date: July 2026</p>
      </header>
      
      <main className={styles.container}>
        <div className={styles.content}>
          <p>At Decoristta, we are committed to delivering your home décor products safely and efficiently across India. Please read our shipping policy carefully before placing your order.</p>

          <h2>Shipping Charges</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order Value</th>
                <th>Shipping Charges</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Below ₹999 (Prepaid Orders)</td>
                <td>₹99</td>
              </tr>
              <tr>
                <td>₹999 – ₹3,499 (Prepaid Orders)</td>
                <td>₹49</td>
              </tr>
              <tr>
                <td>Above ₹3,499 (Prepaid Orders)</td>
                <td><strong>Free Shipping</strong></td>
              </tr>
              <tr>
                <td>Cash on Delivery (Eligible Orders)</td>
                <td>₹99</td>
              </tr>
            </tbody>
          </table>

          <p><strong>Please Note:</strong></p>
          <ul>
            <li>Cash on Delivery (COD) is available only on eligible orders and serviceable pincodes.</li>
            <li>Shipping charges, if applicable, are displayed at checkout before payment.</li>
          </ul>

          <h2>Order Processing & Dispatch</h2>
          <ul>
            <li>Orders are typically processed and dispatched within <strong>1–2 business days</strong> after order confirmation.</li>
            <li>Orders placed on Sundays or public holidays will be processed on the next working day.</li>
            <li>During festivals, promotional sales, or periods of high order volume, dispatch timelines may be extended slightly.</li>
          </ul>

          <h2>Estimated Delivery Time</h2>
          <p>Most orders are delivered within <strong>3–7 business days</strong> after dispatch, depending on the delivery location.</p>
          <p>Delivery timelines displayed at checkout are estimates and may vary due to factors such as:</p>
          <ul>
            <li>Delivery location</li>
            <li>Weather conditions</li>
            <li>Public holidays</li>
            <li>Courier partner operations</li>
            <li>Other unforeseen logistical circumstances</li>
          </ul>
          <p>While we partner with reliable logistics providers, occasional delays beyond our control may occur.</p>

          <h2>Order Tracking</h2>
          <p>Once your order has been shipped, you will receive a tracking link via email and/or SMS, allowing you to monitor your shipment in real time.</p>

          <h2>Multiple Shipments</h2>
          <p>Some orders may be fulfilled from different warehouses and delivered in multiple packages. In such cases, you will only be charged <strong>one shipping fee</strong> for the entire order.</p>

          <h2>Cash on Delivery (COD)</h2>
          <ul>
            <li>COD is available only for eligible products and serviceable pincodes.</li>
            <li>Payment must be made before accepting the delivery.</li>
            <li>Decoristta reserves the right to disable COD for specific orders, customers, or locations based on operational considerations.</li>
            <li>Repeated refusal of COD orders may result in the COD payment option being restricted for future purchases.</li>
          </ul>

          <h2>Delivery Address</h2>
          <p>Customers are responsible for providing complete and accurate shipping information.</p>
          <p>If an order is returned due to an incorrect or incomplete address provided by the customer, additional shipping charges may apply for re-dispatch.</p>

          <h2>Damaged or Tampered Packages</h2>
          <p>If your package appears damaged, tampered with, or opened at the time of delivery, please:</p>
          <ul>
            <li>Refuse the delivery whenever possible, or</li>
            <li>Record an unboxing video and contact our support team within <strong>24 hours</strong> of receiving the package.</li>
          </ul>
          <p>Claims reported after this period may not be eligible for resolution.</p>

          <h2>Special Delivery Requests</h2>
          <p>If you have a time-sensitive delivery request, please mention it in the order notes and email us at <a href="mailto:info@decoristta.com">info@decoristta.com</a>.</p>
          <p>While we will make every reasonable effort to accommodate your request, delivery within a specific date or time cannot be guaranteed.</p>

          <h2>Serviceable Locations</h2>
          <p>Decoristta currently delivers across most locations in India through trusted logistics partners.</p>
          <p>If your location is not serviceable, our team will contact you to discuss available alternatives or arrange a refund if delivery is not possible.</p>

          <h2>Order Cancellation</h2>
          <ul>
            <li>Orders may be cancelled within <strong>1 hour</strong> of placement, provided they have not entered processing or dispatch.</li>
            <li>Once an order has been packed or shipped, cancellation requests cannot be accepted.</li>
          </ul>

          <h2>Undeliverable & Returned Orders</h2>
          <p>If an order is returned to us due to:</p>
          <ul>
            <li>refusal to accept delivery,</li>
            <li>an incorrect or incomplete address,</li>
            <li>the customer being unavailable after multiple delivery attempts, or</li>
            <li>failure to collect the shipment,</li>
          </ul>
          <p>the order will be considered <strong>Return to Origin (RTO)</strong>.</p>
          <p>Re-shipping such orders will require payment of applicable shipping charges before dispatching the order again.</p>

          <h2>International Shipping</h2>
          <p>Currently, Decoristta ships <strong>only within India</strong>.</p>
          <p>International shipping will be introduced in the future.</p>
          <p>We do <strong>not</strong> deliver to P.O. Box or APO/FPO addresses.</p>

          <h2>Need Assistance?</h2>
          <p>For any questions regarding shipping, delivery, order tracking, or logistics, please contact us:</p>
          <p><strong>Email:</strong> <a href="mailto:info@decoristta.com">info@decoristta.com</a></p>
          <p>We appreciate your trust in Decoristta and are committed to making your shopping experience smooth—from checkout to doorstep.</p>
        </div>
      </main>
    </div>
  );
}
