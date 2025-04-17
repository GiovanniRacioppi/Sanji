// Database delle ricette
const recipes = [
    {
        id: 1,
        name: "Riso al curry di Sanji",
        image: "assets/images/ricetta_1.png",
        ingredients: [
            "assets/images/ricetta_1_ingrediente_1.png",
            "assets/images/ricetta_1_ingrediente_2.png",
            "assets/images/ricetta_1_ingrediente_3.png",
            "assets/images/ricetta_1_ingrediente_4.png"
        ]
    },
    {
        id: 2,
        name: "Onigiri di Luffy",
        image: "assets/images/ricetta_2.png",
        ingredients: [
            "assets/images/ricetta_2_ingrediente_1.png",
            "assets/images/ricetta_2_ingrediente_2.png",
            "assets/images/ricetta_2_ingrediente_3.png",
            "assets/images/ricetta_2_ingrediente_4.png"
        ]
    },
    {
        id: 3,
        name: "Takoyaki di Chopper",
        image: "assets/images/ricetta_3.png",
        ingredients: [
            "assets/images/ricetta_3_ingrediente_1.png",
            "assets/images/ricetta_3_ingrediente_2.png",
            "assets/images/ricetta_3_ingrediente_3.png",
            "assets/images/ricetta_3_ingrediente_4.png"
        ]
    },
    {
        id: 4,
        name: "Ramen di Nami",
        image: "assets/images/ricetta_4.png",
        ingredients: [
            "assets/images/ricetta_4_ingrediente_1.png",
            "assets/images/ricetta_4_ingrediente_2.png",
            "assets/images/ricetta_4_ingrediente_3.png",
            "assets/images/ricetta_4_ingrediente_4.png"
        ]
    },
    {
        id: 5,
        name: "Gyoza di Robin",
        image: "assets/images/ricetta_5.png",
        ingredients: [
            "assets/images/ricetta_5_ingrediente_1.png",
            "assets/images/ricetta_5_ingrediente_2.png",
            "assets/images/ricetta_5_ingrediente_3.png",
            "assets/images/ricetta_5_ingrediente_4.png"
        ]
    },
    {
        id: 6,
        name: "Sushi di Zoro",
        image: "assets/images/ricetta_6.png",
        ingredients: [
            "assets/images/ricetta_6_ingrediente_1.png",
            "assets/images/ricetta_6_ingrediente_2.png",
            "assets/images/ricetta_6_ingrediente_3.png",
            "assets/images/ricetta_6_ingrediente_4.png"
        ]
    },
    {
        id: 7,
        name: "Dorayaki di Usopp",
        image: "assets/images/ricetta_7.png",
        ingredients: [
            "assets/images/ricetta_7_ingrediente_1.png",
            "assets/images/ricetta_7_ingrediente_2.png",
            "assets/images/ricetta_7_ingrediente_3.png",
            "assets/images/ricetta_7_ingrediente_4.png"
        ]
    },
    {
        id: 8,
        name: "Tempura di Franky",
        image: "assets/images/ricetta_8.png",
        ingredients: [
            "assets/images/ricetta_8_ingrediente_1.png",
            "assets/images/ricetta_8_ingrediente_2.png",
            "assets/images/ricetta_8_ingrediente_3.png",
            "assets/images/ricetta_8_ingrediente_4.png"
        ]
    },
    {
        id: 9,
        name: "Miso Soup di Brook",
        image: "assets/images/ricetta_9.png",
        ingredients: [
            "assets/images/ricetta_9_ingrediente_1.png",
            "assets/images/ricetta_9_ingrediente_2.png",
            "assets/images/ricetta_9_ingrediente_3.png",
            "assets/images/ricetta_9_ingrediente_4.png"
        ]
    },
    {
        id: 10,
        name: "Pasta di soba di Jinbe",
        image: "assets/images/ricetta_10.png",
        ingredients: [
            "assets/images/ricetta_10_ingrediente_1.png",
            "assets/images/ricetta_10_ingrediente_2.png",
            "assets/images/ricetta_10_ingrediente_3.png",
            "assets/images/ricetta_10_ingrediente_4.png"
        ]
    }
];

// Funzione per ottenere tutti gli ingredienti (per creare la griglia con ingredienti sbagliati)
function getAllIngredients() {
    const allIngredients = [];
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            allIngredients.push(ingredient);
        });
    });
    return allIngredients;
}

// Aggiungi riferimento all'immagine di sfondo
const backgroundImage = "assets/images/bg.png";