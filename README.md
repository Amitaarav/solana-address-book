# Solana Address Book API

A comprehensive backend service built with TypeScript and Express.js for managing a Solana address book and providing essential cryptographic utilities for the Solana blockchain.

## 🏗 Project Structure

The project follows a standard layered architecture to ensure separation of concerns and maintainability.

```text
solana-address-book/
├── src/
│   ├── controllers/      # Request handlers (Contact & Crypto logic)
│   ├── middleware/       # Zod validation and error handling
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic (In-memory contact storage)
│   ├── utils/            # Solana-specific utility functions
│   ├── types/            # TypeScript interface definitions
│   └── index.ts          # Application entry point
├── .env                  # Environment variables
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🔄 Logic & Workflow

The API processes requests through a request-response cycle involving validation, control, and service layers.

### Request Flow Diagram

```mermaid
graph TD
    A[Client Request] --> B{Middleware}
    B -->|Zod Validation| C[Controller]
    B -->|Invalid| D[400 Bad Request]
    
    C --> E[Service Layer]
    C --> F[Solana Utils]
    
    E -->|In-memory Storage| G[Contact Data]
    F -->|@solana/web3.js| H[Solana Network Info]
    
    G --> I[Controller]
    H --> I
    
    I --> J[JSON Response]
```

### Detailed Flow Explanation
1.  **Validation**: Every incoming request for creating/updating contacts or performing crypto operations is validated using **Zod** schemas to ensure data integrity.
2.  **Contact Management**: Handled by the `ContactService`, which maintains an in-memory database of addresses. It automatically detects if an address is a standard Wallet or a Program Derived Address (PDA).
3.  **Crypto Utilities**: Leveraging `@solana/web3.js`, the API provides specialized tools for deriving accounts and verifying ownership without needing a frontend wallet connection.

## ✨ Key Features & Logic

### 1. Contact Management (CRUD)
-   **Create Contact**: Validates the Solana address and stores it with a name.
-   **Auto-Detection**: Automatically identifies if the added address is a `wallet` (on-curve) or a `pda` (off-curve).
-   **Filter & Sort**: Retrieve contacts by type and sorted by ID.

### 2. Solana Utilities
-   **ATA Derivation**: Calculate the Associated Token Account for any user and any token mint.
-   **Signature Verification**: Verify that a specific message was signed by a specific Solana address (Ed25519).
-   **PDA Derivation**: Programmatically find PDAs using a Program ID and an array of seeds.

## 🛠 Crucial Functions Reference

These functions located in `src/utils/solana.ts` are the core of the project's Solana integration:

### `isValidSolanaAddress(address: string): boolean`
Validates if a string is a properly formatted Solana Public Key.
```typescript
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
```

### `deriveATA(ownerAddress: string, mintAddress: string): string`
Derives the Associated Token Account (ATA) address for a given owner and token mint.
```typescript
export function deriveATA(ownerAddress: string, mintAddress: string) {
  const ownerPubkey = new PublicKey(ownerAddress);
  const mintPubkey = new PublicKey(mintAddress);
  
  const [ata] = PublicKey.findProgramAddressSync(
    [
      ownerPubkey.toBuffer(),
      TOKEN_PROGRAM.toBuffer(),
      mintPubkey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM
  );
  
  return ata.toBase58();
}
```

### `verifySignature(address: string, message: string, signature: string): boolean`
Verifies an Ed25519 signature of a message against a public key. Crucial for non-custodial authentication.
```typescript
export function verifySignature(address: string, message: string, signature: string): boolean {
  try {
    const pubkey = new PublicKey(address).toBytes();
    const messageBytes = Buffer.from(message, 'utf8');
    const signatureBytes = bs58.decode(signature);
    
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkey);
  } catch {
    return false;
  }
}
```

### `derivePDA(programId: string, seeds: string[])`
Finds a Program Derived Address and its bump seed.
```typescript
export function derivePDA(programId: string, seeds: string[]) {
  const programPubkey = new PublicKey(programId);
  const seedBuffers = seeds.map(seed => Buffer.from(seed, 'utf8'));
  const [pda, bump] = PublicKey.findProgramAddressSync(seedBuffers, programPubkey);
  return { pda: pda.toBase58(), bump };
}
```

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Default Port**: The API runs on `http://localhost:3000`.

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/contacts` | Create a new contact |
| `GET` | `/api/contacts` | Get all contacts (optional `type` query) |
| `GET` | `/api/contacts/:id` | Get contact by ID |
| `PUT` | `/api/contacts/:id` | Update contact name |
| `DELETE` | `/api/contacts/:id` | Delete a contact |
| `POST` | `/api/contacts/:id/derive-ata` | Derive ATA for a contact + mint |
| `POST` | `/api/verify-ownership` | Verify a message signature |
| `POST` | `/api/derive-pda` | Derive a PDA from seeds |
