'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

const floorTiles = [50, 51, 60, 61,62, 63];
const floorTiles2 = [16, 46];

const generateTileIndexesStep1 = (position, {tileCount = 10} = {}) => {
	return range(tileCount).map((j) => simplex.noise2D(position, j) > 0.5 ? 1 : 0;
};

const generateTileIndexes = (bottom, current, top, {tileCount = 10} = {}) => {
	return current.map((idx, col) => { 
		if (!idx && col > 0 && col < current.length -1) {
			// Left edge
			if (current[col - 1]) {
				return bottom[col] ? 5 
					: top[col] ? 25
					: 15;
			}

			// Right edge
			if (current[col + 1]) {
				return bottom[col] ? 7
					: top[col] ? 27
					: 17;
			}

			// Bottom edge
			if (bottom[col]) {
				return 26;
			}

			// Top edge
			if (top[col]) {
				return 6;
			}

			// Bottom left corner
			if (bottom[col - 1]) {
				return 18;
			}

			// Bottom right corner
			if (bottom[col + 1]) {
				return 19;
			}

			// Top left corner
			if (top[col - 1]) {
				return 8;
			}

			// Top right corner
			if (top[col + 1]) {
				return 9;
			}
		}

		return idx > 0 ? sample(floorTiles) : sample(floorTiles2);
	});
};

export const mapGenerator = () => {
	let position = 0;
	
	let bottom;
	let current = generateTileIndexesStep1(position++);
	let top = generateTileIndexesStep1(position++);
	
	return () => {
		[bottom, current, top] = [current, top, generateTileIndexesStep1(position++)];		
		return generateTileIndexes(bottom, current, top);
	}
};