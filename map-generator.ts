'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

const step1Tiles = [];
const floorTiles = [50, 51, 60, 61,62, 63];
const floorTiles2 = [16, 46];

const generateTileIndexesStep1 = (tileCount = 10) => {
	const position = step1Tiles.length;
	const indexes = range(tileCount).map((j) => simplex.noise2D(position, j) > 0.5 ? 1 : 0;
	step1Tiles.push(indexes);

	return indexes;
};

const generateTileIndexes = (tileCount = 10) => {
	generateTileIndexesStep1();

	const row = step1Tiles.length - 2;
	const prevStrip = step1Tiles[row - 1];
	const strip = step1Tiles[row];
	const nextStrip = step1Tiles[row + 1];

	return strip.map((idx, col) => { 
		if (!idx && col > 0 && col < strip.length -1) {
			// Left edge
			if (strip[col - 1]) {
				return prevStrip[col] ? 5 
					: nextStrip[col] ? 25
					: 15;
			}

			// Right edge
			if (strip[col + 1]) {
				return prevStrip[col] ? 7
					: nextStrip[col] ? 27
					: 17;
			}

			// Bottom edge
			if (prevStrip[col]) {
				return 26;
			}

			// Top edge
			if (nextStrip[col]) {
				return 6;
			}

			// Bottom left corner
			if (prevStrip[col - 1]) {
				return 18;
			}

			// Bottom right corner
			if (prevStrip[col + 1]) {
				return 19;
			}

			// Top left corner
			if (nextStrip[col - 1]) {
				return 8;
			}

			// Top right corner
			if (nextStrip[col + 1]) {
				return 9;
			}
		}

		return idx > 0 ? sample(floorTiles) : sample(floorTiles2);
	});
};

for (let i = 0; i != 3; i++) {			
	generateTileIndexesStep1();
}

export const mapGenerator = () => generateTileIndexes;