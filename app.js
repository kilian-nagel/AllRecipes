
/* Query the meal DB and make the DB
=============== */

class storage {
    constructor(all_req,all_meals,random_meal,favorite_meals){
        this.all_req = all_req;
        this.all_meals = all_meals;
        this.random_meal = random_meal;
        this.favorite_meals = favorite_meals;
        this.current_meal = 0;
        this.req_done = 0;
    }
}
let db = new storage([],[],[],[]);

function query_mealDB(){
    const req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            let request_obj_wrapper = {};
            let response_text = JSON.parse(req.response).meals[0];
            let response_id = JSON.parse(req.response).meals[0].idMeal;
            request_obj_wrapper[response_id]=[db.req_done,response_text];
            if(req_not_already_stored(request_obj_wrapper[Object.keys(request_obj_wrapper)[0]][0])){
                if(db.req_done<15){
                    db.req_done++;
                }
                update_recipes_display(request_obj_wrapper,request_obj_wrapper[Object.keys(request_obj_wrapper)][0])
            }
            else {
                db.all_req[request_obj_wrapper[response_id]] = new_req;
            }
        };
    }
    req.open('GET','https://www.themealdb.com/api/json/v1/1/random.php')
    req.send();
}

function req_not_already_stored(request_obj_wrapper){
    let count = 0;
    for(let meal in db.all_req){
        if(meal == Object.keys(request_obj_wrapper)[0]){count++;}
    }
    if(count>1){
        return false;
    }
    return true;
}

function update_recipes_display(request_obj_wrapper,index){
    request_obj_wrapper = request_obj_wrapper[Object.keys(request_obj_wrapper)[0]][1];
    console.log(request_obj_wrapper);
    let meal = request_obj_wrapper;
    let text = meal.strCategory;
    let img = meal.strMealThumb;

    db.all_meals.push(meal);
    fill_text_img_of_recipes(text,img,index)
    //fill_text_img_of_daily_recipe();
}

/* FILL HTML with DB data  
=============== */

function fill_text_img_of_recipes(text,img,index){
    let recipe_img = document.querySelectorAll('.recipes__recipe-img')[index]; 
    let recipe_text = document.querySelectorAll('.recipes__recipe-text')[index];
    console.log(recipe_img,img,index);
    recipe_text.innerHTML = text;
    recipe_img.src = img;
    init_recipes_listeners(recipe_img);
}

function fill_text_img_of_daily_recipe(x){
    let recipe_img_elt = document.querySelector('.daily-recipe-showcase');
    let recipe_text_elt = document.querySelector('.daily-recipe__text');
    let recipe = db.all_req[db.all_req.length-1].meals[0];
    let recipe_description = recipe.strInstructions;
    let recipe_img = recipe.strMealThumb
    
    recipe_text_elt.innerHTML = recipe_description
    recipe_img_elt.style.background = "url('"+recipe_img+"') "+"center/cover";
}

/* Show specific recipe
=============== */

function show_specific_recipe(){
    let self = this;
    let box_container = document.createElement('div');
    let box = document.createElement('div');
    let body = document.querySelector('body');
    let html = document.querySelector('html');

    box.classList.add('recipe-box');
    box_container.classList.add('recipe-box-wrapper');
    box_container.classList.add('background-hidden');
    box_container.style.height = body.clientHeight+'px';

    body.appendChild(box_container);
    fill_innerhtml_recipe_box(box,self);
    blurring_all_bg();

    init_hideBtn_listener();
}

function get_recipe_index_of_clicked_recipe(self){
    let recipes = document.querySelectorAll('.recipes-container');
    for(let i=0;i<recipes.length;i++){
        if(recipes[i]===self){
            data = db.all_meals[i];
            return data;
        }
    }
}
function get_recipe_index_of_clicked_recipe_with_meal_name(meal_name){
    let recipes = document.querySelectorAll('.recipes-container');
    for(let i=0;i<recipes.length;i++){
        let x = recipes[i].querySelector('.recipes__recipe-text');
        console.log(x);
        if(recipes[i]===meal_name){
            data = db.all_req[i].meals[0];
            return data;
        }
    }
}

function fill_innerhtml_recipe_box(box,self){
    let meal = get_recipe_index_of_clicked_recipe(self);
    let meal_name = meal.strMeal;
    let meal_img = meal.strMealThumb;
    let meal_ingredients=search_meal_ingredients_of_recipe(meal);
    let meal_ingredients_elts = '';
    db.current_meal = meal;
    meal_ingredients.forEach((ingredient)=>{
        meal_ingredients_elts += "<li class = 'recipe-box__items'>";
        meal_ingredients_elts += ingredient;
        meal_ingredients_elts += "</li>";
    });
    let title = meal_name;

    box.innerHTML = "<header class='recipe-box__header'><h3 class='recipe-box__title'>"+title+"</h3><div class='recipe-box__icon-container'><i class='fas fa-times recipe-box__hide-btn hide-btn'></i><i class='fas fa-heart recipe-box__fav-btn' onclick='add_fav_meal(this)'></i></div></header><div class='recipe-box__content'><div class='recipe-box__img-wrapper'><img class='recipe-box__img'></div><p class = 'recipe-box__subtitle'>Ingredients</p><ul class='recipe-box__list'>"+meal_ingredients_elts+"</ul></div>";

    let recipe_box_container = document.querySelector('.recipe-box-wrapper');
    recipe_box_container.appendChild(box);
    let meal_img_elt = document.querySelector('.recipe-box__img');
    meal_img_elt.src = meal_img;
    let header = document.querySelector('recipe-box__header');
}

