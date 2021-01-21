class ChessPiece {
	constructor(type) {
		this.type = type;
		this.isQueen = false;
		this.piece = null;
		this.size = null;
	}

	create(size) {
		this.size = size;
		this.piece = document.createElement("div");
		this.piece.id = "chessPieceContainer";
		this.piece.style.height = (size) + "px";
		this.piece.style.width = (size) + "px";

		let chessPiece = document.createElement("canvas");
		chessPiece.id = "chessPiece";
		chessPiece.height = this.size * 1.2;
		chessPiece.width = this.size * 1.2; 
		if (chessPiece.getContext) {
			var ctx = chessPiece.getContext('2d');
			ctx.fillStyle = this.type === "white" ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';

			var circle = new Path2D();
			circle.arc(this.size/2, this.size/2, this.size / 2, 0, 2 * Math.PI);

			ctx.fill(circle);

			this.piece.appendChild(chessPiece);
		}

		if (this.isQueen) {
			this.piece.appendChild(this.#getQueenSign());

		}

		return this.piece;
	}

	upgradeToQueen() {
		this.isQueen = true;
		this.piece.appendChild(this.#getQueenSign());
	}

	#getQueenSign() {
		let canvas = document.createElement("canvas");
		canvas.id = "crown";
		canvas.height = this.size * 1.3;;
		canvas.width = this.size * 1.3;;
		canvas.style.top = this.size * -0.15 + "px";

		if (canvas.getContext) {
			var ctx = canvas.getContext('2d');

			ctx.fillStyle = 'rgb(255, 233, 0)';

			let size = this.size;

			let sizeY = this.size - size * 0.2;

			ctx.beginPath();
			ctx.moveTo(size*0.03, sizeY*0.3);
			ctx.lineTo(size/8, sizeY/2);
			ctx.lineTo(size*0.25, sizeY*0.25);
			ctx.lineTo(size * 0.35, sizeY/2);
			ctx.lineTo(size * 0.5, sizeY * 0.2);
			ctx.lineTo(size * 0.65, sizeY/2);
			ctx.lineTo(size * (6/8), sizeY*0.25);
			ctx.lineTo(size * (7/8), sizeY/2,);
			ctx.lineTo(size - size*0.03, sizeY*0.3);
			ctx.lineTo(size * 0.97, sizeY * 0.6);
			ctx.quadraticCurveTo(size/2, sizeY*0.75, size * 0.03, sizeY*0.6);
			ctx.fill();

		//	ctx.fillRect(0, 0, this.size, this.size);
	}
	return canvas;
}
}

class BlackChessPiece extends ChessPiece {
	constructor() {
		super("black");
	}

	isEnemy(other) {
		return other instanceof WhiteChessPiece;
	}

	isMyChessPiece() {
		return currentPlayer === "black";
	}
}

class WhiteChessPiece extends ChessPiece {
	constructor() {
		super("white");
	}

	isEnemy(other) {
		return other instanceof BlackChessPiece;
	}

	isMyChessPiece() {
		return currentPlayer === "white";
	}
}

class Field {
	constructor(x, y, dimen) {
		this.x = x;
		this.y = y;
		this.type = (x + y) % 2 == 0 ? "white" : "black";
		this.isChecked = false;
		this.isPossibleMove = false;
		this.isTarget = false;
		this.isAttackPosition = false;
		this.isSecondAttack = false;
		this.dimen = dimen;
		this.child = null;
		this.content = null;
		this.field = this.#createFieldElement();
	}

	redraw() {
		this.field.style.backgroundColor = this.#fieldColor();
		if (this.content == null)
			this.child.innerText = showFieldNames ? Field.fieldIndexToBoardPlacement(this.x, this.y) : "";
	}

	#fieldColor() {
		if(this.isChecked)
			return "skyblue";

		if (this.isTarget && showPossibleAttacks)
			return "lightcoral";

		if (this.isAttackPosition && showPossibleAttacks)
			return "maroon";

		if(this.isPossibleMove && showPossibleMoves)
			return "steelblue";
		
		if (this.type === "white") 
			return "floralwhite"; 
		else 
			return "dimgrey";
	}

	#createFieldElement() {
		let field = document.createElement("div");
		let index = this.x + this.y;
		field.className = "field";
		field.style.height = this.dimen + "px";
		field.style.width = this.dimen + "px";
		field.style.position = "relative";
		field.style.backgroundColor = this.#fieldColor();

		this.child = document.createElement("div");
		this.child.className = "fieldChild";

		field.appendChild(this.child);

		let objectReference = this;
		let clickedField = this;
		field.addEventListener("click", function () {
			if (clickedField.content != null && clickedField.content.isMyChessPiece()) {
				if (clickedField.isChecked && !clickedField.isSecondAttack){
					clickedField.uncheck();
					clickedField.hidePossibleMoves();
					clickedField.hidePossibleAttacks();
					selectedField = "";
				}
				else if (selectedField === "") {
					clickedField.check();
					clickedField.showPossibleAttacks();
					clickedField.showPossibleMoves();
					selectedField = Field.fieldIndexToBoardPlacement(clickedField.x, clickedField.y);
				} else {
					let lastFieldPosition = Field.boardPlacementToFieldIndex(selectedField);
					let lastField = fields[lastFieldPosition.x][lastFieldPosition.y];

					if (!lastField.isSecondAttack) {
						lastField.uncheck();
						lastField.hidePossibleAttacks();
						lastField.hidePossibleMoves();
						clickedField.check();
						clickedField.showPossibleAttacks();
						clickedField.showPossibleMoves();
						selectedField = Field.fieldIndexToBoardPlacement(clickedField.x, clickedField.y);
					}
				}
			}

			if (clickedField.isPossibleMove) {
				let lastFieldPosition = Field.boardPlacementToFieldIndex(selectedField);
				let lastField = fields[lastFieldPosition.x][lastFieldPosition.y];
				lastField.uncheck();
				lastField.hidePossibleAttacks();
				lastField.hidePossibleMoves();
				clickedField.changeContent(lastField.content);

				lastField.changeContent(null);
				selectedField = "";

				if ((clickedField.content instanceof WhiteChessPiece && clickedField.x == 0) || (clickedField.content instanceof BlackChessPiece && clickedField.x == fieldsPerSide - 1)) {
					clickedField.content.upgradeToQueen();
				}
				endTurn();
			}

			if (clickedField.isAttackPosition) {
				let lastFieldPosition = Field.boardPlacementToFieldIndex(selectedField);
				let lastField = fields[lastFieldPosition.x][lastFieldPosition.y];
				lastField.uncheck();
				let enemyFieldToRemove = clickedField.enemyFieldToRemove(lastField.hidePossibleAttacks());

				lastField.hidePossibleMoves();
				clickedField.changeContent(lastField.content);
				lastField.changeContent(null);
				selectedField = "";

				updateResult(enemyFieldToRemove.content);
				enemyFieldToRemove.changeContent(null);

				if (clickedField.canAttack()) {

					clickedField.check();
					clickedField.showPossibleAttacks();
					selectedField = Field.fieldIndexToBoardPlacement(clickedField.x, clickedField.y);
					clickedField.isSecondAttack = true;
				} else {
					clickedField.isSecondAttack = false;
					if ((clickedField.content instanceof WhiteChessPiece && clickedField.x == 0) || (clickedField.content instanceof BlackChessPiece && clickedField.x == fieldsPerSide - 1)) {
						clickedField.content.upgradeToQueen();
					}
					endTurn();
				}
			}
		})

		this.changeContent(null);

		return field;
	}

	enemyFieldToRemove(enemiesFields) {
		if (enemiesFields.length == 1) return enemiesFields[0];

		let closestEnemyIndex = 0;
		let closestEnemyDistance = null;

		let index = 0;
		let currentField = this;
		enemiesFields.forEach(function (enemyField) {
			let currentFieldDistance = Math.sqrt(Math.pow((currentField.x - enemyField.x), 2) + Math.pow((currentField.y - enemyField.y), 2));
			if (closestEnemyDistance > currentFieldDistance || closestEnemyDistance == null) {
				closestEnemyIndex = index;
				closestEnemyDistance = currentFieldDistance;
			}
			index++
		})

		return enemiesFields[closestEnemyIndex];
	}

	changeContent(content) {
		this.content = content;
		this.child.innerText = "";
		this.child.innerHtml = "";
		let fontRatio = fieldsPerSide == SIZE_BIG ? 0.35 : 0.3;
		this.child.style.fontSize = (getDimension() / fieldsPerSide) * fontRatio + "px";

		if (content == null) {
			this.child.style.color = this.type === "white" ? "black" : "white";

			if (showFieldNames)
				this.child.innerText = Field.fieldIndexToBoardPlacement(this.x, this.y);
			return;
		}

		if(content instanceof ChessPiece) {
			this.child.appendChild(content.create(getDimension() / fieldsPerSide * 0.7));
		}
	}

	redrawChessPiece() {
		// if (this.content instanceof ChessPiece) {
			this.changeContent(this.content);
		// }
	}

	uncheck() {
		this.isChecked = false;
		this.redraw();
	}

	check() {
		this.isChecked = true;
		this.redraw();
	}

	setPossibleMove() {
		this.isPossibleMove = true;
		this.redraw();
	}

	unSetPossibleMove() {
		this.isPossibleMove = false;
		this.redraw();
	}

	setTarget() {
		this.isTarget = true;
		this.redraw();
	}

	unSetPossibleAttack() {
		this.isTarget = false;
		this.redraw();
	}

	showPossibleMoves() {
		if (this.content instanceof ChessPiece && this.content.isQueen)
			this.showPossibleQueenMoves();
		else {

			let moves = this.getPossibleMoves()
			moves.forEach(function(position) {
				let possibleMoveDestination = fields[position.x][position.y];
				if (possibleMoveDestination.content == null)
					possibleMoveDestination.setPossibleMove();
			})
		}
	}

	hidePossibleMoves() {
		if (this.content instanceof ChessPiece && this.content.isQueen)
			this.hidePossibleQueenMoves();

		else {

			let moves = this.getPossibleMoves()
			moves.forEach(function(position) {
				let fieldToUncheck = fields[position.x][position.y];
				fieldToUncheck.unSetPossibleMove();
			})
		}
	}

	getPossibleMoves(allDirections = false) {

		let possibleX = [];
		if ((this.x > 0  && this.content instanceof WhiteChessPiece) || (allDirections && this.x > 0))
			possibleX.push(this.x - 1);
		if ((this.x < fieldsPerSide - 1  && this.content instanceof BlackChessPiece) || (allDirections && this.x < fieldsPerSide - 1))
			possibleX.push(this.x + 1);

		let possibleY = [];
		if (this.y > 0)
			possibleY.push(this.y - 1);
		if (this.y < fieldsPerSide - 1)
			possibleY.push(this.y + 1);

		let possibleMoves = [];

		possibleX.forEach(function (i) {
			possibleY.forEach(function (j) {
				possibleMoves.push({x: i,
					y: j});
			})
		})

		return possibleMoves;
	}

	hidePossibleQueenMoves() {
		let possibleMoves = this.getQueenPossibleMoves();

		possibleMoves.forEach(function(position) {
			let possibleMoveDestination = fields[position.x][position.y];
			possibleMoveDestination.unSetPossibleMove();
		})
	}

	showPossibleQueenMoves() {
		let possibleMoves = this.getQueenPossibleMoves();

		possibleMoves.forEach(function(position) {
			let possibleMoveDestination = fields[position.x][position.y];
			possibleMoveDestination.setPossibleMove();
		})
	}

	getAllQueenMoves() {
		let posX = this.x;
		let posY = this.y;

		let moves = [];

		let currentField = this;

		let possibleMovesTransformations = [-1, 1];
		let encounteredEnemy = false;


		possibleMovesTransformations.forEach(function (x) {
			possibleMovesTransformations.forEach(function (y) {

				let movesAxis = [];
				for (let i = 1; i < fieldsPerSide; i++) {

					posX = currentField.x + (i*x);
					posY = currentField.y + (i*y);
					if (posX >= 0 && posX < fieldsPerSide && posY >= 0 && posY < fieldsPerSide) {			
						movesAxis.push ( { x: posX, y: posY});
					} else {
						break;
					}
				}
				moves.push(movesAxis);
			})
		})

		return moves;
	}


	getQueenPossibleMoves() {

		let allMoves = this.getAllQueenMoves();

		let possibleMoves = [];

		allMoves.forEach(function(axis) {
			for (let i = 0; i < axis.length; i++) {
				let checkedField = fields[axis[i].x][axis[i].y];

				if (checkedField.content instanceof ChessPiece) {
					break;
				} else {
					possibleMoves.push(axis[i]);
				}
			}
		})

		return possibleMoves;
	}

	actOnEnemyField(attackFieldsAction = null, enemyFieldAction = null) {
		let allMoves = this.getAllQueenMoves();

		let attackFields = [];
		let enemyPosition;

		let enemyFields = [];

		let currentField = this;
		allMoves.forEach(function(axis) {
			enemyPosition = null;
			for (let i = 0; i < axis.length; i++) {
				let checkedField = fields[axis[i].x][axis[i].y];

				if (checkedField.content instanceof ChessPiece && checkedField.content.isEnemy(currentField.content)) {
					if (enemyPosition == null) {
						enemyPosition = checkedField;
					} else {
						break;
					}
				} else if (checkedField.content instanceof ChessPiece) {
					break;
				} else if (enemyPosition != null) {
					attackFields.push(checkedField);
					enemyFields.push(enemyPosition);
					if (enemyFieldAction != null)
						enemyFieldAction(enemyPosition);
				}
			}
		})

		attackFields.forEach(function (field) {
			if (attackFieldsAction != null)
				attackFieldsAction(field);
		})

		return enemyFields;
	}

	showPossibleQueenAttacks() {
		this.actOnEnemyField(function (attackField) {
			attackField.isAttackPosition = true;
			attackField.redraw();
		},
		function (enemyField) {
			enemyField.setTarget();
		})
	}

	hidePossibleQueenAttacks() {
		return this.actOnEnemyField(function (attackField) {
			attackField.isAttackPosition = false;
			attackField.redraw();
		},
		function (enemyField) {
			enemyField.unSetPossibleAttack();
		})
	}

	getEnemiesPositions() {
		return this.getPossibleMoves(true).filter((position) => fields[position.x][position.y].content instanceof ChessPiece 
			&& fields[position.x][position.y].content.isEnemy(this.content));
	}

	canQueenAttack() {
		return this.actOnEnemyField().length > 0;
	}

	canAttack() {
		if (this.content instanceof ChessPiece && this.content.isQueen)
			return this.canQueenAttack();
		let objectReference = this;
		let canStillAttack = false;
		this.getEnemiesPositions().some(function (position) {

			let coordinateX = position.x + (position.x - objectReference.x);
			let coordinateY = position.y + (position.y - objectReference.y);

			if (coordinateX >= 0 && coordinateX < fieldsPerSide && coordinateY >= 0 && coordinateY < fieldsPerSide && fields[coordinateX][coordinateY].content == null) {
				canStillAttack = true;
				return true
			}
		})
		return canStillAttack;

	}

	showPossibleAttacks() {
		if (this.content instanceof ChessPiece && this.content.isQueen)
			return this.showPossibleQueenAttacks();
		else {
			let objectReference = this;
			this.getEnemiesPositions().forEach(function (position) {

				let coordinateX = position.x + (position.x - objectReference.x);
				let coordinateY = position.y + (position.y - objectReference.y);

				if (coordinateX >= 0 && coordinateX < fieldsPerSide && coordinateY >= 0 && coordinateY < fieldsPerSide) {
					let attackField = fields[coordinateX][coordinateY];
					if (attackField.content == null) {
						fields[position.x][position.y].setTarget();
						attackField.isAttackPosition = true;
						attackField.redraw();
					}
				}
			})
		}
	}

	hidePossibleAttacks() {
		let objectReference = this;
		let enemyFields = []
		if (this.content instanceof ChessPiece && this.content.isQueen)
			return this.hidePossibleQueenAttacks();
		else {
			this.getEnemiesPositions().forEach(function (position) {
				let enemyField = fields[position.x][position.y];

				let coordinateX = position.x + (position.x - objectReference.x);
				let coordinateY = position.y + (position.y - objectReference.y);

				if (coordinateX >= 0 && coordinateX < fieldsPerSide && coordinateY >= 0 && coordinateY < fieldsPerSide) {
					let attackField = fields[coordinateX][coordinateY];
					if (attackField.isAttackPosition) {
						enemyFields.push(enemyField);

						enemyField.unSetPossibleAttack();
						attackField.isAttackPosition = false;
						attackField.redraw();
					}
				}
			})

			return enemyFields;
		}
	}

	static fieldIndexToBoardPlacement(x, y) {
		return `${String.fromCharCode(y + 65)}${fieldsPerSide - x}`;
	}

	static boardPlacementToFieldIndex(place) {
		return {
			x: (fieldsPerSide - place.substring(1, place.length)),
			y: (place.charCodeAt(0) - 65)
		};
	}
}

