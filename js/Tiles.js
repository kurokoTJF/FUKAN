// コリジョン関連コア
// キャラクタ以外のオブジェクトもここで定義
// 現状　ISOMETRICS　は別でやってる
// 0 collision, 1 interact info, 2 object, 3 portal
// iso:
// 4 static, 5 static+collision, 6 depth objects
class Tiles{
	constructor({
		position={x:0,y:0},
		velocity={x:0,y:0},
		width=1,height=1,
		ID=0,
		expand={x:0,y:0},
		movieClips,
		nextLevel=null,
		dimension,
		txt,
		master})
	{
		this.position = position
		this.velocity = velocity
		this.width = tile_size*width
		this.height = tile_size*height
		this.ID = ID
		this.expand = expand
		this.remove = false
		this.show = false
		if(movieClips){
			switch(this.ID){
				case 2:
					this.moviePlayer = new SpritesComponent({
						master:this,
						position:position,
						movieClips:movieClips,
						currentClip:'_hide'
					})
				break
				case 4:
				case 5:
					this.moviePlayer = new SpritesComponent({
						master:this,
						position:position,
						movieClips:movieClips,
						currentClip:'_static'
					})
				break
			}
				
		}
		if(nextLevel!=null){
			if(nextLevel!=undefined)
				this.nextLevel = nextLevel
			else
				this.nextLevel = 0
		}
		this.draw_position ={x:0,y:0}
		
		if(dimension)
			this.dimension = dimension
		
		if(txt)
			this.txt=txt
	}
	
	
	
	
	
	end_cst(name){// end event, change state
		if(name=='ex')
			this.remove = true
	}
	
	getMaster(){
		if(this.master)
			return this.master
		else
			return false
	}
	getTxt(){
		return this.txt
	}
	
	draw(){
		if(PERSPECTIVE == '2D'){
			this.draw_position = camera_projection(this.position)
			if(this.ID==0){
				c.fillStyle = 'rgba(255,55,0,0.25)'
				c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
			}else if(this.ID==1){
				c.fillStyle = 'rgba(255,125,0,1)'
				c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
				if(this.show)
					this.draw_info('[Z]jump, [UP]interact')
			}else if(this.ID==2){
				if(this.moviePlayer.currentClip=='_hide'){
					c.fillStyle = 'rgba(255,255,255,1)'
					c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
				}
				this.moviePlayer.draw()
				//console.log(this.moviePlayer.position.y + ' ' + this.position.y)
			}else if(this.ID==3){
				c.fillStyle = 'rgba(255,0,255,1)'
				c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
				if(this.show)
					this.draw_info('   '+this.nextLevel,20,'white',-tile_size*2)
				
			}
			this.show = false
			
		}else if(PERSPECTIVE =='iso'){
			this.draw_position=camera_projection(project_isometric(this.position))
			switch(this.ID){
				case 0:
					//c.fillStyle = 'rgba(255,55,0,0.5)'
					//c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)	
				break
				case 1:
					//c.fillStyle = 'rgba(255,125,0,1)'
					//c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
					draw_iso_rect(this.position,tile_size,'white')
					if(!this.show) return
					this.draw_info('[X]interact')
					draw_iso_rect(this.position)
					
						
				break
				case 2:
					if(this.moviePlayer.currentClip=='_hide'){
						c.fillStyle = 'rgba(255,255,255,1)'
						c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
					}
					this.moviePlayer.draw()
					//console.log(this.moviePlayer.draw_position.y + ' ' + this.draw_position.y)
				break
				case 3:
					c.fillStyle = 'rgba(255,0,255,0.4)'
					c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
					if(this.show)
						this.draw_info('   '+this.nextLevel,20,'white',-tile_size)
				break
				case 4:
					this.moviePlayer.draw()
					//c.fillStyle = 'rgba(255,0,255,0.4)'
					//c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
				break
				case 5:
					this.moviePlayer.draw()
				break
				case 6:
				break
			}

			
			// reset 1-frame flag

			this.show = false
		}
		
	}
	
	
	draw_info(info,size=10,color='rgba(255,125,0,1)',offsety=-tile_size/2){
		c.fillStyle = color
		c.fillRect(this.draw_position.x,this.draw_position.y+offsety,this.width,this.height)
		c.save()
		c.font = size+"px serif"
		c.fillStyle = 'rgba(0,0,0,1)'
		c.fillText(info,this.draw_position.x, this.draw_position.y+size+offsety)
		c.restore()
	}
	
