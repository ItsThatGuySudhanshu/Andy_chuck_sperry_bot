## Instructions on running the application (Docker)

1. Clone the github repository
2. Create a .env file with the given credentials for username and password
3. Open up terminal and go into the directory where the .env file is stored
4. Run this command: `docker build --tag andy-bot --build-arg CACHEBUST="8" .` . Change the "8" to a random number periodically to avoid caching issues.

## Instructions on running the application (Windows)

1. Download the zip folder by clicking on Code -> Download Zip on the github page. Choose the desktop as the download destination and extract it (should be able to right click on the zip file in the desktop and hit extract)
2. Download this software based on your OS: https://nodejs.org/en/download/
3. Open "Command Prompt" if on Windows and Terminal if on Mac
4. Type in `cd "The path of the extracted folder"`. You can get the path of the folder by right clicking on the folder, selecting Properties, and copying out the path from there
5. Run the "npm install" command in the terminal
6. Create a .env file in the root of the directory you downloaded and copy and paste these values:

`PERSONAL_USERNAME="email"`
`PERSONAL_PASSWORD="password"`

7. Run the "node index.js" command in the terminal
8. The application will now run till you hit Control+C (or cmd+C on mac) in the terminal window


## Testing purposes

1. Build command : `docker build --tag andy-bot --build-arg CACHEBUST=$(date +%s) -f .\DockerfileTest.dockerfile .`
