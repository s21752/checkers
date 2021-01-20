class ChessPiece {
	constructor(type) {
		this.type = type;
		this.isQueen = false;
	}

	create(size) {
		let chessPiece = document.createElement("div");
		chessPiece.style.backgroundColor = this.type === "black" ? "yellow" : "pink";
		chessPiece.style.height = (size) + "px";
		chessPiece.style.width = (size) + "px";

		return chessPiece;
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

	#redraw() {
		this.field.style.backgroundColor = this.#fieldColor();
	}

	#fieldColor() {
		if(this.isChecked)
			return "blue";

		if(this.isPossibleMove && showPossibleMoves)
			return "orange";

		if (this.isTarget && showPossibleAttacks)
			return "olive";

		if (this.isAttackPosition && showPossibleAttacks)
			return "maroon";
		
		if (this.type === "white") 
			return "white"; 
		else 
			return "black";
	}

	#createFieldElement() {
		let field = document.createElement("div");
		let index = this.x + this.y;
		field.className = "field";
		field.style.minHeight = this.dimen + "px";
		field.style.minWidth = this.dimen + "px";
		field.style.maxHeight = this.dimen + "px";
		field.style.maxWidth = this.dimen + "px";
		field.style.position = "relative";
		field.style.backgroundColor = this.#fieldColor();

		this.child = document.createElement("div");
		this.child.className = "fieldChild";

		field.appendChild(this.child);

		let objectReference = this;
		field.addEventListener("click", function () {
			if (objectReference.content != null || objectReference.isPossibleMove || objectReference.isAttackPosition) {
				let wasSelfSelected = selectedField === Field.fieldIndexToBoardPlacement(objectReference.x, objectReference.y);
				let tempContent = null;
				let isAttack = objectReference.isAttackPosition;

				let isMove = objectReference.isPossibleMove || isAttack;

				if (selectedField !== "") {
					let position = Field.boardPlacementToFieldIndex(selectedField);
					let unselected = fields[position.x][position.y];

					if (isMove) {
						tempContent = unselected.content;
					}

					unselected.uncheck();
					unselected.hidePossibleMoves();
					unselected.hidePossibleAttacks();

					if (!wasSelfSelected && isMove) {
						unselected.changeContent(null);
					selectedField = "";
				}

					if (isAttack) {
						let posX = objectReference.x - ((objectReference.x - unselected.x) / 2);
						let posY = objectReference.y - ((objectReference.y - unselected.y) / 2);

						let removed = fields[posX][posY];
						updateResult(removed.content);
						removed.changeContent(null);
					}

					if ((objectReference.content != null && !objectReference.content.isMyChessPiece()) || objectReference.content == null){
												console.log("object is: " + Field.fieldIndexToBoardPlacement(objectReference.x, objectReference.y));
						if(!isAttack) {
							endTurn();
						}
					}
				}

				if (!wasSelfSelected) {
					if (tempContent != null) {
						objectReference.changeContent(tempContent);

						if (isAttack && objectReference.canAttack()) {
							this.isSecondAttack = true;
							objectReference.#performClick();
							console.log("is attack and can attack, from field " + Field.fieldIndexToBoardPlacement(objectReference.x, objectReference.y));
						} else if (isAttack) {
							endTurn();
						}
					}
					else if (this.isSecondAttack || (objectReference.content.isMyChessPiece())){
						objectReference.check();
						if (!this.isSecondAttack)
							objectReference.showPossibleMoves();
						objectReference.showPossibleAttacks();
						this.isSecondAttack = false;
						selectedField = Field.fieldIndexToBoardPlacement(objectReference.x, objectReference.y);
					}
				}

			}
		})

		this.changeContent(null);

		return field;
	}

	#performClick() {
		var clickEvent = new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		});
		this.field.dispatchEvent(clickEvent);
	}

	changeContent(content) {
		this.content = content;
		this.child.innerText = "";
		this.child.innerHtml = "";

		if (content == null) {
			this.child.style.color = this.type === "white" ? "black" : "white";

			if (showFieldNames)
				this.child.innerText = Field.fieldIndexToBoardPlacement(this.x, this.y);
			return;
		}

		if(content instanceof ChessPiece) {
			this.child.appendChild(content.create(this.dimen / 2));
		}
	}

	uncheck() {
		this.isChecked = false;
		this.#redraw();
	}

	check() {
		this.isChecked = true;
		this.#redraw();
	}

	setPossibleMove() {
		this.isPossibleMove = true;
		this.#redraw();
	}

	unSetPossibleMove() {
		this.isPossibleMove = false;
		this.#redraw();
	}

	setTarget() {
		this.isTarget = true;
		this.#redraw();
	}

	unSetPossibleAttack() {
		this.isTarget = false;
		this.#redraw();
	}

	showPossibleMoves() {
		let moves = this.getPossibleMoves()
		moves.forEach(function(position) {
			let possibleMoveDestination = fields[position.x][position.y];

			if (possibleMoveDestination.content == null)
				possibleMoveDestination.setPossibleMove();
		})
	}

	hidePossibleMoves() {
		let moves = this.getPossibleMoves()
		moves.forEach(function(position) {
			let fieldToUncheck = fields[position.x][position.y];
			fieldToUncheck.unSetPossibleMove();
		})
	}

	getPossibleMoves() {
		let possibleX = [];
		if (this.x > 0)
			possibleX.push(this.x - 1);
		if (this.x < fieldsPerSide - 1)
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
	getEnemiesPositions() {
		return this.getPossibleMoves().filter(position => fields[position.x][position.y].content instanceof ChessPiece && fields[position.x][position.y].content.isEnemy(this.content));
	}

	canAttack() {
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
		let objectReference = this;
		this.getEnemiesPositions().forEach(function (position) {

			let coordinateX = position.x + (position.x - objectReference.x);
			let coordinateY = position.y + (position.y - objectReference.y);

			if (coordinateX >= 0 && coordinateX < fieldsPerSide && coordinateY >= 0 && coordinateY < fieldsPerSide) {
				let attackField = fields[coordinateX][coordinateY];
				if (attackField.content == null) {
					fields[position.x][position.y].setTarget();
					attackField.isAttackPosition = true;
					attackField.#redraw();
				}
			}
		})
	}

	hidePossibleAttacks() {
		let objectReference = this;

		this.getEnemiesPositions().forEach(function (position) {
			let enemyField = fields[position.x][position.y];

			let coordinateX = position.x + (position.x - objectReference.x);
			let coordinateY = position.y + (position.y - objectReference.y);
			
			if (coordinateX >= 0 && coordinateX < fieldsPerSide && coordinateY >= 0 && coordinateY < fieldsPerSide) {
				let attackField = fields[coordinateX][coordinateY];
				if (attackField.isAttackPosition) {
					enemyField.unSetPossibleAttack();
					attackField.isAttackPosition = false;
					attackField.#redraw();
				}
			}
		})
	}

	static fieldIndexToBoardPlacement(x, y) {
		return `${String.fromCharCode(y + 65)}${fieldsPerSide - x}`;
	}

	static boardPlacementToFieldIndex(place) {
		return {
			x: (fieldsPerSide - place.charAt(1)),
			y: (place.charCodeAt(0) - 65)
		};
	}
}

