# LeCours - Interactive E-Learning App for Students

Beautiful UI & UX E-Learning App where Students Can Have Live Chat with Other Learners While Watching Educational Video Courses. With Deep Learning Based Assignment Proofing System for Instructors.

Highlights:
- The web app contains a live chat feature with custom room for each course. This would help students watch the recorded lectures while chatting with their friends.
- A deep learning-based image similarity processing API is implemented to check if two assignments submitted by different students are similar or not.
- The web app contains a note taking feature, with which, the students can take notes while learning the course.
- The app is implemented with industry best password protection strategy with multiple salt rounds and hashing function implemented internally using bcrypt. It also contains Google OAuth2.0 Authentication Implementation for faster and secure logins.

## Frontend Technologies Used:-
- Socketio
- HTML
- CSS
- JavaScript
- Flowbite
- Tailwind
- Font Awesome
- EJS

## Backend Technologies Used:-
- Node.JS
- Socketio
- Express.JS

## Database Technology Used:-
- MongoDB
- Redis

Following Node Modules are used:
- dotenv - for securing api keys
- uniqid - for generating unique ids
- express - for server side logic
- body-parser - for parsing the body data
- mongoose - for using mongodb effeciently
- express-session - for cookie sessions
- passport - for authentication
- passport-local-mongoose - passport plugin for mongoose
- passport-google-oauth20 - passport auth strategy for google authentication
- mongoose-findorcreate - a utility mongoose function
- path - a utility module to handle paths in node server
- http - to handle http requests and server
- socketio - socketio plugin for live chat system
- redis - for database cache
- lodash - for working with URLs containing symbols or spaces
- multer - for handling file uploads
- deepai - for using the deepai image computing API
- fs - for working with file system in node

## How to test the app?

Download the project or git clone it into your local machine.

Inside the Project Folder, Create a file named .env and assign the following values in it:
```
SECRET=anyrandomstring
CLIENT_ID=google auth 2.0 cliend id
CLIENT_SECRET=google auth 2.0 client secret
API_KEY=api key from deepai.com
DB_URI=mongodb database uri
```

Now, inside the project terminal, run:
```
npm install
```

Congrats, you are ready to test this web application into your local machine.

Feel free to fork it, star it, or send pull requests.

Some Screenshots of the Web App:

![a](https://github.com/anshgoyalevil/e-learning-system-design/blob/master/public/a.PNG)
![b](https://github.com/anshgoyalevil/e-learning-system-design/blob/master/public/b.PNG)
![c](https://github.com/anshgoyalevil/e-learning-system-design/blob/master/public/c.PNG)
![d](https://github.com/anshgoyalevil/e-learning-system-design/blob/master/public/d.PNG)
![e](https://github.com/anshgoyalevil/e-learning-system-design/blob/master/public/e.PNG)
