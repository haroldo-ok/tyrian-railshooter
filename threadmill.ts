'use strict';

import * as THREE from 'three';
import {range} from 'lodash';


export const createThreadmill = ({tileIndexesGenerator, materials, tileCount = 10, segmentCount = 20}) => {
	const options = {tileCount};	
	const container = new THREE.Object3D();
	
	const floorStrips = range(segmentCount).map((o, i) => {
		var floorGeometry = createFloorStripGeometry(options);
		updateFloorTileIndexes(floorGeometry, tileIndexesGenerator());
		window['floorGeometry'] = floorGeometry;


		var floor = new THREE.Mesh(floorGeometry, materials);
		floor.position.z = (segmentCount - i) * 110;
		floor.rotation.x = Math.PI / 2;            

		container.add(floor);

		return floor;
	});
	
	const update = delta => {
		floorStrips.forEach(strip => {
			strip.position.z += delta * 150;
			if (strip.position.z > segmentCount * 110 / 2) {
				strip.position.z -= segmentCount * 110;
				updateFloorTileIndexes(strip.geometry, tileIndexesGenerator(options));
			}
		});
	});
	
	return [container, update];
	
};

const updateFloorTileIndexes = (geometry, tileNumbers) => {
	geometry.faces.forEach((m, i) => m.materialIndex = tileNumbers[i >> 1]);
	geometry.groupsNeedUpdate = true;
};

const createFloorStripGeometry = ({tileCount = 10}) => {
	const geometry = new THREE.PlaneGeometry(100 * tileCount, 110, tileCount, 1);		

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
