This Dynamic NFT for a chailink hackathon 2023

image python = 3.11.6 with python-dotenv, Web3 , openai==0.28

At first please filling .env file 

docker pull ambientiumim/dynnft:3

docker run -it -d \
    -v ${PWD}:/usr/src/app \
    --restart=always \
    --name dynnft \
    ambientiumim/dynnft:3

Or just use 'make' 

for start :
make start

for stop :
make stop

for log :
make log

and etc.
