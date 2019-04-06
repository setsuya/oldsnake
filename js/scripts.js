$(document).ready(function(){
    checkSavedItems();
    setControlMethod();
    createBoard();
});

const LINE_SIZE = 32;

window.game_timer;
window.game_playing = true;
window.game_state = {
     "playing": true, 
    "pausable": false, 
     "control": "button"
}
window.input = "right";
window.score = 0;
window.hi_score = 0;
window.snake = {
     "position": [0], 
    "direction": "right", 
         "size": 1, 
        "speed": 500, 
       "pieces": ["right"]
};
window.direction = {
       "up": -LINE_SIZE, 
     "down": +LINE_SIZE, 
     "left": -1, 
    "right": +1
};

function checkSavedItems(){
    if(localStorage.hi_score){
        $("#hi_score").text(localStorage.hi_score);
        hi_score = localStorage.hi_score;
    }

    if(localStorage.control){
        if(localStorage.control == "swipe"){
            $("#swipe_controls").click();
        }
    }
}

function createBoard(){
    board = "";

    for(i = 0; i < (LINE_SIZE * LINE_SIZE); i++){
        if(i < LINE_SIZE || i >= ((LINE_SIZE * LINE_SIZE) - LINE_SIZE) || (i % LINE_SIZE) == 0 || (i % LINE_SIZE) == (LINE_SIZE - 1)){
            board += "<div class=\"square barrier m-0 p-0\" data-index=\"" + i + "\"></div>";
        }else{
            board += "<div class=\"square m-0 p-0\" data-index=\"" + i + "\"></div>";
        }
    }

    start_screen = "<div id=\"title_screen\" class=\"text-center\"><p id=\"title_screen_title\" class=\"mt-4 mb-1\">OldSnake</p><button class=\"btn btn-sm btn-dark w-50\" onclick=\"startGame()\">PLAY</button></div>";

    $("#game").html(board + start_screen).css({"width": (LINE_SIZE * 10), "height": (LINE_SIZE * 10)});
}

function startGame(){
    snake["position"][0] = ($(".square").length / 2) + (LINE_SIZE / 2);
    input = "right";
    score = 0;
    game_state["pausable"] = true;

    $("#title_screen").hide();
    $("#score").text(score);
    $(".square").eq(snake["position"]).addClass("piece");

    createFood();

    checkInput();
}

function endGame(){
    clearTimeout(game_timer);

    snake["position"] = [0];
    snake["direction"] = "right";
    snake["size"] = 1;
    snake["speed"] = 500;
    snake["pieces"] = ["right"];
    game_state["pausable"] = false;

    $(".piece").each(function(){
        for(i = 0; i < 3; i++){
            $(this).animate({"opacity": 0}, 150).animate({"opacity": 100}, 150);
        }
    });

    if(score > hi_score){
        hi_score = score;
        localStorage.hi_score = hi_score;

        $("#hi_score").text(hi_score);

        for(i = 0; i < 3; i++){
            $("#hi_score").animate({"opacity": 0}, 150).animate({"opacity": 100}, 150);
        }
    }

    $(".piece").promise().done(function(){
        setTimeout(function(){
            $(".square").removeClass("piece food");
            $("#title_screen").fadeIn();
        }, 1000);
    });
}

function updateDirection(event){
    if(event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight"){
        input = event.key.substring(5).toLowerCase();
    }else if(game_state["pausable"] === true && event.key === " "){
        game_playing = !game_playing;
    }
}

function setControlMethod(){
    if($("#swipe_controls").is(":visible")){
        if($("#swipe_controls").is(":checked")){
            game_state["control"] = "swipe";
            $("#button_pad").parent().fadeOut().addClass("d-none");
            $("#swipe_pad").parent().removeClass("d-none").fadeIn();

            hammertime = new Hammer($("#swipe_pad")[0]);
            hammertime.get("swipe").set({"direction": Hammer.DIRECTION_ALL});

            ["Up", "Down", "Left", "Right"].forEach(function(val){
                hammertime.on("swipe" + val.toLowerCase(), function(){
                    updateDirection({"key": "Arrow" + val});
                });
            });
        }else{
            game_state["control"] = "button";
            $("#swipe_pad").parent().fadeOut().addClass("d-none");
            $("#button_pad").parent().removeClass("d-none").fadeIn();

            $("#button_up, #button_down, #button_left, #button_right").click(function(){
                dir_str = $(this).attr("id").split("_")[1];
                dir_str = "Arrow" + dir_str.charAt(0).toUpperCase() + dir_str.slice(1);

                updateDirection({"key": dir_str});
            });
        }

        localStorage.control = game_state["control"];
    }
}

function checkInput(){
    game_timer = setTimeout(checkInput, snake["speed"]);

    if(game_playing){
        $("#pause_msg").addClass("invisible");
        moveSnake(input);
    }else{
        $("#pause_msg").removeClass("invisible");
    }
}

function createFood(){
    $(".square").removeClass("food");
    food_position = Math.floor(Math.random() * (LINE_SIZE * LINE_SIZE));
    selected_element = $(".square").eq(food_position);

    if(selected_element.hasClass("piece") || selected_element.hasClass("barrier")){
        createFood();
    }else{
        selected_element.addClass("food");
    }
}

function moveSnake(new_direction){
    switch(new_direction){
        case "up":
            if(snake["direction"] !== "down"){
                snake["direction"] = "up";
            }

            break;
        case "down":
            if(snake["direction"] !== "up"){
                snake["direction"] = "down";
            }

            break;
        case "left":
            if(snake["direction"] !== "right"){
                snake["direction"] = "left";
            }

            break;
        case "right":
            if(snake["direction"] !== "left"){
                snake["direction"] = "right";
            }

            break;
    }

    snake["position"][0] += direction[snake["direction"]];

    if(checkCollision()){
        $(".square").removeClass("piece");

        snake["pieces"].unshift(snake["direction"]);
        snake["pieces"].length = snake["size"];

        $(".square").eq(snake["position"][0]).addClass("piece");

        for(i = 1; i < snake["size"]; i++){
            snake["position"][i] += direction[snake["pieces"][i]];
            $(".square").eq(snake["position"][i]).addClass("piece");
        }
    }else{
        endGame();
    }
}

function growSnake(){
    switch(snake["pieces"][snake["size"] - 1]){
        case "up":
            new_direction = "down";

            break;
        case "down":
            new_direction = "up";

            break;
        case "left":
            new_direction = "right";

            break;
        case "right":
            new_direction = "left";

            break;
    }

    snake["pieces"].push(snake["pieces"][snake["size"] - 1]);

    if(snake["size"] !== 1){
        snake["position"].push(snake["position"][snake["size"] - 1] + direction[new_direction]);
    }else{
        snake["position"].push(snake["position"][snake["size"] - 1] + (direction[new_direction] * 2));
    }

    snake["size"] = snake["size"] + 1;
}

function updateScore(points){
    score += points;

    $("#score").text(score);

    updateSpeed();
}

function updateSpeed(){
    if(score % 100 == 0){
        if(snake["speed"] > 1){
            snake["speed"] = Math.floor(snake["speed"] * 0.95);
        }
    }
}

function checkCollision(){
    if($(".square").eq(snake["position"][0]).hasClass("barrier") || $(".square").eq(snake["position"][0]).hasClass("piece")){
        return false;
    }else{
        if($(".square").eq(snake["position"][0]).hasClass("food")){
            updateScore(100);
            growSnake();
            createFood();
        }

        return true;
    }
}
