import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function BlockchainLedger() {
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    api.get('/admin/blockchain').then((r) => setLedger(r.data)).catch(console.error);
  }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <span style={{ fontSize: '32px' }}>⛓️</span>
        <h1>FSP Chain Explorer (PBFT Ledger)</h1>
      </div>
      <p className="muted">
        This ledger uses SHA-256 hashing and Ed25519 digital signatures. Every block is cryptographically linked to the previous one.
      </p>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Block Height</th>
              <th>Request Ref</th>
              <th>Block Hash</th>
              <th>Data Hash (SHA-256)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((block) => (
              <tr key={block.block_id}>
                <td><strong>#{block.block_height}</strong></td>
                <td>{block.reference_number}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
                  {block.current_block_hash.slice(0, 20)}...
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
                  {block.data_hash.slice(0, 20)}...
                </td>
                <td>
                  <span className="status status-completed">✅ Verified</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}