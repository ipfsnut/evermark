// src/services/blockchain/TokenStakingService.ts

import { ethers } from 'ethers';
import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import CardCatalogABI from '../../config/abis/CardCatalog.json';
import { errorLogger } from '../../utils/error-logger';

// Type definitions
export interface UnbondingRequest {
  amount: bigint;
  releaseTime: number;
}

export class TokenStakingService extends BaseContractService {
  /**
   * Get NSI token balance
   */
  async getNSIBalance(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const nsiContract = this.getContract(
        CONTRACT_ADDRESSES.NSI_TOKEN,
        [
          "function balanceOf(address) view returns (uint256)"
        ]
      );
      
      try {
        return await this.callContract<bigint>(nsiContract, 'balanceOf', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('tokenStakingService', innerError, { method: 'getNSIBalance' });
        return BigInt(0); // Return zero instead of throwing
      }
    } catch (error) {
      errorLogger.log('tokenStakingService', error, { method: 'getNSIBalance', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get staked token balance
   */
  async getStakedBalance(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('tokenStakingService', innerError, { method: 'getStakedBalance' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('tokenStakingService', error, { method: 'getStakedBalance', address });
      return BigInt(0);
    }
  }
  
  /**
   * Stake (wrap) tokens
   */
  async wrapTokens(amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.wrap(amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('tokenStakingService', error, { method: 'wrapTokens', amount });
      throw new Error(`Failed to wrap tokens: ${error.message}`);
    }
  }
  
  /**
   * Request token withdrawal (unbonding)
   */
  async requestUnwrap(amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.requestUnwrap(amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('tokenStakingService', error, { method: 'requestUnwrap', amount });
      throw new Error(`Failed to request unwrap: ${error.message}`);
    }
  }
  
  /**
   * Complete token withdrawal after unbonding period
   */
  async completeUnwrap(requestIndex: number) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI,
        signer
      );
      
      const tx = await contract.completeUnwrap(requestIndex);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('tokenStakingService', error, { method: 'completeUnwrap', requestIndex });
      throw new Error(`Failed to complete unwrap: ${error.message}`);
    }
  }
  
  /**
   * Get total voting power
   */
  async getVotingPower(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getTotalVotingPower', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('tokenStakingService', innerError, { method: 'getVotingPower' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('tokenStakingService', error, { method: 'getVotingPower', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get available voting power
   */
  async getAvailableVotingPower(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<bigint>(contract, 'getAvailableVotingPower', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('tokenStakingService', innerError, { method: 'getAvailableVotingPower' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('tokenStakingService', error, { method: 'getAvailableVotingPower', address });
      return BigInt(0);
    }
  }
  
  /**
   * Get unbonding requests
   */
  async getUnbondingRequests(address: string): Promise<UnbondingRequest[]> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.CARD_CATALOG,
        CardCatalogABI
      );
      
      try {
        return await this.callContract<UnbondingRequest[]>(contract, 'getUnbondingRequests', [formattedAddress]);
      } catch (innerError) {
        errorLogger.log('tokenStakingService', innerError, { method: 'getUnbondingRequests' });
        return [];
      }
    } catch (error) {
      errorLogger.log('tokenStakingService', error, { method: 'getUnbondingRequests', address });
      return [];
    }
  }
}

// Export a singleton instance
export const tokenStakingService = new TokenStakingService();
