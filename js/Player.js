// プレイヤー
//　ここを通るのも久しぶりか…

class Player{
	constructor({position={x:100,y:100},movieClips,talk_txt}){
		this.position = position
		this.drawPosition = {x:0,y:0}
		this.NextPos = {x:0,y:0}
		this.oldP1 = {x:0,y:0}
		this.oldP2 = {x:0,y:0}
		this.oldP3 = {x:0,y:0}
		this.velocity = {x:0,y:0,z:0}
		this.maxVelocity = {x:2,y:1}
		this.height = tile_size*2
		this.width = tile_size
		
		this.interTarget = null
		//this.RCPosition = {x:0,y:0}
		this.falling = false
		this.attacking = false
		this.wallSlide = false
		this.state = 'idle'
		this.draw_position = {x:0,y:0}
		this.moviePlayer = new SpritesComponent({master:this,position:position,movieClips:movieClips,currentClip:'idle'})
		this.moviePlayer2 = init_images('./Sprites/isometric_tileset/separated/tile_101.png','iso 1',position)
		this.direction = {x:1,y:1}
		
		this.movieMode = false
		this.moveTarget = {x:0,y:0}
		this.incarnation = false
		if(talk_txt){
			pp(talk_txt)
			this.talkTile = new Tiles({
				position: this.position,
				ID:1,
				txt:talk_txt,
			})
			this.talkTile.master = this
		}
		this.actionPlan = undefined
		this.actionPlan_index = 0
		
		this.body_clock = 4000
		
	
		this.requests = {land:false,head:false,stop:false,interact:false,endMovie:false,move:false}
		//this.requests['land'] =false
		//this.requests['head'] = false
		//this.requests['stop'] = false
		//this.requests['interact'] = false
		this.inputs = {moving:false}
		

	}
	
	// 初期化	
	init(px=1,py=1,width=tile_size,height=tile_size*2){
		this.position.x=px*tile_size
		this.position.y=py*tile_size
		this.height = height
		this.width = width
		this.openInput()

	}

	hitStop_request(type,position_x=0,position_y=0){
		if(type=='head'){
			if(!this.requests['head'])
				this.requests['head'] =true
			this.position.y = position_y
			if(PERSPECTIVE =='iso'){
				if(this.velocity.y!=0 && !this.requests['stop']){
					this.velocity.x *=1.4
				}
			}
		}else if(type=='land'){
			if(!this.requests['land'])
				this.requests['land'] =true	
			this.position.x = position_x
			this.position.y = position_y
			if(PERSPECTIVE =='iso'){
				if(this.velocity.y!=0 && !this.requests['stop']){
					this.velocity.x *=1.4
				}
			}
		}else{
			if(!this.requests['stop'])
				this.requests['stop'] = true;
			this.position.x = position_x
			if(PERSPECTIVE =='iso'){
				if(this.velocity.x!=0 && !(this.requests['head']||this.requests['land'])){
					this.velocity.y *=1.4
				}
			}
			
			
		}
	}
	
	assignInteraction(target){
		this.requests['interact'] = true
		this.interTarget = target
	}
	
	getInterTarget(){
		return this.interTarget
	}
	
	resetInterTarget(){
		this.interTarget = undefined
	}
	
	applyGravity(){
		if(this.position.y+this.height+this.velocity.y<canvas.height){
			if(this.requests['stop']){
				this.maxVelocity.y = 1
			}else{
				this.maxVelocity.y = 6
				this.wallSlide = false
			}
			this.velocity.y+=gravity
		}else{
			this.position.y = canvas.height-this.height
			this.velocity.y=0
			this.requests['land'] = true
		}
		if(this.velocity.y>this.maxVelocity.y){
			this.velocity.y = this.maxVelocity.y
			
		}
		
	}
	
	
	// movie clip end event!! 
	end_cst(name){
		//console.log(name+' motion ended event')
		if(name=='gd_atk'){
			this.attacking = false
			this.cst('idle')
		}else if(name =='land'){
			this.cst('idle')
		}else if(name == 'enchant'){
			this.cst('idle')
			if(this.requests['endMovie'])this.movieMode = false
			// todo 本当はここで決めるべきではない…
		}else if(name == 'enter'){
			this.cst('idle')
			//console.log('enter the door of: ' + this.interTarget.ID)
			change_level_request(this.interTarget.nextLevel)
			world_fade_out()
			pp(screenPainter.currentClip)
			
		}
	}
	