var showFieldNames = false;
var showPossibleMoves = false;
var showPossibleAttacks = false;

const SIZE_BIG = 12;
const SIZE_SMALL = 8;
var PIECES_PER_SIDE = 12;
var BOARD_MARGIN = 16;


var selectedField = "";
var fields = [];
var fieldsPerSide = SIZE_SMALL;
var piecesPerSide = 12;
var boardMargin = BOARD_MARGIN;
var boardMaxDimension = getDimension();
var whitePieces = [];
var blackPieces = [];
var currentPlayer = "white";

setListeners();
restartBoard();

function endTurn() {
	if (currentPlayer === "white") {
		currentPlayer = "black";
	} else {
		currentPlayer = "white";
	}

	document.getElementById("currentPlayer").innerText = "Current player is: " + currentPlayer;
}

function updateResult(removedPiece) {
	if (removedPiece instanceof WhiteChessPiece) {
		if (whitePieces.length > 1)
			whitePieces.splice(0, 1);
		else 
			alert("Black Pieces Won!!!");
	} else if (removedPiece instanceof BlackChessPiece) {
		if (blackPieces.length > 1)
			blackPieces.splice(0, 1);
		else 
			alert("White Pieces Won!!!");
	}

	document.getElementById("piecesQuantity").innerText = "Black pieces remaining: " + blackPieces.length +"\nWhite pieces remaining: " + whitePieces.length;
}

