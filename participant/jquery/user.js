$(()=>{
    $('#current_lot').accordion({
        collapsible: true
    });
    let handle = $('#myslider');
    $('#slider').slider({
        min: 10000,
        max: 250000,
        disabled:true,
        create: function (){
            handle.text($(this).slider("value"));
        },
        slide: (event,ui)=>{
            handle.text(ui.value);
        }
    })
});