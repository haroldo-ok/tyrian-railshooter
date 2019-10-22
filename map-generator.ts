'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

enum TileEdge {
	A, B, L, R
};

const tileEdgeNames = (() => {
	const names = [];
	for (let item in TileEdge) {
		if (isNaN(Number(item))) {
			names.push(item.toLowerCase());
		}
	}
	return names;
})();
console.log(tileEdgeNames);

const tileIndexes = {
	a: [16, 46],
	b: [50, 51, 60, 61,62, 63],
	l: [15],
	r: [17]
};

const generateMainPlanes = (position, {tileCount = 10} = {}): TileEdge[] => {
	return range(tileCount).map((j) => simplex.noise2D(position, j) > 0 ? TileEdge.B : TileEdge.A;
};
								
const enforceHorizontalSpacing = strip => strip.map((idx, col) => {
	// There's a Type "A" tile sandwiched between two Type "B"s; changes the left one
	if (col < strip.length - 1 && idx == TileEdge.B &&
		strip[col + 1] == TileEdge.A && strip[col + 2] == TileEdge.B) {
		return TileEdge.A;
	}		
	return idx;
};
	
const generateHorizontalEdges = strip => strip.map((idx, col) => {
	if (idx == TileEdge.A) {
			// Left edge
			if (col > 0 && strip[col - 1]) {
				return TileEdge.L;
			}

			// Right edge
			if (col < strip.length - 1 && strip[col + 1]) {
				return TileEdge.R;
			}		
	}
	return idx;
});

const generateTileIndexes = (bottom, current, top, {tileCount = 10} = {}) => {
	return current.map((idx, col) => { 
		//switch 
		/*
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
		*/

		return sample(tileIndexes[tileEdgeNames[idx]]);
	});
};
	
const generateStrip = (position) {
	const step1 = generateMainPlanes(position);
	const step2 = enforceHorizontalSpacing(step1);
	return generateHorizontalEdges(step2);
};

export const mapGenerator = () => {
	let position = 0;
	
	let bottom;
	let current = generateStrip(position++);
	let top = generateStrip(position++);
	
	return () => {
		[bottom, current, top] = [current, top, generateStrip(position++)];		
		return generateTileIndexes(bottom, current, top);
	}
};