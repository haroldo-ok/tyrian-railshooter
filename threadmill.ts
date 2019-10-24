'use strict';

import * as THREE from 'three';
import {range} from 'lodash';


export const createThreadmill = ({tileIndexesGenerator, materials, segmentCount = 10}) => {
	
	const floorContainer = new THREE.Object3D();
	
	const floorStrips = range(segmentCount).map((o, i) => {
		var floorGeometry = createFloorStripGeometry();
		//updateFloorTileIndexes(floorGeometry, createArrayOfSize(floorGeometry.faces.length / 2).map(() => sample(floorTiles)));
		updateFloorTileIndexes(floorGeometry, tileIndexesGenerator());
		window['floorGeometry'] = floorGeometry;


		var floor = new THREE.Mesh(floorGeometry, materials);
		floor.position.y = -0.5;
		floor.position.z = (5 - i) * 110;
		floor.rotation.x = Math.PI / 2;            

		floorContainer.add(floor);

		return floor;
	});
	
	const update = delta => {
		floorStrips.forEach(strip => {
			strip.position.z += delta * 100;
			if (strip.position.z > 5 * 110) {
				strip.position.z -= 10 * 110;
				updateFloorTileIndexes(floorGeometry, tileIndexesGenerator());
			}
		});
	});
	
	return [floorContainer, update];
	
};

const updateFloorTileIndexes = (geometry, tileNumbers) => {
	geometry.faces.forEach((m, i) => m.materialIndex = tileNumbers[i >> 1]);
};

const createFloorStripGeometry = () => {
	const geometry = new THREE.PlaneGeometry(1000, 110, 10, 1);		

	const floorScale = 24/256;
	geometry.faceVertexUvs.forEach(layer => layer.forEach((face, i) => {
		const base = layer[i % 2];
		if (i % 2) {
			face[0].x = 0;
			face[0].y = floorScale;
			face[1].x = floorScale;
			face[1].y = floorScale;
			face[2].x = floorScale;
			face[2].y = 0;	
		} else {
			face[0].x = 0;
			face[0].y = 0;			
			face[1].x = 0;
			face[1].y = floorScale;
			face[2].x = floorScale;
			face[2].y = 0;
		}
	}));

	return geometry;
};
