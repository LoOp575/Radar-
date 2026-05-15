type ExplorerChain = 'ethereum' | 'bsc';

type ExplorerConfig = {
  baseUrl: string;
  envKey: string;
};

const explorerConfig: Record<ExplorerChain, ExplorerConfig> = {
  ethereum: {
    baseUrl: 'https://api.etherscan.io/api',
    envKey: 'ETHERSCAN_API_KEY'
  },
  bsc: {
    baseUrl: 'https://api.bscscan.com/api',
    envKey: 'BSCSCAN_API_KEY'
  }
};

function getExplorerKey(chain: ExplorerChain) {
  const envKey = explorerConfig[chain].envKey;
  const key = process.env[envKey];
  if (!key) {
    throw new Error(`Missing ${envKey} environment variable`);
  }
  return key;
}

async function explorerFetch<T>(chain: ExplorerChain, params: Record<string, string | number>) {
  const config = explorerConfig[chain];
  const url = new URL(config.baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  url.searchParams.set('apikey', getExplorerKey(chain));

  const response = await fetch(url.toString(), {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${chain} explorer request failed ${response.status}: ${body}`);
  }

  const data = await response.json();
  if (data.status === '0' && data.message !== 'No transactions found') {
    throw new Error(`${chain} explorer error: ${data.message ?? 'unknown'} ${data.result ?? ''}`);
  }

  return data as T;
}

export async function fetchNativeBalance(chain: ExplorerChain, address: string) {
  return explorerFetch(chain, {
    module: 'account',
    action: 'balance',
    address,
    tag: 'latest'
  });
}

export async function fetchNormalTransactions(chain: ExplorerChain, address: string, page = 1, offset = 25) {
  return explorerFetch(chain, {
    module: 'account',
    action: 'txlist',
    address,
    startblock: 0,
    endblock: 99999999,
    page,
    offset,
    sort: 'desc'
  });
}

export async function fetchTokenTransfers(chain: ExplorerChain, address: string, page = 1, offset = 25) {
  return explorerFetch(chain, {
    module: 'account',
    action: 'tokentx',
    address,
    page,
    offset,
    sort: 'desc'
  });
}

export async function fetchTokenSupply(chain: ExplorerChain, contractAddress: string) {
  return explorerFetch(chain, {
    module: 'stats',
    action: 'tokensupply',
    contractaddress: contractAddress
  });
}
