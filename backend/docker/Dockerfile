FROM python:3.11.6

LABEL maintainer='Denis Kurochkin yatadcd@gmail.com'

ENV build_date 06-12-2023

WORKDIR /usr/src/app

RUN pip install --upgrade pip

RUN pip install python-dotenv

RUN pip install Web3

RUN pip install --upgrade Web3

RUN pip install openai==0.28 

COPY dynnft_bot.py /usr/src/app/

CMD [ "python", "./dynnft_bot.py" ]

