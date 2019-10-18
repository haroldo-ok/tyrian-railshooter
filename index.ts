'use strict';

import * as THREE from 'three';
import {sample} from 'lodash';
import SimplexNoise from 'simplex-noise';

import imageURL from './desert.png';
import enemyImageURL from './NEWSH2.SHP.png';
import floorImageURL from './SHAPESZ.DAT.1.png';

let floorTexture;
let enemySprite;
let enemyTexture;
let enemyFrame = 0;

let ushipTexture;

let enemyPath;
let pathPosition = 0;
let enemies;
let uships;

const animators = [];

const main2 = () => {
	// standard global variables
	var container, scene, camera, renderer, controls, stats;
	var clock = new THREE.Clock();
	// custom global variables
	var cube;
	init();
	animate();
	// FUNCTIONS 		
	function init() 
	{
		// SCENE
		scene = new THREE.Scene();
		// CAMERA
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.set(0,150,400);
		camera.lookAt(scene.position);	
		// RENDERER
		const canvas = document.querySelector('#c');
		renderer = new THREE.WebGLRenderer( {canvas, antialias:true} );
		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		
		const loader = new THREE.TextureLoader();
		
		// LIGHT
		var light = new THREE.PointLight(0xffffff);
		light.position.set(0,250,0);
		scene.add(light);
		
		// FLOOR
		floorTexture = loader.load(imageURL);
		floorTexture.magFilter = THREE.NearestFilter;
		floorTexture.minFilter = THREE.NearestMipMapLinearFilter;
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
		floorTexture.repeat.set( 10, 10 );
		
		var floorTexture2 = loader.load(floorImageURL);
		animators.push(makeTextureAnimator(floorTexture2, {textureY: 256 - 2 * 28, framesX: 1}));
		floorTexture2.repeat.set(1, 1);

		
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide, transparent: true } );
		var floorMaterial2 = new THREE.MeshBasicMaterial( { map: floorTexture2, side: THREE.DoubleSide, transparent: true } );
		
		const tileWidth = 24;
		const tileHeight = 28;
		const tileCountX = Math.floor(256 / tileWidth);
		const tileCountY = Math.floor(256 / tileHeight);
		const tileCount = tileCountX * tileCountY;
		const floorMaterials = createArrayOfSize(tileCount).map((o, i) => {
			const tileX = i % tileCountX;
			const tileY = Math.floor(i / tileCountX);
			const textureX = tileX * tileWidth;
			const textureY = 256 - (tileY + 1) * tileHeight;

			var texture = loader.load(floorImageURL);
			animators.push(makeTextureAnimator(texture, {textureX, textureY, framesX: 1}));
			texture.repeat.set(1, 1);
			
			return new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide, transparent: true } );
		});
						
        const floorContainer = new THREE.Object3D();
        
        const simplex = new SimplexNoise();
		
		const step1Tiles = [];
		const floorTiles = [50, 51, 60, 61,62, 63];
		const floorTiles2 = [16, 46];

		const generateTileIndexesStep1 = (tileCount = 10) => {
			const position = step1Tiles.length;
			const indexes = createArrayOfSize(tileCount).map((o2, j) => simplex.noise2D(position, j) > 0.5 ? 1 : 0;
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

        const floorStrips = createArrayOfSize(10).map((o, i) => {
            var floorGeometry = createFloorStripGeometry();
            //updateFloorTileIndexes(floorGeometry, createArrayOfSize(floorGeometry.faces.length / 2).map(() => sample(floorTiles)));
			updateFloorTileIndexes(floorGeometry, generateTileIndexes());
            window['floorGeometry'] = floorGeometry;


            var floor = new THREE.Mesh(floorGeometry, floorMaterials);
            floor.position.y = -0.5;
            floor.position.z = (5 - i) * 110;
            floor.rotation.x = Math.PI / 2;            
            
            floorContainer.add(floor);
            
            return floor;
        });
        
        animators.push(delta => {
            floorStrips.forEach(strip => {
                strip.position.z += delta * 100;
                if (strip.position.z > 5 * 110) {
                    strip.position.z -= 10 * 110;
					updateFloorTileIndexes(floorGeometry, generateTileIndexes());
                }
            });
        });
                
		scene.add(floorContainer);
        
		// SKYBOX/FOG
		var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		scene.add(skyBox);
		scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

		////////////
		// CUSTOM //
		////////////


		var crateTexture = loader.load(enemyImageURL);
		animators.push(makeTextureAnimator(crateTexture, {textureY: 64}));
		enemyTexture = crateTexture;

		var sprite2 = createSprite(crateTexture);
		sprite2.material.color.set('#F00')
		sprite2.position.set(-100, 50, 0);
		scene.add(sprite2);

		enemies = createArrayOfSize(5).map((o, i) => {
			const sprite = createSprite(crateTexture);
			sprite.position.set(-0, 50, 0);
			scene.add(sprite);
			return sprite;
		});
		enemySprite = enemies[0];


		var sprite2 = createSprite(crateTexture);
		sprite2.material.color.set('#00F')
		sprite2.position.set(100, 50, 0);
		scene.add(sprite2);
		

		ushipTexture = loader.load(enemyImageURL);
		animators.push(makeTextureAnimator(ushipTexture, {textureY: 256 - 6 * 28}));
		
		uships = createArrayOfSize(5).map((o, i) => {
			const sprite = createSprite(ushipTexture);
			sprite.position.set(-200, 50, 0);
			scene.add(sprite);
			return sprite;
		});

		
		// Path to follow
		const path = new THREE.Path([
			new THREE.Vector2(-50, -50),
			new THREE.Vector2(0, -50)
		]);
		var arcRadius = 50;
		path.moveTo(0, 0 - arcRadius);
		path.absarc(0, 0, arcRadius, -Math.PI / 2, 0, false);
		path.lineTo(50, 100);
		path.lineTo(-50, 300);
		enemyPath = path;
	}
	function animate() 
	{
		requestAnimationFrame( animate );
		update();
		render();		
	}
	
	function update() 
	{
		const delta = clock.getDelta();
		
		pathPosition = (pathPosition + delta * 0.5) % 1;
		
		enemies.forEach((enemy, i) => {
			const position = (pathPosition + i / enemies.length) % 1;
			const point = enemyPath.getPointAt(position);
			enemy.position.x = point.x;
			enemy.position.y = 50 + pathPosition * 10;
			enemy.position.z = point.y;
		});
		
		uships.forEach((enemy, i) => {
			const position = (pathPosition + i / uships.length) % 1;
			const point = enemyPath.getPointAt(position);
			enemy.position.x = -point.x;
			enemy.position.y = 50 + position * 20;
			enemy.position.z = point.y;
		});

		// Call animators to animate the textures
		animators.forEach(f => f(delta));
	}
	
	function render() 
	{
		renderer.render( scene, camera );
	}

}

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

