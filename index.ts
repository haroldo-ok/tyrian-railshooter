'use strict';

import * as THREE from 'three';

import imageURL from './desert.png';
import enemyImageURL from './NEWSH2.SHP.png';

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
		
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.position.y = -0.5;
		floor.rotation.x = Math.PI / 2;
		scene.add(floor);
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

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, color: 0xff0000 } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( -100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		enemies = [...Array(10)].map((o, i) => {
			var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture } );
			var sprite2 = new THREE.Sprite( crateMaterial );
			sprite2.position.set( -0, 50, 0 );
			sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
			scene.add( sprite2 );
			return sprite2;
		});
		enemySprite = enemies[0];


		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, color: 0x0000ff } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( 100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		

		ushipTexture = loader.load(enemyImageURL);
		animators.push(makeTextureAnimator(ushipTexture, {textureY: 92}));
		
		uships = [...Array(10)].map((o, i) => {
			var ushipMaterial = new THREE.SpriteMaterial( { map: ushipTexture } );
			var sprite2 = new THREE.Sprite( ushipMaterial );
			sprite2.position.set( -200, 50, 0 );
			sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
			scene.add( sprite2 );
			return sprite2;
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
		
		floorTexture.offset.y -= delta * 6;
		//enemyTexture.offset.x += 0.001;
		//enemySprite.position.x++;
		//enemySprite.position.y++;
		
		//enemySprite.position.z += delta * 100;
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

function makeTextureAnimator(texture, {
	spriteWidth = 24, spriteHeight = 24,
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

main2();