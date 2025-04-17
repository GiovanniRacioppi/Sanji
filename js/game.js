// Configurazione di Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: window.innerWidth,
    height: window.innerHeight * 0.85, // Lascia spazio per la barra di progresso
    backgroundColor: '#f8f8f8',
    scene: {
        preload: preload,
        create: createIntroScreen // Modificato per iniziare con la schermata intro
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Variabili globali
let game = new Phaser.Game(config);
let currentRecipe;
let selectedIngredients = [];
let correctIngredients = [];
let completedRecipes = 0;
let usedRecipes = [];
let ingredientSprites = [];
let recipeText;
let successMessage;
let nextButton;
let errorCount = 0; // Contatore degli errori
let errorText; // Testo per mostrare gli errori rimanenti
let timeLeft = 30; // Tempo rimanente in secondi
let timerText; // Testo per mostrare il timer
let timerEvent; // Evento timer di Phaser
let selectedIngredientsPanel = []; // Array per tenere traccia degli ingredienti selezionati nel pannello laterale

// Precaricamento delle risorse
function preload() {
    this.load.setBaseURL('./');
    
    // Carica l'immagine di sfondo
    this.load.image('background', backgroundImage);
    
    // Carica tutte le immagini delle ricette
    recipes.forEach(recipe => {
        this.load.image(`recipe_${recipe.id}`, recipe.image);
        
        // Carica gli ingredienti di ogni ricetta
        recipe.ingredients.forEach((ingredient, index) => {
            // Estrai il nome del file dall'URL completo
            const ingredientKey = ingredient.split('/').pop().replace('.png', '');
            this.load.image(ingredientKey, ingredient);
        });
    });
    
    // Carica risorse UI
    this.load.image('check', 'assets/images/check.png');
    this.load.image('error', 'assets/images/error.png');
    this.load.image('button', 'assets/images/button.png');
}

// Funzione per creare la schermata di intro
function createIntroScreen() {
    // Aggiungi lo sfondo
    const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
    // Aggiungi il titolo del gioco
    const titleText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.15,
        'COOK LIKE SANJI',
        { 
            fontSize: '64px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 5, offsetY: 5, color: '#000000', blur: 8, fill: true }
        }
    );
    titleText.setOrigin(0.5);
    
    // Aggiungi un sottotitolo
    const subtitleText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.23,
        'Seleziona gli ingredienti corretti per ogni ricetta!',
        { 
            fontSize: '28px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }
    );
    subtitleText.setOrigin(0.5);
    
    // Mostra tutte le immagini delle ricette in una griglia
    const gridCols = 5; // 5 colonne
    const gridRows = 2; // 2 righe
    const recipeSize = Math.min(
        (this.cameras.main.width * 0.7) / gridCols,
        (this.cameras.main.height * 0.35) / gridRows
    ) * 0.8;
    
    const startX = (this.cameras.main.width - (recipeSize * gridCols * 1.5)) / 2 + recipeSize / 2;  // Aumentato spacing orizzontale (1.2 -> 1.5)
    const startY = this.cameras.main.height * 0.4;
    
    // Crea un contenitore per le immagini delle ricette
    const recipesContainer = this.add.container(0, 0);
    
    // Aggiungi tutte le immagini delle ricette
    recipes.forEach((recipe, index) => {
        const col = index % gridCols;
        const row = Math.floor(index / gridCols);
        
        const x = startX + col * recipeSize * 1.6;
        const y = startY + row * recipeSize * 1.6;
        
        // Aggiungi l'immagine della ricetta
        const recipeImage = this.add.image(x, y, `recipe_${recipe.id}`);
        recipeImage.setDisplaySize(recipeSize, recipeSize);
        
        // Aggiungi un bordo arrotondato
        recipeImage.setMask(new Phaser.Display.Masks.GeometryMask(this, 
            this.make.graphics()
                .fillStyle(0xffffff)
                .fillRoundedRect(
                    x - recipeSize / 2,
                    y - recipeSize / 2,
                    recipeSize,
                    recipeSize,
                    15
                )
        ));
        
        // Aggiungi un'ombra
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillRoundedRect(
            x - recipeSize / 2 + 5,
            y - recipeSize / 2 + 5,
            recipeSize,
            recipeSize,
            15
        );
        shadow.setDepth(0);
        recipeImage.setDepth(1);
        
        // Aggiungi il nome della ricetta sotto l'immagine
        const nameText = this.add.text(
            x,
            y + recipeSize / 2 + 25,
            recipe.name,
            { 
                fontSize: '16px', 
                fill: '#FFFFFF', 
                fontStyle: 'bold',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        );
        nameText.setOrigin(0.5, 0);
        
        // Aggiungi un effetto di hover
        recipeImage.setInteractive({ useHandCursor: true });
        
        recipeImage.on('pointerover', function() {
            this.scene.tweens.add({
                targets: [this, nameText],
                scale: 1.1,
                duration: 200
            });
        });
        
        recipeImage.on('pointerout', function() {
            this.scene.tweens.add({
                targets: [this, nameText],
                scale: 1,
                duration: 200
            });
        });
        
        // Aggiungi tutto al contenitore
        recipesContainer.add([shadow, recipeImage, nameText]);
    });
    
    // Aggiungi un pulsante "Inizia Gioco" usando grafica invece di un'immagine
    const startButtonGraphics = this.add.graphics();
    startButtonGraphics.fillStyle(0x4CAF50, 1); // Colore verde
    startButtonGraphics.fillRoundedRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height * 0.85 - 40,
        300, 
        80,
        15
    );
    
    // Aggiungi un bordo al pulsante
    startButtonGraphics.lineStyle(4, 0x2E7D32, 1);
    startButtonGraphics.strokeRoundedRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height * 0.85 - 40,
        300, 
        80,
        15
    );
    
    // Crea un'area interattiva per il pulsante
    const startButton = this.add.zone(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.85,
        300, 
        80
    );
    startButton.setInteractive({ useHandCursor: true });
    
    // Testo del pulsante
    const buttonText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.85,
        'Inizia il gioco',
        { 
            fontSize: '28px', 
            fill: '#FFFFFF',
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }
    );
    buttonText.setOrigin(0.5);
    
    // Effetto hover sul pulsante
    startButton.on('pointerover', function() {
        startButtonGraphics.clear();
        startButtonGraphics.fillStyle(0x66BB6A, 1); // Colore verde più chiaro
        startButtonGraphics.fillRoundedRect(
            this.scene.cameras.main.width / 2 - 165,
            this.scene.cameras.main.height * 0.85 - 44,
            330, 
            88,
            15
        );
        startButtonGraphics.lineStyle(4, 0x2E7D32, 1);
        startButtonGraphics.strokeRoundedRect(
            this.scene.cameras.main.width / 2 - 165,
            this.scene.cameras.main.height * 0.85 - 44,
            330, 
            88,
            15
        );
        buttonText.setScale(1.1);
    });
    
    startButton.on('pointerout', function() {
        startButtonGraphics.clear();
        startButtonGraphics.fillStyle(0x4CAF50, 1); // Colore verde originale
        startButtonGraphics.fillRoundedRect(
            this.scene.cameras.main.width / 2 - 150,
            this.scene.cameras.main.height * 0.85 - 40,
            300, 
            80,
            15
        );
        startButtonGraphics.lineStyle(4, 0x2E7D32, 1);
        startButtonGraphics.strokeRoundedRect(
            this.scene.cameras.main.width / 2 - 150,
            this.scene.cameras.main.height * 0.85 - 40,
            300, 
            80,
            15
        );
        buttonText.setScale(1);
    });
    
    // Evento di click sul pulsante
    startButton.on('pointerdown', () => {
        // Pulisci la scena
        this.children.removeAll(true);
        
        // Inizia il gioco
        create.call(this);
    });
    
    // Aggiungi un'animazione di pulsazione al pulsante
    this.tweens.add({
        targets: buttonText,
        scale: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

// Creazione della scena di gioco
function create() {
    // Aggiungi lo sfondo
    const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
    // Inizializza il gioco
    startNewRound(this);
    
    // Aggiorna la barra di progresso
    updateProgressBar();
}

// Funzione per iniziare un nuovo round
function startNewRound(scene) {
    // Pulisci gli elementi precedenti
    clearPreviousRound(scene);
    
    // Resetta il timer
    timeLeft = 30;
    
    // Seleziona una ricetta casuale non ancora usata
    currentRecipe = getRandomRecipe();
    
    if (!currentRecipe) {
        // Tutte le ricette sono state completate, mostra il messaggio finale
        showGameComplete(scene);
        return;
    }
    
    // Memorizza gli ingredienti corretti per questa ricetta
    correctIngredients = [...currentRecipe.ingredients];
    
    // Mostra l'immagine della ricetta centrata
    const recipeImage = scene.add.image(
        scene.cameras.main.width / 2, // Centrata orizzontalmente
        scene.cameras.main.height * 0.25,
        `recipe_${currentRecipe.id}`
    );
    recipeImage.setDisplaySize(scene.cameras.main.width * 0.3, scene.cameras.main.height * 0.3);
    
    // Aggiungi effetti grafici all'immagine della ricetta
    // Arrotonda i bordi dell'immagine
    recipeImage.setMask(new Phaser.Display.Masks.GeometryMask(scene, 
        scene.make.graphics()
            .fillStyle(0xffffff)
            .fillRoundedRect(
                recipeImage.x - recipeImage.displayWidth / 2,
                recipeImage.y - recipeImage.displayHeight / 2,
                recipeImage.displayWidth,
                recipeImage.displayHeight,
                20
            )
    ));
    
    // Aggiungi un'ombra per dare profondità
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(
        recipeImage.x - recipeImage.displayWidth / 2 + 8,
        recipeImage.y - recipeImage.displayHeight / 2 + 8,
        recipeImage.displayWidth,
        recipeImage.displayHeight,
        20
    );
    shadow.setDepth(0);
    recipeImage.setDepth(1);
    
    // Aggiungi effetti di animazione
    // Effetto di pulsazione leggera
    scene.tweens.add({
        targets: recipeImage,
        scaleX: recipeImage.scaleX * 1.05,
        scaleY: recipeImage.scaleY * 1.05,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Effetto di rotazione leggera
    scene.tweens.add({
        targets: recipeImage,
        angle: 2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    // Mostra il timer in alto a sinistra con stile cartoon
    timerText = scene.add.text(
        scene.cameras.main.width * 0.1,
        scene.cameras.main.height * 0.05,
        `Tempo: ${timeLeft}s`,
        { 
            fontSize: '32px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
        }
    );
    timerText.setOrigin(0, 0.5);
    timerText.setDepth(10);
    
    // Avvia il timer
    timerEvent = scene.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: scene,
        loop: true
    });
    
    // Mostra il nome della ricetta
    recipeText = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height * 0.45,
        currentRecipe.name,
        { 
            fontSize: '32px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, fill: true }
        }
    );
    recipeText.setOrigin(0.5);
    
    // Mostra il contatore degli errori in basso a sinistra con stile cartoon
    errorText = scene.add.text(
        scene.cameras.main.width * 0.1,
        scene.cameras.main.height * 0.95,
        `Errori: ${errorCount}/4`,
        { 
            fontSize: '28px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 6
        }
    );
    errorText.setOrigin(0, 1);
    errorText.setDepth(10);
    
    // Crea la griglia di ingredienti
    createIngredientsGrid(scene);
}

// Funzione per pulire gli elementi del round precedente
function clearPreviousRound(scene) {
    // Ferma il timer se esiste
    if (timerEvent) {
        timerEvent.remove();
        timerEvent = null;
    }
    
    // Rimuovi il testo del timer se esiste
    if (timerText && timerText.destroy) {
        timerText.destroy();
    }
    
    // Resetta le selezioni
    selectedIngredients = [];
    
    // Rimuovi tutti gli sprite degli ingredienti e i loro bordi rossi
    ingredientSprites.forEach(sprite => {
        // Rimuovi il bordo rosso se esiste
        if (sprite.redBorder && sprite.redBorder.destroy) {
            sprite.redBorder.destroy();
        }
        
        // Rimuovi lo sprite
        if (sprite && sprite.destroy) {
            sprite.destroy();
        }
    });
    ingredientSprites = [];
    
    // Rimuovi gli ingredienti dal pannello laterale
    selectedIngredientsPanel.forEach(sprite => {
        if (sprite && sprite.destroy) {
            sprite.destroy();
        }
    });
    selectedIngredientsPanel = [];
    
    // Rimuovi il testo della ricetta se esiste
    if (recipeText && recipeText.destroy) {
        recipeText.destroy();
    }
    
    // Rimuovi il messaggio di successo se esiste
    if (successMessage && successMessage.destroy) {
        successMessage.destroy();
    }
    
    // Rimuovi il pulsante "Prossima" se esiste
    if (nextButton && nextButton.destroy) {
        nextButton.destroy();
    }
    
    // Rimuovi il testo degli errori se esiste
    if (errorText && errorText.destroy) {
        errorText.destroy();
    }
    
    // Rimuovi esplicitamente l'immagine della ricetta e la sua ombra
    scene.children.list.forEach(child => {
        // Cerca specificamente l'immagine della ricetta
        if (child.type === 'Image' && child.texture && child.texture.key.startsWith('recipe_')) {
            child.destroy();
        }
        
        // Rimuovi tutti i testi, immagini e elementi UI rimasti nella scena
        // ECCETTO lo sfondo (background)
        if ((child.type === 'Text' || 
             (child.type === 'Image' && child.texture && child.texture.key !== 'background') || 
             (child.texture && child.texture.key === 'button')) && 
            child !== recipeText && 
            child !== successMessage && 
            child !== errorText && 
            child !== nextButton) {
            child.destroy();
        }
        
        // Rimuovi anche eventuali grafici (come i bordi e le ombre)
        if (child.type === 'Graphics') {
            child.destroy();
        }
    });
}

// Funzione per ottenere una ricetta casuale non ancora usata
function getRandomRecipe() {
    // Filtra le ricette non ancora usate
    const availableRecipes = recipes.filter(recipe => !usedRecipes.includes(recipe.id));
    
    if (availableRecipes.length === 0) {
        return null; // Tutte le ricette sono state usate
    }
    
    // Seleziona una ricetta casuale
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    const selectedRecipe = availableRecipes[randomIndex];
    
    // Aggiungi la ricetta all'elenco delle ricette usate
    usedRecipes.push(selectedRecipe.id);
    
    return selectedRecipe;
}


// Funzione per spostare l'ingrediente selezionato sul lato destro
// Funzione per spostare l'ingrediente selezionato sul lato destro
function moveIngredientToSidebar(scene, ingredient) {
    // Calcola la posizione sul lato destro
    const rightPanelX = scene.cameras.main.width * 0.85;
    const startY = scene.cameras.main.height * 0.2;
    const spacing = 120; // Aumentato lo spazio tra gli ingredienti
    
    // Crea una copia dell'ingrediente
    const ingredientCopy = scene.add.sprite(
        ingredient.x,
        ingredient.y,
        ingredient.texture.key
    );
    
    // Imposta dimensioni fisse di 100x100 pixel
    ingredientCopy.setDisplaySize(100, 100);
    ingredientCopy.setDepth(10);
    
    // Aggiungi un'ombra all'ingrediente
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(
        ingredient.x - 45,
        ingredient.y - 45,
        110, 
        110,
        12
    );
    shadow.setDepth(9);
    
    // Calcola la posizione Y in base al numero di ingredienti già selezionati
    const targetY = startY + (selectedIngredientsPanel.length * spacing);
    
    // Aggiungi un'animazione di movimento verso il lato destro (più lenta)
    scene.tweens.add({
        targets: [ingredientCopy, shadow],
        x: rightPanelX,
        y: targetY,
        duration: 1500, // Aumentato da 800 a 1500 per un movimento più lento
        ease: 'Bounce.Out',
        onComplete: function() {
            // Dopo che l'ingrediente è arrivato a destinazione, aggiungi il bordo arrotondato
            const mask = new Phaser.Display.Masks.GeometryMask(scene, 
                scene.make.graphics()
                    .fillStyle(0xffffff)
                    .fillRoundedRect(
                        rightPanelX - 50, // metà della larghezza (100/2)
                        targetY - 50, // metà dell'altezza (100/2)
                        100,
                        100,
                        12
                    )
            );
            ingredientCopy.setMask(mask);
            
            // Aggiorna l'ombra nella posizione finale
            shadow.clear();
            shadow.fillStyle(0x000000, 0.4);
            shadow.fillRoundedRect(
                rightPanelX - 55,
                targetY - 55,
                110,
                110,
                12
            );
            shadow.setDepth(9);
            
            // Aggiungi un effetto di pulsazione continua
            scene.tweens.add({
                targets: ingredientCopy,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            // Aggiungi un leggero effetto di oscillazione
            scene.tweens.add({
                targets: [ingredientCopy, shadow],
                x: rightPanelX + 5,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    });
    
    // Aggiungi l'ingrediente copiato all'array del pannello laterale
    selectedIngredientsPanel.push(ingredientCopy);
}

// Funzione per mescolare un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Funzione per aggiornare il timer
function updateTimer() {
    timeLeft--;
    
    // Aggiorna il testo del timer
    if (timerText) {
        // Cambia il colore quando il tempo sta per scadere
        let textColor = '#FFFFFF';
        if (timeLeft <= 10) {
            textColor = '#FF9900'; // Arancione
        }
        if (timeLeft <= 5) {
            textColor = '#FF0000'; // Rosso
        }
        
        timerText.setText(`Tempo: ${timeLeft}s`);
        timerText.setFill(textColor);
        
        // Aggiungi un effetto di pulsazione quando il tempo è quasi scaduto
        if (timeLeft <= 5) {
            this.tweens.add({
                targets: timerText,
                scale: 1.2,
                duration: 200,
                yoyo: true
            });
        }
    }
    
    // Se il tempo è scaduto, termina il round
    if (timeLeft <= 0) {
        // Ferma il timer
        if (timerEvent) {
            timerEvent.remove();
        }
        
        // Mostra il messaggio di game over con il flag isTimeOut impostato a true
        showGameOver(this, true);
    }
}

// Funzione per creare la griglia di ingredienti
function createIngredientsGrid(scene) {
    // Ottieni tutti gli ingredienti disponibili
    const allIngredients = getAllIngredients();
    
    // Seleziona 12 ingredienti sbagliati casuali
    const wrongIngredients = getRandomWrongIngredients(allIngredients, currentRecipe.ingredients, 12);
    
    // Combina gli ingredienti corretti e sbagliati
    let allGridIngredients = [...currentRecipe.ingredients, ...wrongIngredients];
    
    // Mescola gli ingredienti
    shuffleArray(allGridIngredients);
    
    // Calcola le dimensioni della griglia
    const gridSize = 16; // 4x4 grid
    const gridCols = 4;
    const gridRows = 4;
    
    // Calcola le dimensioni e la posizione degli elementi della griglia
    const gridWidth = scene.cameras.main.width * 0.8;
    const gridHeight = scene.cameras.main.height * 0.4;
    
    // Assicurati che le celle siano quadrate prendendo la dimensione minore
    const cellSize = Math.min(gridWidth / gridCols, gridHeight / gridRows);
    
    const startX = (scene.cameras.main.width - (cellSize * gridCols)) / 2 + cellSize / 2;
    const startY = scene.cameras.main.height * 0.55 + cellSize / 2;
    
    // Crea gli sprite degli ingredienti
    for (let i = 0; i < gridSize; i++) {
        const col = i % gridCols;
        const row = Math.floor(i / gridCols);
        
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;
        
        // Ottieni il percorso dell'immagine dell'ingrediente
        const ingredientPath = allGridIngredients[i];
        
        // Estrai l'ID dell'ingrediente dal percorso
        const ingredientKey = ingredientPath.split('/').pop().replace('.png', '');
        
        // Crea lo sprite dell'ingrediente
        const ingredient = scene.add.sprite(x, y, ingredientKey);
        
        // Imposta dimensioni quadrate per l'ingrediente
        ingredient.setDisplaySize(cellSize * 0.8, cellSize * 0.8);
        
        // Aggiungi un bordo arrotondato agli ingredienti
        ingredient.setMask(new Phaser.Display.Masks.GeometryMask(scene, 
            scene.make.graphics()
                .fillStyle(0xffffff)
                .fillRoundedRect(
                    x - (cellSize * 0.8) / 2,
                    y - (cellSize * 0.8) / 2,
                    cellSize * 0.8,
                    cellSize * 0.8,
                    10
                )
        ));
        
        ingredient.setInteractive({ useHandCursor: true });
        
        // Memorizza il percorso dell'immagine come proprietà dello sprite
        ingredient.imagePath = ingredientPath;
        
        // Aggiungi l'evento di click
        ingredient.on('pointerdown', function() {
            handleIngredientClick(scene, this);
        });
        
        // Aggiungi lo sprite all'array
        ingredientSprites.push(ingredient);
    }
}

// Funzione per gestire il click su un ingrediente
function handleIngredientClick(scene, ingredient) {
    // Controlla se l'ingrediente è già stato selezionato
    if (selectedIngredients.includes(ingredient.imagePath)) {
        return;
    }
    
    // Controlla se l'ingrediente è corretto
    const isCorrect = correctIngredients.includes(ingredient.imagePath);
    
    if (isCorrect) {
        // Aggiungi l'ingrediente alla lista dei selezionati
        selectedIngredients.push(ingredient.imagePath);
        
        // Mostra l'effetto di selezione corretta
        showSelectionEffect(scene, ingredient, true);
        
        // Rendi l'ingrediente trasparente gradualmente
        scene.tweens.add({
            targets: ingredient,
            alpha: 0.3,
            duration: 500,
            ease: 'Power2'
        });
        
        // Crea una copia dell'ingrediente sul lato destro
        moveIngredientToSidebar(scene, ingredient);
        
        // Controlla se tutti gli ingredienti corretti sono stati selezionati
        if (selectedIngredients.length === correctIngredients.length) {
            // Mostra il messaggio di successo
            showSuccessMessage(scene);
        }
    } else {
        // Incrementa il contatore degli errori
        errorCount++;
        
        // Aggiorna il testo degli errori
        if (errorText) {
            errorText.setText(`Errori: ${errorCount}/4`);
        }
        
        // Mostra l'effetto di selezione errata
        showSelectionEffect(scene, ingredient, false);
        
        // Controlla se il giocatore ha raggiunto il limite di errori
        if (errorCount >= 4) {
            // Mostra il messaggio di game over con il flag isTimeOut impostato a false (default)
            showGameOver(scene);
        }
    }
}

// Funzione per mostrare l'effetto di selezione
function showSelectionEffect(scene, ingredient, isCorrect) {
    // Verifica che le texture esistano prima di creare le icone
    const iconKey = isCorrect ? 'check' : 'error';
    
    // Verifica se la texture esiste prima di creare l'icona
    if (scene.textures.exists(iconKey)) {
        // Crea l'icona di feedback solo se la texture esiste
        const icon = scene.add.image(
            ingredient.x,
            ingredient.y,
            iconKey
        );
        icon.setDisplaySize(40, 40);
        icon.setDepth(1);
        
        // Animazione per l'icona
        scene.tweens.add({
            targets: icon,
            scale: isCorrect ? 1.5 : 1,
            alpha: isCorrect ? 1 : 0,
            duration: isCorrect ? 300 : 500,
            delay: isCorrect ? 0 : 300,
            yoyo: isCorrect,
            onComplete: function() {
                icon.destroy();
            }
        });
    }
    
    // Resto del codice per l'animazione di feedback
    if (isCorrect) {
        // Codice esistente per ingredienti corretti...
    } else {
        // Crea un bordo rosso permanente attorno all'ingrediente
        const redBorder = scene.add.graphics();
        redBorder.lineStyle(3, 0xff0000, 1);
        redBorder.strokeRoundedRect(
            ingredient.x - ingredient.displayWidth / 2 - 5,
            ingredient.y - ingredient.displayHeight / 2 - 5,
            ingredient.displayWidth + 10,
            ingredient.displayHeight + 10,
            12
        );
        redBorder.setDepth(ingredient.depth + 1);
        
        // Breve animazione di shake per feedback visivo
        scene.tweens.add({
            targets: ingredient,
            x: ingredient.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 2
        });
        
        // Disabilita l'interattività dell'ingrediente
        ingredient.disableInteractive();
        
        // Salva il riferimento al bordo rosso nell'ingrediente per poterlo rimuovere in clearPreviousRound
        ingredient.redBorder = redBorder;
    }
}

// Funzione per mostrare il messaggio di successo
function showSuccessMessage(scene) {
    // Ferma il timer
    if (timerEvent) {
        timerEvent.remove();
    }
    
    // Incrementa il contatore delle ricette completate
    completedRecipes++;
    
    // Aggiorna la barra di progresso
    updateProgressBar();
    

    // Crea il messaggio di successo
    successMessage = scene.add.text(
        scene.cameras.main.width / 5,
        scene.cameras.main.height / 2,
        'Complimenti!\nRicetta completata!',
        { 
            fontSize: '36px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#FF0000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 6, fill: true }
        }
    );
    successMessage.setOrigin(0.5);
    successMessage.setDepth(2);
    
    // Animazione per il messaggio di successo
    scene.tweens.add({
        targets: successMessage,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 1
    });
    
    
    // Crea il pulsante "Ricomincia"
    const nextButton = scene.add.text(
        scene.cameras.main.width / 6,
        scene.cameras.main.height / 2 + 100,
        'Prossima ricetta',
        { 
            fontSize: '36px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, fill: true },
            padding: { left: 25, right: 25, top: 15, bottom: 15 }
        }
    );
    nextButton.setOrigin(0.5);
    nextButton.setInteractive({ useHandCursor: true });
    nextButton.setDepth(2);
    
    // Aggiungi effetto hover
    nextButton.on('pointerover', function() {
        this.setStyle({ fill: '#FFFF00' });
        this.setScale(1.1);
    });
    
    nextButton.on('pointerout', function() {
        this.setStyle({ fill: '#FFFFFF' });
        this.setScale(1);
    });
    
   
    // Evento di click sul pulsante
    nextButton.on('pointerdown', function() {
        // Inizia un nuovo round
        clearPreviousRound(scene);
        startNewRound(scene);
    });
}

// Funzione per mostrare il game over
function showGameOver(scene, isTimeOut = false) {
    // Pulisci gli elementi precedenti
    clearPreviousRound(scene);
    
    // Crea il messaggio di game over con testo diverso in base alla causa
    const gameOverMessage = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 - 50,
        isTimeOut ? 
            'Mi dispiace!\nIl tempo a disposizione è terminato.' : 
            'Mi dispiace!\nTentativi terminati.',
        { 
            fontSize: '40px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#FF0000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 6, fill: true }
        }
    );
    gameOverMessage.setOrigin(0.5);
    gameOverMessage.setDepth(2);
    
    // Animazione per il messaggio di game over
    scene.tweens.add({
        targets: gameOverMessage,
        scale: 1.1,
        duration: 300,
        yoyo: true,
        repeat: 2
    });
    
    // Crea il pulsante "Ricomincia"
    const restartButton = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 100,
        'Ricomincia',
        { 
            fontSize: '36px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, fill: true },
            padding: { left: 25, right: 25, top: 15, bottom: 15 }
        }
    );
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.setDepth(2);
    
    // Aggiungi effetto hover
    restartButton.on('pointerover', function() {
        this.setStyle({ fill: '#FFFF00' });
        this.setScale(1.1);
    });
    
    restartButton.on('pointerout', function() {
        this.setStyle({ fill: '#FFFFFF' });
        this.setScale(1);
    });
    
    // Evento di click sul pulsante
    restartButton.on('pointerdown', function() {
        // Distruggi esplicitamente il pulsante e il messaggio di game over
        restartButton.destroy();
        gameOverMessage.destroy();
        
        // Resetta il gioco
        usedRecipes = [];
        completedRecipes = 0;
        errorCount = 0; // Resetta il contatore degli errori
        updateProgressBar();
        
        // Inizia un nuovo round
        //startNewRound(scene);
        scene.children.removeAll(true);
        createIntroScreen.call(scene);
    });
}

// Funzione per mostrare il completamento del gioco
function showGameComplete(scene) {
    // Pulisci gli elementi precedenti
    clearPreviousRound(scene);
    
    // Crea il messaggio di completamento
    const completeMessage = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 - 50,
        'Complimenti!\nHai completato tutte le ricette!',
        { 
            fontSize: '30px', 
            fill: '#FFFFFF', 
            fontStyle: 'bold',
            fontFamily: 'Arial Rounded MT Bold, Comic Sans MS, Arial',
            stroke: '#FF0000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 6, fill: true }
        }
    );
    completeMessage.setOrigin(0.5);
    
    // Crea il pulsante "Ricomincia"
    const restartButton = scene.add.image(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 100,
        'button'
    );
    restartButton.setDisplaySize(250, 80);
    restartButton.setInteractive({ useHandCursor: true });
    
    // Testo del pulsante
    const buttonText = scene.add.text(
        restartButton.x,
        restartButton.y,
        'Ricomincia',
        { fontSize: '24px', fill: '#fff' }
    );
    buttonText.setOrigin(0.5);
    
    // Evento di click sul pulsante
    restartButton.on('pointerdown', function() {
        // Resetta il gioco
        usedRecipes = [];
        completedRecipes = 0;
        errorCount = 0; // Resetta il contatore degli errori
        updateProgressBar();
        
        // Inizia un nuovo round
        startNewRound(scene);
    });
}

// Funzione per aggiornare la barra di progresso
function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    // Calcola la percentuale di completamento
    const percentage = (completedRecipes / recipes.length) * 100;
    
    // Aggiorna la barra di progresso
    progressFill.style.width = `${percentage}%`;
    
    // Aggiorna il testo
    progressText.textContent = `Ricetta: ${completedRecipes}/${recipes.length}`;
}

// Funzione per ottenere ingredienti sbagliati casuali
function getRandomWrongIngredients(allIngredients, correctIngredients, count) {
    // Filtra gli ingredienti sbagliati (quelli che non sono nella ricetta corrente)
    const wrongIngredients = allIngredients.filter(ingredient => !correctIngredients.includes(ingredient));
    
    // Mescola gli ingredienti sbagliati
    shuffleArray(wrongIngredients);
    
    // Restituisci il numero richiesto di ingredienti sbagliati
    return wrongIngredients.slice(0, count);
}


// Gestione del ridimensionamento della finestra
window.addEventListener('resize', function() {
    if (game) {
        // Aggiorna le dimensioni del gioco
        game.scale.resize(window.innerWidth, window.innerHeight * 0.85);
        
        // Ricrea la scena corrente
        game.scene.getScenes(true)[0].scene.restart();
    }
});

