// Function qui s'exécute toute seule (cf. premiers slides du cours)
// Comme cette balise est à la fin de la page, on est sur que le code HTML a été entièrement chargé.
// Equivalent d'un $('document').ready(function(){...}); en jQuery
(function() {
	// Difficulé (nombre de colonne ou ligne)
	// Par exemple pour 4 : 4x4 = 16 pièces
	var DIFFICULTE = 4;
	
	var plateauImage;
	var plateauLargeur;
	var plateauHauteur;
	var pieceLargeur;
	var pieceHauteur;
	var pieceSelectionnee;
	var pieceDepotCible;
	var pieces;
	
	var canvas;
	var canvasContexte;
	
	var mouse;
	
	var buttonStart;

	/**
	 * Initialisation du jeu
	 */
	function initGame(){
		plateauImage = new Image();
		plateauImage.addEventListener('load', onImageLoaded, false);
		plateauImage.src = "level-1.jpg";
	}
	
	/**
	 * Callback appelé après le chargement de l'image de fond
	 */
	function onImageLoaded(e) {
		pieceLargeur = Math.floor(plateauImage.width / DIFFICULTE)
		pieceHauteur = Math.floor(plateauImage.height / DIFFICULTE)
		plateauLargeur = pieceLargeur * DIFFICULTE;
		plateauHauteur = pieceHauteur * DIFFICULTE;
		
		setCanvas();
		initPuzzle();
	}
	
	/**
	 * Initialisation du canvas
	 */
	function setCanvas(){
		canvas = document.getElementById('puzzleCanvas');
		canvasContexte = canvas.getContext('2d');
		canvas.width = plateauLargeur;
		canvas.height = plateauHauteur;
		canvas.style.border = "1px solid black";
	}
	
	/**
	 * Initialisation du puzzle
	 * On pourra appeler cette fonction pour réinitialiser le puzzle
	 */
	function initPuzzle(){
		pieces = [];
		
		// Position du curseur
		mouse = {x:0, y:0};
		
		pieceSelectionnee = null;
		pieceDepotCible = null;
		
		// L'image complète est dessinée sur le canevas 
		canvasContexte.drawImage(plateauImage, 0, 0, plateauLargeur, plateauHauteur, 0, 0, plateauLargeur, plateauHauteur);
		
		displayInstructions("Bonne chance !");
		displayName(prompt('entrer votre nom'))
		
		// Dessiner les pièces
		buildPieces();
	}

	/*-----------------------------------------------------------------------------------------------------*/
	/**
	 * Création des canvas pour afficher les instructions
	 */
	function displayName(name){
		// Création d'un rectangle semi-transparent
		canvasContexte.fillStyle = "#000000";
		canvasContexte.globalAlpha = .4; // Transparence du fond
		canvasContexte.fillRect(100, plateauHauteur - 500, plateauLargeur - 200, 40);
		canvasContexte.fillStyle = "#FFFFFF";

		// Ajout du texte d'instruction
		canvasContexte.globalAlpha = 1;
		canvasContexte.textAlign = "center";
		canvasContexte.textBaseline = "middle";
		canvasContexte.font = "20px Arial";
		canvasContexte.fillText(name,plateauLargeur / 2, plateauHauteur - 480);
	}
	/*-----------------------------------------------------------------------------------------------------*/
	
	/**
	 * Création des canvas pour afficher les instructions
	 */
	function displayInstructions(msg){
		// Création d'un rectangle semi-transparent
		canvasContexte.fillStyle = "#000000";
		canvasContexte.globalAlpha = .4; // Transparence du fond
		canvasContexte.fillRect(100, plateauHauteur - 40, plateauLargeur - 200, 40);
		canvasContexte.fillStyle = "#FFFFFF";
		
		// Ajout du texte d'instruction
		canvasContexte.globalAlpha = 1;
		canvasContexte.textAlign = "center";
		canvasContexte.textBaseline = "middle";
		canvasContexte.font = "20px Arial";
		canvasContexte.fillText(msg,plateauLargeur / 2, plateauHauteur - 20);
	}
	
	/**
	 * Créer les pièces du puzzle
	 */
	function buildPieces(){
		var i;
		var piece;
		var xPos = 0;
		var yPos = 0;
		
		// Itérer sur le nombre total de pièce du puzzle à créer
		// calculé en fonction de la difficultée
		for (i = 0; i < DIFFICULTE * DIFFICULTE; i++) {
			// Créer un objet pour chaque pièce
			// Calculer la position de la pièce
			piece = {};
			piece.sx = xPos;
			piece.sy = yPos;
			pieces.push(piece);
			xPos += pieceLargeur;
			if (xPos >= plateauLargeur) {
				xPos = 0;
				yPos += pieceHauteur;
			}
		}
		
		// Evènement : attendre que l'utilisateur clic sur le bouton pour démarrer le jeu
		buttonStart = document.getElementById('puzzleStart');
		buttonStart.onmousedown = shufflePuzzle;
	}
	
	/**
	 * Callback appelé sur l'évènement onmousedown
	 * Mélanger le puzzle : dessiner les pièces de manière aléatoire dans le canevas
	 */
	function shufflePuzzle(){
		var i;
		var piece;
		var xPos = 0;
		var yPos = 0;
		
		// Mélanger les pièces dans le tableau
		pieces = shuffleArray(pieces);
		
		// Efface tout les pixels tracés jusqu'à présent
		canvasContexte.clearRect(0, 0, plateauLargeur, plateauHauteur);
		
		// Itérer chaque pièce du tableau
		for (i = 0; i < pieces.length; i++) {
			piece = pieces[i];
			piece.xPos = xPos;
			piece.yPos = yPos;
			
			// A partir de l'image complète du puzzle, créer une image correspond aux dimensions, et à la position, de la pièce.
			// Les 4 derniers paramètres définisent la zone du canevas où nous voulons dessiner.
			canvasContexte.drawImage(plateauImage, piece.sx, piece.sy, pieceLargeur, pieceHauteur, xPos, yPos, pieceLargeur, pieceHauteur);
			
			// Dessiner une bordure autour de la pièce
			canvasContexte.strokeRect(xPos, yPos, pieceLargeur,pieceHauteur);
			
			xPos += pieceLargeur;
			if (xPos >= plateauLargeur){
				xPos = 0;
				yPos += pieceHauteur;
			}
		}
		
		// Evènement : attendre que l'utilisateur clic sur le canevas
		// Cela signifie qu'il à séletionné une pièce, dans l'intention de la déplacer
		document.onmousedown = onPuzzleClick;
	}
	
	/**
	 * Callback appelé sur l'évènement onmousedown après un clic sur le puzzle.
	 * Nous devons déterminer la pièce qui a été cliquée.
	 */
	function onPuzzleClick(e) {
		// Ce bloc retourne la position du curseur dans le canevas.
		// Dans notre cas : c'est la possition où le clic a été fait.
		// Modifier l'objet "mouse" pour se souvenir de sa position.
		if (e.layerX || e.layerX == 0) {
			mouse.x = e.layerX - canvas.offsetLeft;
			mouse.y = e.layerY - canvas.offsetTop;
		} else if (e.offsetX || e.offsetX == 0) {
			mouse.x = e.offsetX - canvas.offsetLeft;
			mouse.y = e.offsetY - canvas.offsetTop;
		}
		
		// Détermine la pièce qui a été cliquée
		pieceSelectionnee = checkPieceClicked();
		
		if (pieceSelectionnee != null) {
			// BUT FINAL : Estomper l'opacité de la pièce pour révéler les pièces en dessous 
			// (car la pièce est amenée à être bougée).
			
			// Effacer la zone du canevas correspond à la pièce sélectionnée
			canvasContexte.clearRect(pieceSelectionnee.xPos, pieceSelectionnee.yPos, pieceLargeur, pieceHauteur);
			
			// Avant de redessiner la pièce, sauvegarder le contexte
			// Permet de modifier seulement l'opacité de la pièce déplacée (et pas l'opacité globale du puzzle)
			canvasContexte.save();
			
			// Modifier l'opacité
			canvasContexte.globalAlpha = .9;
			
			// Dessiner l'image correspondante à la pièce. Son centre est positionné sur le curseur.
			// 5 premiers paramètres : toujours identiques
			// 2 paramètres suivantes : permet de centrer sur le curseur
			// 2 derniers paramètres : toujours identiques
			canvasContexte.drawImage(plateauImage, pieceSelectionnee.sx, pieceSelectionnee.sy, pieceLargeur, pieceHauteur, mouse.x - (pieceLargeur / 2), mouse.y - (pieceHauteur / 2), pieceLargeur, pieceHauteur);
			
			// Indiquer qu'on a finie de modifier l'opacité, 
			// et qu'on souhaite restorer les valeurs à leurs origines
			canvasContexte.restore();
			
			//One for when we move the mouse (dragging the puzzle piece)
			
			// Evènement : attendre que l'utilisateur déplace son curseur
			// Cela signifie qu'il déplace la pièce
			document.onmousemove = updatePuzzle;
			
			// Evènement : attendre que l'utilisateur relache son curseur
			// Cela signifie qu'il dépose la pièce
			document.onmouseup = pieceDropped;
		}
	}
	
	/**
	 * Détermine si une pièce a été sélectionnée (cliquée).
	 * 
	 * Comment ? Itérer sur chaque pièce du puzzle et déterminer si la position du clic
	 * était dans les frontières de l'une de nos pièces. Si oui, on retourne l'objet correspondant.
	 * Si non, retourner null.
	 */
	function checkPieceClicked(){
		var i;
		var piece;
		
		for (i = 0; i < pieces.length; i++) {
			piece = pieces[i];
			if (mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceLargeur) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHauteur)) {
				// PIECE NOT HIT
			} else {
				return piece;
			}
		}
		
		return null;
	}
	
	/**
	 * Callback appelé quand l'utilisateur déplace sont curseur après avoir sélectionné une pièce.
	 */
	function updatePuzzle(e) {
		var i;
		var piece;
		pieceDepotCible = null;
		
		// Ce bloc retourne la position du curseur dans le canevas.
		// Modifier l'objet "mouse" pour se souvenir de sa position.
		if (e.layerX || e.layerX == 0) {
			mouse.x = e.layerX - canvas.offsetLeft;
			mouse.y = e.layerY - canvas.offsetTop;
		} else if(e.offsetX || e.offsetX == 0) {
			mouse.x = e.offsetX - canvas.offsetLeft;
			mouse.y = e.offsetY - canvas.offsetTop;
		}
		
		// Efface tout les pixels tracés jusqu'à présent
		// Nécessaire car la pièce déplacée au dessus des autres pièces va modifier leurs apparences
		canvasContexte.clearRect(0, 0, plateauLargeur, plateauHauteur);
		
		// Itérer chaque pièce
		for (i = 0; i < pieces.length; i++) {
			piece = pieces[i];
			
			// Vérifier si la pièce qu'on référence actuellement est la même que la pièce déplacée.
			// Si oui, continuer l'itération (= sauter à l'itération suivante).
			if (piece == pieceSelectionnee) {
				continue;
			}
			
			// Redessiner la pièce et lui ajouter une bordure (strokeRect)
			canvasContexte.drawImage(plateauImage, piece.sx, piece.sy, pieceLargeur, pieceHauteur, piece.xPos, piece.yPos, pieceLargeur, pieceHauteur);
			canvasContexte.strokeRect(piece.xPos, piece.yPos, pieceLargeur, pieceHauteur);
			
			// Puisque nous avons une référence vers chaque objet de la boucle, 
			// on peut aussi profiter de cette occasion pour vérifier si la pièce déplacée est au dessus de la pièce itérée.
			// Permet à l'utilisateur de savoir s'il peut déposer la pièce déplacée sur une autre.
			if (pieceDepotCible == null) {
				// Comme notre curseur est au centre de la pièce déplacée,
				// on doit simplement détérminer sur quelle autre pièce notre curseur est.
				if (mouse.x < piece.xPos || mouse.x > (piece.xPos + pieceLargeur) || mouse.y < piece.yPos || mouse.y > (piece.yPos + pieceHauteur)) {
					// NOT OVER
				} else {
					pieceDepotCible = piece;
					
					canvasContexte.save();
					
					// Dessiner un masque vert en opacité sur la pièce de dépôt
					canvasContexte.globalAlpha = .4;
					canvasContexte.fillStyle = '#009900';
					canvasContexte.fillRect(pieceDepotCible.xPos, pieceDepotCible.yPos, pieceLargeur, pieceHauteur);
					
					canvasContexte.restore();
				}
			}
		}
		
		// Nous devons redessiner la pièce déposée
		// Le code est le même que lorsque nous avons cliqué sur la pièce, 
		// mais comme le curseur s'est déplacé, la position de la pièce sera mis à jour.
		canvasContexte.save();
		canvasContexte.globalAlpha = .6;
		canvasContexte.drawImage(plateauImage, pieceSelectionnee.sx, pieceSelectionnee.sy, pieceLargeur, pieceHauteur, mouse.x - (pieceLargeur / 2), mouse.y - (pieceHauteur / 2), pieceLargeur, pieceHauteur);
		canvasContexte.restore();
		canvasContexte.strokeRect( mouse.x - (pieceLargeur / 2), mouse.y - (pieceHauteur / 2), pieceLargeur,pieceHauteur);
	}
	
	/**
	 * Callback appelé quand l'utilisateur dépose la pièce sélectionnée/déplacée.
	 * 
	 * Nous avons avec succès déplacée la pièce sélectionnée.
	 * Nous avons même affiché un feedback visuel à l'utilisateur pour lui indiquer la zone de dépôt.
	 * Nous devons maintenant déposer la pièce.
	 */
	function pieceDropped(e) {
		// Supprimer les listeners comme aucune pièce n'est actuellement déplacée.
		document.onmousemove = null;
		document.onmouseup = null;
		
		// Si pieceDepotCible est null, ça signifie que l'utilisateur à déplacé 
		// la pièce sélectionné a son endroit d'origine (donc dur sur place...).
		if (pieceDepotCible != null){
			// Reste plus qu'à interverir les positions x/y de la pièce déplacée et de la pièce de dépôt.
			var tmp = {
				xPos: pieceSelectionnee.xPos,
				yPos: pieceSelectionnee.yPos
			};
			pieceSelectionnee.xPos = pieceDepotCible.xPos;
			pieceSelectionnee.yPos = pieceDepotCible.yPos;
			pieceDepotCible.xPos = tmp.xPos;
			pieceDepotCible.yPos = tmp.yPos;
		}
		
		// Vérifier si le jeu est gagné
		resetPuzzleAndCheckWin();
	}
	
	/**
	 * Vérifier si le jeu est gagné après le déplacement d'une pièce
	 */
	function resetPuzzleAndCheckWin(){
		var gameWin = true;
		var i;
		var piece;
		
		// Efface tout les pixels tracés jusqu'à présent
		canvasContexte.clearRect(0, 0, plateauLargeur, plateauHauteur);
		
		// Itérer sur les pièces
		// Dessinner les pièces dans leur position d'origine et vérifier si les positions sont gagnantes
		for(i = 0;i < pieces.length;i++){
			piece = pieces[i];
			canvasContexte.drawImage(plateauImage, piece.sx, piece.sy, pieceLargeur, pieceHauteur, piece.xPos, piece.yPos, pieceLargeur, pieceHauteur);
			canvasContexte.strokeRect(piece.xPos, piece.yPos, pieceLargeur, pieceHauteur);
			if (piece.xPos != piece.sx || piece.yPos != piece.sy){
				gameWin = false;
			}
		}
		
		if (gameWin) {
			// Timeout pour que le reset du puzzle ne soit pas trop brusque une fois le jeu gagné
			// On pourrait aussi afficher un message de féliciation à l'utilisateur...
			// et peut être afficher le temps qu'il a mis pour compléter le jeu...
			setTimeout(gameWon, 500);
		}
	}
	
	/**
	 * Jeu gagnée.
	 * Relancer une nouvelle partie.
	 */
	function gameWon(){
		document.onmousedown = null;
		document.onmousemove = null;
		document.onmouseup = null;
		initPuzzle();
	}
	
	/**
	 * Fonction utilitaire permettant de mélanger un array
	 */
	function shuffleArray(o){
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}
	
	// Lancement du jeu
	initGame();
})();