//////////////////////////////              VISIBILITY      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var showFieldNames = true;
var showPossibleMoves = true;
var showPossibleAttacks = true;

const FIELDS_PER_SIDE = 12;
var PIECES_PER_SIDE = 30;
var BOARD_MARGIN = 16;
//////////////////////////////              VISIBILITY      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


var selectedField = "";
var fields = [];
var fieldsPerSide = FIELDS_PER_SIDE;
var piecesPerSide = PIECES_PER_SIDE;
var boardMargin = BOARD_MARGIN;
var boardMaxDimension = getDimension();
var whitePieces = [];
var blackPieces = [];
var currentPlayer = "white";

restartBoard();

function endTurn() {
	if (currentPlayer === "white") {
		currentPlayer = "black";
	} else {
		currentPlayer = "white";
	}

	document.getElementById("currentPlayer").innerText = currentPlayer;
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
}

function restartBoard() {
	fieldsPerSide = FIELDS_PER_SIDE;
	piecesPerSide = PIECES_PER_SIDE;
	boardMargin = BOARD_MARGIN;
	fields = [];
	whitePieces = [];
	blackPieces = [];

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
}


function drawCheckboard() {
	let actualBoardDimension = boardMaxDimension;  // - boardMaxDimension / (fieldsPerSide + 1)


	let board = createBoard(actualBoardDimension);
	for (let i = 0; i < fieldsPerSide; i++) {
		// create row
		let row = [];

		for (let j = 0; j < fieldsPerSide; j++) {
			// create field     // i == rowIndex, j == columnIndex
			let field = new Field(i, j, actualBoardDimension / fieldsPerSide);//createField(j + i, actualBoardDimension / fieldsPerSide);

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
	currentPlayerText.innerText = "white";

document.getElementById("container").appendChild(currentPlayerText);
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
	return Math.min(window.innerHeight, window.innerWidth) - 2 * boardMargin - 2 * 10;
}