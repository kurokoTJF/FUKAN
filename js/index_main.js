
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d',{ willReadFrequently: true })

// PlayerのPositionはtile_sizeを入れてる、tile単位ではない！
const tile_scale = 2
const tile_size = 32
const tiled_width = 10*tile_scale
const tiled_height = 7*tile_scale

canvas.width = tile_size*tiled_width
canvas.height = tile_size*tiled_height

const gravity = 0.4
var keys = {
	right:{
		press:false,
		pressed:false,
	},
	left:{
		press:false,
		pressed:false,
	},
	jump:{
		press:false,
		pressed:false,
	},
	atk:{
		press:false,
		pressed:false,
	},
	up:{
		press:false,
		pressed:false,
	},
	down:{
		press:false,
		pressed:false,
	},
	pause:{
		press:false,
		pressed:false,
	},
	q:{
		press:false,
		pressed:false,
	},
	e:{
		press:false,
		pressed:false,
	},
	
}

const screenPainter = new SpritesComponent({
	position:{x:0,y:0},
	type:1,
	movieClips:{
		fade_in:{
			//imgSrc:'./Sprites/red/idle.png',
			frameLength:10,
			frameBuffer:10,
			loopStartFrame:9, 
			//align_type : 'bottom',
			//scale:{x:2,y:2},
		},
		fade_out:{
			//imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			//align_type : 'bottom',
			//scale:{x:2,y:2},
		},
	}
})

let showDIP = false
let PERSPECTIVE = '2D'

