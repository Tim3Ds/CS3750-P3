window.onload = ()=>{
    let socket = io();

    let gameInfo = {
        username: document.getElementById('username').textContent,
        gameCode: document.getElementById('gameCode').textContent,
    }
    socket.emit('connect-to-game-room', gameInfo)

    // test function click to run socket commands
    $('#test').click(function (e) {
        socket.emit('send',{
            gameCode: gameInfo.gameCode,
            username: gameInfo.username,
            text: 'did it work'
        })
        console.log('Action');
    });

    let cat;
    socket.emit('server-getGameCategories', gameInfo);

    socket.on('client-getGameCategories', function(categories){
        console.log('client-getGameCategories', categories, categories.length);
        console.log('hi')
        cat = categories;
        $('.game').append('<form>')
        for(i=0;cat.length>i;i++){
          console.log('inside')
            $('.game').append('<div><label><input type="radio" name="radio" id="'+ 
                cat[i] + '">' + cat[i] + '</input></label></div>');
        };
        $('.game').append('</form>');
    });

    socket.on('client-newRound', function(round){
        $('.game').children().remove();
        $('.game').append(`we have a round`);
        console.log(round);
    })

    $('#submit').click(function (e) {
        // make game object
        let round = {
            gameCode: gameInfo.gameCode,
            category: '',
            playerQuestions: {},
            playerAnswers: {}
        }
        
        // use for loop to get categories
        cat.forEach(function(element){
            if(document.getElementById(element).checked) // check for checked
            {
                console.log(element);
                round.category = element;
            }
        });

        socket.emit('server-createRound', round);

        
        console.log('create Round');
    });

    socket.on('message', (msg) =>{
        console.log(msg);
    });
    socket.on('no-game',function(){
        window.location.href = '/';
    })
}
