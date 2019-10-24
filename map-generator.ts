'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise();

enum TileEdge {
	A, B, L, R,
	BOTTOM, TOP,
	ITL, ITR, IBL, IBR,
	OTL, OTR, OBL, OBR
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
	
	itl: [5],
	itr: [7],
	ibl: [25],
	ibr: [27],
	
	otl: [8],
	otr: [9],
	obl: [18],
	obr: [19]
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
			if (col > 0 && strip[col - 1] == TileEdge.B) {
				return TileEdge.L;
			}

			// Right edge
			if (col < strip.length - 1 && strip[col + 1] == TileEdge.B) {
				return TileEdge.R;
			}		
	}
	return idx;
});

const enforceVerticalSpacing = ([bottom, current, top]) => {
	const topWithSpacing = top.map((idx, col) => {
		if (idx == TileEdge.B && current[col] == TileEdge.A && bottom[col] == TileEdge.B) {
			return TileEdge.A;
		}
		
		// Diagonals
		if (col > 0 && col < top.length) {
			if (top[col - 1] == TileEdge.B && current[col] == TileEdge.A && bottom[col + 1] == TileEdge.B ||
			   top[col + 1] == TileEdge.B && current[col] == TileEdge.A && bottom[col - 1] == TileEdge.B ||
			   idx == TileEdge.B && current[col] == TileEdge.A && current[col - 1] == TileEdge.B && top[col - 1] == TileEdge.A ||
			   idx == TileEdge.B && current[col] == TileEdge.A && current[col + 1] == TileEdge.B && top[col + 1] == TileEdge.A) {
				return TileEdge.A;
			}
		}

		return idx;
	});

	return [bottom, current, topWithSpacing];
});

const generateInnerCorners = ([bottom, current, top]) => {
	const currentWithCorners = current.map((idx, col) => {
		if (idx == TileEdge.L) {
			// Top left
			if (top[col] == TileEdge.B) {
				return TileEdge.ITL;
			}
			// Bottom left
			if (bottom[col] == TileEdge.B) {
				return TileEdge.IBL;
			}
			return idx;
		}

		if (idx == TileEdge.R) {
			// Top right
			if (top[col] == TileEdge.B) {
				return TileEdge.ITR;
			}
			// Bottom right
			if (bottom[col] == TileEdge.B) {
				return TileEdge.IBR;
			}
			return idx;
		}

		return idx;
	});

	return [bottom, currentWithCorners, top];
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
	
const generateOuterCorners = ([bottom, current, top]) => {
	const currentWithCorners = current.map((idx, col) => {
		if (idx != TileEdge.A) {
			return idx;
		}

		// Top left corner
		if (col > 0 && top[col - 1] == TileEdge.B) {
			return TileEdge.OTL;
		}

		// Top right corner
		if (col < current.length - 1 && top[col + 1] == TileEdge.B) {
			return TileEdge.OTR;
		}

		// Bottom left corner
		if (col > 0 && bottom[col - 1] == TileEdge.B) {
			return TileEdge.OBL;
		}

		// Bottom right corner
		if (col < current.length - 1 && bottom[col + 1] == TileEdge.B) {
			return TileEdge.OBR;
		}

		return idx;
	});

	return [bottom, currentWithCorners, top];
});

const generateTileIndexes = ([bottom, current, top], {tileCount = 10} = {}) => {
	return current.map((idx, col) => sample(tileIndexes[tileEdgeNames[idx]]));
};
	
const generateMainPlaneWithHorizontalSpacing = (position, {tileCount = 10} = {}) => {
	const step1 = generateMainPlanes(position, {tileCount});
	return enforceHorizontalSpacing(step1);
};
	
const createStripGenerator = ({tileCount = 10} = {}) => {
	const options = {tileCount};
	
	let position = 0;
	let [a, b, c] = [
		null,
		generateMainPlaneWithHorizontalSpacing(position++, options),
		generateMainPlaneWithHorizontalSpacing(position++, options)
	];
	
	return () => {
		[a, b, c] = enforceVerticalSpacing([b, c, generateMainPlaneWithHorizontalSpacing(position++, options)]);
		return generateHorizontalEdges(c);
	}
}
	
export const mapGenerator = ({tileCount = 10} = {}) => {
	const generateStrip = createStripGenerator({tileCount});
	
	let bottom;
	let current = generateStrip();
	let top = generateStrip();
	
	return () => {
		const currentStrips = [bottom, current, top] = enforceVerticalSpacing([current, top, generateStrip()]);
		const tileTypes = [generateInnerCorners, generateVerticalEdges, generateOuterCorners]
				.reduce((o, f) => f(o), currentStrips);
		return generateTileIndexes(tileTypes);
	}
};