	// ぶつかるかどうかの条件判定。現状　方形のみ　対応
	// next frame. Player body collision
	hitTest(target=player,delta=player.velocity){
		if((target.position.x+target.width+delta.x > this.position.x+this.velocity.x - this.expand.x)&&
		(target.position.x+delta.x<this.position.x+this.width+this.velocity.x + this.expand.x)&&
		(target.position.y+target.height + delta.y>=this.position.y+this.velocity.y - this.expand.y)&&
		(target.position.y+delta.y < this.position.y+this.height+this.velocity.y + this.expand.y)){
			return true
		}else{
			return false
		}
	}
	
	// ぶつかったらどうするか
	hitTestTarget(target = player){
		if(this.hitTest(target,target.velocity)){
			//console.log('inside me!!')
			// 移動値を消すリクエストを出す替わりにす位置調整してあげる
			//「なぜ直接消さないの」
			//「」
			if(this.ID==0 || (this.ID==2&&this.moviePlayer.currentClip=='_hide')||this.ID==5){
				if(target.position.y+target.height <= this.position.y){
					if((target.position.x+target.width>this.position.x)&&(target.position.x < this.position.x+this.width)){
						target.hitStop_request('land',target.position.x+this.velocity.x,this.position.y-target.height)

					}
				}else if(target.position.y >= this.position.y+this.height){
					if((target.position.x+target.width>this.position.x)&&(target.position.x < this.position.x+this.width)){
						target.hitStop_request('head',0,this.position.y+this.height)
					}
				}else if(target.position.x+target.width<=this.position.x){
					target.hitStop_request('xstop',this.position.x+this.velocity.x-target.width)
				}else if(target.position.x>=this.position.x+this.width){
					target.hitStop_request('xstop',this.position.x+this.velocity.x+this.width)
				}else{
					console.log('break!!')
					if(target.velocity.x>=0){						
						target.hitStop_request('xstop',this.position.x+this.velocity.x-target.width)
			
					}else{
						target.hitStop_request('xstop',this.position.x+this.width+this.velocity.x)
					}
				}
			}
			
			if(target != player) return
			if(this.ID == 2){// removable objects!
				if(target.state =='gd_atk')
					this.moviePlayer.switchMovieClip('ex')
			}else if(this.ID==3){
				target.assignInteraction(this)
				
				this.show = true
			}
		}
		
	}
	
	update(){ //
		
		if(this.ID==4){// 画像だけならここはスキップ

		}else if(this.ID==1){// 調査ポイント
		
			let forward = {x:player.direction.x*10,y:player.direction.y*10}
			if(this.hitTest(player,combine(player.velocity,forward))){
				player.assignInteraction(this)
				this.show = true
				if(this.txt){
					dialog_box.setText(this.txt)
				}
			}else{
				if(player.getInterTarget() == this){
					player.resetInterTarget()
					dialog_box.resetDialog()
				}
			}
				
		}else{// 普通のコリジョン。移動可能。自分達以外のすべての動くものに対して計算する。
			
			characters.forEach((character)=>{
				this.hitTestTarget(character)
			})
			
			this.position.x +=this.velocity.x
			// change the direction
			if(this.position.x+this.width>canvas.width && this.velocity.x>0)
				this.velocity.x *= -1
			else if(this.position.x<0 && this.velocity.x<0)
				this.velocity.x *=-1
		}

		if(this.moviePlayer)
			this.moviePlayer.update()

	}
}
