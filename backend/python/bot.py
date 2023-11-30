# python/bot.py
from web3 import Web3, Account
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
import json
import os
import asyncio
import requests
import concurrent.futures

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

# {TRANSFERFROM - TRANSACTION}
def transfer_from(token_id, holder_address, receiver_address, custom_gas_price_gwei):
    try:
        nonce = w3.eth.get_transaction_count(account.address)
        receiver_address = w3.toChecksumAddress(receiver_address)
        gas_price = w3.toWei(custom_gas_price_gwei, 'gwei') 
        tx = contract.functions.transferFrom(holder_address, receiver_address, token_id).buildTransaction({
            'chainId': w3.eth.chain_id,
            'gas': 700000,
            'gasPrice': gas_price, 
            'nonce': nonce,
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key)
        tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
        print(f"Transaction sent, waiting for receipt...")
        receipt = w3.eth.waitForTransactionReceipt(tx_hash)
        print(f"Transaction completed. Receipt: {receipt}")
        return True
    except Exception as e:
        print(f"Error during transfer: {e}")
        return False

# {EVENTS}
async def handle_uri_batch_added(event):
    token_id = event['args']['tokenId']
    burn_in_seconds = event['args']['burnInSeconds'] + 5
    holder_address = minted_tokens.pop(token_id, None)

    if holder_address:
        print(f"URIBatchAdded: TokenId={token_id}, HolderAddress={holder_address}, ...")
        print("Setting timer for transferring token...")
        print(f"Waiting for {burn_in_seconds} seconds before transferring token...")
        
        # Use ThreadPoolExecutor to run transfer_from in a separate thread
        with concurrent.futures.ThreadPoolExecutor() as executor:
            result = await asyncio.get_event_loop().run_in_executor(
                executor, transfer_from, token_id, holder_address, '0x000000000000000000000000000000000000dead'
            )
        
        if result:
            print(f"Transfer completed successfully for TokenId={token_id}")
        else:
            print(f"Transfer failed for TokenId={token_id}")
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

    while True:
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

loop = asyncio.get_event_loop()

# {LOOP FROM BLOCK TO LATEST}
loop.run_until_complete(log_loop(42994674, 'latest'))
