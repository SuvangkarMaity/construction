import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function DuePayments() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    async function load() {
      setSales(await fetchJson('/sales/due'));
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-card">
        <h2>Due Payments</h2>
        <p>Review due amounts and navigate to customer details for date-wise sales and payments.</p>
      </div>

      <div className="page-card">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Sale Date</th>
              <th>Material</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.customer?.name}</td>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>{sale.material?.name}</td>
                <td>{sale.quantity * sale.sellingPrice}</td>
                <td>{sale.totalPaid || 0}</td>
                <td>{sale.dueAmount}</td>
                <td>
                  <Link to={`/customer/${sale.customer?._id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
