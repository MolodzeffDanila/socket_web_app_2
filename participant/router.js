const express = require('express');
const router = express.Router();

let paintings = require('./json/paintings.json');
let participants = require('./json/participants.json');

let current_painting_id =0;

router.get('/', (req,res)=>{
    res.render('start',{

    });
})

router.post('/login', (req,res)=>{
    let nick = req.body.user;
    try{
        let nick = req.body.user;
        if(!nick){
            throw new SyntaxError("Empty nickname!");
        }
    }catch (error){
        res.render('error');
    }
    if(nick === 'admin'){
        res.redirect("/admin");
    }
    else{
        for(let item of participants){
            if(nick === item.nick){
                res.redirect('/user/' + nick);
            }
        }
    }

})

router.get('/admin', (req,res)=>{
    res.render('admin',{
        paintings: paintings,
        participants: participants
    })
})

router.get('/user/:nick', (req,res)=>{
    let nick = req.params.nick;
    let user = null;
    for(let item of participants){
        if(nick === item.nick){
            user = item;
        }
    }
    res.render('user',{
        user: user,
        current_painting: paintings[current_painting_id]
    })
})

router.get('/bin/:name', (req,res)=>{
    let user_name=req.params.name;
    let user;
    for(let item of participants){
        if(item.name===user_name){
            user = item;
        }
    }
    let bought_paintings= [];
    for(let item of paintings){
        if(item.owner===user_name){
            bought_paintings.push(item);
        }
    }
    res.render('bin',{
        user: user,
        paintings: bought_paintings
    })
})

module.exports = router;