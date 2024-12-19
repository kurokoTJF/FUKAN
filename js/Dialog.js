class dialogBox{
	constructor({
			position={x:0,y:tile_size*10},
			default_txt=txt_floor15,
			puppets=[player]
		}){
		this.position = position
		this.page_num = 0
		this.in_page_num = 0
		this.content_text = default_txt
		this.pages=[] // ','で分割してできたデータ
		this.checkPage = false
		this.words='' // 他のタグを消した部分
		this.words_splitted=[]
		this.head_show = false
		this.print_interval = 0
		this.print_interval_buffer = 1
		this.print_index = 0
		this.print_finished = false
		this.print_text=''
		this.load = false
		this.remove = false
		this.puppets = puppets
		this.counter=0
		this.autoPlay=true
		this.drawPosTarget = undefined
		this.skippable = true
	}
	
	isRemovable(){
		return this.remove
	}
	
	setRemove(){
		this.remove = true
	}
	
	setEventEnd(){
		pp('Dialog終了、Puppets開放')
		this.setRemove()
		this.puppets.forEach((pop)=>{
			pop.setInputOpen()
		})
	}
	
	setText(txt){
		this.content_text = txt
	}
	
	resetDialog(){
		this.content_text = txt_floor15
	}	

	updateCounter(time){
		if(this.counter<time){
			this.counter++
			return false
		}else{
			this.counter=0
			return true
		}
	}
	
	init_page(){
		this.in_page_num=0
		this.checkPage = false
		this.head_show = false
		this.print_interval = 0
		this.print_index = 0
		this.print_finished = false
		this.print_text = ''
		this.words=''
		this.counter=0
	}
	
	drawProcess(counter=this.counter,max=100){
		let string = ''
		let process = Math.ceil(counter/max*10)
		for(let i=0;i<process;i++){
			string +='='
		}
		string+='|||||'
		for(let i=0;i<(10-process);i++){
			string +='='
		}
		return '['+string+']'
	}

	update(){	
		
		// talk event switch. 同じEボタンだと瞬時に反応する			
		/*
			if(player.isMovieMode())
				characters.forEach((c)=>{
					c.setInputOpen()
				})
		*/
		let regex 
		let found
		let mt_head
		let mt_action
		
		
		if(!this.load){//初回のKeyイベントをスキップできる
			this.load = true
			this.puppets.forEach((pop)=>{
				pop.setInputClose()
			})
			this.pages = this.content_text.split('|')
			this.page_num = 0
			this.init_page()
			let temp = this.pages[0].match(/(?<=<skip>)(.*?)(?=<\/skip>)/g)
			if(temp=='false')
				this.skippable = false
		}else{
			if(getOnPress('e')){
				pp('dialog取消')
				this.setEventEnd()
				
			}
			
			// handle Input
			
			if(!this.print_finished){
				if(this.skippable&&getOnPress('right'))
					this.print_finished = true
			}else{
				if((this.skippable&&getOnPress('right'))||(this.autoPlay&&this.updateCounter(100))){
					if(found && this.in_page_num<found.length-1){
						in_page_num++
					}
					else{
						this.page_num++
						this.init_page()
						if(this.page_num>=this.pages.length){
							this.setEventEnd()						
							return
						}
					}
				}
			}
		}
		
		
		
		// get article to show
		if(!this.checkPage){// 一回だけ！
			this.checkPage= true
			//let regex = '<test>(.*?)</test>'
			// /<test>(.*?)<\/test>/g
			let temp = this.pages[this.page_num].match(/(.*?)(?=<test>)/g)
			
			if(!temp)
				this.words = this.pages[this.page_num]
			else
				this.words = temp[0]
			found = this.pages[this.page_num].match(/(?<=<test>)(.*?)(?=<\/test>)/g)
			mt_head = this.pages[this.page_num].match(/(?<=<head>)(.*?)(?=<\/head>)/g)
			mt_action = this.pages[this.page_num].match(/(?<=<action>)(.*?)(?=<\/action>)/g)
			
			if(found){
				if(found[0] =='333')
					player.cst('enchant')
			}
			if(mt_head){
				console.log('<head>表示')
				this.head_show = true
				temp = mt_head[0].split(' ')
				this.drawPosTarget = temp[0]
				this.words = temp[1]

			}
			if(mt_action){
				pp('Scriptから<action>を読み取りました')
				let _temp = mt_action[0].split(' ')
				window[_temp[0]].setAction(_temp[1],{x:_temp[2],y:_temp[3]})
			}
			
			
			this.words_splitted = this.words.split('')
			this.print_text = this.words_splitted[0]
		
		}
		
		
		// pick words to print
		if(!this.print_finished){
			if(this.print_interval<this.print_interval_buffer)
				this.print_interval++
			else{
				this.print_interval = 0
				if(this.print_index<this.words_splitted.length-1){
					this.print_index++
					this.print_text +=this.words_splitted[this.print_index]
				}
				else
					this.print_finished = true
			}
		}else{
			this.print_text = this.words
		}
		
	}
	
	draw(){
		if(this.remove) return 
		let hint =''
		let height = 16
		let offset = 32
		let target
		// print 		
		if(this.head_show){
			target = window[this.drawPosTarget]
			offset += 64
			c.save()
			printText(this.print_text+hint,target.drawPosition.x,target.drawPosition.y-offset+height,height,1,'white','rgba(0,0,0,0.5)','center')
			c.restore()
		}else{
			hint = '\npress -> to next page or wait:('+this.counter+'/100)'
			c.fillStyle = 'white'
			c.fillRect(this.position.x,this.position.y,canvas.width,canvas.height/8)
			printText(this.print_text+hint,this.position.x,this.position.y+16,16)
		}
		
		
	}
}