function restartBoard() {
	removeBoard();
	showFieldNames = false;
	showPossibleMoves = false;
	showPossibleAttacks = false;
	boardMargin = BOARD_MARGIN;
	fields = [];
	whitePieces = [];
	blackPieces = [];
	currentPlayer = "white";
	selectedField = "";

	for (let i = 0; i < piecesPerSide; i++) {
		whitePieces.push(new WhiteChessPiece());
		blackPieces.push(new BlackChessPiece());
	}

	drawCheckboard();

	let index = 0;
	fields.forEach(function (row) {
		row.forEach(function (field) {

			if (field.type === "black") {
				if (index < piecesPerSide) {
					field.changeContent(blackPieces[index]);
					index++;
				} else {
					return;
				}
			} 
		})
	})

	index = 0;

	fields.slice().reverse().forEach(function (row) {
		row.slice().reverse().forEach(function (field) {

			if (field.type === "black") {
				if (index < piecesPerSide) {
					field.changeContent(whitePieces[index]);
					index++;
				} else {
					return;
				}
			} 
		})
	})

	let piecesQuantity = document.createElement("div");
	piecesQuantity.id = "piecesQuantity";
	piecesQuantity.className = "info";
	piecesQuantity.innerText = "Black pieces remaining: " + blackPieces.length +"\nWhite pieces remaining: " + whitePieces.length;
	document.getElementById("mainMenu").appendChild(piecesQuantity);
	document.getElementById("checkShowMoves").checked = false;
	document.getElementById("checkShowAttacks").checked = false;
	document.getElementById("checkShowFieldNames").checked = false;
}