	cst(name){// change/switch state
		//console.log('change to '+name)
		if(this.state==name)return
		this.moviePlayer.switchMovieClip(name)
		this.state = name
	}
	
	switchMovieClip(name){
		if(this.moviePlayer.currentClip === name) return
		//console.log(this.wallSlide)
		this.moviePlayer.image = this.moviePlayer.movieClips[this.moviePlayer.currentClip].image
		this.moviePlayer.currentClip = name
		this.moviePlayer.currentFrame = 0
		this.moviePlayer.frameCounter = 0
		
		
	}
	
	
	handleRequest(){
		if (this.requests['stop'])
			this.velocity.x = 0

		if (this.requests['land']) 
			this.velocity.y = 0

		if (this.requests['head']) 
			this.velocity.y = 0
		
		if(this.requests['endMovie'])
			this.openInput()
		
		if(this.requests['call']){
			if(this.toComfirm())
				this.requests['call']=false
		}
	}
	// reste 1-frame request
	resetRequests(){
		if(this.requests['land']){
			this.falling = false
			this.requests['land'] = false
		}
		this.requests['head'] = false
		this.requests['stop'] = false
		this.requests['interact'] = false
		//this.interTarget = null
		//console.log('RQ reset!')
	}
		
		
	isMovieMode(){
		return this.movieMode
	}

	closeInput(){
		this.movieMode = true
	}

	openInput(){
		if(this.requests['moving']){
			pp('移動中のため、openInput再試行中')
			this.requests['endMovie'] = true
			return false
		}else
			this.requests['endMovie'] = false
			this.movieMode = false
	}
	
	clearInput(){
		for(let input in this.inputs)
			if(this.inputs[input]){
				pp('Inputs['+input+'] クリア')
				this.inputs[input]=false

			}
	}
	
	setAction(type,position){
		if(type=='move'){
			pp('setAction move')
			this.requests['move']=true
			this.moveTarget = position
		}
	}
	
	moveTo(px,py,_radius=2){
		let delta={x:px-this.position.x,y:py-this.position.y}
		let radius = _radius
		let v = 1
		let c1 = false
		let c2 = false
		// 現状の対策
		//get distance
		if(getDistance2D(this.position,{x:px,y:py})>radius){
			if(delta.x>0){
			this.velocity.x=v
			
			}else if (delta.x<0){
				this.velocity.x=-v

			}
			if(delta.y>0){
				this.velocity.y=v
				
			}else if (delta.y<0){
				this.velocity.y=-v

			}
			
			return false
		}else{
			this.velocity.x=0
			this.velocity.y=0
			return true
		}
		
		
	}
	
	toCount(time){
		if(this.body_clock<time){
			this.body_clock++
			return false
		}else{
			this.body_clock=0
			return true
		}
	}
	
	// 受肉
	incarnate(){
		this.incarnation = true
		this.actionPlan=[]
	}
	
	addPlan(){
		return // stop
		console.log('Action Plan 追加')
		this.actionPlan.push(
			//{name:'move1',type:'move',target:{x:this.position.x-5,y:this.position.y}},
			//{name:'move2',type:'move',target:{x:this.position.x,y:this.position.y}},
			{name:'approach',type:'approach',target:player,radius:100},
			{name:'approach',type:'wait',time:500},
			{name:'move1',type:'move',target:{x:this.position.x,y:this.position.y}},
		
		)
	}
	
