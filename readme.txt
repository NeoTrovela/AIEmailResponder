##########################
Installation:
In our AIEmailResponder app, we have two folders representing the client as well as the server
Each folder has their own docker file, which you must set up according to the instructions in the '_readme.txt' files
in their respective folder.
In each folder, we also have two config ini files in each folder
- For the client side, the only thing in the emailresponder-client-config.ini file is [client] with webserver=http://localhost:3000
- For server side, we have information concerning our openapi key, as well as our rds information, which you can copy from our submission
Follow the docker installation steps and run the server side to listen to the client
For the database, we have a database file that has the SQL required to make the two tables we have. Our tables use MwSQL and is hosted on AWS RDS

##########################
Usage:
We have 3 functions
- add/update user -> must memorize your own userid in order to use the other functions 
- generate -> generate response to an email using OpenAI API 
- history -> look at history of past generations
- search -> find past generations based on a given userid and a tone

##########################
Github:
https://github.com/NeoTrovela/AIEmailResponder/tree/main
Shared github repository with Ian Evensen and Neo Trovela-Villamiel