function search_meal_ingredients_of_recipe(meal){
    let index = 0;
    let ingredients = [meal.strIngredient1,meal.strIngredient2,meal.strIngredient3,meal.strIngredient4,meal.strIngredient5,meal.strIngredient6,meal.strIngredient7,meal.strIngredient8,meal.strIngredient9,meal.strIngredient10,meal.strIngredient11,meal.strIngredient12,meal.strIngredient13,meal.strIngredient14,meal.strIngredient15,meal.strIngredient16,meal.strIngredient17,meal.strIngredient18,meal.strIngredient19,meal.strIngredient20];
    let ingreds = ingredients.filter((x)=>{
        return x != '' && x != null;
    })
    return ingreds;
}

function init_hideBtn_listener (self){
    let hide_btn = document.querySelector('.recipe-box__hide-btn');
    let recipe_box = document.querySelector('.recipe-box-wrapper');
    let parent = recipe_box.parentNode;
    
    hide_btn.addEventListener('click',()=>{
        recipe_box.innerHTML = '';
        parent.removeChild(recipe_box);
        remove_blur_bg();
    });

}

function blurring_all_bg(){
    let body = document.querySelector('body');
    let children = body.children;
    let recipe_box = document.querySelector('.recipe-box');
    let header = document.querySelector('.header');
    let recipes = document.querySelector('.recipes');
    let personalize = document.querySelector('.personalize');
    let daily_recipe = document.querySelector('.daily-recipe');
    let elts = [header,recipes,personalize,daily_recipe];
    
    elts.forEach((x)=>{
        x.style.filter = 'blur(20px)';
    });
}

function remove_blur_bg (){
    let header = document.querySelector('.header');
    let recipes = document.querySelector('.recipes');
    let personalize = document.querySelector('.personalize');
    let daily_recipe = document.querySelector('.daily-recipe');
    let elts = [header,recipes,personalize,daily_recipe];

    elts.forEach((x)=>{
        x.style.filter = 'none';
    })
}

function show_fav_icon(){
    let parent = this;
    let fav_icon = parent.querySelector('.recipes__goto-icon');
    let fav_icon_wrapper = parent.querySelector('.recipes__goto-icon-wrapper');

    fav_icon_wrapper.style.display = 'grid';
    fav_icon.style.display = 'inline-block';
}

function show_fav_icon(){
    let parent = this;
    let fav_icon = parent.querySelector('.recipes__goto-icon');
    let fav_icon_wrapper = parent.querySelector('.recipes__goto-icon-wrapper');
    let fav_icon_wrapper_display,fav_icon_display;

    fav_icon_wrapper.style.display = 'grid';
    fav_icon.style.display = 'inline-block';
}

function hide_fav_icon(){
    let parent = this;
    let fav_icon = parent.querySelector('.recipes__goto-icon');
    let fav_icon_wrapper = parent.querySelector('.recipes__goto-icon-wrapper');

    fav_icon_wrapper.style.display = 'none';
    fav_icon.style.display = 'none';
}

/* Navigation 
=============== */

function change_state_navbar(){
    let navbar = document.querySelector('.navbar-container');
    let bg_blur = document.querySelector('.blur-bg');
    let nav_main = document.querySelector('.navbar-main');
    let nav_header = document.querySelector('.navbar-header');

    if(navbar.style.display == 'none'){
        navbar.style.display = 'flex';
        blurring_all_bg();
    } else {
        navbar.style.display = 'none';
        remove_blur_bg();
    }
}

/* Favorite Recipes
=============== */

function hide_content_for_fav_meals(){
    let recipes = document.querySelector('.recipes');
    let personalize = document.querySelector('.personalize');
    let daily_recipe = document.querySelector('.daily-recipe');
    let elts = [header,recipes,personalize,daily_recipe];

    elts.forEach((x)=>{
        x.style.display = 'none';
    })
}

function show_favorite_meals(){
    let body = document.querySelector('body');
    hide_content_for_fav_meals();
    let html = create_fav_meal_innerhtml();
    body.appendChild(html);
}

function create_fav_meal_innerhtml(){
    let innerhtml = "<div class='fav-meals-container'><section class='fav-meals-header'><h2 class='fav-meals-header__title'>Favorite meals</h2></section><section class='fav-meals'><div class='fav-meals__container'><div class='fav-meals-left'><h3 class='fav-meals__title'>Title</h3><p class='fav-meals__subtitle'>Subtitle</p></div><div class='fav-meals-right'><img class='fav-meals__img'></div></div></section><section class='specific-meal'><div class='specific-meal-header'><h3 class='specific-meal__title'></h3><img class='specific-meal__img'></div></div><div class='specific-meal-ingredients'>Ingredients</div><div class='specific-meal-preparation'>Preparations</div></section></div>";
    return innerhtml;
}

function add_fav_meal(){
    db.favorite_meals.push(db.current_meal);
}

/* Listeners
=============== */

function init_recipes_listeners(child){
    let parent = child.parentNode;
    parent.addEventListener('mouseover',show_fav_icon);
    parent.addEventListener('mouseout',hide_fav_icon);
    parent.addEventListener('click',show_specific_recipe);
}

function init_all_listeners(){
    let menu_btn = document.querySelector('.header__nav-btn');
    menu_btn.addEventListener('click',change_state_navbar);
}

/* MAIN
=============== */

function main(){
    for(let i=0;i<15;i++){
        query_mealDB();
        init_all_listeners();
    }
}
main();

/* GENERAL FUNCTIONS
=============== */