	handlePlan(plan){
		// test
		switch(plan.type){
			case 'approach':
				if(this.moveTo(plan.target.position.x,plan.target.position.y,plan.radius))
					this.actionPlan.shift()
			break
			case 'wait':
				if(this.toCount(plan.time)){
					this.actionPlan.shift()
				}else if(this.requests['cancel_wait']){
					this.actionPlan.shift()
					this.requests['cancel_wait']=false
				}
			break
			case 'move':
				if(this.moveTo(plan.target.x,plan.target.y))
					this.actionPlan.shift()//shift
					
			break
			case 'call':
				if(this.toCall(plan.target))
					this.actionPlan.shift()//shift
					
			break
			
		}
		
		if(this.velocity.x!=0 || this.velocity.y!=0)
			this.inputs['moving']=true
		else 
			this.inputs['moving']=false
	}
	cancelWait(){
		this.requests['cancel_wait']=true
		this.body_clock=0
	}
	
	toCall(target){
		console.log('A:あの～')
		if(this.toCount(100)){
			target.beCalled(this)
			return true				
		}else{
			return false
		}
	}
	
	beCalled(target){
		console.log('B:なんか誰かから話しかけられてるぞ')
		this.requests['call']=true
		this.requests['call_target']=target
		//target.beConfirmed(this,1)
	}
	
	toComfirm(){
		if(this.toCount(100)){
			console.log('B:あっごめん、どしたの？')
			this.requests['call_target'].beConfirmed(this,1)
			return true
		}else{
			return false
		}
	}
	
	beConfirmed(target,agree=1){
		if(agree){
			console.log('A:ありがと、実は…')
			world_addDialogs(txt_npc_talk,[NPC0,NPC1])
			this.cancelWait()
		}
	}

		
	handleInput(){
		if(onPress('jump')){
			if(this.requests['land']||(this.requests['stop']&&this.velocity.y>0)){
				this.attacking = false
				this.wallSlide = false
				this.cst('jump')
				this.requests['land'] = false // in case the following code overwrite the state 'jump'
				this.velocity.y=-10
			}
		}else if(!keys.jump.pressed){
			if(this.velocity.y<0){
				this.velocity.y = 0
			}
		}
		
		if(onPress('up')){
			if(this.requests['interact'] ){
				if(this.interTarget.ID==1){
					this.closeInput()
					this.cst('enchant')
					this.velocity.x = 0
					this.velocity.y = 0
					
				}else{
					this.closeInput()
					this.cst('enter')
					this.velocity.x = 0
					this.velocity.y = 0
					world_fade_in()
				}
				return
				//console.log('the great one is waiting...')
				//console.log('the ID is:'+ this.interTarget.ID)
			}
		}
		
		
		if(keys.left.pressed&& !this.attacking){
			if(this.requests['land'] )
				this.cst('run')
			this.velocity.x=-this.maxVelocity.x
		}
		else if(keys.right.pressed && !this.attacking){
			if(this.requests['land'])
				this.cst('run')
			this.velocity.x=this.maxVelocity.x
		}
		else if(!(keys.left.pressed||keys.right.pressed)){
			if(this.requests['land'] && this.velocity.y>=0 && !this.attacking){
				if(this.falling){
					this.falling = false
					this.cst('land')
				}else if(this.moviePlayer.currentClip!= 'land')
					this.cst('idle')
			}
			this.velocity.x=0
		}
		
		if(onPress('atk')){
			if(this.state=='idle'|| this.state =='land'){
				this.attacking = true
				this.cst('gd_atk')
			}
		}
		
	}
	
