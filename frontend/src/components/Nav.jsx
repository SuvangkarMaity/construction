import { NavLink } from 'react-router-dom';

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/godowns', label: 'Godowns' },
  { path: '/materials', label: 'Materials' },
  { path: '/orders', label: 'Orders & Payments' },
  { path: '/advanced-payments', label: 'Advanced Payments' },
  { path: '/companies', label: 'Companies' },
  { path: '/stock', label: 'Stock In/Out' },
  { path: '/sales', label: 'Sales' },
  { path: '/customers', label: 'Customers' },
  { path: '/customer-payments', label: 'Customer Payments' },
  { path: '/payments', label: 'Payments' },
  { path: '/targets', label: 'Targets' },
];

export default function Nav() {
  return (
    <aside className="sidebar">
      <h1>CMMS</h1>
      <p>Material & payments management for every godown.</p>
      <nav>
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} className={({ isActive }) => (isActive ? 'active' : '')}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