// make the stage
let characters = []
characters.push(new Player({
	movieClips:{
		idle:{
			imgSrc:'./Sprites/red/idle.png',
			frameLength:6,
			frameBuffer:10,
			loopStartFrame:0, 
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		walk:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:0,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		run:{
			imgSrc:'./Sprites/red/run.png',
			frameLength:8,
			frameBuffer:5,
			loopStartFrame:0, 			
			align_type : 'bottom',			
			scale:{x:2,y:2},
		},
		
		jump:{
			imgSrc:'./Sprites/red/jump.png',
			frameLength:6,
			frameBuffer:5,
			loopStartFrame:2, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		fall:{
			imgSrc:'./Sprites/red/fall.png',
			frameLength:7,
			frameBuffer:6,
			loopStartFrame:3, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		land:{
			imgSrc:'./Sprites/red/land.png',
			frameLength:3,
			frameBuffer:6,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		gd_atk:{
			imgSrc:'./Sprites/red/gd_atk.png',
			frameLength:10,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		wall_slide:{
			imgSrc:'./Sprites/red/wall_slide.png',
			frameLength:4,
			frameBuffer:8,
			loopStartFrame:2,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enchant:{
			imgSrc:'./Sprites/red/enchant.png',
			frameLength:8,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enter:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:9,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		
		
		
	},

}))
characters.push(new Player({
	movieClips:{
		idle:{
			imgSrc:'./Sprites/red/idle.png',
			frameLength:6,
			frameBuffer:10,
			loopStartFrame:0, 
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		walk:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:0,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		run:{
			imgSrc:'./Sprites/red/run.png',
			frameLength:8,
			frameBuffer:5,
			loopStartFrame:0, 			
			align_type : 'bottom',			
			scale:{x:2,y:2},
		},
		
		jump:{
			imgSrc:'./Sprites/red/jump.png',
			frameLength:6,
			frameBuffer:5,
			loopStartFrame:2, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		fall:{
			imgSrc:'./Sprites/red/fall.png',
			frameLength:7,
			frameBuffer:6,
			loopStartFrame:3, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		land:{
			imgSrc:'./Sprites/red/land.png',
			frameLength:3,
			frameBuffer:6,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		gd_atk:{
			imgSrc:'./Sprites/red/gd_atk.png',
			frameLength:10,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		wall_slide:{
			imgSrc:'./Sprites/red/wall_slide.png',
			frameLength:4,
			frameBuffer:8,
			loopStartFrame:2,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enchant:{
			imgSrc:'./Sprites/red/enchant.png',
			frameLength:8,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enter:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:9,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		
		
		
	},
	
	talk_txt:txt_NPC0,

}))
characters.push(new Player({
	movieClips:{
		idle:{
			imgSrc:'./Sprites/red/idle.png',
			frameLength:6,
			frameBuffer:10,
			loopStartFrame:0, 
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		walk:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:0,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		run:{
			imgSrc:'./Sprites/red/run.png',
			frameLength:8,
			frameBuffer:5,
			loopStartFrame:0, 			
			align_type : 'bottom',			
			scale:{x:2,y:2},
		},
		
		jump:{
			imgSrc:'./Sprites/red/jump.png',
			frameLength:6,
			frameBuffer:5,
			loopStartFrame:2, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		fall:{
			imgSrc:'./Sprites/red/fall.png',
			frameLength:7,
			frameBuffer:6,
			loopStartFrame:3, 			
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		land:{
			imgSrc:'./Sprites/red/land.png',
			frameLength:3,
			frameBuffer:6,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		gd_atk:{
			imgSrc:'./Sprites/red/gd_atk.png',
			frameLength:10,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		wall_slide:{
			imgSrc:'./Sprites/red/wall_slide.png',
			frameLength:4,
			frameBuffer:8,
			loopStartFrame:2,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enchant:{
			imgSrc:'./Sprites/red/enchant.png',
			frameLength:8,
			frameBuffer:8,
			nextClip:'idle',
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		enter:{
			imgSrc:'./Sprites/red/walk.png',
			frameLength:10,
			frameBuffer:8,
			loopStartFrame:9,
			align_type : 'bottom',
			scale:{x:2,y:2},
		},
		
		
		
	},
	
	talk_txt:txt_NPC1,

}))


var player = characters[0]// constやletとかはglobal objectに登録しないので
var NPC0 = characters[1]
var NPC1 = characters[2]

const tile2 = new Tiles({
	position:{x:300,y:100},
	velocity:{x:-1,y:0},
	width:2,
	height:1,
	ID:0,
	
})



function world_addDialogs(script,puppets=[player]){
	let dialog_box = new dialogBox({puppets:puppets})
	dialog_box.setText(script)
	dialogs.push(dialog_box)
	
}
let dialogs=[]
const dialog_box = new dialogBox({})
//dialogs.push(dialog_box)

let middlegroundLevel1
let backgroundLevel1
let foregroundLevel1
// generate the map
let terrain = []
let objects = []
let test_objects = []

let level = 3
let levels = {
	0:{
		init: () => {
			console.log('逃げ場なし！')
		},
		type: 'void',
	},
	1:{
		init: () => {
		    console.log('level1 generating')
			terrain = []
			objects = []
			player.init(4,-4,tile_size,tile_size*2)
			generate_from_array2D(array_parse2D(floorCollisions))
			middlegroundLevel1 = init_images('./Sprites/map/MiddleGround.png')
			backgroundLevel1 = init_images('./Sprites/map/Background.png')
			foregroundLevel1 = init_images('./Sprites/map/ForeGround.png')
			PERSPECTIVE = '2D'

		},
		type: '2D',
	},
	2:{
		init: () => {
			terrain = []
			objects = []
			player.init(4,-4,tile_size,tile_size*2)
		    console.log('level2 generating')
			generate_from_array2D(array_parse2D(level2Collisions))
			middlegroundLevel1 = init_images('./Sprites/map/st2_mg.png')
			backgroundLevel1 = init_images('./Sprites/map/st2_bg.png')
			foregroundLevel1 = init_images('./Sprites/map/st2_fg.png')
			PERSPECTIVE = '2D'
		},
		type: '2D',
	},
	3:{
		init: () => {
			terrain = []
			objects = []
			test_objects = []
			player.init(10,12,24,24)
			NPC0.init(10,20,24,24)
			NPC0.setIncarnate()
			NPC1.init(10,25,24,24)
			NPC1.setIncarnate()
		    console.log('level '+level+' generating')
			generate_from_array2D(array_parse2D(level3Col,16))
			generate_from_array2D(array_parse2D(level3OBJ,16))
			generate_from_objects(level3_objects)
			//middlegroundLevel1 = init_images('./Sprites/isometric_tileset/15F_floor.png')
			background = init_Tiles(0,0,'./Sprites/isometric_tileset/15F_floor.png',2,'iso 3D',4,{l:16,w:28,h:7})
			foreground = init_Tiles(0,0,'./Sprites/isometric_tileset/15F_foreground.png',2,'iso 3D',4,{l:16,w:28,h:7})
			PERSPECTIVE = 'iso'
			
			
		},
		type: 'iso',
	},
}

///////////////////////
let world_fade_in_RQ = false
let world_fade_out_RQ = false

function resetFadeRequest(){
	if(world_fade_in_RQ)
		world_fade_in_RQ =false
	if(world_fade_out_RQ)
		world_fade_out_RQ = false
}

function handleWorldFadeIn(){
	screenPainter.switchMovieClip('fade_in')
}

function handleWorldFadeOut(){
	screenPainter.switchMovieClip('fade_out')
}

//////////////////////




function requestSetLevel(_level){
	if(_level == undefined)
		level = 0
	else 
		level = _level
	levels[level].init()
}


window.addEventListener('keydown',(event)=>{
	switch (event.key){
	case 'p':
		keys.pause.pressed = true
		break
	case 'ArrowRight':
		keys.right.pressed = true
		break
	case 'ArrowLeft':
		keys.left.pressed = true
		break
	case 'z':
		keys.jump.pressed = true
		break
	case 'x':
		keys.atk.pressed = true
		break
	case 'q':
		keys.q.pressed = true
		break
	case 'ArrowUp':
		keys.up.pressed = true
		break
	case 'ArrowDown':
		keys.down.pressed = true
		break
	case 'e':
		keys.e.pressed = true
		break
	}
})

window.addEventListener('keyup',(event)=>{
	switch (event.key) {
	case 'p':
	    keys.pause.pressed = false

	        break
	    case 'ArrowRight':
	        keys.right.pressed = false
	        break
	    case 'ArrowLeft':
	        keys.left.pressed = false
	        break
	    case 'z':
	        keys.jump.pressed = false
	        break
	    case 'x':
	        keys.atk.pressed = false
	        break
	    case 'ArrowUp':
	        keys.up.pressed = false
	        break
		case 'ArrowDown':
	        keys.down.pressed = false
	        break
	    case 'q':
	        keys.q.pressed = false
	        break
		case 'e':
	        keys.e.pressed = false
	        break
	}
})


///////////////////////////////////////////

levels[level].init()
updateWorld()




function updateWorld(){
	window.requestAnimationFrame(updateWorld)
	if (!keys.pause.pressed) {
		//console.log(PERSPECTIVE)
	    switch (PERSPECTIVE) {
	    case '2D':
	        tile2.update()
	        terrain.forEach((tile) => {
	            tile.update()
	        })
	        objects.forEach((tile) => {
	            if (tile.remove) {
	                objects.splice(objects.indexOf(tile), 1)
	            } else
	                tile.update()
	        })
	        characters.forEach((character)=>{
				character.update()
			})
			screenPainter.update()


	        draw_call()
	        DIP()
	        break
	    
		case 'iso':
			
			if(getOnPress('jump')){
				let plan = 
				NPC0.body_clock=0
				NPC0.actionPlan.push(
					{type:'approach',target:NPC1,radius:100},				
					{type:'call',target:NPC0},
					{type:'wait',time:200},
					{type:'move',target:{x:NPC0.position.x,y:NPC0.position.y}},
				)
				//
			}
			objects.forEach((tile) => {
				tile.update()
	        })
			terrain.forEach((tile) => {
				tile.update()
	        })
			characters.forEach((character)=>{
				character.update()
			})

			dialogs.forEach((da)=>{
				if(da.isRemovable()){
					dialogs.splice(dialogs.indexOf(da),1)
				}else{
					da.update()
				}
			})
			
			screenPainter.update()
			draw_call_isometric()
			
			DIP()
			
			break
	    }
	}
	
	// 瞬間イベントの回収
	for(let _key in keys)
		if(keys[_key].pressed)
			keys[_key].press = true
		else 
			keys[_key].press = false
	
	
	//console.log(keys)
}


function draw_call(){
	
	c.fillStyle = 'rgb(125,125,255)'
	c.fillRect(0,0,canvas.width,canvas.height)
	backgroundLevel1.draw()
	tile2.draw()
	
	
	terrain.forEach((tile)=>{
		tile.draw()
	})
	middlegroundLevel1.draw()
	
	objects.forEach((tile)=>{
		tile.draw()
	})
	//player.draw_box()
	player.draw()//其中可能触发世界方法change level
	foregroundLevel1.draw()
	//const myImageData = c.getImageData(0,0,canvas.width,canvas.height)
	
	/*
	if(player.storyMode){
		screenPainter.draw_black()
		//screenPainter.draw_cinema()
		c.save()
		drawImageData(myImageData,0.2,320/0.2,100/0.2)
		c.restore()
	}
	else {
	    screenPainter.draw_black_out()
	}
	*/
	screenPainter.draw()
}

function draw_call_isometric() {
    c.fillStyle = 'rgb(0,0,0)'
	c.fillRect(0,0,canvas.width,canvas.height)
	//console.log('draw iso')
	background.draw()
	terrain.forEach((tile)=>{
		tile.draw()
	})
	
	
	//if(this.position.x<player.position.x && this.position.y<player.position.y)
	test_objects.forEach((obj)=>{
		let _dot = front(obj.position,{x:obj.dimension.l*tile_size,y:obj.dimension.w*tile_size},{x:player.position.x+player.width/2,y:player.position.y+player.height/2})	
		if(_dot>0)
			obj.draw()	
			
	})
	objects.forEach((tile)=>{
		// dot(1,1) で深度を求める
		if(tile.position.x+tile.position.y<=player.position.x+player.position.y)
			tile.draw()
	})
	
	player.draw()
	
	
	test_objects.forEach((obj)=>{
		let _dot = front(obj.position,{x:obj.dimension.l*tile_size,y:obj.dimension.w*tile_size},{x:player.position.x+player.width/2,y:player.position.y+player.height/2})		
		if(_dot<=0){
			c.save()
			if(cover_iso(obj,{x:player.position.x+player.width/2,y:player.position.y+player.height/2}))
				c.globalAlpha = 0.6;
			obj.draw()
			c.restore()
		}			
			
	})
	
	objects.forEach((tile)=>{
		if(tile.position.x+tile.position.y>player.position.x+player.position.y)
			tile.draw()
	})
	
	
	NPC0.draw()
	NPC1.draw()
		
	foreground.draw()
	
	
	dialogs.forEach((da)=>{
		da.draw()
		
	})
			
	//dialog_box.draw()
	
	
	
	screenPainter.draw()
	
	
}
function drawImageData(ImageData,scaleArg,posX=0,posY=0) {
    canvasInvisible=document.createElement('canvas');
    canvasInvisible.width=canvas.width;
    canvasInvisible.height=canvas.height;
    ctx2 = canvasInvisible.getContext('2d');
    ctx2.putImageData(ImageData, 0, 0);
    
    c.scale(scaleArg, scaleArg);
    c.drawImage(canvasInvisible,posX,posY);
	
}
//http://volgakurvar.blog.fc2.com/blog-entry-39.html