	handleInput_iso(){
		// story Mode 最優先
		if (this.movieMode){
			if(this.requests['move']){
				pp('Puppet移動中')
				if(this.moveTo(this.moveTarget.x,this.moveTarget.y))
					this.requests['move']=false
			}else{
				this.velocity.x =0
				this.velocity.y = 0
			}
		// NPC 自動アクション
		}else{
		
			if(this.incarnation){
				// 時間を動かす…
				if(this.actionPlan.length==0){
					if(this.toCount(300))
						this.addPlan()
				// やることを処理
				}else{
					this.handlePlan(this.actionPlan[this.actionPlan_index])
				}
				
				if(!this.inputs['moving']){
					this.velocity.x=0
					this.velocity.y=0
				}
			}
			// Player インプット
			else {
				if(keys.left.pressed){
					this.velocity.x=-1
				}else if(keys.right.pressed){
					this.velocity.x = 1
				}
			
				if(keys.up.pressed){
					this.velocity.y = -1
				}else if(keys.down.pressed){
					this.velocity.y = 1
				}
				
				if(onPress('e')){
					if(this.requests['interact']){
						let target = this.interTarget.getMaster()
						if(target){
							console.log('会話イベント開始')
							world_addDialogs(this.interTarget.getTxt(),[this,target])
						}else{
							console.log('調査イベント開始')
							world_addDialogs(this.interTarget.getTxt(),[this])
						}
					}else{
						console.log('get close to the inventable point')
						world_addDialogs(txt_floor15)
						this.closeInput()
					}
				}
				
				if(onPress('atk')){
					if(this.requests['interact'] ){
						if(this.interTarget.nextLevel){
							this.closeInput()
							this.cst('enter')
							this.velocity.x = 0
							this.velocity.y = 0
							world_fade_in()
						}else{
							pp('press E to invent')
						}
					}
				}
			
				
				if(!keys.left.pressed && !keys.right.pressed){
					this.velocity.x = 0
				}
				if(!keys.up.pressed && !keys.down.pressed){
					this.velocity.y = 0
				}
			}
		
		}
		
		if(this.state!='enter')
			if(Math.abs(this.velocity.x) + Math.abs(this.velocity.y) >0){
				this.cst('walk')
			}else{
				if(this.state!='enchant')
					this.cst('idle')
			}
		
		
		normalize(this.velocity,this.maxVelocity.x)
		
		// moving状態だと直接World空間でvelocityを計算してるので変換不要
		if(!this.inputs['moving']){
			// iso-camera to world 
			this.velocity.y *= 0.5
			let _temp = revert_project_isometric({x:this.velocity.x,y:this.velocity.y})
			this.velocity.x = _temp.x
			this.velocity.y = _temp.y
		}
		
		
	}

	

	// 描画系
	draw_box(){
		switch(PERSPECTIVE){
			case '2D':
				let drawPosition= camera_projection(this.position)
				/*
				c.fillStyle = 'red'
				c.fillRect(drawPosition.x-this.velocity.x,drawPosition.y-this.velocity.y,this.width,this.height)
				
				c.fillStyle = 'yellow'
				c.fillRect(this.oldP3.x,this.oldP3.y,this.width,this.height)
				c.fillStyle = 'purple'
				c.fillRect(this.oldP2.x,this.oldP2.y,this.width,this.height)
				c.fillStyle = 'orange'
				c.fillRect(this.oldP1.x,this.oldP1.y,this.width,this.height)
				*/
				c.fillStyle = 'pink'
				c.fillRect(drawPosition.x,drawPosition.y,this.width,this.height)
			break
			case 'iso':
				//c.save()
				//c.globalAlpha = 0.8;
				//this.moviePlayer2.draw()
				draw_iso_rect(this.position,this.width,'white')
				//c.restore()				
				/*
				this.draw_position=camera_projection(project_isometric(this.position))
				c.fillStyle = 'pink'
				c.fillRect(this.draw_position.x,this.draw_position.y,this.width,this.height)
				*/
			break
		}
		
	}
	
