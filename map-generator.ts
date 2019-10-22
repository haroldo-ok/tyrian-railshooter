'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

enum TileEdge {
	A, B, L, R,
	BOTTOM, TOP,
	TL, TR, BL, BR
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
	r: [17],
	top: [6],
	bottom: [26],
	tl: [8],
	tr: [9],
	bl: [18],
	br: [19]
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
	
const generateVerticalEdges = ([bottom, current, top]) => {
	const currentWithEdges = current.map((idx, col) => {
		if (idx != TileEdge.A) {
			return idx;
		}

		if (top[col] == TileEdge.B) {
			return TileEdge.TOP;
		}

		if (bottom[col] == TileEdge.B) {
			return TileEdge.BOTTOM;
		}

		return idx;
	});

	return [bottom, currentWithEdges, top];
});
	
const generateCorners = ([bottom, current, top]) => {
	const currentWithCorners = current.map((idx, col) => {
		if (idx != TileEdge.A) {
			return idx;
		}

		// Top left corner
		if (col > 0 && top[col - 1]) {
			return TileEdge.TL;
		}

		// Top right corner
		if (col < current.length - 1 && top[col + 1]) {
			return TileEdge.TR;
		}

		// Bottom left corner
		if (col > 0 && bottom[col - 1]) {
			return TileEdge.BL;
		}

		// Bottom right corner
		if (col < current.length - 1 && bottom[col + 1]) {
			return TileEdge.BR;
		}

		return idx;
	});

	return [bottom, currentWithCorners, top];
});

const generateTileIndexes = ([bottom, current, top], {tileCount = 10} = {}) => {
	return current.map((idx, col) => sample(tileIndexes[tileEdgeNames[idx]]));
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
		const currentStrips = [bottom, current, top] = [current, top, generateStrip(position++)];		
		const step1 = generateVerticalEdges(currentStrips);
		const step2 = generateCorners(step1);
		return generateTileIndexes(step2);
	}
};