function drawCheckboard() {
	let board = createBoard(getDimension());
	for (let i = 0; i < fieldsPerSide; i++) {
		let row = [];

		for (let j = 0; j < fieldsPerSide; j++) {
			let field = new Field(i, j, getDimension() / fieldsPerSide);

			row.push(field);
		}
		fields.push(row);
	}

	fields.forEach(function (row) {
		row.forEach(function (field) {

			board.appendChild(field.field);
		})
	})

	let currentPlayerText = document.createElement("div");
	currentPlayerText.id = "currentPlayer";
	currentPlayerText.innerText = "Current player is: " + currentPlayer;
	currentPlayerText.className = "info";

	document.getElementById("mainMenu").appendChild(currentPlayerText);
	document.getElementById("container").appendChild(board);
}

function removeBoard() {
	document.getElementById("container").innerHTML = "";
}

function createBoard(boardDimension) {
	let board = document.createElement("div");
	board.id = "checkBoard";
	board.style.height = boardDimension + "px";
	board.style.width = boardDimension + "px";
	board.style.margin = boardMargin + "px";
	board.style.backgroundColor = "peru";

	return board;
}

function getDimension() {
	let container = document.getElementById("container");
	return Math.min(container.offsetHeight, container.offsetWidth) - 2 * boardMargin - 2 * 10;
}