	draw_para(){
		if(!showDIP) return
		switch(PERSPECTIVE){
			case '2D':
				
			break
			case 'iso':
				let offset= -tile_size*2.5
				let size = 10
				let para =this.body_clock
				if(this.movieMode)
					para = ' (story)'
				
				if(this.incarnation){
					if(this.actionPlan.length==0)
						para += ' nothing to do'
					else
						para += this.actionPlan[this.actionPlan_index].type
					if(this.inputs['moving'])
						para += ' moving'
					else
						para += ' , not moving'
				}
				
				this.draw_position=camera_projection(project_isometric(this.position))
				c.fillStyle = 'pink'
				c.fillRect(this.draw_position.x-this.width,this.draw_position.y+offset,this.width*5,this.height)
				c.font = size+"px serif"
				c.fillStyle = 'rgba(0,0,0,1)'
				
				c.fillText(para,this.draw_position.x-this.width, this.draw_position.y+offset+size)
				
			break
		}
		
	}
	
	draw(){
		this.draw_box()
		if(this.talkTile)this.talkTile.draw()
		this.draw_para()
		this.moviePlayer.draw()
	}
	
	ISOCameraProjection(){
		let DP = camera_projection(project_isometric(this.position))
		this.drawPosition.x = DP.x
		this.drawPosition.y = DP.y
	}
		
	update(){
		// reuse the position data to create shadow
		/*
		this.oldP3.x = this.oldP2.x
		this.oldP3.y = this.oldP2.y		
		this.oldP2.x = this.oldP1.x
		this.oldP2.y = this.oldP1.y 
		this.oldP1.x = this.position.x
		this.oldP1.y = this.position.y
		*/
		
		switch(PERSPECTIVE){
			case '2D':
				// 1)adjustment + update
				// that should be done right after the collision calculation
				if (this.requests['stop']) {
					this.velocity.x = 0
				}
				if (this.requests['land']) {
					this.velocity.y = 0
				}
				if (this.requests['head']) {
					this.velocity.y = 0
				}
				this.position.y += this.velocity.y
				this.position.x += this.velocity.x

				// 2)get next delta
				// the 'velocity' basically means 'delata position per frame'
				if (!this.movieMode)
					this.handleInput() // all the input event

				if (this.velocity.y >= 0 && !this.requests['land']) {
					this.falling = true
					this.attacking = false
					if (this.requests['stop']) {
						this.wallSlide = true
							this.cst('wall_slide')
					} else
						this.cst('fall')
				}

				// canvas bound
				if (this.position.x < 0)
					this.position.x = 0 
				else if (this.position.x + this.width > canvas.width)
					this.position.x = canvas.width - this.width

				this.applyGravity()
				
				break
				
			case 'iso':
				
				if(this.talkTile){
					this.talkTile.update()
				}
					
				
				// 1) 残ったリクエストを対応、変化値の最終チェック
				this.handleRequest()
				
				this.position.x += this.velocity.x
				this.position.y += this.velocity.y

				this.ISOCameraProjection()
				
				// 2) 次の変化を求める
				this.handleInput_iso() // all the input event
				
				//移動制限
				if (this.position.x < 0)
					this.position.x = 0 
				
				if (this.position.y < 0)
					this.position.y = 0
				
				break
		}
		
		
		
		// change the rest parameters
		
		this.NextPos.x = this.position.x+this.velocity.x
		this.NextPos.y = this.position.y+this.velocity.y
		
		if(this.velocity.x>0)
			this.direction.x=1
		else if(this.velocity.x<0)
			this.direction.x=-1
		if(this.velocity.y>0)
			this.direction.y=1
		else if(this.velocity.y<0)
			this.direction.y=-1
		
		if(PERSPECTIVE=='iso'){
			let _temp = dot_production(this.velocity,{x:1,y:-1})
			if(_temp>0)
				this.moviePlayer.scale.x = 1
			else if(_temp<0)
				this.moviePlayer.scale.x = -1
		}else{
			if(this.velocity.x>0){
			this.moviePlayer.scale.x=1
			}
			else if(this.velocity.x<0){
				this.moviePlayer.scale.x=-1
			}
		}
		
		// pass to movieplayer
		this.moviePlayer.update()
		
		// reset the 1-frame request
		this.resetRequests() //movieplayerで、動画再生時もリクエストの消化するタイミングを決めたいので、リセットは最後までに保留する。
	}
}