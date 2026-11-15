import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchJson } from '../services/api';

export default function CustomerDetails() {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    async function load() {
      setCustomerData(await fetchJson(`/customers/${id}`));
    }
    if (id) load();
  }, [id]);

  if (!customerData) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-card">
        <h2>{customerData.customer.name}</h2>
        <p>{customerData.customer.email || ''}</p>
        <p>{customerData.customer.phone || ''}</p>
        <p>{customerData.customer.unit || ''}</p>
        <p>{customerData.customer.address || ''}</p>
      </div>

      <div className="page-card">
        <h3>Purchase & Payment History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Material</th>
              <th>Qty</th>
              <th>Sale Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Mode/Note</th>
            </tr>
          </thead>
          <tbody>
            {customerData.sales.map((sale) => (
              <tr key={sale._id}>
                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                <td>{sale.material?.name}</td>
                <td>{sale.quantity}</td>
                <td>{sale.sellingPrice}</td>
                <td>{sale.quantity * sale.sellingPrice}</td>
                <td>{sale.status}</td>
                <td>{sale.totalPaid || 0}</td>
                <td>
                  {sale.payments?.map((payment, index) => (
                    <div key={index}>
                      {payment.mode} {payment.amount} {payment.note ? `(${payment.note})` : ''}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
