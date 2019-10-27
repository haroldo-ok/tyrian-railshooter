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
								

const generateTileIndexes = ([bottom, current, top], {tileTypeIndexes} = {}) => {
	return current.map((idx, col) => sample(tileTypeIndexes[tileEdgeNames[idx]]));
};
	
const createStripGenerator = ({tileCount = 10, threshold = 0} = {}) => {	
	const simplex = new SimplexNoise();
	const noiseFunction = (x, y) => simplex.noise2D(x, y);
	
	const options = {tileCount, threshold, noiseFunction};
	
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
			'..*',
			'?.?',
		],
		result: TileEdge.L
	},
	{
		pattern: [
			'?.?',
			'*..',
			'?.?',
		],
		result: TileEdge.R
	},
	{
		pattern: [
			'?.?',
			'...',
			'?*?',
		],
		result: TileEdge.TOP
	},
	{
		pattern: [
			'?*?',
			'...',
			'?.?',
		],
		result: TileEdge.BOTTOM
	},

	
	// Inner corner
	{
		pattern: [
			'?*?',
			'*..',
			'?..',
		],
		result: TileEdge.ITL
	},
	{
		pattern: [
			'?*?',
			'..*',
			'..?',
		],
		result: TileEdge.ITR
	},
	{
		pattern: [
			'?..',
			'*..',
			'?*?',
		],
		result: TileEdge.IBL
	},
	{
		pattern: [
			'..?',
			'..*',
			'?*?',
		],
		result: TileEdge.IBR
	},

	// Outer corners
	{
		pattern: [
			'..?',
			'...',
			'?.*',
		],
		result: TileEdge.OTL
	},
	{
		pattern: [
			'?..',
			'...',
			'*.?',
		],
		result: TileEdge.OTR
	},
	{
		pattern: [
			'?.*',
			'...',
			'..?',
		],
		result: TileEdge.OBL
	},
	{
		pattern: [
			'*.?',
			'...',
			'?..',
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
		const currentStrips = [bottom, current, top] = [current, top, generateStrip()];		
		const withHolesPatched = applyAutomata(holePatchingAutomata, currentStrips);
		[bottom, current, top] = withHolesPatched;
		
		const withCorners = applyAutomata(cornerAutomata, withHolesPatched);
		return generateTileIndexes(withCorners, {tileTypeIndexes});
	}
};