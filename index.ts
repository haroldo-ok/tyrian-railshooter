'use strict';

import * as THREE from 'three';

import imageURL from './desert.png';
import enemyImageURL from './NEWSH2.SHP.png';

let floorTexture;
let enemySprite;
let enemyTexture;
let enemyFrame = 0;

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
		crateTexture.magFilter = THREE.NearestFilter;
		crateTexture.minFilter = THREE.NearestMipMapLinearFilter;
		enemyTexture = crateTexture;

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false, color: 0xff0000 } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( -100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( -0, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		enemySprite = sprite2;
		scene.add( sprite2 );

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false, color: 0x0000ff } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( 100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		// Temporary sprite to debug animation glitch
		/*
		var crateTexture2 = loader.load(enemyImageURL);
		crateTexture2.magFilter = THREE.NearestFilter;
		crateTexture2.minFilter = THREE.NearestMipMapLinearFilter;
		crateTexture2.repeat.set( 1 / (256/24), 1 / (256/24) );
		crateTexture2.offset.x = Math.floor(enemyFrame) * (24 / 256);
		crateTexture2.offset.y = 64 / 256;
		
		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture2, useScreenCoordinates: false, color: 0x00ff00 } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( 100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );
		*/
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
		
		enemySprite.position.z += delta * 100;
		
		enemyFrame = (enemyFrame + delta * 16) % 8;
		
		//enemyTexture.repeat.set( 1 / (256/24), 1 / (256/24) );
		enemyTexture.repeat.set( 1 / (256/24), 1 / (256/24) );
		enemyTexture.offset.x = Math.floor(enemyFrame) * (24 / 256);
		enemyTexture.offset.y = 64 / 256;
	}
	
	function render() 
	{
		renderer.render( scene, camera );
	}

}

main2();