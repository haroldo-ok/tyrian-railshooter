'use strict';

import {range, sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

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

export const desertTileIndexes = {
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

export const cloudTileIndexes = {
	a: [13, 20, 21],
	b: [-1],
	l: [12],
	r: [14],
	top: [3],
	bottom: [23],
	
	itl: [2],
	itr: [4],
	ibl: [22],
	ibr: [24],
	
	otl: [0],
	otr: [1],
	obl: [10],
	obr: [11]
};

export const rockTileIndexes = {
	a: [76, 70, 71, 72, 73, 74],
	b: [-1],
	l: [75],
	r: [77],
	top: [66],
	bottom: [86],
	
	itl: [68],
	itr: [69],
	ibl: [78],
	ibr: [79],
	
	otl: [65],
	otr: [67],
	obl: [85],
	obr: [87]
};

const generateMainPlanes = (position, {tileCount = 10, threshold = 0, noiseFunction} = {}): TileEdge[] => {
	return range(tileCount).map((j) => noiseFunction(position, j) > threshold ? TileEdge.B : TileEdge.A;
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

const generateTileIndexes = ([bottom, current, top], {tileTypeIndexes} = {}) => {
	return current.map((idx, col) => sample(tileTypeIndexes[tileEdgeNames[idx]]));
};
	
const generateMainPlaneWithHorizontalSpacing = (position, {tileCount = 10, threshold = 0, noiseFunction} = {}) => {
	const step1 = generateMainPlanes(position, {tileCount, threshold, noiseFunction});
	return enforceHorizontalSpacing(step1);
};
	
const createStripGenerator = ({tileCount = 10, threshold = 0} = {}) => {	
	const simplex = new SimplexNoise();
	const noiseFunction = (x, y) => simplex.noise2D(x, y);
	
	const options = {tileCount, threshold, noiseFunction};
	
	/*
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
	*/
	
	let position = 0;
	
	return () => {
		return generateMainPlanes(position++, options);
	}
}

const holePatchingAutomata = [
	{
		pattern: [
			'???',
			'*.*',
			'???',
		],
		result: TileEdge.A
	},
	{
		pattern: [
			'?*?',
			'?.?',
			'?*?',
		],
		result: TileEdge.A
	},
	{
		pattern: [
			'??*',
			'?.?',
			'*??',
		],
		result: TileEdge.A
	},
	{
		pattern: [
			'*??',
			'?.?',
			'??*',
		],
		result: TileEdge.A
	},
];

const cornerAutomata = [

	{
		pattern: [
			'?.?',
			'?.*',
			'?.?',
		],
		result: TileEdge.L
	},
	{
		pattern: [
			'?.?',
			'*.?',
			'?.?',
		],
		result: TileEdge.R
	},
	{
		pattern: [
			'???',
			'...',
			'?*?',
		],
		result: TileEdge.TOP
	},
	{
		pattern: [
			'?*?',
			'...',
			'???',
		],
		result: TileEdge.BOTTOM
	},

	
	// Inner corner
	{
		pattern: [
			'?*?',
			'*.?',
			'???',
		],
		result: TileEdge.ITL
	},
	{
		pattern: [
			'?*?',
			'?.*',
			'???',
		],
		result: TileEdge.ITR
	},
	{
		pattern: [
			'???',
			'*.?',
			'?*?',
		],
		result: TileEdge.IBL
	},
	{
		pattern: [
			'???',
			'?.*',
			'?*?',
		],
		result: TileEdge.IBR
	},

	// Outer corners
	{
		pattern: [
			'???',
			'?..',
			'?.*',
		],
		result: TileEdge.OTL
	},
	{
		pattern: [
			'???',
			'..?',
			'*.?',
		],
		result: TileEdge.OTR
	},
	{
		pattern: [
			'?.*',
			'?..',
			'???',
		],
		result: TileEdge.OBL
	},
	{
		pattern: [
			'*.?',
			'..?',
			'???',
		],
		result: TileEdge.OBR
	},
	
];
	
const patternTokenHandlers = {
	'?': () => true,
	'.': x => x === TileEdge.B,
	'*': x => x === TileEdge.A
};
	
const patternMatches = (expected, actual, offset) => {
	for (let i = 0, j = offset - 1; i < expected.length; i++, j++) {
		if (!patternTokenHandlers[expected[i]](actual[j])) {
			return false;
		}			
	}
	
	return true;
}
	
const applyAutomata = (automata, [bottom, current, top]) => {
	const currentModified = current.map((idx, col) => {
		return automata.reduce((val, {pattern, result}) => {
			if (col > 0 && col < current.length - 1) {
				if (val !== TileEdge.A && val !== TileEdge.B) {
					return val;
				}
				
				const [patTop, patCurrent, patBottom] = pattern;

				if (patternMatches(patBottom, bottom, col) &&
				   patternMatches(patCurrent, current, col) &&
				   patternMatches(patTop, top, col)) {				
					return result;
				}
			}
			
			return val;
		}, idx);
	});
	
	return [bottom, currentModified, top];
}
	
export const mapGenerator = ({tileCount = 10, threshold = 0, tileTypeIndexes} = {}) => {
	const generateStrip = createStripGenerator({tileCount, threshold});
	
	let bottom;
	let current = generateStrip();
	let top = generateStrip();
	
	return () => {
		/*
		const currentStrips = [bottom, current, top] = enforceVerticalSpacing([current, top, generateStrip()]);
		const tileTypes = [generateInnerCorners, generateVerticalEdges, generateOuterCorners]
				.reduce((o, f) => f(o), currentStrips);
				*/
		const currentStrips = [bottom, current, top] = [current, top, generateStrip()];		
		const withHolesPatched = applyAutomata(holePatchingAutomata, currentStrips);
		const withCorners = applyAutomata(cornerAutomata, withHolesPatched);
		return generateTileIndexes(withCorners, {tileTypeIndexes});
	}
};