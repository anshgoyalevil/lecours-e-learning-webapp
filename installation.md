# Installation Docs

## Some prerequisites for running it in your local machine
- npm ([Installation guide here](https://radixweb.com/blog/installing-npm-and-nodejs-on-windows-and-mac))
- mongodb installed ([Installation guide here](https://www.geeksforgeeks.org/how-to-install-mongodb-on-windows/))
- node version 16+ recommended. (Check your version using the ```node --version``` command) ([Installation guide here](https://radixweb.com/blog/installing-npm-and-nodejs-on-windows-and-mac))
- Your are good to go to the next step.

## Installing the project

- fork this repository to your account
- git clone the project to your local computer. The command would look something like ```git clone https://github.com/{Your GitHub Username}/lecours-e-learning-webapp```
- Change the terminal to the ```lecours-e-learning-webapp``` project folder using the ```cd lecours-e-learning-webapp``` command on Linux and ```cd "lecours-e-learning-webapp"``` command on Windows.
- run ```npm install```
- Create a new .env file inside the project's root directory with the following data

```
SECRET=alittleandcutesecret
CLIENT_ID=fakeid
CLIENT_SECRET=fakesecret
APP_SEC=My little secret
API_KEY=DeepAi.org API Key
DB_URI=mongodb://127.0.0.1:27017/courseDB
```
- Get your [DeepAI.org](https://deepai.org/) API key from their official wesite, and paste it after ```API_KEY``` for example ```API_KEY=29kfsb_fmb```
- Do not change rest of the above value inside the .env file.
- Open a new terminal window and type ```mongod``` to shart the mongoDB server.
- In the previous terminal, type the command ```node index.js``` to start the server.
- Go to your browser window, and check the running application. The URL would be ```127.0.0.1:3000```

If you have any query, feel free to ask in on the [discussions forum here](https://github.com/anshgoyalevil/lecours-e-learning-webapp/discussions) or [join the Discord Community here](https://discord.gg/6f28dqWy).
