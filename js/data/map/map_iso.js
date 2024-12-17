// object-based!
function generate_from_objects(_object_data){
	
	for(let index in _object_data){
		let first = true
		let obj = _object_data[index]
		let x,y
		if(obj.size){
			for(let _x = 0; _x < obj.size.w; _x++){
				for(let _y = 0; _y<obj.size.h; _y++)
				{
					x=obj.position.x+_x
					y=obj.position.y+_y
					// まず下地に　ID＝0のコリジョンTileを敷いて
					terrain.push(new Tiles({position: {x:x * tile_size,y:y * tile_size},}))
					
					// 左上に　ID=4の画像だけ＋特殊ISO描画のTile
					if(!first) continue
					first =false
					test_objects.push(init_Tiles(x,y,obj.imgSrc,2,'iso 3D',4,{l:obj.size.w,w:obj.size.h,h:1}))
					
				}
			}	//terrain.push(init_Tiles(obj.position.x+_x,obj.position.y+_y,obj.imgSrc,2,'iso 1',5))
		}
		else {
			x=obj.position.x
			y=obj.position.y
			//objects.push(init_Tiles(x,y,obj.imgSrc,2,'iso 1',4))
			// コリジョン有無
			if(!obj.sign_only)
				terrain.push(new Tiles({
					position: {x: x * tile_size,y: y * tile_size},
				}))
				
			// 本体
			terrain.push(new Tiles({
				position: {x: x * tile_size,y: y * tile_size},
				ID:1,
				txt:obj.txt,
			}))
			
			// 素材タイル
			if(!obj.imgSrc) continue
			objects.push(new Tiles({
				position: {x: x * tile_size,y: y * tile_size},
				ID:4,
				movieClips: {
					_static: {
						imgSrc: obj.imgSrc,
						align_type:'iso 1',
						scale: {
						x: 2,
						y: 2
					},
						
					},
				},
			}))
		}
	}
}
	


const level3Col = 
			[94, 94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94, 94, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94,
            94, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94]

const level3OBJ = 
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			
// object単位で管理するパート。
const level3_objects = {
	1:{
		position:{x:3,y:2},
		size:{w:5,h:2},
		imgSrc:'./Sprites/isometric_tileset/sample_square.png',
	},
	
	2:{
		position:{x:2,y:9},
		size:{w:6,h:3},
		imgSrc:'./Sprites/isometric_tileset/obj_char_1.png',
	},
	
	windows:{
		position:{x:0,y:10},
		txt:txt_window,
		sign_only:true,// コリジョン不要
	},
	
	poster:{
		position:{x:15,y:22},
		txt:txt_diana_poster,
		sign_only:true,
	},

	pikachu:{
		position:{x:13,y:6},
		imgSrc:'./Sprites/isometric_tileset/separated/tile_052.png',
		txt:'これは……先輩が落ちたピカチュウだ！,正直なぜピカチュウなのかは分からない…！',
	},

	sato:{
		position:{x:5,y:11},
		txt:txt_sato,
		sign_only:true,
	},
	
	irie:{
		position:{x:7,y:11},
		txt:txt_irie,
		sign_only:true,
	},
		
	chn:{
		position:{x:3,y:13},
		txt:txt_chn,
		sign_only:true,
	},
	
	su:{
		position:{x:5,y:13},
		txt:txt_su,
		sign_only:true,
	},
	
	domatu:{
		position:{x:7,y:13},
		txt:txt_domatu,
		sign_only:true,
	},
	
	range:{
		position:{x:0,y:3},
		txt:txt_range,
		sign_only:true,
	},
	
	nico:{
		position:{x:10,y:3},
		txt:txt_nico_figure,
		sign_only:true,
	},
	
	move:{
		position:{x:10,y:11},
		txt:txt_moving_test,
		sign_only:true,
	},
	
}

	
	


/*

*/