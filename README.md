# Nova 
## A trading webapp built on TradingsView's lightweight charts library

The idea is to implmenet a llm (such as ChatGpt) to process the onscreen data and preform data anlyssi / charting from the users input.

Challenging factors:
1. Setting up the library to handle drawing tools (this was not native to lightweight charts had to code the charting tools manually)
2. Getting the crypto data: I used coinApi to handle searching for coins and gathering historical data
3. Authenticating users: I used firebase for this, already setup just replace subsequent credinetials with your project
4. Passing user input from the input box to a llm for processing request
5. Receiving response from the llm and handling it on screen

## Home screen
<img width="1512" alt="home" src="https://github.com/user-attachments/assets/9b656dfe-f1e8-49e0-88c3-fb1ce51fcd04" />

## Coin search
<img width="1489" alt="search" src="https://github.com/user-attachments/assets/b55a04ee-a047-48eb-ab98-274e4cf71b15" />

## Login & Sign up
<img width="676" alt="signup" src="https://github.com/user-attachments/assets/ff50f79d-e6f8-42eb-92dc-d8bcc17fab32" />
<img width="703" alt="signin" src="https://github.com/user-attachments/assets/da073a74-94f1-4f5e-8acb-6e18cc650716" />
