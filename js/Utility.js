///////////////////////////////////////////
function front(pos1,offset,pos2){
	// in 2D space....
	//(pos2.x-pos1.x-offset.x)*offset.y/offset.x + (pos2.y - pos1.y)*1
	return (pos2.x-pos1.x-offset.x)*offset.y/offset.x + pos2.y - pos1.y
}

function cover_iso(obj,pos){
	// in iso camera space
	let _pos1 =project_isometric(pos)
	let _pos2 = project_isometric(obj.position)
	
	let _dot1 = (_pos1.x - _pos2.x)*0.5 + _pos1.y-(_pos2.y-2*tile_size)
	let _dot2 = (_pos1.x - _pos2.x)*(-0.5) + (_pos1.y-(_pos2.y-2*tile_size))
	let _dot3 = _pos1.x-(_pos2.x-obj.dimension.w*tile_size)
	let _dot4 = -(_pos1.x)+(_pos2.x+obj.dimension.l*tile_size)
	
	if(_dot2>0&&_dot1>0&&_dot3>0&&_dot4>0)
		return true
	else 
		false
}

/////////////////////////////////////////////

//world coord to camera space!
function camera_projection(_v){ 
	
	let result ={x:0,y:0}
	let pp = {x:0,y:0}
	if(PERSPECTIVE == 'iso'){
		pp = project_isometric(player.position)
	}else{
		pp = player.position
	}
	result.x = _v.x-(pp.x-canvas.width/2) 
	result.y = _v.y-(pp.y-canvas.height/2) 
	

	return result

}

// obj to world coord!
function project_isometric(position){
	let result = {x:0,y:0}
	result.x = position.x+position.y*(-1)+canvas.width/2
	result.y = position.x*(0.5)+position.y*(0.5)+tile_size
	return result

}
function revert_project_isometric(position){
	let result ={x:0,y:0}
	result.x = position.x*(0.5)+position.y
	result.y = position.x*(-0.5)+position.y
	return result
}

function normalize(vector,max=1){
	let _temp = Math.sqrt(vector.x*vector.x+vector.y*vector.y)
	if(!_temp) return // 0だったらやばい
	vector.x = vector.x/_temp * max
	vector.y = vector.y/_temp * max
}

function dot_production(vector1,vector2){
	return vector1.x*vector2.x+vector1.y*vector2.y
}

function draw_iso_rect(_position,size=tile_size,color='red'){
	let _DP = camera_projection(project_isometric(_position))
	let _temp = {x:_DP.x,y:_DP.y}
	c.strokeStyle = color
	c.lineWidth = '2'
	c.beginPath()
	c.moveTo(_DP.x,_DP.y)
	
	_DP = camera_projection(project_isometric({x:_position.x+size,y:_position.y}))
	c.lineTo(_DP.x,_DP.y)
	
	_DP = camera_projection(project_isometric({x:_position.x+size,y:_position.y+size}))
	c.lineTo(_DP.x,_DP.y)
	
	_DP = camera_projection(project_isometric({x:_position.x,y:_position.y+size}))
	c.lineTo(_DP.x,_DP.y)
	
	c.lineTo(_temp.x,_temp.y)
	c.stroke()
}

	

function combine(A,B){
	return {x:A.x+B.x,y:A.y+B.y}
}

function pp(_txt){
	return console.log(_txt)
}



function printText(txt,posX=100,posY=100,lineHeight=10,bg=0,color='black',bgColor='white',align='left'){
	
	if(!txt) txt = 'nothing to show'
	let lines = txt.split('\n')
	let offsetX = 0
	if(align=='center'){
		offsetX=-lines[0].length/2*lineHeight
	}
	
	if(bg){
		c.fillStyle = bgColor
		c.fillRect(posX+offsetX,posY-lineHeight,lines[0].length*lineHeight,lineHeight*1.2*(lines.length+1))
	}
	c.fillStyle = color
	c.font = lineHeight+"px serif"
	for (let i = 0; i < lines.length; i++) {
		c.fillText(lines[i], posX+offsetX, posY + (i * lineHeight*1.2))
	}
}

// Masterなし、位置だけ共有する,static
function init_images(_path,align_type='center',position={x:0,y:0},dimension=undefined,scale=2) {
	return new SpritesComponent({
        position: position,
		dimension:dimension,
        movieClips: {
            _static: {
                imgSrc: _path,
                scale: {
                    x: scale,
                    y: scale
                },
				align_type:align_type,
            },
        }
    })
}



function init_Tiles(_x,_y,_path,scale=2,align_type='center',ID=5,dimension=undefined) {
	return new Tiles({
        position: {x: _x * tile_size,y: _y * tile_size},
		ID:ID,
        movieClips: {
            _static: {
                imgSrc: _path,
                scale: {
                    x: scale,
                    y: scale
                },
				align_type:align_type,
				
            },
        },
		dimension:dimension,
    })
}

function offset_tile_center(_width,_height,scale_x,scale_y){
	
	return {x:(tile_size-_width*scale_x)/2,y:(tile_size-_height*scale_y)/2}
}

function offset_tile_center(_size,_scale){
	return {x:(tile_size-_size*_scale)/2,y:(tile_size-_size*_scale)/2}
}

function offset_tile_bottom(_size,_scale){
	return {x:(tile_size-_size*_scale)/2,y:(tile_size-_size*_scale)}
}

function offset_bottom(_osize_x,_osize_y,_size_x,_size_y,_scale){
	return {x:(_osize_x-_size_x*_scale)/2,y:(_osize_y-_size_y*_scale)}
}

function onPress(_key){
	return !keys[_key].press && keys[_key].pressed
}

function getDistance2D(p1,p2){
	let x = p1.x-p2.x
	let y = p1.y-p2.y
	return Math.sqrt(x*x+y*y)
}


let DIP_page_num=0

function DIP(){
	
	if(onPress('q')){
		if(!showDIP)
			showDIP=true
		else
			showDIP=false
		if(DIP_page_num<3)
			DIP_page_num++
		else
			DIP_page_num=0
	}
	let txts=[
		"Press Q to show DIP",
		"\n    press Q to hide DIP"
		+"\n    current Level: "+level+", type: "+ PERSPECTIVE 
		+"\nPlayer Attributes List:"
		+"\n    Player ineract target: "+player.interTarget
		+"\n    Player pos x: "+player.position.x/tile_size
		+"\n    Player pos y: "+player.position.y/tile_size
		+"\n    Player velocity x: "+player.velocity.x 
		+"\n    Player velocity y: "+player.velocity.y
		+"\n    Player velocity z: "+player.velocity.z
		+"\n    stopRQ: "+player.stopRQ
		+"\n    landRQ: "+player.landRQ
		+"\n    headRQ: "+player.headRQ
		+"\n    interRQ: "+player.interRQ
		+"\n    falling: "+player.falling
		+"\n    attacking: "+player.attacking
		+"\n    wall sliding: "+player.wallSlide
		+"\n    current clip: "+player.moviePlayer.currentClip
		+"\n    currentFrame: "+player.moviePlayer.currentFrame
		+"\n    frameCounter: "+player.moviePlayer.frameCounter
		+"\n    frameLength: "+player.moviePlayer.frameLength
		+"\n    image width: "+player.moviePlayer.imgWidth
		+"\n    image height: "+player.moviePlayer.imgHeight
		+"\n    scale X "+player.moviePlayer.scale.x
		+"\n    scale Y: "+player.moviePlayer.scale.y,
		
		'Dialog box numbers: ' + dialogs.length,
		
	]
	
		
	
	printText(txts[DIP_page_num],30,30,10,1)
}




