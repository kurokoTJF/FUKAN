// 素材を管理する

//　「_hide」や「_static」で特殊状態を表す。

// Loadがたまに失敗するので、imgWidthとか更新できなかったりするので、荒療治した結果めちゃくちゃになっているが…


class SpritesComponent{
	constructor({master,position, imgSrc='./Sprites/test_map.png',offset={x:0,y:0},scale={x:1,y:1},movieClips,currentClip = '_static',type=0}){
		this.master = master
		this.position = position
		
		this.imgWidth = 1
		this.imgHeight = 1
		this.loaded = false
		this.image = new Image() // to store the current image
		this.image.src = imgSrc
		this.frameLength = 1
		this.image.onload =() => {
			this.loaded = true
			this.imgWidth = this.image.width
			this.imgHeight = this.image.height
		}
		
		
		this.offset = offset
		this.scale = scale // to flip things
		this.currentFrame = 0
		this.frameCounter = 0
		
		this.align_type = 'center'
		if(type)
			this.type = type
		if(movieClips){
			this.movieClips = movieClips
			for(let clip in this.movieClips){
				if(this.movieClips[clip].imgSrc){
					const image = new Image()
					image.src = this.movieClips[clip].imgSrc
					this.movieClips[clip].image = image // every movie clip will have a [image] object
				}
				if(this.movieClips[clip].align_type)
					this.align_type = this.movieClips[clip].align_type
			}
		}else{
			console.log('1 sprite component without movie clips is created: '+type)
		}
		this.currentClip = currentClip
		this.switched = false
		this.playing = false
		this.ending = false
		this.playRQ = false
		
		this.draw_position = {x:0,y:0}
		
	}
	
	update(){
		if(this.currentClip == '_static' || this.currentClip =='_hide') return
		
		// 特殊ケース
		if(this.type==1){
			this.update_Frame_loop()
			return
		}
		// 特殊ケース
		

		this.updateFrames()
	}
	
	switchMovieClip(name){ // switch and reset frame。場合によってはリセットしないかな。
		if(this.currentClip === name) return
		this.currentClip = name
		this.currentClip = name
		this.currentFrame = 0
		this.frameCounter = 0
		//console.log(this.wallSlide)
		if(this.movieClips[name]!=undefined){
			this.image = this.movieClips[name].image			
		}else{
			pp('no sprites movie playing')
		}
	}
	
	draw(){// sprite animation 
		// 特殊ケース処理
		if(this.type==1){// screen space painter!
			if(this.currentClip=='fade_in'){
				pp('fade in!')
				c.fillStyle = 'rgba(0,0,0,'+this.currentFrame/10+')'
				c.fillRect(this.position.x,this.position.y,canvas.width,canvas.height)
			}else if(this.currentClip =='fade_out'){
				pp('fade out!')
				c.fillStyle = 'rgba(0,0,0,'+(1-this.currentFrame/10)+')'
				c.fillRect(this.position.x,this.position.y,canvas.width,canvas.height)
			}
			return
		}
		
		
		if(this.currentClip=='_hide') {
			c.fillStyle = 'rgba(55,5,255,1)'
			c.fillRect(this.draw_position.x,this.draw_position.y,tile_size/2,tile_size/2)
			return
		}
		// 特殊ケース処理
		
		
		
		// scale, draw_position, offset の計算
		let _scale_x = this.scale.x*this.movieClips[this.currentClip].scale.x
		let _scale_y = this.scale.y*this.movieClips[this.currentClip].scale.y

		this.draw_position=camera_projection(this.position)
		
		switch(this.align_type){
			case 'center':
			break
			case 'bottom':
				this.offset = offset_bottom(this.master.width,this.master.height,this.imgWidth,this.imgHeight,this.movieClips[this.currentClip].scale.x)
			break
		}
		
		
		if(PERSPECTIVE=='iso'){ // isometric視点でoffset変更や調整
			this.draw_position = camera_projection(project_isometric(this.position))
			if(this.align_type=='bottom'){
				this.offset.x-=this.master.width/2
				this.offset.y-=this.master.width/2 // 座標変換の都合で、足をマスの左中央に移動させる。
			}else if(this.align_type =='iso 1'){//
				this.offset.x = -this.imgWidth/2 * this.movieClips[this.currentClip].scale.x
				this.offset.y = tile_size-this.imgHeight * this.movieClips[this.currentClip].scale.x
			}else if(this.align_type == 'iso 3D'){
				this.offset.y = -this.imgHeight*this.movieClips[this.currentClip].scale.x+tile_size/2*(this.master.dimension.l+this.master.dimension.w)
				this.offset.x = -tile_size*this.master.dimension.w
			}
		}
		// scale, draw_position, offset の計算
		
		
		
		
		if(this.currentClip=='_static'){
			this.checkUpdate()
			
			if(!this.loaded) return
			
			//簡易Update
			this.imgWidth = this.image.width
			this.imgHeight = this.image.height
			
			c.save()
			c.scale(_scale_x,_scale_y)
			
			let _temp =0
			if(this.scale.x<0)
				_temp = -this.imgWidth
			c.drawImage(
				this.image, 
				(this.draw_position.x+this.offset.x)/_scale_x+_temp,
				(this.draw_position.y+this.offset.y)/_scale_y,
				this.imgWidth,
				this.imgHeight
			)
			c.restore()
			
		
		}else{//console.log('draw static things 1: ' + ' '+this.currentClip+ ' '+this.loaded)
						//console.log('draw static things 2: '+this.loaded)
			//console.log('try1'+this.loaded)
			////console.log('draw player in: '+this.image.src)
			if(!this.loaded) return
			
			
			const cropbox = {
				position:{
					x:this.imgWidth *this.currentFrame,
					y:0
				},
				width: this.imgWidth,
				height: this.imgHeight,
			}
			
			
			
			c.save()
			c.scale(_scale_x,_scale_y)
			let _temp = 0
			if(this.scale.x<0)
				_temp = -this.imgWidth
			c.drawImage(
				this.image, 
				cropbox.position.x,
				cropbox.position.y,
				cropbox.width,
				cropbox.height,
				(this.draw_position.x+this.offset.x)/(_scale_x)+_temp,
				(this.draw_position.y+this.offset.y)/(_scale_y),
				this.imgWidth,
				this.imgHeight
			)
			c.restore()
			
			//console.log('try2: '+this.loaded)

		}
		
	}
	
	
	
