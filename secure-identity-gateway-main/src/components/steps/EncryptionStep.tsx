import React, { useState } from 'react';
import { simulateAESEncrypt, simulateAESDecrypt, generateRSAKeyPair } from '@/lib/crypto';
import TerminalCard from '@/components/TerminalCard';
import AlgorithmPanel from '@/components/AlgorithmPanel';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

const EncryptionStep: React.FC = () => {
  const [plaintext, setPlaintext] = useState('Sensitive user data');
  const [aesResult, setAesResult] = useState<{ ciphertext: string; key: string; decrypted: string } | null>(null);
  const [rsaKeys, setRsaKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const { addLog, setActiveStep, learnMode } = useAuthStore();

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
    <div className="space-y-4">
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

      {/* AES Deep Dive */}
      {learnMode && <AlgorithmPanel
        title="AES Symmetric Encryption"
        description="AES (Advanced Encryption Standard) encrypts data in 128-bit blocks using the same secret key for both encryption and decryption. It is the global standard for protecting classified data, used by governments and financial institutions worldwide."
        steps={[
          {
            label: 'Key Generation (CSPRNG)',
            detail: 'A random 128/256-bit key is generated using CSPRNG. This key must be kept secret.',
            deepDive: 'The AES key is generated using crypto.getRandomValues() — the same CSPRNG used for OTP generation. Key sizes:\n\n• AES-128: 128-bit key → 10 rounds\n• AES-192: 192-bit key → 12 rounds\n• AES-256: 256-bit key → 14 rounds\n\nMore rounds = more security but slightly slower. AES-256 is considered quantum-resistant (Grover\'s algorithm reduces effective security to 128 bits, which is still secure).',
            highlight: !!aesResult,
          },
          {
            label: 'Key Expansion (Rijndael Schedule)',
            detail: 'The cipher key is expanded into multiple round keys using the Rijndael key schedule.',
            deepDive: 'The original key is expanded into 11 round keys (for AES-128) using three operations:\n\n1. RotWord: Cyclic left rotation of a 4-byte word\n2. SubWord: Each byte is substituted using the S-Box\n3. XOR with Rcon: Round constant (powers of 2 in GF(2⁸))\n\nThis ensures each round uses a unique key derived from the original. Even knowing one round key, recovering the original key is computationally infeasible due to the non-linear S-Box substitution.',
          },
          {
            label: 'SubBytes (S-Box Substitution)',
            detail: 'Each byte in the data block is replaced using a pre-computed substitution table (S-Box).',
            deepDive: 'The AES S-Box is NOT arbitrary — it is mathematically constructed:\n\n1. Take the multiplicative inverse of each byte in the Galois Field GF(2⁸)\n2. Apply an affine transformation over GF(2)\n\nThis produces a substitution with optimal non-linearity, maximizing resistance to:\n• Linear cryptanalysis: Finding linear approximations of the cipher\n• Differential cryptanalysis: Analyzing how input differences propagate\n\nThe S-Box maps: 0x00→0x63, 0x01→0x7C, ..., 0xFF→0x16. Every byte maps to exactly one other byte (bijective).',
          },
          {
            label: 'ShiftRows + MixColumns',
            detail: 'Rows are shifted cyclically and columns are mixed using Galois field multiplication.',
            deepDive: 'ShiftRows provides inter-column diffusion:\n• Row 0: no shift\n• Row 1: shift left 1 byte\n• Row 2: shift left 2 bytes\n• Row 3: shift left 3 bytes\n\nMixColumns provides inter-byte diffusion within each column by multiplying with a fixed polynomial matrix in GF(2⁸):\n[2 3 1 1]   Each column is treated as a polynomial\n[1 2 3 1]   and multiplied modulo x⁴+1\n[1 1 2 3]\n[3 1 1 2]\n\nTogether, these ensure that changing one input byte affects ALL output bytes after just 2 rounds (full diffusion).',
          },
          {
            label: 'AddRoundKey + Output',
            detail: 'After 10 rounds (AES-128), the final ciphertext is produced. Decryption applies inverse operations.',
            deepDive: 'AddRoundKey XORs the state with the current round key. This is the only step that introduces key material into the cipher. Without it, the encryption would be a fixed permutation that anyone could reverse.\n\nThe final round omits MixColumns (this is not a security weakness — it\'s a design choice that simplifies implementation without reducing security).\n\nDecryption applies the inverse of each operation in reverse order: InvShiftRows, InvSubBytes, AddRoundKey, InvMixColumns.',
            highlight: !!aesResult,
          },
        ]}
        deepDiveSections={[
          {
            heading: 'Galois Field Arithmetic GF(2⁸)',
            text: 'AES operates in GF(2⁸) — a finite field with exactly 256 elements (0x00 to 0xFF). In this field:\n\n• Addition = XOR (no carries)\n• Multiplication = polynomial multiplication modulo the irreducible polynomial x⁸ + x⁴ + x³ + x + 1 (0x11B)\n\nThis field guarantees every non-zero element has a multiplicative inverse, which is essential for the S-Box construction and MixColumns operation. The irreducible polynomial was chosen because it produces a field with good cryptographic properties.',
          },
          {
            heading: 'Modes of Operation (CBC, CTR, GCM)',
            text: 'AES alone encrypts only one 128-bit block. For larger data, modes of operation chain blocks together:\n\n• ECB (Electronic Codebook): Each block encrypted independently. INSECURE — identical plaintext blocks produce identical ciphertext blocks (reveals patterns).\n• CBC (Cipher Block Chaining): Each block is XORed with the previous ciphertext block. Requires an IV. Sequential (slow).\n• CTR (Counter Mode): Encrypts a counter value, XORed with plaintext. Parallelizable and fast.\n• GCM (Galois/Counter Mode): CTR + authentication tag. Provides BOTH confidentiality and integrity. The recommended mode for modern applications.',
          },
          {
            heading: 'AES vs ChaCha20 — Modern Cipher Comparison',
            text: 'AES: Hardware-accelerated (AES-NI instruction on Intel/AMD CPUs), ~4 GB/s throughput. Dominant on desktop/server.\nChaCha20: Software-optimized, faster on devices without AES hardware (ARM mobile chips, IoT). Used by Google (TLS), WireGuard VPN.\n\nBoth are considered equally secure. The choice depends on hardware: AES with hardware support, ChaCha20 without.',
          },
        ]}
        codeExample={`// AES-GCM encryption with Web Crypto API
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
);
const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv }, key, new TextEncoder().encode("secret data")
);
// GCM automatically appends a 128-bit authentication tag
// → Provides confidentiality + integrity + authenticity`}
        securityNote="AES requires secure key distribution since both parties need the same key. In practice, AES is combined with RSA or Diffie-Hellman for key exchange (hybrid encryption). Never use ECB mode — it leaks patterns in the data."
        liveData={aesResult ? [
          { label: 'Plaintext', value: plaintext },
          { label: 'Key (hex)', value: aesResult.key, color: 'text-warning' },
          { label: 'Ciphertext', value: aesResult.ciphertext, color: 'text-destructive' },
          { label: 'Decrypted', value: aesResult.decrypted, color: 'text-primary' },
        ] : undefined}
      />}

      {/* RSA Deep Dive */}
      {learnMode && <AlgorithmPanel
        title="RSA Asymmetric Encryption"
        description="RSA uses two mathematically linked keys: a public key (shared openly) for encryption, and a private key (kept secret) for decryption. Security relies on the computational difficulty of factoring large semi-primes."
        steps={[
          {
            label: 'Prime Generation (p, q)',
            detail: 'Two large random primes p and q are generated (typically 1024 bits each for RSA-2048).',
            deepDive: 'Finding large primes uses probabilistic primality testing:\n\n1. Generate a random odd number of desired bit length\n2. Run Miller-Rabin primality test with k iterations\n3. If it passes all k tests, it\'s prime with probability > 1 - 4⁻ᵏ\n\nFor k=64 iterations, the false positive rate is < 2⁻¹²⁸ — astronomically unlikely. The density of primes near n is approximately 1/ln(n), so for 1024-bit numbers, roughly 1 in 710 odd numbers is prime.',
          },
          {
            label: 'Compute Modulus (n = p × q)',
            detail: 'n becomes the modulus. φ(n) = (p-1)(q-1) is Euler\'s totient.',
            deepDive: 'The modulus n = p × q is public — it\'s part of the public key. Security depends on the difficulty of factoring n back into p and q:\n\n• RSA-2048: n is a 617-digit number\n• Best factoring algorithm (GNFS): ~2¹¹² operations\n• Current record: RSA-250 (829 bits) factored in 2020 using 2700 CPU-years\n• RSA-2048 estimated: ~10²⁹ CPU-years to factor\n\nEuler\'s totient φ(n) = (p-1)(q-1) counts integers less than n that are coprime to n. This value must remain SECRET — knowing φ(n) trivially reveals the private key.',
          },
          {
            label: 'Public Exponent (e = 65537)',
            detail: 'Choose e coprime to φ(n). Public key = (n, e).',
            deepDive: 'The standard choice e = 65537 (0x10001 = 2¹⁶ + 1) is used for practical reasons:\n\n• It\'s prime → always coprime to φ(n)\n• Binary: 10000000000000001 → only two 1-bits\n• Fast modular exponentiation via square-and-multiply (only 17 multiplications)\n• Large enough to prevent small-exponent attacks\n\nSmaller values (e=3) are faster but vulnerable to Coppersmith\'s attack if the message is short. e=65537 is the universally accepted compromise.',
          },
          {
            label: 'Private Exponent (d = e⁻¹ mod φ(n))',
            detail: 'Computed using the Extended Euclidean Algorithm. Private key = (n, d).',
            deepDive: 'The Extended Euclidean Algorithm finds d such that:\ne × d ≡ 1 (mod φ(n))\n\nThis means e × d = k × φ(n) + 1 for some integer k.\n\nCorrectness proof (Euler\'s Theorem):\n(mᵉ)ᵈ = m^(e×d) = m^(k×φ(n)+1) = m × (m^φ(n))^k\n\nBy Euler\'s theorem, m^φ(n) ≡ 1 (mod n) when gcd(m,n) = 1\nSo (mᵉ)ᵈ ≡ m × 1^k ≡ m (mod n) ✓\n\nThis proves decryption recovers the original message.',
            highlight: !!rsaKeys,
          },
          {
            label: 'Encrypt / Decrypt',
            detail: 'Encrypt: c = mᵉ mod n. Decrypt: m = cᵈ mod n. Only the private key holder can decrypt.',
            deepDive: 'Encryption: c = mᵉ mod n (anyone can do this with the public key)\nDecryption: m = cᵈ mod n (only the private key holder)\n\nModular exponentiation is computed efficiently using the square-and-multiply algorithm, which reduces mᵉ mod n from e multiplications to log₂(e) multiplications.\n\nIMPORTANT: The message m must be smaller than n. For larger data, use hybrid encryption:\n1. Generate random AES key K\n2. Encrypt data with AES: C_data = AES(K, data)\n3. Encrypt AES key with RSA: C_key = RSA(pubkey, K)\n4. Send both C_data and C_key\n5. Recipient decrypts K with RSA, then decrypts data with AES',
          },
        ]}
        deepDiveSections={[
          {
            heading: 'RSA Padding — OAEP vs PKCS#1 v1.5',
            text: 'Raw (textbook) RSA is INSECURE:\n• Deterministic: same plaintext → same ciphertext (leaks information)\n• Malleable: attacker can manipulate ciphertext to alter plaintext\n\nOAEP (Optimal Asymmetric Encryption Padding) fixes both:\n1. Add random padding to message before encryption\n2. This makes encryption probabilistic (same input → different output each time)\n3. Provides CCA2 security (secure against adaptive chosen-ciphertext attacks)\n\nPKCS#1 v1.5 is the older padding scheme — still widely used but vulnerable to Bleichenbacher\'s attack (padding oracle). OAEP is recommended for all new implementations.',
          },
          {
            heading: 'RSA Digital Signatures',
            text: 'RSA also provides digital signatures (authentication, not just encryption):\n\n• Sign: signature = hash(message)^d mod n (using private key)\n• Verify: hash(message) =? signature^e mod n (using public key)\n\nOnly the private key holder can create valid signatures, but anyone with the public key can verify them. This is used in:\n• Code signing (ensuring software hasn\'t been tampered with)\n• TLS certificates (proving server identity)\n• JWT tokens (signed with RSA-SHA256)',
          },
          {
            heading: 'Quantum Threat & Post-Quantum Cryptography',
            text: 'Shor\'s algorithm on a quantum computer can factor large numbers in polynomial time, completely breaking RSA. Timeline estimates vary:\n\n• Optimistic: 10-15 years for cryptographically relevant quantum computers\n• Conservative: 20-30 years\n\nNIST has standardized post-quantum alternatives:\n• CRYSTALS-Kyber: Lattice-based key encapsulation (replacing RSA/DH key exchange)\n• CRYSTALS-Dilithium: Lattice-based digital signatures\n• SPHINCS+: Hash-based signatures\n\n"Harvest now, decrypt later" attacks mean encrypted data captured today could be decrypted when quantum computers arrive. Sensitive data should already be migrating to post-quantum encryption.',
          },
        ]}
        codeExample={`// RSA-OAEP key pair generation with Web Crypto API
const keyPair = await crypto.subtle.generateKey(
  {
    name: "RSA-OAEP",
    modulusLength: 2048,          // n is 2048 bits
    publicExponent: new Uint8Array([1, 0, 1]), // e = 65537
    hash: "SHA-256",              // hash for OAEP padding
  },
  true, ["encrypt", "decrypt"]
);

// Encrypt with public key
const ciphertext = await crypto.subtle.encrypt(
  { name: "RSA-OAEP" },
  keyPair.publicKey,
  new TextEncoder().encode("secret message")
);

// Decrypt with private key
const plaintext = await crypto.subtle.decrypt(
  { name: "RSA-OAEP" },
  keyPair.privateKey,
  ciphertext
);`}
        securityNote="RSA is ~1000x slower than AES. In practice, RSA encrypts a random AES key (hybrid encryption), and AES encrypts the actual data. Quantum computers could break RSA via Shor's algorithm — post-quantum alternatives (CRYSTALS-Kyber) are being standardized by NIST."
        liveData={rsaKeys ? [
          { label: 'Public Key', value: rsaKeys.publicKey.replace(/-----.*-----/g, '').trim().slice(0, 40) + '...', color: 'text-primary' },
          { label: 'Private Key', value: rsaKeys.privateKey.replace(/-----.*-----/g, '').trim().slice(0, 40) + '...', color: 'text-destructive' },
          { label: 'Security', value: 'Private key never shared — only public key is distributed', color: 'text-muted-foreground' },
        ] : undefined}
      />}
    </div>
  );
};

export default EncryptionStep;
