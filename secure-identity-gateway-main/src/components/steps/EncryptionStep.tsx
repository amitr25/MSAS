import React, { useState } from 'react';
import { simulateAESEncrypt, simulateAESDecrypt, generateRSAKeyPair } from '@/lib/crypto';
import TerminalCard from '@/components/TerminalCard';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

const EncryptionStep: React.FC = () => {
  const [plaintext, setPlaintext] = useState('Sensitive user data');
  const [aesResult, setAesResult] = useState<{ ciphertext: string; key: string; decrypted: string } | null>(null);
  const [rsaKeys, setRsaKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const { addLog, setActiveStep } = useAuthStore();

  const handleAES = () => {
    const { ciphertext, key } = simulateAESEncrypt(plaintext);
    const decrypted = simulateAESDecrypt(ciphertext, key);
    setAesResult({ ciphertext, key, decrypted });
    addLog({ event: 'AES encryption/decryption demonstrated', status: 'info' });
  };

  const handleRSA = () => {
    const keys = generateRSAKeyPair();
    setRsaKeys(keys);
    addLog({ event: 'RSA key pair generated', status: 'info' });
  };

  return (
    <TerminalCard title="encryption_demo.sh" icon={<Lock size={12} />} active>
      <div className="space-y-5">
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary">$</span> Demonstrate AES (symmetric) and RSA (asymmetric) encryption
        </div>

        {/* AES */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-info font-semibold">▸ AES Symmetric Encryption</div>
          <input
            value={plaintext}
            onChange={e => setPlaintext(e.target.value)}
            className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50"
            placeholder="Enter data to encrypt"
          />
          <button
            onClick={handleAES}
            disabled={!plaintext}
            className="px-4 py-1.5 rounded bg-info/20 text-info border border-info/30 font-mono text-xs hover:bg-info/30 transition-colors disabled:opacity-40"
          >
            Encrypt → Decrypt
          </button>
          {aesResult && (
            <div className="bg-secondary/80 rounded p-3 border border-border/50 space-y-2 text-xs font-mono animate-fade-in">
              <div><span className="text-muted-foreground">Key: </span><span className="text-warning break-all">{aesResult.key}</span></div>
              <div><span className="text-muted-foreground">Ciphertext: </span><span className="text-destructive break-all">{aesResult.ciphertext}</span></div>
              <div><span className="text-muted-foreground">Decrypted: </span><span className="text-primary">{aesResult.decrypted}</span></div>
            </div>
          )}
        </div>

        {/* RSA */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-accent font-semibold">▸ RSA Asymmetric Key Pair</div>
          <button
            onClick={handleRSA}
            className="px-4 py-1.5 rounded bg-accent/20 text-accent border border-accent/30 font-mono text-xs hover:bg-accent/30 transition-colors"
          >
            Generate Key Pair
          </button>
          {rsaKeys && (
            <div className="bg-secondary/80 rounded p-3 border border-border/50 space-y-2 text-xs font-mono animate-fade-in">
              <div><span className="text-muted-foreground">Public Key:</span><pre className="text-primary mt-1 whitespace-pre-wrap break-all">{rsaKeys.publicKey}</pre></div>
              <div><span className="text-muted-foreground">Private Key:</span><pre className="text-destructive mt-1 whitespace-pre-wrap break-all">{rsaKeys.privateKey}</pre></div>
            </div>
          )}
        </div>

        <button onClick={() => setActiveStep(5)} className="text-xs font-mono text-primary/70 hover:text-primary underline">
          → Proceed to Token Management
        </button>
      </div>
    </TerminalCard>
  );
};

export default EncryptionStep;
