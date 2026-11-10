import { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('fasp_customer');
    if (raw) setCustomer(JSON.parse(raw));
  }, []);

  const saveCustomer = (token, cust) => {
    localStorage.setItem('fasp_customer_token', token);
    localStorage.setItem('fasp_customer', JSON.stringify(cust));
    setCustomer(cust);
  };

  const logoutCustomer = () => {
    localStorage.removeItem('fasp_customer_token');
    localStorage.removeItem('fasp_customer');
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider value={{ customer, saveCustomer, logoutCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);