function makeTextureAnimator(texture, {
	spriteWidth = 24, spriteHeight = 28,
	textureWidth = 256, textureHeight = 256,
	textureX = 0, textureY = 0,
	framesX = 8, framesY = 1,
	speed = 16
} = {}) {
	const ratio = {
		x: 1 / (textureWidth / spriteWidth),
		y: 1 / (textureHeight / spriteHeight)
	};
	
	const offset = {
		x: textureX / 256,
		y: textureY / 256
	};
	
	// Initializes the texture
	
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestMipMapLinearFilter;
	texture.repeat.set(ratio.x, ratio.y);
	
	texture.offset.x = offset.x;
	texture.offset.y = offset.y;
	
	// Creates the texture update function
	
	const frameCount = framesX * framesY;
	let frameTime = 0;
	
	return timeDelta => {
		frameTime = (frameTime + timeDelta * speed) % frameCount;
		
		const integerTime = Math.floor(frameTime);
		const time = {
			x: Math.floor(integerTime % framesX),
			y: Math.floor(integerTime / framesX)
		};
		
		texture.offset.x = time.x * ratio.x + offset.x;
		texture.offset.y = time.y * ratio.y + offset.y;
	};
}

function createSprite(texture, {width = 64, height = 64} = {}) {
	var material = new THREE.SpriteMaterial({ map: texture });	
	var sprite = new THREE.Sprite(material);
	sprite.scale.set( width, height, 1.0 );
	return sprite
}

const createArrayOfSize = size => [...Array(size)];

main2();