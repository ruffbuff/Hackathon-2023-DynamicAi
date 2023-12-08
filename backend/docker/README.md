# DynNFT Bot
This Python script is specifically designed for interacting with the blockchain to manage Dynamic Non-Fungible Tokens (NFTs) through smart contracts. It encompasses a range of functionalities, including token burning, metadata 
creation, and image generation, and is tailored to function as a standalone Python program. The script heavily relies on external services and the Ethereum blockchain, with robust error handling and logging for increased 
reliability. It is specifically crafted to interact with a designated Ethereum smart contract, showcasing advanced Python capabilities in blockchain interactions and asynchronous programming.
## Key Components and Functionalities Overview:
### Import Libraries:
The script imports essential libraries such as json, os, asyncio, web3, dotenv, openai, requests, and datetime, enabling blockchain interactions, environment variable configuration, AI-driven image generation, and fundamental 
file and time operations.
### Environment Setup:
It configures environment variables using dotenv, which includes settings for blockchain interactions, OpenAI's API key, and other necessary parameters.
### Blockchain Setup:
The script establishes a Web3.py connection to the Ethereum blockchain and sets up contract interactions using ABI and a contract address from the environment variables.
### Function greet_time(value):
Returns an appropriate IPFS hash based on the time of day, likely utilized for default image handling.
### Function burn_token(token_id):
Features a retry mechanism for burning (invalidating) a token on the blockchain, with dynamic gas fee adjustments for optimized transaction success.
### Function pinata_upload(filename):
Uploads files to Pinata, a service for pinning files to IPFS (InterPlanetary File System), and retrieves the IPFS hash of the uploaded file.
### Function add_milliseconds_and_convert_to_unixtime(numbers):
Generates future timestamps in Unix format by adding random milliseconds to the current time, used for setting token expiration times.
### Function add_uris_to_token(token_id, uris, burnInSeconds):
Updates a token with new URIs and a burn time in seconds on the blockchain, including retry logic and dynamic gas fee adjustments.
### Function generate_image_with_dalle(prompt):
Leverages OpenAI's DALL-E for image generation based on a given prompt.
### Function save_image(image_url, filename):
Downloads and locally saves an image from a specified URL.
### Function create_nft_metadata(...):
Constructs and stores NFT metadata, incorporating elements like token ID, image URL, and attributes from blockchain event data.
### Event Handling (handle_event(event)):
Monitors blockchain events related to NFT minting and randomness fulfillment, processes these events, and initiates corresponding actions such as image generation and metadata creation.
### Logging and Queue Processing:
Logs various events and manages a transaction queue, ensuring orderly and efficient execution of blockchain interactions.
### Asynchronous Main Function:
Coordinates the components, setting up event filters and concurrently running the logging loop, time logging, and transaction queue processing.
### Usage of Random Numbers (VRF):
Employs random numbers for generating unique filenames and varying token expiration times, enhancing the distinctiveness and dynamism of each NFT.
### Security and Reliability:
Incorporates retry mechanisms with dynamic fee adjustments and comprehensive error handling, vital for successful blockchain transactions and maintaining the integrity and reliability of the NFT minting and management process.
### In summary, this script presents a sophisticated solution for creating and managing Dynamic NFTs, integrating AI for image generation and blockchain technology for secure, reliable token transactions.
