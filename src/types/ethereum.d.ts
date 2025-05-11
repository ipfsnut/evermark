interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface EthereumProvider {
  request: (args: RequestArguments) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  emit: (eventName: string, ...args: any[]) => boolean;
  
  // MetaMask specific properties
  isMetaMask?: boolean;
  selectedAddress?: string | null;
  networkVersion?: string;
  chainId?: string;
  
  // Legacy properties
  send?: (
    methodOrRequest: string | RequestArguments,
    params?: any[]
  ) => Promise<any>;
  sendAsync?: (
    request: RequestArguments,
    callback: (error: any, response: any) => void
  ) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}