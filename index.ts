'use strict';

import * as THREE from 'three';

import imageURL from './desert.png';
import enemyImageURL from './enemy.png';

const main = () => {
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas});
	
	const fov = 75;
	const aspect = 2;
	const near = 0.1;
	const far = 5;
	
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	
	camera.position.z = 2;
	
	const scene = new THREE.Scene();
	
	const boxWidth = 1;
	const boxHeight = 1;
	const boxDepth = 1;
	const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
	
	const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
	
	const cube = new THREE.Mesh(geometry, material);
	//scene.add(cube);
	
	
	//const enemyTexture = THREE.ImageUtils.loadTexture('enemy.png');
	const enemyTexture = THREE.ImageUtils.loadTexture(imageURL);
	const enemyMaterial = new THREE.SpriteMaterial({map: enemyTexture});
	const sprite2 = new THREE.Sprite(enemyMaterial);
	sprite2.position.set(0, 0, 0 );
	//sprite2.scale.set( 21, 21, 1.0 ); // imageWidth, imageHeight
	sprite2.scale.set(64, 64, 1.0 ); // imageWidth, imageHeight
	scene.add(sprite2);

	
	const color = 0xFFFFFF;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
	scene.add(light);	
	
	console.info(scene);
	
	
	const render = time => {
		time *= 0.001; // Convert to secs
		
		cube.rotation.x = time;
		cube.rotation.y = time;
		
		renderer.render(scene, camera);
		
		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
	
	console.log('OK!');
}

const main2 = () => {
	// standard global variables
	var container, scene, camera, renderer, controls, stats;
//	var keyboard = new THREEx.KeyboardState();
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
		//container = document.getElementById( 'ThreeJS' );
		//container.appendChild( renderer.domElement );
		// EVENTS
		//THREEx.WindowResize(renderer, camera);
		//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
		// CONTROLS
		//controls = new THREE.OrbitControls( camera, renderer.domElement );
		// STATS
		/*
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		*/
		
		const loader = new THREE.TextureLoader();
		
		// LIGHT
		var light = new THREE.PointLight(0xffffff);
		light.position.set(0,250,0);
		scene.add(light);
		
		// FLOOR
		var floorTexture = loader.load(imageURL);
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

		//var ballTexture = loader.load(imageURL);
		/*
		var ballTexture = loader.load(enemyImageURL);
		ballTexture.magFilter = THREE.NearestFilter;
		ballTexture.minFilter = THREE.NearestMipMapLinearFilter;
		
		*/

		/*
		var ballMaterial = new THREE.SpriteMaterial( { map: ballTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft  } );
		var sprite = new THREE.Sprite( ballMaterial );
		sprite.position.set( 50, 50, 0 );
		sprite.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite );

		var ballMaterial = new THREE.SpriteMaterial( { map: ballTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.bottomRight } );
		var sprite = new THREE.Sprite( ballMaterial );
		sprite.position.set( window.innerWidth - 50, window.innerHeight - 50, 0 );
		sprite.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite );
		*/

		var crateTexture = loader.load(enemyImageURL);
		crateTexture.magFilter = THREE.NearestFilter;
		crateTexture.minFilter = THREE.NearestMipMapLinearFilter;

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false, color: 0xff0000 } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( -100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		//var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false, color: 0x00ff00 } );
		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( -0, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

		var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, useScreenCoordinates: false, color: 0x0000ff } );
		var sprite2 = new THREE.Sprite( crateMaterial );
		sprite2.position.set( 100, 50, 0 );
		sprite2.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
		scene.add( sprite2 );

	}
	function animate() 
	{
		requestAnimationFrame( animate );
		render();		
		update();
	}
	function update()
	{
		/*
		if ( keyboard.pressed("z") ) 
		{ 
			// do something
		}
		*/

		//controls.update();
		//stats.update();
	}
	function render() 
	{
		renderer.render( scene, camera );
	}

}

main2();