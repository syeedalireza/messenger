/**
 * @fileoverview Crypto Service for E2EE
 * @description Provides encryption/decryption and key management
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as sodium from 'libsodium-wrappers';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CryptoService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await sodium.ready;
  }

  /**
   * Generate a new key pair for a user
   * @returns Public and private key pair (base64 encoded)
   */
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const keyPair = sodium.crypto_box_keypair();
    
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey),
    };
  }

  /**
   * Store user's public key
   * @param userId - User ID
   * @param publicKey - Base64 encoded public key
   */
  async storePublicKey(userId: string, publicKey: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { publicKey },
    });
  }

  /**
   * Get user's public key
   * @param userId - User ID
   * @returns Base64 encoded public key
   */
  async getPublicKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { publicKey: true },
    });

    return user?.publicKey || null;
  }

  /**
   * Encrypt message for a recipient
   * @param message - Plain text message
   * @param recipientPublicKey - Recipient's public key (base64)
   * @param senderPrivateKey - Sender's private key (base64)
   * @returns Encrypted message (base64)
   */
  encryptMessage(
    message: string,
    recipientPublicKey: string,
    senderPrivateKey: string,
  ): string {
    const messageBytes = sodium.from_string(message);
    const recipientPubKeyBytes = sodium.from_base64(recipientPublicKey);
    const senderPrivKeyBytes = sodium.from_base64(senderPrivateKey);

    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const encrypted = sodium.crypto_box_easy(
      messageBytes,
      nonce,
      recipientPubKeyBytes,
      senderPrivKeyBytes,
    );

    // Combine nonce and ciphertext
    const combined = new Uint8Array(nonce.length + encrypted.length);
    combined.set(nonce);
    combined.set(encrypted, nonce.length);

    return sodium.to_base64(combined);
  }

  /**
   * Decrypt message
   * @param encryptedMessage - Encrypted message (base64)
   * @param senderPublicKey - Sender's public key (base64)
   * @param recipientPrivateKey - Recipient's private key (base64)
   * @returns Decrypted message
   */
  decryptMessage(
    encryptedMessage: string,
    senderPublicKey: string,
    recipientPrivateKey: string,
  ): string {
    const combined = sodium.from_base64(encryptedMessage);
    
    // Extract nonce and ciphertext
    const nonce = combined.slice(0, sodium.crypto_box_NONCEBYTES);
    const ciphertext = combined.slice(sodium.crypto_box_NONCEBYTES);

    const senderPubKeyBytes = sodium.from_base64(senderPublicKey);
    const recipientPrivKeyBytes = sodium.from_base64(recipientPrivateKey);

    const decrypted = sodium.crypto_box_open_easy(
      ciphertext,
      nonce,
      senderPubKeyBytes,
      recipientPrivKeyBytes,
    );

    return sodium.to_string(decrypted);
  }

  /**
   * Generate device-specific encryption key
   * @param deviceId - Device identifier
   * @returns Device key
   */
  generateDeviceKey(deviceId: string): string {
    const key = sodium.crypto_secretbox_keygen();
    return sodium.to_base64(key);
  }

  /**
   * Verify message signature (for authenticity)
   * @param message - Original message
   * @param signature - Base64 encoded signature
   * @param publicKey - Signer's public key
   * @returns True if valid
   */
  verifySignature(message: string, signature: string, publicKey: string): boolean {
    try {
      const messageBytes = sodium.from_string(message);
      const signatureBytes = sodium.from_base64(signature);
      const publicKeyBytes = sodium.from_base64(publicKey);

      return sodium.crypto_sign_verify_detached(
        signatureBytes,
        messageBytes,
        publicKeyBytes,
      );
    } catch {
      return false;
    }
  }
}
<!-- e2ee -->
<!-- key exchange -->