function setListeners() {
	document.getElementById("restart").onclick = function () {
		document.getElementById("mainMenu").innerText = "";
		restartBoard();

	}

	document.getElementById("checkShowMoves").addEventListener('change', (event) => {
		showPossibleMoves = event.currentTarget.checked;
		redrawFields();
	})

	document.getElementById("checkShowAttacks").addEventListener('change', (event) => {
		showPossibleAttacks = event.currentTarget.checked;
		redrawFields();
	})

	document.getElementById("checkShowFieldNames").addEventListener('change', (event) => {
		showFieldNames = event.currentTarget.checked;
		redrawFields();
	})

	let radio = document.forms.boardSize.boardSize;
	let prev = null;
	for (let i = 0; i < radio.length; i++) {
		radio[i].addEventListener('change', function() {
			if (this !== prev) {
				prev = this;
				fieldsPerSide = this.value === "small" ? SIZE_SMALL : SIZE_BIG;
				piecesPerSide = fieldsPerSide == SIZE_SMALL ? 12 : 30;
				document.getElementById("mainMenu").innerText = "";
				restartBoard();
			}
		})
	}

	window.addEventListener('resize', function () {
		let board = document.getElementById("checkBoard");
		board.style.height = getDimension() + "px";
		board.style.width = getDimension() + "px";
		fields.forEach(function (row) {
			row.forEach(function (field) {
				field.field.style.height = getDimension() / fieldsPerSide + "px";
				field.field.style.width = getDimension() / fieldsPerSide + "px";
				field.redrawChessPiece();

			})
		})
	})
}

function redrawFields() {
	fields.forEach(function (row) {
		row.forEach(function (field) {
			field.redraw();
		})
	})
}