	checkUpdate(){// whenever currentClip is changed	
		this.image = this.movieClips[this.currentClip].image
		this.currentFrame = 0
		this.frameCounter = 0			
		this.switched = false;
	
	}
	
	updateFrames(){// for sprite animation
		if(this.image !== this.movieClips[this.currentClip].image){
			this.checkUpdate()
			this.image.onload =() => {
				//console.log('onload========================'+this.image.src)
				this.loaded = true			
			}
			return
		}
		
		if(this.loaded && !this.switched){
			this.switched = true
			//console.log(this.switched)
			this.imgWidth = this.image.width / this.movieClips[this.currentClip].frameLength
			this.imgHeight = this.image.height
			if( this.movieClips[this.currentClip].offset ){
				this.offset.x = this.movieClips[this.currentClip].offset.x
				this.offset.y = this.movieClips[this.currentClip].offset.y
				
			}
				//this.offset = this.movieClips[this.currentClip].offset // ポインターかなここで渡してるのは
		}
		if(!this.loaded){
			//console.log('updating frames, but majakayo...'+this.loaded+' '+ this.switched)
		
		}
		
		// count frame
		this.frameCounter ++
		if(this.frameCounter >= this.movieClips[this.currentClip].frameBuffer){
			this.frameCounter = 0
			this.currentFrame++			
		
		
			// animation end event, inside count frame
			let _loopStartFrame=this.movieClips[this.currentClip].loopStartFrame
			let _frameLength = this.movieClips[this.currentClip].frameLength
			if(this.currentFrame >= _frameLength){
				if(this.movieClips[this.currentClip].nextClip){
					this.master.end_cst(this.currentClip)// end animation event, like 'gotoAndPlay()'
					this.checkUpdate()
				}else{
					if(_loopStartFrame == _frameLength-1){
						this.master.end_cst(this.currentClip)
					}
					this.currentFrame = _loopStartFrame
				}
			}
		}
	}
	
	
	///////////////////
	
	//screen painter
	
	////////////////////

	update_Frame_loop(){
		pp(this.currentClip)
		let frameBuffer = this.movieClips[this.currentClip].frameBuffer
		let loopStartFrame = this.movieClips[this.currentClip].loopStartFrame
		let frameLength = this.movieClips[this.currentClip].frameLength
		this.frameCounter ++
		if(this.frameCounter < frameBuffer) return
		this.frameCounter = 0
		this.currentFrame++
		if(this.currentFrame < frameLength) return
		if(loopStartFrame==undefined){
			this.switchMovieClip('_hide')
			return
		}
		this.currentFrame = loopStartFrame
	}
	
	draw_cinema(){
		c.fillStyle = 'rgba(0,0,0,0.1)'
		let _height = canvas.height/8
		c.fillRect(0,0,canvas.width,_height)
		c.fillRect(0,canvas.height-_height,canvas.width,_height)
	}
}