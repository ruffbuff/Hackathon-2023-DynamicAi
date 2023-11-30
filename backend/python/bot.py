# python/bot.py
from web3 import Web3, Account
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import json
import os
import asyncio
import signal
import concurrent.futures

shutdown_requested = False

load_dotenv()
provider_url = os.getenv("PROVIDER_URL")
api_key = os.getenv("API_KEY")
private_key = os.getenv("PRIVATE_KEY")
account = Account.from_key(private_key)
full_provider_url = f"{provider_url}{api_key}"

w3 = Web3(Web3.WebsocketProvider(full_provider_url))

w3.middleware_onion.inject(geth_poa_middleware, layer=0)

# {CONNECT TO BLOCKCHAIN}
if not w3.isConnected():
    print("Failed to connect to the blockchain")
    exit()

print("Successful connection to the blockchain")

with open('info.json', 'r') as file:
    contract_data = json.load(file)
    contract_address = contract_data['address']
    contract_abi = contract_data['abi']

contract = w3.eth.contract(address=contract_address, abi=contract_abi)

minted_tokens = {}
MAX_TOKENS_TRACKED = 1000

def signal_handler(signal, frame):
    global shutdown_requested
    print("Shutdown requested...")
    shutdown_requested = True

MAX_RETRIES = 3
RETRY_INTERVAL = 5  # seconds

transaction_semaphore = asyncio.Semaphore(1)

async def safe_web3_call(call, *args, **kwargs):
    """Retry Web3 calls in case of failure or timeout."""
    for attempt in range(MAX_RETRIES):
        try:
            return await asyncio.wait_for(call(*args, **kwargs), timeout=30)
        except (Exception, asyncio.TimeoutError) as e:
            if attempt < MAX_RETRIES - 1:
                print(f"Web3 call failed, retrying... (attempt {attempt + 1})")
                await asyncio.sleep(RETRY_INTERVAL)
            else:
                print(f"Web3 call failed after {MAX_RETRIES} attempts.")
                raise

# {BURN TOKEN - TRANSACTION}
async def burn_token(token_id, custom_gas_price_gwei=10):
    """Burn a token with retries and semaphore control."""
    async with transaction_semaphore:
        try:
            gas_price_increment = 10
            current_gas_price = w3.eth.gas_price
            new_gas_price = max(w3.toWei(custom_gas_price_gwei, 'gwei'), current_gas_price + w3.toWei(gas_price_increment, 'gwei'))

            nonce = w3.eth.get_transaction_count(account.address, 'pending')

            tx = contract.functions.burnToken(token_id).buildTransaction({
                'from': account.address,
                'chainId': w3.eth.chain_id,
                'gas': 700000,
                'gasPrice': new_gas_price, 
                'nonce': nonce,
            })
            signed_tx = w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = await safe_web3_call(w3.eth.sendRawTransaction, signed_tx.rawTransaction)
            receipt = await safe_web3_call(w3.eth.waitForTransactionReceipt, tx_hash)
            print(f"Transaction completed. Receipt: {receipt}")
            return True
        except Exception as e:
            print(f"Error during burn token: {e}")
            return False

async def delayed_burn(token_id, holder_address, delay, gas_price):
    await asyncio.sleep(delay)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, burn_token, token_id, gas_price
        )
    if result:
        print(f"Transfer completed successfully for TokenId={token_id}")
    else:
        print(f"Transfer failed for TokenId={token_id}")

# {EVENTS}
async def handle_uri_batch_added(event):
    token_id = event['args']['tokenId']
    burn_in_seconds = event['args']['burnInSeconds'] + 5
    holder_address = minted_tokens.pop(token_id, None)

    if holder_address:
        print(f"URIBatchAdded: TokenId={token_id}, HolderAddress={holder_address}, ...")
        print("Setting timer for transferring token...")
        print(f"Waiting for {burn_in_seconds} seconds before transferring token...")
        
        if not shutdown_requested:
            await delayed_burn(token_id, holder_address, burn_in_seconds, 10)
    else:
        print(f"Error: Holder address for token {token_id} not found.")

def handle_weather_nft_minted(event):
    token_id = event['args']['tokenId']
    minter_address = event['args']['minter']

    if len(minted_tokens) >= MAX_TOKENS_TRACKED:
        minted_tokens.pop(next(iter(minted_tokens)))

    minted_tokens[token_id] = minter_address
    print(f"WeatherNFTMinted: Minter={minter_address}, TokenId={token_id}, ...")

def handle_randomness_requested(event):
    print(f"RandomnessRequested: TokenId={event['args']['tokenId']}, RequestId={event['args']['requestId']}")

def handle_randomness_fulfilled(event):
    print(f"RandomnessFulfilled: TokenId={event['args']['tokenId']}, RandomNumbers={event['args']['randomNumbers']}")

def handle_upkeep_performed(event):
    print(f"UpkeepPerformed: TokenId={event['args']['tokenId']}, NewURI={event['args']['newURI']}")

signal.signal(signal.SIGINT, signal_handler)

# {EVENT FILTER}
async def log_loop(start_block, end_block):
    print("Start listening to events from the block", start_block)
    event_filters = [
        contract.events.WeatherNFTMinted.createFilter(fromBlock=start_block, toBlock=end_block),
        contract.events.RandomnessRequested.createFilter(fromBlock=start_block, toBlock=end_block),
        contract.events.RandomnessFulfilled.createFilter(fromBlock=start_block, toBlock=end_block),
        contract.events.URIBatchAdded.createFilter(fromBlock=start_block, toBlock=end_block),
        contract.events.UpkeepPerformed.createFilter(fromBlock=start_block, toBlock=end_block),
    ]

    while not shutdown_requested:
        for event_filter in event_filters:
            for event in event_filter.get_new_entries():
                if event.event == 'WeatherNFTMinted':
                    handle_weather_nft_minted(event)
                elif event.event == 'RandomnessRequested':
                    handle_randomness_requested(event)
                elif event.event == 'RandomnessFulfilled':
                    handle_randomness_fulfilled(event)
                elif event.event == 'URIBatchAdded':
                    await handle_uri_batch_added(event)
                elif event.event == 'UpkeepPerformed':
                    handle_upkeep_performed(event)

        await asyncio.sleep(1)

    print("Shutting down...")

loop = asyncio.get_event_loop()

# {LOOP FROM BLOCK TO LATEST}
try:
    loop.run_until_complete(log_loop(42994674, 'latest'))
except KeyboardInterrupt:
    pass
finally:
    for task in asyncio.all_tasks(loop):
        task.cancel()
    try:
        loop.run_until_complete(asyncio.gather(*asyncio.all_tasks(loop)))
    except asyncio.CancelledError:
        pass
    
    loop.close()