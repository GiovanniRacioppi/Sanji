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
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2,
        'Complimenti!\nHai completato la ricetta!',
        { fontSize: '40px', fill: '#008000', fontStyle: 'bold', align: 'center' }
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
    
    // Crea il pulsante "Prossima ricetta"
    nextButton = scene.add.image(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 100,
        'button'
    );
    nextButton.setDisplaySize(250, 80);
    nextButton.setInteractive({ useHandCursor: true });
    nextButton.setDepth(2);
    
    // Testo del pulsante
    const buttonText = scene.add.text(
        nextButton.x,
        nextButton.y,
        'Prossima ricetta',
        { fontSize: '24px', fill: '#fff' }
    );
    buttonText.setOrigin(0.5);
    buttonText.setDepth(3);
    
    // Evento di click sul pulsante
    nextButton.on('pointerdown', function() {
        // Inizia un nuovo round
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
            fontSize: '40px', 
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