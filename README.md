How to prepare this project

(Note that I am running this on Cloud 9, which already has some of the dependencies installed. You may require
some manual installation if you find components are missing)

After cloning the repository, do the following

1) Completely delete the node_modules directory - the contents and the directory itself
2) Run 'npm install' so the dependencies declared in package.json are installed

Populate the database

1) In a new terminal window execute the script ./start_mongodb
2) In another terminal window enter the mongo shell by entering 'mongo'Running the server
3) In the mongo shell, enter the following: 'load('data/loadDataToMongo.js')'. This will load the data into MongoDB

Now run the node server

1) In a terminal window enter 'node server.js'

Now use your browser to go to the home page. Since I'm using Cloud9, this is: https://fxprcs-ui-mcdg.c9.io

