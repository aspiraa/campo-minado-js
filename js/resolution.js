function CampoMinadoResolver(fieldSize, campoMinado) {
	
	/*
	* Properties
	*/
	const UP_THRESHOLD = fieldSize-1;
	const RIGHT_THRESHOLD = fieldSize-1;
	const DOWN_THRESHOLD = 0;
	const LEFT_THRESHOLD = 0;

	let gameMap;
	let cellsProbabilitiesMap = {};
	let bombCells = [];
	let safeCells = [];

	/*
	* Functions
	*/
	const Analyze = async () => {
		while (CheckStatus() == 0) {
			let cellsProbabilities = [];

			ActualizeMap();
			cellsProbabilities = Object.values(cellsProbabilitiesMap);

			const newBombs = cellsProbabilities.filter( node => node.chance==1 );
			DisposeNewBombs(newBombs);

			cellsProbabilitiesMap = {};
			ActualizeMap();
			cellsProbabilities = Object.values(cellsProbabilitiesMap);

			const notABomb = cellsProbabilities.filter( node => node.chance==0 );

			if (notABomb.length == 0) {
				cellsProbabilities.sort( (a,b) => a.chance-b.chance)
				const cell = cellsProbabilities[0];
				OpenCell(cell.x, cell.y);
			}
			else			
				OpenCell(notABomb[0].x, notABomb[0].y)
				

			await new Promise(resolve => setTimeout(resolve, 1000))
			document.getElementById('exibir-execucao').innerHTML = '<pre>' + campoMinado.Tabuleiro() + '</pre>';
		}
		EndGame();
	};

	

	const ActualizeMap = () => {
		gameMap = campoMinado.Tabuleiro().split('\n');

			bombCells.forEach( bomb => {
				let line = gameMap[bomb.x];
				line = line.substring(0,bomb.y) + '*' + line.substring(bomb.y+1);
				gameMap[bomb.x] = line;
			});

		for (let i = 0; i < fieldSize; i++) {
			for (let j = 0; j < fieldSize; j++) {
				CheckCell(i, j);
			}
		}
	};
	
	const CheckCell = (i, j) => {
		let cellValue = gameMap[i][j];
		switch (cellValue) {
			case '*':
			case '0':
			case '-':
				break;
			default:
				ClueCheck(i, j, cellValue)
		}
	}
	
	
	// check clues and calculates the percentage of bomb chance

	const ClueCheck = (x, y, bombs) => {
		const neighborhood = neighborhoodCellsToArray(x, y);
		const neighborBombs = neighborhood.reduce( (count, node) => (node.value=='*'? count+1:count), 0);
		const neighborOpens = neighborhood.reduce( (count, node) => (node.value=='-'? count+1:count), 0);

		neighborhood.forEach( node => {
			if (node.value == '-') {
				// number of cells divided by remaining bombs arround
				const nodeBombChance = (bombs - neighborBombs) / neighborOpens;
				let cellProbabilitie = cellsProbabilitiesMap[`${node.x}${node.y}`];

				if (cellProbabilitie) {
					if (nodeBombChance == 0 || (cellProbabilitie.chance!=0 && nodeBombChance>cellProbabilitie.chance)) {
						cellProbabilitie = {
							...node,
							chance: nodeBombChance
						};
					}
				} else 
					cellProbabilitie = {
						...node,
						chance: nodeBombChance
					};

				cellsProbabilitiesMap[`${node.x}${node.y}`] = cellProbabilitie;
			}
		});
	}
	
	// check around cells

	const neighborhoodCellsToArray = (x, y) => {
		const validCells = [];
		for (let i = x-1; i<=x+1 && i<=fieldSize; i++) {
			for (let j = y-1; j<=y+1 && j<=fieldSize; j++) {
				if ((i==x && j==y) ||
					(i<DOWN_THRESHOLD) ||
					(j<LEFT_THRESHOLD)
				) 
					continue;
				else
					validCells.push({
						x: i,
						y: j,
						value: gameMap[i][j]
					});
			}
		}

		return validCells;
	}

	// add new bombs in map

	const DisposeNewBombs = (bombsToPlace) => {
		bombsToPlace.forEach( bomb => {
			const newElement = document.createElement("li")
			let text = document.createTextNode(`NOVA BOMBA ENCONTRADA: Linha=${bomb.x+1} Coluna=${bomb.y+1} \n`)
			newElement.appendChild(text)
			let list = document.getElementById("bombLog")
			list.appendChild(text)			
			
			
			bombCells.push(bomb)
		});
	}


	const OpenCell = (x, y) => {
		campoMinado.Abrir(x+1, y+1);
	}
	const CheckStatus = () => campoMinado.JogoStatus();
	const EndGame = () => {
		
		status = ""

		if( CheckStatus() == 1){
			status = "STATUS : VITORIA"
		} else status = "STATUS : DERROTA"
		document.getElementById('status').innerHTML = `${status}`;

	}

	/*
	* Start
	*/
	Analyze();
}