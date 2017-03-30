var schema = require('../models/schema');

module.exports = (io) => {
    var app = require('express');
    var router = app.Router();
    var userCount = 0;// total number of players in all of the games
    var games = [];// array of games
    // socket.io events
    io.on('connection', function (socket) {
        userCount++;
        console.log('a user connected ' + userCount + ' user(s)');
        
        // this funciton will only send to the connecting player 
        socket.emit('message',{
            username: 'Game', 
            text: 'Welcome to the Game', 
        });

        // chat style message that indicates when someone has navigated away 
        // this fuction is called by a client fuction that looks like:
        // window.onbeforeunload = () => {
        //     socket.emit('leave',{
        //         username: document.getElementById('username').textContent,
        //         gameCode: document.getElementById('gameCode').textContent
        //     })
        // };
        socket.on('leave', function (msg) {
            io.sockets.in(msg.gameCode).emit('message', {
                username: 'Game', 
                text: msg.username + ' has left Game', 
            });
        });
        
        // chat style function for sending and reciving messages 
        socket.on('send', function (msg) {
            io.sockets.in(msg.gameCode).emit('message', { 
                username: msg.username, 
                text: msg.text, 
            });
        });
        
        // this function is called only by the game page
        // it add a player to a room if the room dose not
        // exists it calls no game and returns to home page
        socket.on('connect-to-game-room', function(msg) {
            console.log('connect to Game', msg);
            //check to see of game exists
            let test = games.filter(function(e) { return e.gameCode == msg.gameCode; }).length > 0;
            if(test){
                // if game exists join room with gameCode
                socket.join(msg.gameCode);
                // tell game somone joined the game (not implimented yet)
                io.sockets.in(msg.gameCode).emit('join-game');
            }else{
                console.log('no game');
                // tell game bage there is no game
                socket.emit('no-game');
            }
        });
        
        // this function is called my the join game page 
        // it add a player to ghe game if the game exists
        socket.on('join-game-room', function (msg) {
            // test for if game with gameCode exists
            let test = games.filter(function(e) { return e.gameCode == msg.gameCode; }).length > 0;
            if(test){
                // find the index of the game with gameCode
                let dex = games.findIndex(function(e) { return e.gameCode == msg.gameCode; });
                // add new player to the game 
                player = 'player' + games[dex].playerCount;
                games[dex].players[player] = msg.username; 
                games[dex].playerPoints[player] = 0;
                games[dex].playerCount++
                console.log('join game room', msg , test, '\nGame: ', games);
            }else{
                console.log('no game');
                socket.emit('no-game');
            }
        });
        
        // this function is called by the create game page
        socket.on('create', function (game) {
            console.log('Create Game');
            // we may need to make sure a game with gameCode dose not exists before creating a new game with that gameCode
            
            // add game to the active games array
            games.push(game)
            console.log(games);
        });

        socket.on('server-createRound', function(round){
            let test = games.filter(function(e) { return e.gameCode == msg.gameCode; }).length > 0;
            if(test){
                // generate on client
                // // make new round template
                // var round = {
                //     category: '',
                //     playerQuestions: {},
                //     playerAnswers: {}
                // }
                // find the index of the game with gameCode
                let dex = games.findIndex(function(e) { return e.gameCode == msg.gameCode; });
                // // set round catigory
                // round.category = msg.category;
                // addPlayers to round
                for(i=0;games[dex].playerCount>i;i++){
                    var player = 'player' + i;
                    round.playerAnswers[player] = '';
                    round.playerQuestions[player] = '';
                }
                // add new round to game 
                games[dex].round.push(round);
                // send updated game object to all players in the game (not yet implimented)
                socket.emit('client-newRound', round)
            }else{
               io.sockets.in(msg.gameCode).emit('message', { 
                    username: 'Game Server', 
                    text: 'Cant find Game', 
                });
            }   
        })
        socket.emit('server-updateRound', function(msg){
            let test = games.filter(function(e) { return e.gameCode == msg.gameCode; }).length > 0;
            if(test){
                let dex = games.findIndex(function(e) { return e.gameCode == msg.gameCode; });
                games[dex].round.playerQuestions[msg.player] = msg.question;
                games[dex].round.playerAnswers[msg.player] = msg.answers;
            }else{
               io.sockets.in(msg.gameCode).emit('message', { 
                    username: 'Game Server', 
                    text: 'Cant find Game', 
                });
            }  
        })
        
        // this will update the server side game
        socket.on('server-getGame',function(){
            let test = games.filter(function(e) { return e.gameCode == game.gameCode; }).length > 0;
            if(test){
                // find the index of the game with gameCode
                let dex = games.findIndex(function(e) { return e.gameCode == msg.gameCode; });
                // send updated game object to all players in the game (not yet implimented)
                console.log(games[dex]);
                socket.emit('client-getGame',games[dex]);    
            }else{
                console.log('no game');
                socket.emit('no-game');
            }
            
        });

        // this will gets game catigories from mongo for create game 
        socket.on('server-getCategories',function(){
            schema.Categories.find({}, 'category', function(err, category){
                console.log(category);
                socket.emit('client-getCategories', category);
            })
        });
        socket.on('server-getGameCategories',function(msg){
            let test = games.filter(function(e) { return e.gameCode == msg.gameCode; }).length > 0;
            if(test){
                let dex = games.findIndex(function(e) { return e.gameCode == msg.gameCode; });
                console.log(games[dex].categories);
                socket.emit('client-getGameCategories', games[dex].categories);
            }else{
               io.sockets.in(msg.gameCode).emit('message', { 
                    username: 'Game Server', 
                    text: 'Cant find Game', 
                });
            }  
        });
        // add a Categories to db
        socket.on('server-addCategory',function(cat){
            schema.Categories.findOne({ category: cat }, function(err, category){
                if(!category){
                    var newCat = new schema.Categories({
                        category: cat
                    });
                    newCat.save(function(err) {
                        //check for errors
                        if (err) {
                            console.log('Something bad happened! Please try again.');
                        } 
                    });
                                    
                } else{
                    console.log('category already exists')
                }
            });
        });
        
        // get question in category
        socket.on('server-getQuestionInCat', function(cat){
            schema.Questions.find({category: cat}, function(err, question){
                if(!question){
                    // return a category has no questions
                }else{
                    // return question from category
                }
            });
        });
        // add a quetion to db
        socket.on('server-addQuestion',function(quest){
            schema.Questions.findOne({ question: quest.question }, function(err, question){
                if(!question){
                    var newQuest = new schema.Questions({
                        category: quest.category,
                        question: quest.question,
                        answer: quest.answer
                    });
                    newCat.save(function(err) {
                        //check for errors
                        if (err) {
                            console.log('Something bad happened! Please try again.');
                        } 
                    });
                } else{
                    console.log('category already exists')
                }
            });
        });

        socket.on('disconnect', function(){
            userCount--;
            console.log('user disconnected ' + userCount + ' user(s)');
        });
    });

    return router;
}