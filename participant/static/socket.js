var socket = io('http://localhost:3030')

socket.on('start', function (data){
    $('#chat').append("<h1>"+data.msg+"</h1>");
    let budget;
    let max;
    for(let item of data.participants){
        if(document.title===item.name){
            budget = Number(item.budget);
        }
    }
    if(budget< data.price*2){
        max = budget;
    }else{
        max = data.price*2;
    }
    $('#slider').slider("option",{min: data.price, max: max,disabled:false});
})

socket.on('maintimer',function (data){
    $('#time').text("Время до конца аукциона: " + data.time.toString() + " сек.");
    $('#slider').slider({disabled: false});
})

socket.on('lottimer',function (data){
    $('#cur_time').text("Время до конца торгов за текущий лот: " + data.lot_time.toString() + " сек.");
    $('#betbtn').attr('disabled',false);
})

socket.on('pause',function (data){
    $('#pause').text("Время до конца паузы: " + data.pause_time.toString() + " сек.");
    $('#betbtn').attr('disabled',true);
})

socket.on('end', function (data){
    $('#chat').append('<h1>'+data.msg+'</h1>');
    $('#cur_time').text("Время до конца торгов за текущий лот: " + data.lot_time.toString() + " сек.");
    $('#betbtn').attr('disabled',true);
})

socket.on('rewrite_budget',function (data){
    if(document.title === data.name){
        $('#budget').text("Бюджет: " + data.budget.toString() + " руб.");
        if(data.budget < $('#slider').slider('min')){
            $('#slider').slider("option",{disabled:true});
        }else{
            $('#slider').slider("option",{disabled:false});
        }
    }
})

socket.on('update_painting',function (data){
    $('#status').text(data.curr_lot.status);
    $('#chat').append('<h3>'+data.msg + data.curr_lot.title+'</h3>');
    $('#title').text("Текущий лот: " + data.curr_lot.title);
    $('#paint_author').text("Автор: " + data.curr_lot.author);
    $('#paint_year').text("Год написания: " + data.curr_lot.year);
    $('#paint_price').text("Минимальная цена: " + data.curr_lot.price);
    $('#paint_src').attr('src','../'+data.curr_lot.img);
    let budget;
    for(let item of data.participants){
        if(document.title===item.name){
            budget = Number(item.budget);
        }
    }
    if(budget<data.curr_lot.price){
        $('#slider').slider("option",{disabled: true});
    }else{
        if(budget<data.curr_lot.price*2){
            $('#slider').slider("option",{min: data.curr_lot.price, max: budget});
        }else{
            $('#slider').slider("option",{min: data.curr_lot.price, max: data.curr_lot.price*2});
        }
    }
})

socket.on('send_message', function (data){
    $('#status').text(data.curr_lot.status);
    $('#title').text("Текущий лот: " + data.curr_lot.title);
    $('#paint_author').text("Автор: " + data.curr_lot.author);
    $('#paint_year').text("Год написания: " + data.curr_lot.year);
    $('#paint_price').text("Минимальная цена: " + data.curr_lot.price);
    $('#paint_src').attr('src','../'+data.curr_lot.img);
    for(let item of data.msg){
        $('#chat').append(item);
    }
})

socket.on('write_bet', function (data){
    $('#chat').append(data.msg);
    let client_budget;
    for(let item of data.participants){
        if(item.name === document.title){
            client_budget=parseInt(item.budget);
        }
    }
    let max = 0;
    if(data.bet*2>client_budget){
        max = client_budget;
    }else{
        max = data.bet*2;
    }
    $('#slider').slider("option",{min: data.bet, max: max});
})

function start_auction(){
    socket.emit("start_auction");
    $('#start').attr('disabled',true);
}

function timer(){
    socket.emit('timer');
}

function make_deal(name){
    let bet = $('#slider').slider('value');
    let bet_message = "<h2>"+ "Участник " + name + " сделал ставку " + bet + " руб." + "</h2>";
    socket.emit('get_bet', {msg: bet_message, bet:bet, name:name});
}

socket.emit('get_messages'); //запрос для обновления сообщений об аукционе