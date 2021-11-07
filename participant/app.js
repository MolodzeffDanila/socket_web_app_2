const express = require('express');
const app = express();
const port = 3000;
const http = require('http').Server(app)
const router = require('./router.js')
const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET','POST']
    }
})

app.set("view engine", "pug");
app.set("views", "./view");
app.use('/static',express.static(`${__dirname}/static`));
app.use('/jquery',express.static(`${__dirname}/jquery`));
app.use('/socket.io',express.static(`${__dirname}/node_modules/socket.io/`));

app.use(express.json());
app.use(express.urlencoded());

app.use('/', router);

let paintings = require('./json/paintings.json');
let settings = require('./json/settings.json');
let participants = require('./json/participants.json');

let time = settings.time;
let lot_time = settings.lot_time;
let pause_time = 0;
let current_lot_index=0;
let messages=[];

io.sockets.on('connection', function(socket){
    socket.on('start_auction', function (data){
        socket.broadcast.emit('start', {msg: "Аукцион начался!",price: paintings[current_lot_index].price,participants: participants});
        socket.emit('start',{msg:"Аукцион начался!",price: paintings[current_lot_index].price,participants: participants});
        messages.push("<h1>Аукцион начался!</h1>");
        setTimeout(main_timer,1000);
        setTimeout(lot_timer,1000);
    })

    socket.on('get_messages', function (){ //запрос сохраняет на странице предыдущие сообщения об аукционе
        socket.emit('send_message',{msg: messages,curr_lot:paintings[current_lot_index]})
    })

    socket.on('get_bet', function (data){
        messages.push(data.msg);
        paintings[current_lot_index].potential_owner = data.name;
        paintings[current_lot_index].biggest_bet = data.bet;
        let participant;
        for (let item of participants){
            if(item.name===data.name){
                participant = item;
            }
        }
        socket.emit('write_bet', {msg: data.msg, bet: paintings[current_lot_index].biggest_bet, participants:participants});
        socket.broadcast.emit('write_bet', {msg: data.msg, bet: paintings[current_lot_index].biggest_bet, participants:participants});
    })

    function main_timer(){
        if(time===0){
            socket.emit('end', {msg: "Торги окончены!", lot_time: 0})
            socket.broadcast.emit('end', {msg: "Торги окончены!", lot_time: 0})
            messages.push("<h1>Торги окончены!</h1>");
            return;
        }
        time-=1;
        socket.broadcast.emit('maintimer', {time: time});
        socket.emit('maintimer',{time: time});
        setTimeout(main_timer,1000);
    }

    function lot_timer(){
        if(lot_time===0){
            paintings[current_lot_index].owner=paintings[current_lot_index].potential_owner;
            paintings[current_lot_index].status="Продана"
            pause_time = settings.pause_time;
            for(let item of participants){
                if(item.name === paintings[current_lot_index].owner){
                    let budget_tmp = parseInt(item.budget) - paintings[current_lot_index].biggest_bet;
                    item.budget = budget_tmp.toString();
                    socket.broadcast.emit('rewrite_budget',{budget: item.budget,name:item.name, curr_lot: paintings[current_lot_index]});
                    socket.emit('rewrite_budget',{budget: item.budget,name:item.name, curr_lot: paintings[current_lot_index]});
                }
            }
            if(current_lot_index<paintings.length-1){
                current_lot_index+=1;
                messages.push("<h3>Текущий лот: " + paintings[current_lot_index].title + "</h3>");
                socket.emit('update_painting',{msg: "Текущий лот: ",curr_lot: paintings[current_lot_index],participants:participants});
                socket.broadcast.emit('update_painting',{msg: "Текущий лот:",curr_lot: paintings[current_lot_index],participants:participants});
                pause_timer();
            }
        }
        if(time===0 && lot_time===0){
            return;
        }
        if(pause_time===0){
            lot_time-=1;
            socket.broadcast.emit('lottimer', {lot_time: lot_time});
            socket.emit('lottimer',{lot_time: lot_time});
            setTimeout(lot_timer,1000);
        }

    }

    function pause_timer(){
        if(time===0){
            return;
        }
        if(pause_time===0){
            lot_time = settings.lot_time
            lot_timer();
        }
        if(lot_time===0){
            pause_time -= 1;
            socket.broadcast.emit('pause', {pause_time: pause_time});
            socket.emit('pause', {pause_time: pause_time});
            setTimeout(pause_timer, 1000);
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

var Rollbar = require('rollbar')
var rollbar = new Rollbar({
    accessToken: '6b9ff98f2a7742de94490aefc5eb3715',
    captureUncaught: true,
    captureUnhandledRejections: true,
})

rollbar.log('Something');

http.listen(3030);

module.exports = app;